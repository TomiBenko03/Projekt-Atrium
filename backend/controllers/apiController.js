const axios = require('axios');
const fs = require('fs');
const Transaction = require('../models/Transaction'); // Adjust path as needed
const { log } = require('console');
const { create } = require('xmlbuilder2');
const generateUpn = async (req, res) => {
    try {
        const { transactionId } = req.params;

        // Fetch transaction details
        const transaction = await Transaction.findById(transactionId)
            .populate('buyers sellers property')
            .exec();

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        log(transaction.buyers[0].firstName)
        // Extract relevant data from transaction
        const buyer = transaction.buyers[0]; // Assuming first buyer
        const seller = transaction.sellers[0]; // Assuming first seller
        const property = transaction.property[0];
        const amount = transaction.paymentDetails?.remaining?.amount || 0;

        // Construct UPN request payload
        const upnData = {
            payerIban: "SI56170000000000910",
            payerName: `${buyer?.firstName || 'neke '} ${buyer?.lastName || 'neke '}`.trim(),
            currencyCode: "EUR",
            amount: amount,
            payerCity: buyer?.address || "Unknown City",
            payerAddress: buyer?.address || "Unknown Address",
            purposeCode: "GDSV",
            dueDate: transaction.handoverDeadline ? new Date(transaction.handoverDeadline).toISOString() : new Date().toISOString(),
            purpose: `Plačilo za nepremičnino: ${property?.address || "Unknown Property"}`,
            recipientIban:/* seller?.bankAccount ||*/ "SI56170000000000910",
            recipientName: `${seller?.firstName || 'neke'} ${seller?.lastName || 'neke'}`.trim(),
            recipientAddress: seller?.address || "Unknown Address",
            recipientCity: seller?.address || "Unknown City",
            payerReference: "SI99",
            recipientReference: `SI00 ${new Date().getFullYear()}`
        };

        // Call UPN QR code API
        const response = await axios.post(
            'https://demo.podjetnikovpomocnik.net/api/upn/qr-code/pdf/simple',
            upnData,
            {
                headers: {
                    'Accept': 'application/octet-stream',
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }
        );

        // Save PDF locally
        const filePath = `UPN_QR_${transactionId}.pdf`;
        fs.writeFileSync(filePath, response.data);

        // Send the PDF as a response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filePath}`);
        res.send(response.data);
    } catch (error) {
        console.error('Error generating UPN PDF:', error);
        res.status(500).json({ error: 'Failed to generate UPN PDF' });
    }
};


const bankBICs = {
    'SI56': 'BANKSI22',
    'SI00': 'BANKX123',
    'DE89': 'DEUTDEFF',
    'FR14': 'BNPAFRPP'
};

function getBICfromIBAN(iban) {
    if (!iban || iban.length < 4) return 'UNKNOWNBIC';
    const bankCode = iban.substring(0, 4); // Prvih 4 znaki določajo banko
    return bankBICs[bankCode] || 'UNKNOWNBIC';
}

const generateAndSendHalcomXml = async (req, res) => {
    try {
        const { transactionId } = req.params;

        // Pridobitev transakcije z uporabo Mongoose in populate (če uporabljate reference)
        const transaction = await Transaction.findById(transactionId)
            .populate('buyers sellers')
            .exec();

        if (!transaction) {
            return res.status(404).json({ error: 'Transakcija ne obstaja' });
        }

        // Predpostavimo, da imamo vsaj enega kupca in enega prodajalca
        const buyer = transaction.buyers[0];
        const seller = transaction.sellers[0];

        // Ustvarjanje XML dokumenta z uporabo podatkov iz transakcije
        const debtorBIC = getBICfromIBAN(buyer.bankAccount);
        const creditorBIC = getBICfromIBAN(seller.bankAccount);

        const xmlDoc = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('Document', { xmlns: 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.09' })
            .ele('CstmrCdtTrfInitn')
            .ele('GrpHdr')
            .ele('MsgId').txt(`Msg-${transaction.id}`).up()
            .ele('CreDtTm').txt(transaction.createdAt ? transaction.createdAt.toISOString() : new Date().toISOString()).up()
            .ele('NbOfTxs').txt('1').up()
            .ele('CtrlSum').txt(transaction.paymentDetails?.remaining?.amount || '0.00').up()
            .ele('InitgPty')
            .ele('Nm').txt('ATRIUM D.O.O.').up()
            .up()
            .up()
            .ele('PmtInf')
            .ele('PmtInfId').txt(transaction.id).up()
            .ele('PmtMtd').txt('TRF').up()
            .ele('NbOfTxs').txt('1').up()
            .ele('CtrlSum').txt(transaction.paymentDetails?.remaining?.amount || '0.00').up()
            .ele('PmtTpInf')
            .ele('SvcLvl')
            .ele('Cd').txt('SEPA').up()
            .up()
            .up()
            .ele('ChrgBr').txt('SLEV').up()
            .ele('Dbtr')
            .ele('Nm').txt(`${buyer.firstName} ${buyer.lastName}`).up()
            .up()
            .ele('DbtrAcct')
            .ele('Id')
            .ele('IBAN').txt(buyer.bankAccount || 'SI00000000000000000').up()
            .up()
            .up()
            .ele('DbtrAgt')
            .ele('FinInstnId')
            .ele('BIC').txt(debtorBIC).up()
            .up()
            .up()
            .ele('CdtTrfTxInf')
            .ele('PmtId')
            .ele('InstrId').txt(`REF-${transaction.id}`).up()
            .ele('EndToEndId').txt(`REF-${transaction.id}`).up()
            .up()
            .ele('Amt')
            .ele('InstdAmt', { Ccy: 'EUR' }).txt(transaction.paymentDetails?.remaining?.amount || '0.00').up()
            .up()
            .ele('CdtrAgt')
            .ele('FinInstnId')
            .ele('BIC').txt(creditorBIC).up()
            .up()
            .up()
            .ele('Cdtr')
            .ele('Nm').txt(`${seller.firstName} ${seller.lastName}`).up()
            .ele('PstlAdr')
            .ele('AdrLine').txt('Dunajska 123').up()
            .ele('AdrLine').txt('1000 Ljubljana').up()
            .up()
            .up()
            .ele('CdtrAcct')
            .ele('Id')
            .ele('IBAN').txt(seller.bankAccount || 'SI11111111111111111').up()
            .up()
            .up()
            .ele('RmtInf')
            .ele('Ustrd').txt('Plačilo storitev ATRIUM').up()
            .up()
            .up()
            .up()
            .up()
            .up();


        // Končni XML string, lepo oblikovan
        const xmlContent = xmlDoc.end({ prettyPrint: true });

        // Pošljemo XML kot odgovor
        // Shrani XML v datoteko
        /* const filePath = `halcom_${transactionId}.xml`;
         fs.writeFileSync(filePath, xmlContent, 'utf8');
         console.log(`XML datoteka shranjena na: ${filePath}`);*/

        // Pošlji XML kot prenos uporabniku
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', `attachment; filename="halcom_${transactionId}.xml"`);
        res.send(xmlContent);
    } catch (error) {
        console.error('Napaka pri generiranju in shranjevanju XML:', error);
        res.status(500).json({ error: 'Napaka pri generiranju in shranjevanju XML' });
    }
};

// authentication used for google drive API!
// simple display of the auth code
const oAuthCallback = async(req, res) => {
    const code = req.query.code;
    res.send(`
        <html>
            <body>
                <p>Your authorization code is: ${code}</p>
            </body>
        </html>
    `);
}

module.exports = { generateUpn, generateAndSendHalcomXml, oAuthCallback };

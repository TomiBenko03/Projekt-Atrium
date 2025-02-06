const axios = require('axios');
const fs = require('fs');
const Transaction = require('../models/Transaction'); // Adjust path as needed
const { log } = require('console');

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

module.exports = generateUpn;

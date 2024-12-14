const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Agent = require('../models/Agent');
const Seller = require('../models/Seller');
const Buyer = require('../models/Buyer');
const Property = require('../models/Property');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const fs = require('fs');

const createTransaction = async (req, res) => {
    try {
        const {
            sellers,
            sellerSurnames,
            buyers,
            buyerSurnames,
            propertyName,
            paymentDetailsDepositAmount,
            paymentDetailsDepositDeadline,
            paymentDetailsDepositAccount,
            paymentDetailsRemainingAmount,
            paymentDetailsRemainingDeadline,
            paymentDetailsRemainingAccount,
            paymentDescriptor,
            buyerMortgage,
            mortgageAmount,
            handoverDeadline,
            sellerExpenses,
            buyerExpenses,
            contractPreparationDeadline,
            contractPreparedBy,
            legalDocuments,
        } = req.body;

        // Find the agent by id
        const agentId = req.session.agentId;
        const agent = await Agent.findById(agentId);
        if (!agent) throw new Error('Agent not found');

        // Resolve sellers by names
        const sellerIds = await Promise.all(
            (sellers || []).map(async (name, index) => {
                const seller = await Seller.findOne({ firstName: name.trim(), lastName: sellerSurnames[index]?.trim(), agentId: agent._id });
                if (!seller) throw new Error(`Seller ${name} ${sellerSurnames[index]} not found`);
                return seller._id;
            })
        );

        // Resolve buyers by names
        const buyerIds = await Promise.all(
            (buyers || []).map(async (name, index) => {
                const buyer = await Buyer.findOne({ firstName: name.trim(), lastName: buyerSurnames[index]?.trim(), agentId: agent._id });
                if (!buyer) throw new Error(`Buyer ${name} ${buyerSurnames[index]} not found`);
                return buyer._id;
            })
        );

        // Find the property by its mainPropertyId
        const property = await Property.findOne({ mainPropertyId: propertyName });
        if (!property) throw new Error('Property not found');

        // Create the transaction
        const newTransaction = new Transaction({
            agent: agent._id,
            sellers: sellerIds,
            buyers: buyerIds,
            property: property._id,
            paymentDetails: {
                deposit: {
                    amount: Number(paymentDetailsDepositAmount) || 0,
                    deadline: paymentDetailsDepositDeadline || null,
                    account: paymentDetailsDepositAccount || '',
                },
                remaining: {
                    amount: Number(paymentDetailsRemainingAmount) || 0,
                    deadline: paymentDetailsRemainingDeadline || null,
                    account: paymentDetailsRemainingAccount || '',
                },
            },
            paymentDescriptor: paymentDescriptor || '',
            buyerMortgage: Boolean(buyerMortgage),
            mortgageAmount: Number(mortgageAmount) || 0,
            handoverDeadline,
            sellerExpenses: sellerExpenses || [],
            buyerExpenses: buyerExpenses || [],
            contractPreparationDeadline,
            contractPreparedBy,
            legalDocuments,
        });

        // Save the transaction
        const savedTransaction = await newTransaction.save();
        res.status(201).json({
            message: 'Transaction created successfully',
            transaction: savedTransaction,
        });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(400).json({
            message: 'Failed to create transaction',
            error: error.message,
        });
    }
};

const searchTransaction = async (req, res) => {
    try {
        console.log('Searching for transaction:', req.params.id); // Debug log¸
=======
        console.log('Searching for transaction:', req.params.id);
        
        // Validate ID format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid transaction ID format' });
        }

>>>>>>> Stashed changes
        const transaction = await Transaction.findById(req.params.id)
            .populate('agent')
            .populate('buyers')
            .populate('sellers')
            .populate('property')
            .exec();

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Log successful find
        console.log('Transaction found:', transaction._id);
        
        res.json(transaction);
    } catch (error) {
        console.error('Search error details:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            message: 'Error searching transaction',
            error: error.message
        });
    }
};

const getAgentTransactions = async (req, res) => {
    try {
        const agentId = req.session.agentId;
        const transactions = await Transaction.find({ agent: agentId })
            .populate('agent')
            .populate('buyers')
            .populate('sellers')
            .populate('property');
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Failed to fetch transactions', error });
    }
};

// helper function for generating reports
const formatCheckbox = (value) => {
    return `${value ? '☒' : '☐'} DA ${!value ? '☒' : '☐'} NE`;
  };

// provizijsko porocilo
const generateCommissionReport = async(req, res) => {
    try{
    const transaction = await require('../models/Transaction').findById(req.params.id)
            .populate('agent')
            .populate('buyers')
            .populate('sellers')
            .populate('property');
    if (!transaction){
        return res.status(404).json({message: 'Transaction not found'});
    }

    // some calculations needed for the report
    const commissionPercentage = 4;
    const totalPrice = transaction.property.price;
    const commissionAmount = (totalPrice * commissionPercentage) / 100;
    const kwCaresDeduction = 20;
    const finalCommissionAmount = commissionAmount - kwCaresDeduction;

    // additional services (if data is available)
    const equipmentPrice = transaction.property.sellingPrice?.equipment || 0;
    const otherPrice = transaction.property.sellingPrice?.other || 0;
    const totalAdditionalServices = equipmentPrice + otherPrice;

    // to string
    const additionalServicesString = totalAdditionalServices > 0
      ? `Oprema: ${equipmentPrice}€, Ostalo: ${otherPrice}€, Skupaj: ${totalAdditionalServices}€`
      : 'N/A';

    const today = new Date().toLocaleDateString();

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: "Calibri",
              size: 22 //11pt
            }
          }
        }
      },

      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun(`Agent: ${transaction.agent.firstName} ${transaction.agent.lastName}. `),
              new TextRun(`Datum oddaje obračuna: ${today}`,),
              new TextRun({
                text: `Naslov nepremičnine in ID znak (št. stanovanja): ${transaction.property.address}, ID: ${transaction.property.mainPropertyId}`,
                break: true
              }),
              new TextRun({
                text: "",
                break: true
              })
            ]
          }),

          new Paragraph({
            children: [
              new TextRun(`Prodajalec: ${transaction.sellers.map(s => `${s.firstName} ${s.lastName}`).join(', ')}. `),
              new TextRun(`Plačnik: ${formatCheckbox(transaction.sellers[0]?.isPayer)}, `),
              new TextRun(`št. računa: ${transaction.sellers[0]?.bankAccount || 'N/A'}`),
              new TextRun({
                text: `plačano: ${formatCheckbox(transaction.sellers[0]?.hasPaid)}.`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Kdo je zastopal prodajalca (ime in priimek agenta): ${transaction.agent.firstName} ${transaction.agent.lastName}.`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun(`Kupec: ${transaction.buyers.map(b => `${b.firstName} ${b.lastName}`).join(', ')}. `),
              new TextRun(`Plačnik: ${formatCheckbox(transaction.buyers[0]?.isPayer)}, `),
              new TextRun(`št. računa: ${transaction.buyers[0]?.bankAccount || 'N/A'}, `),
              new TextRun({
                text: `plačano: ${formatCheckbox(transaction.buyers[0]?.hasPaid)}.`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Kdo je zastopal kupca (ime in priimek agenta): ${transaction.agent.firstName} ${transaction.agent.lastName}.`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun(`Prodajna cena: ${transaction.property.price}€. `),
              new TextRun(`Skupaj (%): ${commissionPercentage}%. `),
              new TextRun(`Skupaj provizija znesek: ${commissionAmount}€, `),
              new TextRun({
                text: `(-20 € - KW cares): -${kwCaresDeduction}€`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Znesek provizije, ki vam ga je potrebno nakazati: ${finalCommissionAmount}€. (če gre za delitev potem je to 70%, v kolikor ste capper potem odštejete 10% franšize). `,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `REFERRAL/NAPOTITEV: `,
                bold: true,
                underline: true,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun(`napotitev ste prejeli: ${transaction.referralReceived ? 'DA' : 'NE'}. `),
              new TextRun(`Kdo vam ga je posredoval: ${transaction.referralFrom || 'N/A'}, `),
              new TextRun(`napotitev ste posredovali: ${transaction.referralGiven ? 'DA' : 'NE'}. `),
              new TextRun(`Komu ste ga posredovali: ${transaction.referralTo || 'N/A'}. `),
              new TextRun({
                text: `Višina dogovorjenega refferal-a za obračun: ${transaction.referralPercentage || '0'}%.`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun(`Interne dodatne storitve: ${additionalServicesString}. `),
              new TextRun(`Zunanji pogodbeni dobavitelji: ${transaction.externalContractors || 'N/A'}. `),
              new TextRun({
                text: `Provizija od dobavitelja: ${transaction.contractorCommission || 'N/A'}. `,
                break: true
              }),

            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Kdo je vodil prodajni postopek (ime in priimek): ${transaction.agent.firstName} ${transaction.agent.lastName}`,
                break: true
              }),

            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Odgovoren za prodajno pogodbo (ime, priimek in naziv družbe): ${transaction.contractPreparedBy || 'N/A'}`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Datum zaključka: ${new Date(transaction.handoverDeadline).toLocaleDateString()}`,
                break: true
              }),
            ]
          }),
        ]
      }]
    })

    const buffer = await Packer.toBuffer(doc);
    const filename = transaction.agent.firstName + "_izplacilo_provizije";

    res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename=${filename}.docx`,
    })
    res.send(buffer);
    } catch (error){
    console.error(`Error generating report:`, error);
    res.status(500).json({message: `Error generating report`})
  };
}

module.exports = {
    createTransaction,
    searchTransaction,
    getAgentTransactions,
    generateCommissionReport,
};

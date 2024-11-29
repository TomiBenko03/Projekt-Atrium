const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Agent = require('../models/Agent'); // Import Agent model
const Seller = require('../models/Seller'); // Import Seller model
const Buyer = require('../models/Buyer'); // Import Buyer model
const Property = require('../models/Property'); // Import Property model

const createTransaction = async (req, res) => {
    try {
        const {
            agentFirstName,
            agentLastName,
            sellers,
            sellerSurnames,
            buyers,
            buyerSurnames,
            propertyName,
            paymentDetailsDepositAmount,
            paymentDetailsDepositDeadline,
            paymentDetailsDepositAccount,
            paymentDetailsDepositAlreadyPaidAmount,
            paymentDetailsDepositAlreadyPaidAccount,
            paymentDetailsRemainingAmount,
            paymentDetailsRemainingDeadline,
            paymentDetailsRemainingAccount,
            paymentDetailsRemainingAdditionalNotes,
            handoverDeadline,
            sellerExpenses,
            buyerExpenses,
            contractPreparationDeadline,
            contractPreparedBy,
            legalDocuments,
        } = req.body;

        // Ensure sellers and buyer arrays are parsed correctly
        const sellerNamesArray = Array.isArray(sellers) ? sellers : sellers.split(',');
        const sellerSurnamesArray = Array.isArray(sellerSurnames) ? sellerSurnames : sellerSurnames.split(',');
        const buyerNamesArray = Array.isArray(buyers) ? buyers : buyers.split(',');
        const buyerSurnamesArray = Array.isArray(buyerSurnames) ? buyerSurnames : buyerSurnames.split(',');

        // Resolve agent by firstName and lastName
        const agent = await Agent.findOne({
            firstName: agentFirstName,
            lastName: agentLastName,
        });
        if (!agent) {
            return res.status(404).json({ message: "Agent not found" });
        }

        // Resolve sellers by firstName and lastName
        const sellerIds = await Promise.all(
            sellerNamesArray.map(async (firstName, index) => {
                const seller = await Seller.findOne({
                    firstName: firstName.trim(),
                    lastName: sellerSurnamesArray[index]?.trim(),
                });
                if (!seller) throw new Error(`Seller ${firstName} ${sellerSurnamesArray[index]} not found`);
                return seller._id;
            })
        );

        // Resolve buyers by firstName and lastName
        const buyerIds = await Promise.all(
            buyerNamesArray.map(async (firstName, index) => {
                const buyer = await Buyer.findOne({
                    firstName: firstName.trim(),
                    lastName: buyerSurnamesArray[index]?.trim(),
                });
                if (!buyer) throw new Error(`Buyer ${firstName} ${buyerSurnamesArray[index]} not found`);
                return buyer._id;
            })
        );

        // Resolve property by mainPropertyId
        const property = await Property.findOne({ mainPropertyId: propertyName });
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        // Parse expenses arrays
        const sellerExpensesArray = Array.isArray(sellerExpenses)
            ? sellerExpenses
            : [];
        const buyerExpensesArray = Array.isArray(buyerExpenses)
            ? buyerExpenses
            : [];

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
                    alreadyPaid: {
                        amount: Number(paymentDetailsDepositAlreadyPaidAmount) || 0,
                        account: paymentDetailsDepositAlreadyPaidAccount || '',
                    },
                },
                remaining: {
                    amount: Number(paymentDetailsRemainingAmount) || 0,
                    deadline: paymentDetailsRemainingDeadline || null,
                    account: paymentDetailsRemainingAccount || '',
                    additionalNotes: paymentDetailsRemainingAdditionalNotes || '',
                },
            },
            handoverDeadline,
            sellerExpenses: sellerExpensesArray,
            buyerExpenses: buyerExpensesArray,
            contractPreparationDeadline,
            contractPreparedBy,
            legalDocuments,
        });

        const savedTransaction = await newTransaction.save();

        res.status(201).json({
            message: 'Transaction created successfully',
            transaction: savedTransaction,
        });
    } catch (error) {
        console.error('Error creating transaction: ', error);
        res.status(400).json({
            message: 'Failed to create transaction',
            error: error.message,
        });
    }
};

module.exports = {
    createTransaction,
};

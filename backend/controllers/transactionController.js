const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

const createTransaction = async(req, res) => {
    try{
        const {
            agent,
            sellers,
            buyers,
            property,
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

        // Parse `sellers`, `buyers`, `sellerExpenses`, and `buyerExpenses` if provided
        const sellersArray = Array.isArray(sellers) ? sellers : [];
        const buyersArray = Array.isArray(buyers) ? buyers : [];
        const sellerExpensesArray = Array.isArray(sellerExpenses) ? sellerExpenses : [];
        const buyerExpensesArray = Array.isArray(buyerExpenses) ? buyerExpenses : [];

        const newTransaction = new Transaction({
            agent,
            sellers: sellersArray,
            buyers: buyersArray,
            property,
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
            transaction: savedTransaction
        });
    }
    catch (error) {
        console.error('Error creating transaction: ', error);
        res.status(400).json({
            message: 'Failed to create transaction',
            error: error.message
        });
    }
};

module.exports = {
    createTransaction
};
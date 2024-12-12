const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Agent = require('../models/Agent');
const Seller = require('../models/Seller');
const Buyer = require('../models/Buyer');
const Property = require('../models/Property');

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
        const transaction = await Transaction.findById(req.params.id)
            .populate('agent')
            .populate('buyers')
            .populate('sellers')
            .populate('property');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        console.log('sent for transaction:', req.params.id); // Debug log
        res.json(transaction);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Error searching transaction', error: error.message });
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

module.exports = {
    createTransaction,
    searchTransaction,
    getAgentTransactions,
};

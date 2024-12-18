const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Agent = require('../models/Agent');
const Seller = require('../models/Seller');
const Buyer = require('../models/Buyer');
const Property = require('../models/Property');
const { generateCommissionReport, generateBindingOffer, generateSalesContract } = require('../utils/documentGenerator');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, VerticalAlign, WidthType } = require("docx");

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
            status
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
            status,
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
        console.log('Searching for transaction:', req.params.id);
        
        // Validate ID format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid transaction ID format' });
        }

        const transaction = await Transaction.findById(req.params.id)
            .populate('agent')
            .populate('buyers')
            .populate('sellers')
            .populate('property')
            .populate('status')
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
            .populate('_id')
            .populate('agent')
            .populate('buyers')
            .populate('sellers')
            .populate('property')
            .populate('status');
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Failed to fetch transactions', error });
    }
};
const updateTransaction = async (req, res) => {
    try {
      const { Id } = req.params;
      const { status } = req.body;
  
      // Validate transaction ID format
     
    
      // Find the transaction by ID
      const transaction = await Transaction.findById(Id);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
  
      // Update only the status field
      transaction.status = status;
      await transaction.save();
  
      res.status(200).json({
        message: 'Transaction status updated successfully',
        status: transaction.status,
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({
        message: 'Failed to update transaction',
        error: error.message,
      });
    }
  };
  
  const handleCommissionReport = async (req, res) => {
    try {
        const { buffer, filename } = await generateCommissionReport(req.params.id);
        
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename=${filename}`
        });
        res.send(buffer);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Error generating report' });
    }
};

const handleBindingOffer = async (req, res) => {
    try {
        const { buffer, filename } = await generateBindingOffer(req.params.id);
        
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename=${filename}`
        });
        res.send(buffer);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Error generating report' });
    }
};

const handleSalesContract = async (req, res) => {
  try{
    const { buffer, filename } = await generateSalesContract(req.params.id);
    res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename=${filename}`
        });
    res.send(buffer);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
};

module.exports = {
    createTransaction,
    searchTransaction,
    getAgentTransactions,
    updateTransaction,
    generateCommissionReport: handleCommissionReport,
    generateBindingOffer: handleBindingOffer,
    generateSalesContract: handleSalesContract,
};

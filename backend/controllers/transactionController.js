const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Agent = require('../models/Agent');
const Seller = require('../models/Seller');
const Buyer = require('../models/Buyer');
const Property = require('../models/Property');
const sendEmailNotification = require('../utils/emailService');

const { 
    generateBindingOffer, 
    generateCalculationOfRealEstateCosts 
} = require('../utils/documentGenerator');
const {
    generateCommissionReport,
    generateSalesContract,
    generatePrimopredajniZapisnik,
} = require('../utils/documentGen');
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

            paymentDetailsRemainingDeadline,
            paymentDescriptor,
            buyerMortgage,
            mortgageAmount,
            handoverDeadline,
            sellerExpenses,
            buyerExpenses,
            contractPreparationDeadline,
            contractPreparedBy,
            legalDocuments,
            status,
            // Nova polja
            kontrola,
            referral,
            vpisanoFF,
            zakljucenoFF,
            stRacDoStranke,
            strankaPlacala,
            stRacunaAgenta,
            agentPlacano,
            arhivOk,
            commissionPercent,
            commissionGross,
        } = req.body;

        // Najdemo agenta glede na id iz seje
        const agentId = req.session.agentId;
        const agent = await Agent.findById(agentId);
        if (!agent) throw new Error('Agent not found');

        // Resolve sellers by names
        const sellerIds = await Promise.all(
            (sellers || []).map(async (name, index) => {
                const seller = await Seller.findOne({ 
                    firstName: name.trim(), 
                    lastName: sellerSurnames[index]?.trim(), 
                    agentId: agent._id 
                });
                if (!seller) throw new Error(`Seller ${name} ${sellerSurnames[index]} not found`);
                return seller._id;
            })
        );

        // Resolve buyers by names
        const buyerIds = await Promise.all(
            (buyers || []).map(async (name, index) => {
                const buyer = await Buyer.findOne({ 
                    firstName: name.trim(), 
                    lastName: buyerSurnames[index]?.trim(), 
                    agentId: agent._id 
                });
                if (!buyer) throw new Error(`Buyer ${name} ${buyerSurnames[index]} not found`);
                return buyer._id;
            })
        );

        // Najdemo nepremičnino glede na mainPropertyId
        const property = await Property.findOne({ mainPropertyId: propertyName });
        if (!property) throw new Error('Property not found');

        // Ustvarimo transakcijo z vsemi podatki, vključno z novimi polji
        const newTransaction = new Transaction({
            agents: [agent._id],
            sellers: sellerIds,
            buyers: buyerIds,
            property: property._id,
            paymentDetails: {
                deposit: {
                    amount: Number(paymentDetailsDepositAmount) || 0,
                    deadline: paymentDetailsDepositDeadline || null,
                    alreadyPaid: { amount: 0},
                },
                remaining: {
                    amount: Number(property.price) || 0,
                    deadline: paymentDetailsRemainingDeadline || null,
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
            // Dodajamo nova polja
            kontrola: Number(kontrola) || 0,
            referral: Boolean(referral),
            vpisanoFF: Boolean(vpisanoFF),
            zakljucenoFF: Boolean(zakljucenoFF),
            stRacDoStranke: stRacDoStranke || '',
            strankaPlacala: Boolean(strankaPlacala),
            stRacunaAgenta: stRacunaAgenta || '',
            agentPlacano: Boolean(agentPlacano),
            arhivOk: Boolean(arhivOk),
            commissionPercent: Number(commissionPercent) || 0,
            commissionGross: Number(commissionGross) || 0,
        });

        // Shranimo transakcijo
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
        console.log('Searching for transaction:', req.params.id); // Debug log

        const { id } = req.params;
        const userId = req.session.agentId;
        const userRole = req.session.role;
        
        // Validate ID format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid transaction ID format' });
        }

        const transaction = await Transaction.findById(req.params.id)
            .populate('agents')
            .populate('buyers')
            .populate('sellers')
            .populate('property')
            .populate('status')
            .exec();

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if(userRole === 'odvetnik' && !transaction.agents.includes(userId)) {
            return res.status(403).json({ message: 'Access denied. Transaction not assigned to you.' });
        }
        
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
        const userId = req.session.agentId;

        const transactions = await Transaction.find({ agents: userId })
            .populate('agents')
            .populate('buyers')
            .populate('sellers')
            .populate('property');

        res.status(200).json(transactions);
        console.log("nekeje12");
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Failed to fetch transactions', error });
    }
};
const getAdminTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('agents')
            .populate('buyers')
            .populate('sellers')
            .populate('property');

        res.status(200).json(transactions);
        console.log("nekeje3");
    } catch (error) {
        console.error('Error fetching all transactions:', error);
        res.status(500).json({ message: 'Failed to fetch transactions', error });
    }
};
const updateTransaction = async (req, res) => {
    try {
        const { Id } = req.params;
        const { status } = req.body;
  
        const transaction = await Transaction.findById(Id)
            .populate('agents', 'email firstName lastName role')

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
  
        const previousStatus = transaction.status;
        transaction.status = status;
        await transaction.save();

        if (previousStatus !== status) {
            if (status === 'prodajalni postopek') {
                const lawyers = transaction.agents.filter(agent => agent.role === 'odvetnik');
                for (const lawyer of lawyers) {
                    await sendEmailNotification(
                        "info@kwslovenia.si",
                        "KW info",
                        lawyer.email,
                        `Status transakcije ${transaction._id} je bil spremenjen v 'prodajalni postopek'`
                    );
                }
            }
            if (status === 'pripravljanje pogodbe') {
                const agents = transaction.agents.filter(agent => agent.role === 'agent');
                for (const agent of agents) {
                    await sendEmailNotification(
                        "info@kwslovenia.si",
                        "KW info",
                        agent.email,
                        `Status transakcije ${transaction._id} je bil spremenjen v 'pripravljanje pogodbe'`
                    );
                }
            }
        }
  
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

const assignTransactionToLawyer = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { lawyerEmail } = req.body;

        const lawyer = await Agent.findOne({ email: lawyerEmail, role: 'odvetnik' });
        if (!lawyer) {
            return res.status(400).json({ message: 'Lawyer not found or invalid role' });
        }

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(400).json({ message: 'Transaction not found' });
        }

        if (!transaction.agents.includes(lawyer._id)) {
            transaction.agents.push(lawyer._id);
            await transaction.save();
        }

        res.status(200).json({ message: 'Transaction assigned to lawyer' });
    } catch (error) {
        console.error('Error assigning transaction: ', error);
        res.status(500).json({ 
            message: 'Failed to assign transaction', 
            error: error.message 
        });
    }
};

const handleCommissionReport = async (req, res) => {
    try {
        const { buffer, fileName } = await generateCommissionReport(req.params.id);
        
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename=${fileName}`
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
    try {
        const { buffer, fileName } = await generateSalesContract(req.params.id);
        
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename=${fileName}`
        });
        
        res.send(buffer);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Error generating report' });
    }
};

const handlePrimopredajniZapisnik = async (req, res) => {
    try {
        const { buffer, fileName } = await generatePrimopredajniZapisnik(req.params.id);
        
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename=${fileName}`
        });
        
        res.send(buffer);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Error generating report' });
    }
};

const handleCalculationOfRealEstateCosts = async (req, res) => {
    try {
        const { buffer, filename } = await generateCalculationOfRealEstateCosts(req.params.id);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=${filename}`
        });
        res.send(buffer);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Error generating report' });
    }
};

const updateFFDetails = async (req, res) => {
    try {
      const { id } = req.params; // ID transakcije
      const {
        kontrola,
        referral,
        vpisanoFF,
        zakljucenoFF,
        stRacDoStranke,
        strankaPlacala,
        stRacunaAgenta,
        agentPlacano,
        arhivOk,
      } = req.body;
  
      // Posodobimo FF polja. Pretvorimo vrednosti, če je potrebno.
      const updatedTransaction = await Transaction.findByIdAndUpdate(
        id,
        {
          kontrola: Number(kontrola) || 0,
          referral: Boolean(referral),
          vpisanoFF: Boolean(vpisanoFF),
          zakljucenoFF: Boolean(zakljucenoFF),
          stRacDoStranke: stRacDoStranke || '',
          strankaPlacala: Boolean(strankaPlacala),
          stRacunaAgenta: stRacunaAgenta || '',
          agentPlacano: Boolean(agentPlacano),
          arhivOk: Boolean(arhivOk),
        },
        { new: true } // Vrne posodobljen dokument
      );
  
      if (!updatedTransaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
  
      res.json(updatedTransaction);
    } catch (error) {
      console.error('Error updating FF details:', error);
      res.status(500).json({
        message: 'Failed to update FF details',
        error: error.message,
      });
    }
  };
  



module.exports = {
    createTransaction,
    searchTransaction,
    getAgentTransactions,
    getAdminTransactions,
    updateTransaction,
    assignTransactionToLawyer,
    generateCommissionReport: handleCommissionReport,
    generateBindingOffer: handleBindingOffer,
    generateSalesContract: handleSalesContract,
    generateCalculationOfRealEstateCosts: handleCalculationOfRealEstateCosts,
    generatePrimopredajniZapisnik: handlePrimopredajniZapisnik,
    updateFFDetails,
};

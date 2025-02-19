const Message = require('../models/Message');
const Transaction = require('../models/Transaction');
const Agent = require('../models/Agent');
const sendEmailNotification = require('../utils/emailService');

const addComment = async (req, res) => {
    const { userId, transactionId, comment } = req.body;

    console.log('Session:', req.session); // Debugging session
    console.log('Sender ID:', userId); // Debugging senderId
    console.log('Transaction ID:', userId); 
    console.log('Comment:', comment); 

    if (!transactionId || !comment || !userId) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const transaction = await Transaction.findById(transactionId)
            .populate('agents', 'email firstName lastName')
            .populate('buyers', 'email firstName lastName')
            .populate('sellers', 'email firstName lastName');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const newComment = new Message({
            transaction: transactionId,
            sender: userId,
            comment
        });

        await newComment.save();

        // Get sender details
        const sender = await Agent.findById(userId)
            .select('firstName lastName email');

        if (!sender) {
            console.log('Sender not found');
            return res.status(201).json({ message: 'Comment added successfully', comment: newComment });
        }

        // Get all agent emails except sender
        const recipientEmails = transaction.agents
            .map(agent => agent.email)
            .filter(email => email !== sender.email);

        // Send notifications
        recipientEmails.forEach(async (email) => {
            await sendEmailNotification(
                sender.email, // Pass the sender's email dynamically
                `${sender.firstName} ${sender.lastName}`,
                email,
                comment
            );
        });

        res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Failed to add comment', error });
    }
};

const getComments = async (req, res) => {
    const { transactionId } = req.params;

    try {
        const comments = await Message.find({ transaction: transactionId })
            .populate('sender', 'firstName lastName email')
            .sort({ timestamp: -1 });

        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Failed to fetch comments', error });
    }
};

module.exports = {
    addComment,
    getComments
};
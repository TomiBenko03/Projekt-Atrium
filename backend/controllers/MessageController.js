const Agent = require('../models/Agent');
const Message = require('../models/Message');

const sendMessage = async (req, res) => {
    const { senderId, receiverEmail, message } = req.body;
    
    if (!senderId || !receiverEmail || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try{
        const receiver = await Agent.findOne({ email: receiverEmail });
        if(!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        const newMessage = new Message({
            sender: senderId,
            receiver: receiver._id,
            message
        })

        await newMessage.save();

        res.status(201).json({ message: 'Message sent successfully' });
    }
    catch (error) {
        console.error('Error sending message: ', error);
        res.status(500).json({ message: 'Failed to send message', error });
    }
};

const getMessages = async (req, res) => {
    const { userId } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        }).populate('sender receiver', 'firstName lastName email');

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Failed to fetch messages', error });
    }
};

module.exports = {
    sendMessage,
    getMessages,
};
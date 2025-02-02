const Buyer = require('../models/Buyer');

const createBuyer = async (req, res) => {
    try {
        const { firstName, lastName, address, gsm, email, emso, taxNumber, bankAccount, bankName } = req.body;
        const agentId = req.session.agentId;

        const newBuyer = new Buyer({
            firstName,
            lastName,
            address,
            gsm,
            email,
            emso,
            taxNumber,
            bankAccount,
            bankName,
            agentId
        });

        const savedBuyer = await newBuyer.save();
        res.status(201).json({ message: 'Buyer created successfully', buyer: savedBuyer });
    } catch (error) {
        console.error('Error creating Buyer:', error);
        res.status(500).json({ message: 'Failed to create Buyer', error });
    }
};

const getAgentBuyers = async(req, res) => {
    try {
        const agentId = req.session.agentId;
        const buyers = await Buyer.find({ agentId });
        res.status(200).json(buyers);
    } catch (error) {
        console.error('Error fetching buyers:', error);
        res.status(500).json({ message: 'Failed to fetch buyers', error });
    }
};

const searchBuyers = async(req, res) => {
    try{
        const { query } = req.body;

        const buyers = await Buyer.find({
            $or: [
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } },
                { gsm: { $regex: query, $options: 'i' }
            }
            ]
        });
        res.status(200).json(buyers);
    }
    catch(error) {
        console.error('Error searching buyers: ', error);
        res.status(500).json({ message: 'Failed to search buyers', error });
    }
};

module.exports = {
    createBuyer,
    getAgentBuyers,
    searchBuyers,
};

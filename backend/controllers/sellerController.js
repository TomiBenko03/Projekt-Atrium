const Agent = require('../models/Agent');
const Seller = require('../models/Seller');

const createSeller = async(req, res) => {
    try {
        const { firstName, lastName, address, gsm, email, emso, taxNumber, bankAccount, bankName } = req.body;
        const agentId = req.session.agentId;

        console.log('Agent ID:', agentId); // Debug

        const newSeller = new Seller({
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

        const savedSeller = await newSeller.save();
        res.status(201).json({ message: 'Seller created successfully', seller: savedSeller });
    } catch (error) {
        console.error('Error creating seller:', error);
        res.status(500).json({ message: 'Failed to create seller', error });
    }
};

const getAgentSellers = async(req, res) => {
    try {
        const agentId = req.session.agentId;
        const sellers = await Seller.find({ agentId });
        res.status(200).json(sellers);
    } catch (error) {
        console.error('Error fetching sellers:', error);
        res.status(500).json({ message: 'Failed to fetch sellers', error });
    }
};

const searchSellers = async(req, res) => {
    try{
        const { query } = req.body;
        const sellers = await Seller.find({
            $or: [
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } }
            ]
        });
        res.status(200).json(sellers);
    }
    catch(error) {
        console.error('Error searching sellers: ', error);
        res.status(500).json({ message: 'Failed to search sellers', error });
    }
};

const searchSellersByPhone = async(req, res) => {
    try{
        const { query } = req.body;

        const sellers = await Seller.find({
            gsm: { $regex: query, $options: 'i' }
        });

        res.status(200).json(sellers);
    }
    catch (error) {
        console.error('Error searching for sellers by phone: ', error);
        res.status(500).json({ message: 'Failed to search sellers by phone', error });
    }
};

module.exports = {
    createSeller,
    getAgentSellers,
    searchSellers,
    searchSellersByPhone,
};


const Buyer = require('../models/Buyer');

// Create a new agent
const createBuyer = async (req, res) => {
    try {
        const { firstName, lastName, address, gsm, email, emso, taxNumber, bankAccount, bankName } = req.body;

        // Create a new agent document
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
        });

        // Save the agent to the database
        const savedBuyer = await newBuyer.save();
        res.status(201).json({ message: 'Buyer created successfully', buyer: savedBuyer });
    } catch (error) {
        console.error('Error creating Buyer:', error);
        res.status(500).json({ message: 'Failed to create Buyer', error });
    }
};

module.exports = {
    createBuyer,
};

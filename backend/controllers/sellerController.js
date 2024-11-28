const Seller = require('../models/Seller');

const createSeller = async(req, res) => {
    try {
        const { firstName, lastName, address, gsm, email, emso, taxNumber, bankAccount, bankName } = req.body;

        // Create a new seller document
        const newSeller = new Seller({
            firstName,
            lastName,
            address,
            gsm,
            email,
            emso,
            taxNumber,
            bankAccount,
            bankName
        });

        // Save the seller to the database
        const savedSeller = await newSeller.save();
        res.status(201).json({ message: 'Seller created successfully', seller: savedSeller });
    } catch (error) {
        console.error('Error creating seller:', error);
        res.status(500).json({ message: 'Failed to create seller', error });
    }
};

module.exports = {
    createSeller,
};


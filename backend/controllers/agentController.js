const Agent = require('../models/Agent');

// Create a new agent
const createAgent = async (req, res) => {
    try {
        const { firstName, lastName, address, gsm, email, emso, taxNumber } = req.body;

        // Create a new agent document
        const newAgent = new Agent({
            firstName,
            lastName,
            address,
            gsm,
            email,
            emso,
            taxNumber,
        });

        // Save the agent to the database
        const savedAgent = await newAgent.save();
        res.status(201).json({ message: 'Agent created successfully', agent: savedAgent });
    } catch (error) {
        console.error('Error creating agent:', error);
        res.status(500).json({ message: 'Failed to create agent', error });
    }
};

module.exports = {
    createAgent,
};

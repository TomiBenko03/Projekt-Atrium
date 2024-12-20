const Agent = require('../models/Agent');

const createAgent = async (req, res) => {
    try {
        const { firstName, lastName, address, gsm, email, emso, taxNumber, password, role } = req.body;

        // Validate the role
        if (!['agent', 'odvetnik'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be either "agent" or "odvetnik".' });
        }

        // Create a new user with the specified role
        const newAgent = new Agent({
            firstName,
            lastName,
            address,
            gsm,
            email,
            emso,
            taxNumber,
            password,
            role, // Assign the role
        });

        const savedAgent = await newAgent.save();
        res.status(201).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`, agent: savedAgent });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Failed to create user', error });
    }
};


const getAllAgents = async (req, res) => {
    try {
        const agents = await Agent.find({});
        res.status(200).json(agents);
    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ message: 'Failed to fetch agents', error });
    }
};

const login = async (req, res, next) => {
    try{
        const agent = await Agent.authenticate(req.body.email, req.body.password);

        req.session.agentId = agent._id;
        req.session.role=agent.role;
        console.log('Session after login:', req.session);
        return res.json(agent);
    }
    catch (err) {
        const error = new Error('Wrong email or password');
        error.status = 401;
        return next(error);
    }
};

const logout = (req, res, next) => {
    if(req.session) {
        req.session.destroy(function (err) {
            if(err) {
                console.error('Error destroying session: ', err);
                return next(err);
            }
            else{
                console.log('Session destroyed successfully');
                return res.status(201).json({ message: 'Logged out successfully' });
            }
        });
    }
    else{
        console.log('No sessions to destroy');
        return res.status(400).json({ message: 'No session to destroy' });
    }
};


module.exports = {
    createAgent,
    getAllAgents,
    login,
    logout
};
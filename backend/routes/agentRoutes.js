const express = require('express');
const router = express.Router();
const { createAgent, login, logout } = require('../controllers/agentController');
const { getAllAgents } = require('../controllers/agentController');

// POST /api/agents - Create a new agent
router.post('/', createAgent);
router.post('/login', login);
router.post('/logout', logout);

router.get('/', getAllAgents);


module.exports = router;

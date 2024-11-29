const express = require('express');
const router = express.Router();
const { createAgent } = require('../controllers/agentController');
const { getAllAgents } = require('../controllers/agentController');

// POST /api/agents - Create a new agent
router.post('/', createAgent);
router.get('/', getAllAgents);

module.exports = router;

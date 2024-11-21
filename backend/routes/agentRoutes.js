const express = require('express');
const router = express.Router();
const { createAgent } = require('../controllers/agentController');

// POST /api/agents - Create a new agent
router.post('/', createAgent);

module.exports = router;

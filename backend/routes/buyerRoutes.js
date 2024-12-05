const express = require('express');
const router = express.Router();
const { createBuyer, getAgentBuyers } = require('../controllers/buyerController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createBuyer);
router.post('/agentBuyers', authMiddleware, getAgentBuyers);

module.exports = router;

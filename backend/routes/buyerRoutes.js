const express = require('express');
const router = express.Router();
const { createBuyer, getAgentBuyers, searchBuyers } = require('../controllers/buyerController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createBuyer);
router.post('/agentBuyers', authMiddleware, getAgentBuyers);
router.post('/searchBuyers', authMiddleware, searchBuyers)

module.exports = router;

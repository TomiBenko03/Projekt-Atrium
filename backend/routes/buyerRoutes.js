const express = require('express');
const router = express.Router();
const { createBuyer, getAgentBuyers, searchBuyers, searchBuyersByPhone } = require('../controllers/buyerController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createBuyer);
router.post('/agentBuyers', authMiddleware, getAgentBuyers);
router.post('/searchBuyers', authMiddleware, searchBuyers)
router.post('/searchBuyersByPhone', authMiddleware, searchBuyersByPhone);

module.exports = router;

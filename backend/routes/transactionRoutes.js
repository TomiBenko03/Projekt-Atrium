const express = require('express');
const router = express.Router();
const { createTransaction, searchTransaction, getAgentTransactions } = require('../controllers/transactionController');

router.post('/', createTransaction);
router.get('/search/:id', searchTransaction);
router.get('/agentTransactions', getAgentTransactions);

module.exports = router;
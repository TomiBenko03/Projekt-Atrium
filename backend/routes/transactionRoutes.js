const express = require('express');
const router = express.Router();
const { createTransaction, searchTransaction, getAgentTransactions, generateCommissionReport } = require('../controllers/transactionController');

router.post('/', createTransaction);
router.get('/search/:id', searchTransaction);
router.get('/agentTransactions', getAgentTransactions);
router.get('/report/:id', generateCommissionReport);

module.exports = router;
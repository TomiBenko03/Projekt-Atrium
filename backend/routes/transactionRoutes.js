const express = require('express');
const router = express.Router();
const { createTransaction, searchTransaction, getAgentTransactions, generateCommissionReport, generateBindingOffer,updateTransaction } = require('../controllers/transactionController');

router.post('/', createTransaction);
router.get('/search/:id', searchTransaction);
router.get('/agentTransactions', getAgentTransactions);
router.get('/report/:id', generateCommissionReport);
router.get('/bindingOffer/:id', generateBindingOffer);
router.put('/updatestatus/:Id', updateTransaction);
module.exports = router;
const express = require('express');
const router = express.Router();
const { 
    createTransaction, 
    searchTransaction, 
    getAgentTransactions, 
    generateCommissionReport, 
    generateBindingOffer,
    updateTransaction, 
    generateSalesContract, 
    assignTransactionToLawyer,
    generateCalculationOfRealEstateCosts,
    updateFFDetails
} = require('../controllers/transactionController');


router.post('/', createTransaction);
router.get('/search/:id', searchTransaction);
router.get('/agentTransactions', getAgentTransactions);
router.put('/updatestatus/:Id', updateTransaction);
router.put('/assignLawyer/:transactionId', assignTransactionToLawyer);

router.get('/report/:id', generateCommissionReport);
router.get('/bindingOffer/:id', generateBindingOffer);
router.get('/salesContract/:id', generateSalesContract);
router.get('/calcEstateCosts/:id', generateCalculationOfRealEstateCosts);
router.put('/updateFF/:id', updateFFDetails);
module.exports = router;
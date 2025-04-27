const express = require('express');
const router = express.Router();
const {
    createTransaction,
    searchTransaction,
    getAgentTransactions,
    getAdminTransactions,
    generateCommissionReport,
    generateBindingOffer,
    updateTransaction,
    generateSalesContract,
    assignTransactionToLawyer,
    generateCalculationOfRealEstateCosts,
    generatePrimopredajniZapisnik,
    updateFFDetails,
    updateTransactionDetails,
    updateRelatedEntity,
    getAuditLogs
} = require('../controllers/transactionController');
const authMiddleware = require('../middleware/auth');


router.post('/', createTransaction);
router.get('/search/:id', searchTransaction);
router.get('/agentTransactions', getAgentTransactions);
router.get('/adminTransactions', getAdminTransactions);
router.put('/updatestatus/:Id', updateTransaction);
router.put('/assignLawyer/:transactionId', assignTransactionToLawyer);

router.get('/report/:id', generateCommissionReport);
router.get('/bindingOffer/:id', generateBindingOffer);
router.get('/salesContract/:id', generateSalesContract);
router.get('/calcEstateCosts/:id', generateCalculationOfRealEstateCosts);
router.get('/primopredajniZapisnik/:id', generatePrimopredajniZapisnik);
router.put('/updateFF/:id', updateFFDetails);
router.put('/:id', authMiddleware, updateTransactionDetails);
router.put(
    '/:id/:entityType(buyer|seller|property)/:entityId',
    authMiddleware,
    updateRelatedEntity
); router.get('/audit/:id', authMiddleware, getAuditLogs);
module.exports = router;
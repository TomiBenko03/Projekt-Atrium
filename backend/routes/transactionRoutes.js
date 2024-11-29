const express = require('express');
const router = express.Router();
const { createTransaction, searchTransaction } = require('../controllers/transactionController');

router.post('/', createTransaction);
router.get('/search/:id', searchTransaction);

module.exports = router;
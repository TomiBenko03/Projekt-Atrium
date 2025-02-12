const express = require('express');
const router = express.Router();
const { generateUpn, generateAndSendHalcomXml }= require('../controllers/apiController'); // Adjust path as needed

router.post('/generateUpn/:transactionId', generateUpn);
router.post('/generateAndSendHalcomXml/:transactionId', generateAndSendHalcomXml);

module.exports = router;
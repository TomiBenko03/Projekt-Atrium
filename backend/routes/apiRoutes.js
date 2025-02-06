const express = require('express');
const router = express.Router();
const generateUpn = require('../controllers/apiController'); // Adjust path as needed



router.post('/generateUpn/:transactionId', generateUpn);

module.exports = router;
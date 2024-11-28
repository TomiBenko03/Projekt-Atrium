const express = require('express');
const router = express.Router();
const { createSeller } = require('../controllers/sellerController');

router.post('/', createSeller);

module.exports = router;
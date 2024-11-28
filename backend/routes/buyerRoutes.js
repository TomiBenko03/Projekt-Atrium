const express = require('express');
const router = express.Router();
const { createBuyer } = require('../controllers/buyerController');

// POST /api/agents - Create a new agent
router.post('/', createBuyer);

module.exports = router;

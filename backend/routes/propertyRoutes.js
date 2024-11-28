const express = require('express');
const router = express.Router();
const { createProperty } = require('../controllers/propertyController');

// POST /api/agents - Create a new agent
router.post('/', createProperty);

module.exports = router;

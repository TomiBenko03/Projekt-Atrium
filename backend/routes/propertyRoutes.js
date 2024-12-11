const express = require('express');
const router = express.Router();
const { createProperty, getAgentProperties, searchProperties } = require('../controllers/propertyController');
const authMiddleware = require('../middleware/auth');

router.post('/', createProperty);
router.post('/agentProperties', authMiddleware, getAgentProperties);
router.post('/searchProperties', authMiddleware, searchProperties);

module.exports = router;

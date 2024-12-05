const express = require('express');
const router = express.Router();
const { createSeller, getAgentSellers } = require('../controllers/sellerController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createSeller);
router.post('/agentSellers', authMiddleware, getAgentSellers);

module.exports = router;
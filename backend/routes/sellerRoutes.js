const express = require('express');
const router = express.Router();
const { createSeller, getAgentSellers, searchSellers } = require('../controllers/sellerController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createSeller);
router.post('/agentSellers', authMiddleware, getAgentSellers);
router.post('/searchSellers', authMiddleware, searchSellers);

module.exports = router;
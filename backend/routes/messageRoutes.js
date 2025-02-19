const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.post('/comment', messageController.addComment);
router.get('/comments/:transactionId', messageController.getComments);

module.exports = router;
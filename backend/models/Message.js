const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
    comment: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
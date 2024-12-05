const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    gsm: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emso: { type: String, required: true },
    taxNumber: { type: String, required: true },
    bankAccount: { type: String },
    bankName: { type: String },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }
}, { timestamps: true });

module.exports = mongoose.model('Buyer', buyerSchema);

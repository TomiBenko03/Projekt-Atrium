const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    agents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true }],
    sellers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seller' }],
    buyers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Buyer' }],
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    paymentDetails: {
        deposit: {
            amount: Number,
            deadline: Date,
            alreadyPaid: { amount: Number, account: String },
        },
        remaining: {
            amount: Number,
            deadline: Date,
        },
    },
    paymentDescriptor: { type: String },
    buyerMortgage: { type: Boolean, default: false },
    mortgageAmount: { type: Number },
    handoverDeadline: { type: Date, required: true },
    sellerExpenses: [{ description: String, amount: Number }],
    buyerExpenses: [{ description: String, amount: Number }],
    contractPreparationDeadline: { type: Date },
    contractPreparedBy: { type: String },
    status: { type: String },

    // Nova polja
    kontrola: { type: Number, default: 0.00 },
    referral: { type: Boolean, default: false },
    vpisanoFF: { type: Boolean, default: false },
    zakljucenoFF: { type: Boolean, default: false },
    stRacDoStranke: { type: String },
    strankaPlacala: { type: Boolean, default: false },
    stRacunaAgenta: { type: String },
    agentPlacano: { type: Boolean, default: false },
    arhivOk: { type: Boolean, default: false },
    commissionPercent: { type: Number, default: 0 },
    commissionGross: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);

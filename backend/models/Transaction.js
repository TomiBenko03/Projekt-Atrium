const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
    sellers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seller' }],
    buyers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Buyer' }],
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    paymentDetails: {
        deposit: { 
            amount: Number,
            deadline: Date,
            account: String,
            alreadyPaid: { amount: Number, account: String },
        },
        remaining: {
            amount: Number,
            deadline: Date,
            account: String,
            additionalNotes: String,
        },
    },
    paymentDescriptor: { type: String }, // Added paymentDescriptor
    buyerMortgage: { type: Boolean, default: false }, // Added buyerMortgage
    mortgageAmount: { type: Number }, // Added mortgageAmount
    handoverDeadline: { type: Date, required: true },
    sellerExpenses: [{ description: String, amount: Number }],
    buyerExpenses: [{ description: String, amount: Number }],
    contractPreparationDeadline: { type: Date },
    contractPreparedBy: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);

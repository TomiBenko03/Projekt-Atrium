const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    propertyId: { type: String, required: true },
    address: { type: String, required: true },
    price: { type: Number, required: true },
    type: { 
        type: String, 
        enum: ['Apartment', 'House', 'Land', 'Commercial'], 
        required: true 
    },
    isNewBuild: { type: Boolean, default: false },
    preemptionRight: { type: Boolean, default: false },
    additionalParts: [
        { partId: String, type: String, description: String }
    ],
    equipmentIncluded: [{ type: String }],
    deposit: { type: Number },
    sellingPrice: { 
        property: { type: Number, required: true },
        equipment: { type: Number },
        other: { type: Number },
    },
    paymentTerms: {
        deposit: {
            amount: Number,
            paymentDeadline: Date,
            account: String,
        },
        remainingAmount: {
            amount: Number,
            paymentDeadline: Date,
            account: String,
            additionalConditions: String,
        },
    },
    buyerMortgage: { type: Boolean, default: false },
    mortgageAmount: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);

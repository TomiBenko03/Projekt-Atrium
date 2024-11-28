const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    mainPropertyId: { type: String, required: true },
    lesserProperties: [
        { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property'
        }
    ],
    address: { type: String, required: true },
    price: { type: Number, required: true },
    type: { 
        type: String, 
        enum: ['Apartment', 'House', 'Land', 'Commercial'], 
        required: true 
    },
    isNewBuild: { type: Boolean, default: false },
    isAgriculturalLand: { type: Boolean, default: false },
    preemptionRight: { type: Boolean, default: false },
    sellingPrice: { 
        property: { type: Number, required: true },
        equipment: { type: Number },
        other: { type: Number },
    },
    deposit: { 
        amount: { type: Number },
        paymentDeadline: { type: Date },
        account: { type: String },
    },
    remainingPayment: { 
        amount: { type: Number },
        paymentDeadline: { type: Date },
        account: { type: String },
        additionalConditions: { type: String }
    },
    buyerMortgage: { type: Boolean, default: false },
    mortgageAmount: { type: Number },
    equipmentIncluded: [{ type: String }],
    paymentMethodAndDeadlines: { 
        type: String
    },
    transferDeadlineAfterFullPayment: { 
        type: Date
    },
    sellerExpenses: { 
        description: { type: String },
        amount: { type: Number }
    },
    buyerExpenses: { 
        description: { type: String },
        amount: { type: Number }
    },
    contractPreparationDeadline: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);

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
    equipmentIncluded: [{ type: String }],
    paymentDescription: { 
        type: String, 
        default: '', 
        maxlength: 500 // Optional: Restrict the length of the description
    },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);

const mongoose = require('mongoose');
const Property = require('../models/Property');

const createProperty = async (req, res) => {
    try {
        const {
            mainPropertyId,
            lesserProperties,
            address,
            price,
            type,
            isNewBuild,
            isAgriculturalLand,
            preemptionRight,
            sellingPriceProperty,
            sellingPriceEquipment,
            sellingPriceOther,
            depositAmount,
            depositDeadline,
            depositAccount,
            remainingAmount,
            remainingDeadline,
            remainingAccount,
            buyerMortgage,
            mortgageAmount,
            equipmentIncluded,
            transferDeadline,
            sellerExpensesDescription,
            sellerExpensesAmount,
            buyerExpensesDescription,
            buyerExpensesAmount,
            contractDeadline,
        } = req.body;

        // Validate and convert `lesserProperties` to ObjectIds
        let lesserPropertiesArray = [];
        if (Array.isArray(lesserProperties) && lesserProperties.length > 0) {
            lesserPropertiesArray = lesserProperties
                .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
                .map((id) => mongoose.Types.ObjectId(id));
        }

        // Ensure `equipmentIncluded` is an array
        let equipmentIncludedArray = [];
        if (typeof equipmentIncluded === 'string') {
            // If `equipmentIncluded` is a comma-separated string, split it into an array
            equipmentIncludedArray = equipmentIncluded.split(',').map((item) => item.trim());
        } else if (Array.isArray(equipmentIncluded)) {
            // If `equipmentIncluded` is already an array, use it directly
            equipmentIncludedArray = equipmentIncluded;
        }

        // Create a new property document
        const newProperty = new Property({
            mainPropertyId,
            lesserProperties: lesserPropertiesArray,
            address,
            price,
            type,
            isNewBuild,
            isAgriculturalLand,
            preemptionRight,
            sellingPrice: {
                property: sellingPriceProperty,
                equipment: sellingPriceEquipment,
                other: sellingPriceOther,
            },
            deposit: {
                amount: depositAmount,
                paymentDeadline: depositDeadline,
                account: depositAccount,
            },
            remainingPayment: {
                amount: remainingAmount,
                paymentDeadline: remainingDeadline,
                account: remainingAccount,
            },
            buyerMortgage,
            mortgageAmount,
            equipmentIncluded: equipmentIncludedArray,
            transferDeadlineAfterFullPayment: transferDeadline,
            sellerExpenses: {
                description: sellerExpensesDescription,
                amount: sellerExpensesAmount,
            },
            buyerExpenses: {
                description: buyerExpensesDescription,
                amount: buyerExpensesAmount,
            },
            contractPreparationDeadline: contractDeadline,
        });

        // Save the property to the database
        const savedProperty = await newProperty.save();

        // Send success response
        res.status(201).json({
            message: 'Property created successfully',
            property: savedProperty,
        });
    } catch (error) {
        console.error('Error creating property:', error);
        res.status(400).json({
            message: 'Failed to create property',
            error: error.message,
        });
    }
};

module.exports = {
    createProperty,
};

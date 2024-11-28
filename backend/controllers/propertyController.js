const mongoose = require('mongoose');
const Property = require('../models/Property');

const createProperty = async (req, res) => {
    try {
        const {
            mainPropertyId,
            lesserProperties, // These are the propertyId strings to search for
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

        // Step 1: Find the properties with matching `propertyId`s
        let lesserPropertiesArray = [];
        if (Array.isArray(lesserProperties) && lesserProperties.length > 0) {
            const foundProperties = await Property.find({
                mainPropertyId: { $in: lesserProperties } // Search by `mainPropertyId`
            });

            // Extract the `_id` of the found properties
            lesserPropertiesArray = foundProperties.map((property) => property._id);
        }

        // Step 2: Convert `equipmentIncluded` to an array
        const equipmentIncludedArray = Array.isArray(equipmentIncluded)
            ? equipmentIncluded
            : typeof equipmentIncluded === 'string'
            ? equipmentIncluded.split(',').map((item) => item.trim())
            : [];

        // Step 3: Create a new property document
        const newProperty = new Property({
            mainPropertyId,
            lesserProperties: lesserPropertiesArray,
            address,
            price: Number(price),
            type,
            isNewBuild,
            isAgriculturalLand,
            preemptionRight,
            sellingPrice: {
                property: Number(sellingPriceProperty) || 0,
                equipment: Number(sellingPriceEquipment) || 0,
                other: Number(sellingPriceOther) || 0,
            },
            deposit: {
                amount: Number(depositAmount) || 0,
                paymentDeadline: depositDeadline || null,
                account: depositAccount || '',
            },
            remainingPayment: {
                amount: Number(remainingAmount) || 0,
                paymentDeadline: remainingDeadline || null,
                account: remainingAccount || '',
            },
            buyerMortgage: buyerMortgage || false,
            mortgageAmount: Number(mortgageAmount) || 0,
            equipmentIncluded: equipmentIncludedArray,
            transferDeadlineAfterFullPayment: transferDeadline || null,
            sellerExpenses: {
                description: sellerExpensesDescription || '',
                amount: Number(sellerExpensesAmount) || 0,
            },
            buyerExpenses: {
                description: buyerExpensesDescription || '',
                amount: Number(buyerExpensesAmount) || 0,
            },
            contractPreparationDeadline: contractDeadline || null,
        });

        // Step 4: Save the property to the database
        const savedProperty = await newProperty.save();

        // Step 5: Send success response
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

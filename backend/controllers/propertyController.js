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
            equipmentIncluded,
        } = req.body;

        // Step 1: Find `lesserProperties` by their `mainPropertyId`
        const lesserPropertiesArray = Array.isArray(lesserProperties)
            ? await Property.find({ mainPropertyId: { $in: lesserProperties } }).select('_id')
            : [];

        // Step 2: Prepare `equipmentIncluded` as an array
        const equipmentIncludedArray = Array.isArray(equipmentIncluded)
            ? equipmentIncluded
            : (equipmentIncluded || '').split(',').map((item) => item.trim());

        // Step 3: Create the new property
        const newProperty = new Property({
            mainPropertyId,
            lesserProperties: lesserPropertiesArray.map((prop) => prop._id),
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
            equipmentIncluded: equipmentIncludedArray,
        });

        const savedProperty = await newProperty.save();

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

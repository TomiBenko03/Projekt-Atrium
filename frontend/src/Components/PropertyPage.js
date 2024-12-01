import React, { useState } from 'react';
import axios from 'axios';

const PropertyPage = () => {
    const [formData, setFormData] = useState({
        mainPropertyId: '',
        lesserProperties: '',
        address: '',
        price: '',
        type: 'Apartment',
        isNewBuild: false,
        isAgriculturalLand: false,
        preemptionRight: false,
        sellingPriceProperty: '',
        sellingPriceEquipment: '',
        sellingPriceOther: '',
        equipmentIncluded: '',
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Parse lesserProperties and equipmentIncluded into arrays
            const parsedData = {
                ...formData,
                lesserProperties: formData.lesserProperties
                    ? formData.lesserProperties.split(',').map((id) => id.trim())
                    : [],
                equipmentIncluded: formData.equipmentIncluded
                    ? formData.equipmentIncluded.split(',').map((item) => item.trim())
                    : [],
                price: parseFloat(formData.price),
                sellingPrice: {
                    property: parseFloat(formData.sellingPriceProperty) || 0,
                    equipment: parseFloat(formData.sellingPriceEquipment) || 0,
                    other: parseFloat(formData.sellingPriceOther) || 0,
                },
            };

            // Remove redundant fields before sending
            delete parsedData.sellingPriceProperty;
            delete parsedData.sellingPriceEquipment;
            delete parsedData.sellingPriceOther;

            const response = await axios.post('http://localhost:3001/api/property', parsedData);
            setMessage(`Property created successfully: ${response.data.property.mainPropertyId}`);
            setError('');
            // Reset the form
            setFormData({
                mainPropertyId: '',
                lesserProperties: '',
                address: '',
                price: '',
                type: 'Apartment',
                isNewBuild: false,
                isAgriculturalLand: false,
                preemptionRight: false,
                sellingPriceProperty: '',
                sellingPriceEquipment: '',
                sellingPriceOther: '',
                equipmentIncluded: '',
            });
        } catch (error) {
            console.error('Error creating property:', error);
            setMessage('');
            setError('Failed to create property. Please check your input.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h1>Property Registration</h1>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Main Property ID:</label>
                    <input
                        type="text"
                        name="mainPropertyId"
                        value={formData.mainPropertyId}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Lesser Property IDs (comma-separated):</label>
                    <input
                        type="text"
                        name="lesserProperties"
                        value={formData.lesserProperties}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Address:</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Price:</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Type:</label>
                    <select name="type" value={formData.type} onChange={handleChange}>
                        <option value="Apartment">Apartment</option>
                        <option value="House">House</option>
                        <option value="Land">Land</option>
                        <option value="Commercial">Commercial</option>
                    </select>
                </div>
                <div>
                    <label>Is New Build:</label>
                    <input
                        type="checkbox"
                        name="isNewBuild"
                        checked={formData.isNewBuild}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Is Agricultural Land:</label>
                    <input
                        type="checkbox"
                        name="isAgriculturalLand"
                        checked={formData.isAgriculturalLand}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Preemption Right:</label>
                    <input
                        type="checkbox"
                        name="preemptionRight"
                        checked={formData.preemptionRight}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Selling Price (Property):</label>
                    <input
                        type="number"
                        name="sellingPriceProperty"
                        value={formData.sellingPriceProperty}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Selling Price (Equipment):</label>
                    <input
                        type="number"
                        name="sellingPriceEquipment"
                        value={formData.sellingPriceEquipment}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Selling Price (Other):</label>
                    <input
                        type="number"
                        name="sellingPriceOther"
                        value={formData.sellingPriceOther}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Equipment Included (comma-separated):</label>
                    <input
                        type="text"
                        name="equipmentIncluded"
                        value={formData.equipmentIncluded}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" style={{ marginTop: '10px' }}>Submit</button>
            </form>
        </div>
    );
};

export default PropertyPage;

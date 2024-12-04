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
        <div style={{
            padding: '20px', 
            maxWidth: '600px', 
            margin: 'auto',
            backgroundColor: "#f8f8f8",
            borderRadius: '8px',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)'
       }}>
            <h1 style={{ color: '#333', textAlign: 'center', marginBottom: '20px' }}>Property Registration</h1>
            {message && 
            <p style={{ 
                color: message.includes('successfully') ? 'green' : 'red',
                textAlign: 'center',
                fontWeight: 'bold'
            }}>
                {message}
            </p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label 
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        Main Property ID:</label>
                    <input
                        type="text"
                        name="mainPropertyId"
                        value={formData.mainPropertyId}
                        onChange={handleChange}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            flex: 1,
                            maxWidth: '600px',
                            width: '96%'
                        }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        Lesser Property IDs (comma-separated):</label>
                    <input
                        type="text"
                        name="lesserProperties"
                        value={formData.lesserProperties}
                        onChange={handleChange}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            flex: 1,
                            maxWidth: '600px',
                            width: '96%'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        Address:</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            flex: 1,
                            maxWidth: '600px',
                            width: '96%'
                        }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        Price:</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            flex: 1,
                            maxWidth: '600px',
                            width: '96%'
                        }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label 
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        Type:</label>
                    <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleChange}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        flex: 1,
                        maxWidth: '600px',
                        width: '96%',
                        backgroundColor: '#fff',
                        boxSizing: 'border-box'
                    }}
                    >
                        <option value="Apartment">Apartment</option>
                        <option value="House">House</option>
                        <option value="Land">Land</option>
                        <option value="Commercial">Commercial</option>
                    </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        Is New Build:</label>
                    <input
                        type="checkbox"
                        name="isNewBuild"
                        checked={formData.isNewBuild}
                        onChange={handleChange}
                        style={{
                           marginRight: '10px',
                           width: '16px',
                           height: '16px',
                           cursor: 'pointer',
                           borderRadius: '4px',
                           border: '1px solid #ddd'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        Is Agricultural Land:</label>
                    <input
                        type="checkbox"
                        name="isAgriculturalLand"
                        checked={formData.isAgriculturalLand}
                        onChange={handleChange}
                        style={{
                            marginRight: '10px',
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                         }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        Preemption Right:</label>
                    <input
                        type="checkbox"
                        name="preemptionRight"
                        checked={formData.preemptionRight}
                        onChange={handleChange}
                        style={{
                            marginRight: '10px',
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                         }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        Selling Price (Property):</label>
                    <input
                        type="number"
                        name="sellingPriceProperty"
                        value={formData.sellingPriceProperty}
                        onChange={handleChange}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            flex: 1,
                            maxWidth: '600px',
                            width: '96%'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        Selling Price (Equipment):</label>
                    <input
                        type="number"
                        name="sellingPriceEquipment"
                        value={formData.sellingPriceEquipment}
                        onChange={handleChange}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            flex: 1,
                            maxWidth: '600px',
                            width: '96%'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        Selling Price (Other):</label>
                    <input
                        type="number"
                        name="sellingPriceOther"
                        value={formData.sellingPriceOther}
                        onChange={handleChange}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            flex: 1,
                            maxWidth: '600px',
                            width: '96%'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        Equipment Included (comma-separated):</label>
                    <input
                        type="text"
                        name="equipmentIncluded"
                        value={formData.equipmentIncluded}
                        onChange={handleChange}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            flex: 1,
                            maxWidth: '600px',
                            width: '96%'
                        }}
                    />
                </div>
                <button type="login" 
                style={{ 
                    width: '100%',
                    padding: '8px 16px',
                    backgroundColor: '#b40101',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}>
                    Log in
                </button>
            </form>
        </div>
    );
};

export default PropertyPage;

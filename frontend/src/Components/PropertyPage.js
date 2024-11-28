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
        depositAmount: '',
        depositDeadline: '',
        depositAccount: '',
        remainingAmount: '',
        remainingDeadline: '',
        remainingAccount: '',
        buyerMortgage: false,
        mortgageAmount: '',
        equipmentIncluded: '',
        transferDeadline: '',
        sellerExpensesDescription: '',
        sellerExpensesAmount: '',
        buyerExpensesDescription: '',
        buyerExpensesAmount: '',
        contractDeadline: '',
    });

    const [message, setMessage] = useState('');

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
            const parsedData = {
                ...formData,
                lesserProperties: formData.lesserProperties.split(',').map((id) => id.trim()),
                equipmentIncluded: formData.equipmentIncluded.split(',').map((item) => item.trim()),
            };

            const response = await axios.post('http://localhost:3001/api/Property', parsedData);
            setMessage(`Property created successfully: ${response.data.mainPropertyId}`);
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
                depositAmount: '',
                depositDeadline: '',
                depositAccount: '',
                remainingAmount: '',
                remainingDeadline: '',
                remainingAccount: '',
                buyerMortgage: false,
                mortgageAmount: '',
                equipmentIncluded: '',
                transferDeadline: '',
                sellerExpensesDescription: '',
                sellerExpensesAmount: '',
                buyerExpensesDescription: '',
                buyerExpensesAmount: '',
                contractDeadline: '',
            });
        } catch (error) {
            console.error('Error creating property:', error);
            setMessage('Failed to create property.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h1>Property Registration</h1>
            {message && <p style={{ color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
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
                    <label>Deposit Amount:</label>
                    <input
                        type="number"
                        name="depositAmount"
                        value={formData.depositAmount}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Deposit Deadline:</label>
                    <input
                        type="date"
                        name="depositDeadline"
                        value={formData.depositDeadline}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Deposit Account:</label>
                    <input
                        type="text"
                        name="depositAccount"
                        value={formData.depositAccount}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Remaining Payment Amount:</label>
                    <input
                        type="number"
                        name="remainingAmount"
                        value={formData.remainingAmount}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Remaining Payment Deadline:</label>
                    <input
                        type="date"
                        name="remainingDeadline"
                        value={formData.remainingDeadline}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Remaining Payment Account:</label>
                    <input
                        type="text"
                        name="remainingAccount"
                        value={formData.remainingAccount}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Buyer Mortgage:</label>
                    <input
                        type="checkbox"
                        name="buyerMortgage"
                        checked={formData.buyerMortgage}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Mortgage Amount:</label>
                    <input
                        type="number"
                        name="mortgageAmount"
                        value={formData.mortgageAmount}
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
                <div>
                    <label>Transfer Deadline After Full Payment:</label>
                    <input
                        type="date"
                        name="transferDeadline"
                        value={formData.transferDeadline}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Seller Expenses Description:</label>
                    <textarea
                        name="sellerExpensesDescription"
                        value={formData.sellerExpensesDescription}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Seller Expenses Amount:</label>
                    <input
                        type="number"
                        name="sellerExpensesAmount"
                        value={formData.sellerExpensesAmount}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Buyer Expenses Description:</label>
                    <textarea
                        name="buyerExpensesDescription"
                        value={formData.buyerExpensesDescription}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Buyer Expenses Amount:</label>
                    <input
                        type="number"
                        name="buyerExpensesAmount"
                        value={formData.buyerExpensesAmount}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Contract Preparation Deadline:</label>
                    <input
                        type="date"
                        name="contractDeadline"
                        value={formData.contractDeadline}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" style={{ marginTop: '10px' }}>Submit</button>
            </form>
        </div>
    );
};

export default PropertyPage;

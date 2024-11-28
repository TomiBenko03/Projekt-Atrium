import React, { useState } from 'react';
import axios from 'axios';

const TransactionPage = () => {
    const [formData, setFormData] = useState({
        agent: '',
        sellers: '',
        buyers: '',
        property: '',
        paymentDetailsDepositAmount: '',
        paymentDetailsDepositDeadline: '',
        paymentDetailsDepositAccount: '',
        paymentDetailsDepositAlreadyPaidAmount: '',
        paymentDetailsDepositAlreadyPaidAccount: '',
        paymentDetailsRemainingAmount: '',
        paymentDetailsRemainingDeadline: '',
        paymentDetailsRemainingAccount: '',
        paymentDetailsRemainingAdditionalNotes: '',
        handoverDeadline: '',
        sellerExpenses: '',
        buyerExpenses: '',
        contractPreparationDeadline: '',
        contractPreparedBy: '',
        legalDocumentsAccessPublicDomain: false,
        legalDocumentsAccessEasement: false,
        legalDocumentsEasementDetails: '',
        legalDocumentsDeletionConsent: false,
        legalDocumentsBuildingPermit: false,
        legalDocumentsUsagePermit: false,
        legalDocumentsEnergyCertificate: false,
        legalDocumentsLocationInfo: '',
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
                sellers: formData.sellers.split(',').map((id) => id.trim()),
                buyers: formData.buyers.split(',').map((id) => id.trim()),
                sellerExpenses: formData.sellerExpenses
                    .split(';')
                    .map((item) => {
                        const [description, amount] = item.split(',');
                        return { description: description.trim(), amount: Number(amount) || 0 };
                    }),
                buyerExpenses: formData.buyerExpenses
                    .split(';')
                    .map((item) => {
                        const [description, amount] = item.split(',');
                        return { description: description.trim(), amount: Number(amount) || 0 };
                    }),
            };

            const response = await axios.post('http://localhost:3001/api/transactions', parsedData);
            setMessage(`Transaction created successfully with ID: ${response.data.transaction._id}`);
            setFormData({
                agent: '',
                sellers: '',
                buyers: '',
                property: '',
                paymentDetailsDepositAmount: '',
                paymentDetailsDepositDeadline: '',
                paymentDetailsDepositAccount: '',
                paymentDetailsDepositAlreadyPaidAmount: '',
                paymentDetailsDepositAlreadyPaidAccount: '',
                paymentDetailsRemainingAmount: '',
                paymentDetailsRemainingDeadline: '',
                paymentDetailsRemainingAccount: '',
                paymentDetailsRemainingAdditionalNotes: '',
                handoverDeadline: '',
                sellerExpenses: '',
                buyerExpenses: '',
                contractPreparationDeadline: '',
                contractPreparedBy: '',
                legalDocumentsAccessPublicDomain: false,
                legalDocumentsAccessEasement: false,
                legalDocumentsEasementDetails: '',
                legalDocumentsDeletionConsent: false,
                legalDocumentsBuildingPermit: false,
                legalDocumentsUsagePermit: false,
                legalDocumentsEnergyCertificate: false,
                legalDocumentsLocationInfo: '',
            });
        } catch (error) {
            console.error('Error creating transaction:', error);
            setMessage('Failed to create transaction.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <h1>Transaction Registration</h1>
            {message && <p style={{ color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Agent ID:</label>
                    <input
                        type="text"
                        name="agent"
                        value={formData.agent}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Sellers (comma-separated IDs):</label>
                    <input
                        type="text"
                        name="sellers"
                        value={formData.sellers}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Buyers (comma-separated IDs):</label>
                    <input
                        type="text"
                        name="buyers"
                        value={formData.buyers}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Property ID:</label>
                    <input
                        type="text"
                        name="property"
                        value={formData.property}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Deposit Amount:</label>
                    <input
                        type="number"
                        name="paymentDetailsDepositAmount"
                        value={formData.paymentDetailsDepositAmount}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Deposit Deadline:</label>
                    <input
                        type="date"
                        name="paymentDetailsDepositDeadline"
                        value={formData.paymentDetailsDepositDeadline}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Deposit Account:</label>
                    <input
                        type="text"
                        name="paymentDetailsDepositAccount"
                        value={formData.paymentDetailsDepositAccount}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Remaining Payment Amount:</label>
                    <input
                        type="number"
                        name="paymentDetailsRemainingAmount"
                        value={formData.paymentDetailsRemainingAmount}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Remaining Payment Deadline:</label>
                    <input
                        type="date"
                        name="paymentDetailsRemainingDeadline"
                        value={formData.paymentDetailsRemainingDeadline}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Handover Deadline:</label>
                    <input
                        type="date"
                        name="handoverDeadline"
                        value={formData.handoverDeadline}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Seller Expenses (semicolon-separated, format: description,amount):</label>
                    <input
                        type="text"
                        name="sellerExpenses"
                        value={formData.sellerExpenses}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Buyer Expenses (semicolon-separated, format: description,amount):</label>
                    <input
                        type="text"
                        name="buyerExpenses"
                        value={formData.buyerExpenses}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Contract Preparation Deadline:</label>
                    <input
                        type="date"
                        name="contractPreparationDeadline"
                        value={formData.contractPreparationDeadline}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Contract Prepared By:</label>
                    <input
                        type="text"
                        name="contractPreparedBy"
                        value={formData.contractPreparedBy}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Legal Documents (Access Easement):</label>
                    <input
                        type="checkbox"
                        name="legalDocumentsAccessEasement"
                        checked={formData.legalDocumentsAccessEasement}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Legal Documents (Building Permit):</label>
                    <input
                        type="checkbox"
                        name="legalDocumentsBuildingPermit"
                        checked={formData.legalDocumentsBuildingPermit}
                        onChange={handleChange}
                    />
                </div>
                {/* Add more fields here as needed */}
                <button type="submit" style={{ marginTop: '10px' }}>Submit</button>
            </form>
        </div>
    );
};

export default TransactionPage;

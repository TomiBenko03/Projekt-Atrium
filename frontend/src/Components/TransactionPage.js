import React, { useState } from 'react';
import axios from 'axios';

const TransactionPage = () => {
    const [formData, setFormData] = useState({
        agentFirstName: '',
        agentLastName: '',
        sellers: '',
        sellerSurnames: '',
        buyers: '',
        buyerSurnames: '',
        propertyName: '',
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
                sellers: formData.sellers.split(',').map((name) => name.trim()),
                sellerSurnames: formData.sellerSurnames.split(',').map((surname) => surname.trim()),
                buyers: formData.buyers.split(',').map((name) => name.trim()),
                buyerSurnames: formData.buyerSurnames.split(',').map((surname) => surname.trim()),
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
            setMessage(`Transaction created successfully, prepared by: ${response.data.transaction.contractPreparedBy}`);
            setFormData({
                agentFirstName: '',
                agentLastName: '',
                sellers: '',
                sellerSurnames: '',
                buyers: '',
                buyerSurnames: '',
                propertyName: '',
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
                    <label>Agent First Name:</label>
                    <input
                        type="text"
                        name="agentFirstName"
                        value={formData.agentFirstName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Agent Last Name:</label>
                    <input
                        type="text"
                        name="agentLastName"
                        value={formData.agentLastName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Sellers (comma-separated first names):</label>
                    <input
                        type="text"
                        name="sellers"
                        value={formData.sellers}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Sellers (comma-separated last names):</label>
                    <input
                        type="text"
                        name="sellerSurnames"
                        value={formData.sellerSurnames}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Buyers (comma-separated first names):</label>
                    <input
                        type="text"
                        name="buyers"
                        value={formData.buyers}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Buyers (comma-separated last names):</label>
                    <input
                        type="text"
                        name="buyerSurnames"
                        value={formData.buyerSurnames}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Property Name:</label>
                    <input
                        type="text"
                        name="propertyName"
                        value={formData.propertyName}
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

                <button type="submit" style={{ marginTop: '10px' }}>Submit</button>
            </form>
        </div>
    );
};

export default TransactionPage;

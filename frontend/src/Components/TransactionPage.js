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
        paymentDetailsRemainingAmount: '',
        paymentDetailsRemainingDeadline: '',
        paymentDetailsRemainingAccount: '',
        paymentDescriptor: '',
        buyerMortgage: false,
        mortgageAmount: '',
        handoverDeadline: '',
        sellerExpenses: '',
        buyerExpenses: '',
        contractPreparationDeadline: '',
        contractPreparedBy: '',
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
            // Parse sellers, buyers, and expenses
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
                buyerMortgage: formData.buyerMortgage,
                mortgageAmount: parseFloat(formData.mortgageAmount) || 0,
            };

            const response = await axios.post('/api/transactions', parsedData);
            setMessage(`Transaction created successfully, prepared by: ${response.data.transaction.contractPreparedBy}`);
            setError('');
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
                paymentDetailsRemainingAmount: '',
                paymentDetailsRemainingDeadline: '',
                paymentDetailsRemainingAccount: '',
                paymentDescriptor: '',
                buyerMortgage: false,
                mortgageAmount: '',
                handoverDeadline: '',
                sellerExpenses: '',
                buyerExpenses: '',
                contractPreparationDeadline: '',
                contractPreparedBy: '',
            });
        } catch (error) {
            console.error('Error creating transaction:', error);
            setMessage('');
            setError('Failed to create transaction. Please check the input data.');
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
            <h1 style={{ color: '#333', textAlign: 'center', marginBottom: '20px' }}>Transaction Registration</h1>
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
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Agent First Name:</label>
                    <input
                        type="text"
                        name="agentFirstName"
                        value={formData.agentFirstName}
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
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Agent Last Name:</label>
                    <input
                        type="text"
                        name="agentLastName"
                        value={formData.agentLastName}
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
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Sellers (comma-separated first names):</label>
                    <input
                        type="text"
                        name="sellers"
                        value={formData.sellers}
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
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Sellers (comma-separated last names):</label>
                    <input
                        type="text"
                        name="sellerSurnames"
                        value={formData.sellerSurnames}
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
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Buyers (comma-separated first names):</label>
                    <input
                        type="text"
                        name="buyers"
                        value={formData.buyers}
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
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Buyers (comma-separated last names):</label>
                    <input
                        type="text"
                        name="buyerSurnames"
                        value={formData.buyerSurnames}
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
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Property Name:</label>
                    <input
                        type="text"
                        name="propertyName"
                        value={formData.propertyName}
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
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Deposit Amount:</label>
                    <input
                        type="number"
                        name="paymentDetailsDepositAmount"
                        value={formData.paymentDetailsDepositAmount}
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
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Deposit Deadline:</label>
                    <input
                        type="date"
                        name="paymentDetailsDepositDeadline"
                        value={formData.paymentDetailsDepositDeadline}
                        onChange={handleChange}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            flex: 1,
                            maxWidth: '600px',
                            width: '96%',
                            backgroundColor: '#fff',
                            boxSizing: 'border-box',
                            cursor: 'pointer'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Payment Descriptor:</label>
                    <textarea
                        name="paymentDescriptor"
                        value={formData.paymentDescriptor}
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
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Buyer Mortgage:</label>
                    <input
                        type="checkbox"
                        name="buyerMortgage"
                        checked={formData.buyerMortgage}
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
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Mortgage Amount:</label>
                    <input
                        type="number"
                        name="mortgageAmount"
                        value={formData.mortgageAmount}
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
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Handover Deadline:</label>
                    <input
                        type="date"
                        name="handoverDeadline"
                        value={formData.handoverDeadline}
                        onChange={handleChange}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            flex: 1,
                            maxWidth: '600px',
                            width: '96%',
                            backgroundColor: '#fff',
                            boxSizing: 'border-box',
                            cursor: 'pointer'
                        }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Seller Expenses (semicolon-separated, format: description,amount):</label>
                    <input
                        type="text"
                        name="sellerExpenses"
                        value={formData.sellerExpenses}
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
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Buyer Expenses (semicolon-separated, format: description,amount):</label>
                    <input
                        type="text"
                        name="buyerExpenses"
                        value={formData.buyerExpenses}
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

export default TransactionPage;

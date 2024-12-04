import React, { useState } from 'react';
import axios from 'axios';

const AgentPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        gsm: '',
        email: '',
        emso: '',
        taxNumber: '',
        password: ''
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/api/agents', formData);
            setMessage(`Agent registered successfully: ${response.data.agent.firstName} ${response.data.agent.lastName}`);
            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
                address: '',
                gsm: '',
                email: '',
                emso: '',
                taxNumber: '',
                password: ''
            });
        } catch (error) {
            console.error('Error registering agent:', error);
            setMessage('Failed to register agent. error.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h1>Agent Registration</h1>
            {message && <p style={{ color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="firstName">First Name:</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="lastName">Last Name:</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="address">Address:</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="gsm">GSM:</label>
                    <input
                        type="text"
                        id="gsm"
                        name="gsm"
                        value={formData.gsm}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="emso">EMSO:</label>
                    <input
                        type="text"
                        id="emso"
                        name="emso"
                        value={formData.emso}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="taxNumber">Tax Number:</label>
                    <input
                        type="text"
                        id="taxNumber"
                        name="taxNumber"
                        value={formData.taxNumber}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="text"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" style={{ marginTop: '10px' }}>Submit</button>
            </form>
        </div>
    );
};

export default AgentPage;

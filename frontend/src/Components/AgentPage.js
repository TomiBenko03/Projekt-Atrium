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
        <div style={{ 
            padding: '20px', 
            maxWidth: '600px', 
            margin: 'auto',
            backgroundColor: "#f8f8f8",
            borderRadius: '8px',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)'
        }}>
            <h1 style={{ color: '#333', textAlign: 'center', marginBottom: '20px' }}>Agent Registration</h1>
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
                    <label htmlFor="firstName" 
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>First Name:</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
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
                    <label htmlFor="lastName" 
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Last Name:</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
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
                    <label htmlFor="address" 
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Address:</label>
                    <input
                        type="text"
                        id="address"
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
                    <label htmlFor="gsm" 
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>GSM:</label>
                    <input
                        type="text"
                        id="gsm"
                        name="gsm"
                        value={formData.gsm}
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
                    <label htmlFor="email" 
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
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
                    <label htmlFor="emso" 
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>EMSO:</label>
                    <input
                        type="text"
                        id="emso"
                        name="emso"
                        value={formData.emso}
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
                    <label htmlFor="taxNumber" 
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Tax Number:</label>
                    <input
                        type="text"
                        id="taxNumber"
                        name="taxNumber"
                        value={formData.taxNumber}
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
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="password" 
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Password:</label>
                    <input
                        type="text"
                        id="password"
                        name="password"
                        value={formData.password}
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
                <button type="submit" 
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
                    Register agent
                </button>
            </form>
        </div>
    );
};

export default AgentPage;

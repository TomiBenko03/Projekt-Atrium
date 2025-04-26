import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; // Or wherever the styles are located

const AgentPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        gsm: '',
        email: '',
        emso: '',
        taxNumber: '',
        password: '',
        role: 'agent', // Default to 'agent'
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
            setMessage(`User registered successfully as ${formData.role}: ${response.data.agent.firstName} ${response.data.agent.lastName}`);
            setFormData({
                firstName: '',
                lastName: '',
                address: '',
                gsm: '',
                email: '',
                emso: '',
                taxNumber: '',
                password: '',
                role: 'agent',
            });
        } catch (error) {
            console.error('Error registering user:', error);
            setMessage('Failed to register user. Please try again.');
        }
    };

    return (
        <div className="registration-container">
            <form className="registration-form" onSubmit={handleSubmit}>
                <h1>Registracija</h1>
                {message && <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>}
                <div className="form-group">
                    <label htmlFor="role">Vloga:</label>
                    <select id="role" name="role" value={formData.role} onChange={handleChange} required>
                        <option value="agent">Agent</option>
                        <option value="odvetnik">Odvetnik</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="firstName">Ime:</label>
                    <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="lastName">Priimek:</label>
                    <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="address">Naslov:</label>
                    <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="gsm">GSM:</label>
                    <input type="text" id="gsm" name="gsm" value={formData.gsm} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="emso">EMSO:</label>
                    <input type="text" id="emso" name="emso" value={formData.emso} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="taxNumber">Davčna:</label>
                    <input type="text" id="taxNumber" name="taxNumber" value={formData.taxNumber} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Geslo:</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
                <button type="submit" className="button-primary">Register</button>
            </form>
        </div>
    );
};

export default AgentPage;

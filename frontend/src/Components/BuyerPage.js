import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const BuyerPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        gsm: '',
        email: '',
        emso: '',
        taxNumber: '',
        bankAccount: '',
        bankName: '',
    });

    const [message, setMessage] = useState('');
    const [userRole, setUserRole] = useState(null); // Store user role
    const [loading, setLoading] = useState(true); // To handle loading state

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/session', {
                    withCredentials: true,
                });
                setUserRole(response.data.role);
            } catch (error) {
                console.error('Error fetching user role:', error);
                setUserRole(null); // In case of error, no role
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/api/buyer', formData, {
                withCredentials: true,
            });
            setMessage(`Buyer created successfully: ${response.data.buyer.firstName} ${response.data.buyer.lastName}`);
            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
                address: '',
                gsm: '',
                email: '',
                emso: '',
                taxNumber: '',
                bankAccount: '',
                bankName: '',
            });
        } catch (error) {
            console.error('Error creating buyer:', error);
            if (error.response.status === 401) {
                setMessage('Unauthorized. Please login.');
            }
            setMessage('Failed to create buyer.');
        }
    };

    if (loading) {
        return <div>Loading...</div>; // Display a loading message while fetching user role
    }

    if (userRole === 'odvetnik') {
        return (
            <div className="restricted-container">
                <h1>Access Denied</h1>
                <p>You do not have permission to add new buyers.</p>
            </div>
        );
    }

    return (
        <div className="form-container">
            <h1 className="form-header">Buyer Registration</h1>
            {message && <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
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
                <div className="form-group">
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
                <div className="form-group">
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
                <div className="form-group">
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
                <div className="form-group">
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
                <div className="form-group">
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
                <div className="form-group">
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
                <div className="form-group">
                    <label htmlFor="bankAccount">Bank Account:</label>
                    <input
                        type="text"
                        id="bankAccount"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="bankName">Bank Name:</label>
                    <input
                        type="text"
                        id="bankName"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="button-primary">
                    Add Buyer
                </button>
            </form>
        </div>
    );
};

export default BuyerPage;

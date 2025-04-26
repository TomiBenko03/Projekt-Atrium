import React, { useState, useContext } from 'react';
import { UserContext } from '../userContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [message, setMessage] = useState('');
    const userContext = useContext(UserContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/api/agents/login', formData, {
                withCredentials: true
            });

            if (response.data._id) {
                userContext.setUserContext(response.data);
                navigate('/');
            } else {
                setFormData({
                    email: '',
                    password: ''
                });
                setMessage('Invalid credentials. Please try again.');
            }
        } catch (error) {
            console.error('Error logging in: ', error);
            setMessage('Failed to log in. Please check your credentials and try again.');
        }
    };

    return (
        <div className="registration-container">
            <form className="registration-form" onSubmit={handleLogin}>
                <h1 className="form-header">Agent Login</h1>
                {message && <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>}
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
                    <label htmlFor="password">Geslo:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="button-primary">
                    Log in
                </button>
            </form>
        </div>
    );
};

export default LoginPage;

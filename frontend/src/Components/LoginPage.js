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


    const handleChange = (e) =>{
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async(e) => {
        e.preventDefault();
        try{
            const response = await axios.post('http://localhost:3001/api/agents/login', formData);

            const data = response.data;
            if(data._id !== undefined){
                userContext.setUserContext(data);
                navigate('/');
            }
            else{
                setFormData({
                    email: '',
                    password: ''
                });
            }
        } catch (error) {
            console.error('Error logging in: ', error);
            setMessage('Failed to log in agent. error');
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
            <h1 style={{ color: '#333', textAlign: 'center', marginBottom: '20px' }}>Agent Login</h1>
            {message && 
            <p style={{ 
                color: message.includes('successfully') ? 'green' : 'red',
                textAlign: 'center',
                fontWeight: 'bold'
            }}>
                {message}
            </p>}
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor='email'
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email: </label>
                    <input 
                        type='email'
                        id='email'
                        name='email'
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
                    <label htmlFor='password'
                    style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Password: </label>
                    <input 
                        type='text'
                        id='password'
                        name='password'
                        value={formData.passowrd}
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

export default LoginPage;

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
        <div style={{padding: '20px', maxWidth: '600px', margin: 'auto'}}>
            <h1>Agent Login</h1>
            {message && <p style= {{color: message.includes('in') ? 'red' : 'gren'}}>{message}</p>}
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor='email'>Email: </label>
                    <input 
                        type='email'
                        id='email'
                        name='email'
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor='password'>Password: </label>
                    <input 
                        type='text'
                        id='password'
                        name='password'
                        value={formData.passowrd}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" style={{ marginTop: '10px' }}>Submit</button>
            </form>
        </div>
         
    );
};

export default LoginPage;

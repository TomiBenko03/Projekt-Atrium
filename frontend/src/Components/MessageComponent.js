import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../userContext';
import '../App.css';

const MessageComponent = () => {
    const [receiverEmail, setReceiverEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [messages, setMessages] = useState([]);

    const { user } = useContext(UserContext);
    const userId = user?._id;

    const fetchMessages = async () => {
        if (!userId) return;

        try {
            const response = await axios.get(`http://localhost:3001/api/messages/${userId}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [userId]);

    const handleSendMessage = async () => {
        if (!receiverEmail || !message) {
            setError('All fields are required');
            return;
        }

        try {
            await axios.post('http://localhost:3001/api/messages/send', {
                senderId: userId,
                receiverEmail,
                message
            });
            setReceiverEmail('');
            setMessage('');
            setError('');
            fetchMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            setError('Failed to send message');
        }
    };

    return (
        <div className="message-container" style={{ background: '#f8f8f8', padding: '20px', borderRadius: '8px', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)' }}>
            <div className="form-group">
                <label htmlFor="receiverEmail">Receiver's Email:</label>
                <input
                    type="email"
                    id="receiverEmail"
                    value={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                    placeholder="Enter receiver's email"
                    className="form-input"
                />
            </div>
            <div className="form-group">
                <label htmlFor="message">Message:</label>
                <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message"
                    className="form-input"
                    rows="4"
                />
            </div>
            {error && <p className="error-message" style={{ color: '#ff0000', marginBottom: '10px' }}>{error}</p>}
            <button onClick={handleSendMessage} className="button-primary">
                Send Message
            </button>

            <div className="messages-list" style={{ marginTop: '20px' }}>
                {messages.map((msg) => (
                    <div key={msg._id} style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', marginBottom: '10px', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }}>
                        <p><strong>{msg.sender.firstName} {msg.sender.lastName}:</strong> {msg.message} </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MessageComponent;
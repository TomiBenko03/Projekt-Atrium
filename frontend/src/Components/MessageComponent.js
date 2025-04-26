import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../userContext';
import '../App.css';

const MessageComponent = ({ transactionId }) => {
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [comments, setComments] = useState([]);

    const { user } = useContext(UserContext);
    const userId = user?._id;

    console.log('User:', user); // Debugging user
    console.log('User ID:', userId); // Debugging userId

    const fetchComments = async () => {
        if (!transactionId) return;

        try {
            const response = await axios.get(`http://localhost:3001/api/messages/comments/${transactionId}`);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [transactionId]);

    const handleAddComment = async () => {
        if (!comment) {
            setError('Comment cannot be empty');
            return;
        }

        console.log('Transaction ID:', transactionId); // Debugging transactionId
        console.log('Comment:', comment); // Debugging comment

        try {
            await axios.post('http://localhost:3001/api/messages/comment', {
                userId,
                transactionId,
                comment
            });
            setComment('');
            setError('');
            fetchComments();
        } catch (error) {
            console.error('Error adding comment:', error);
            setError('Failed to add comment');
        }
    };

    return (
        <div>
            <div className="form-group">
                <label htmlFor="comment" >Dodaj komentar:</label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Type your comment"
                    className="form-input"
                    rows="4"
                />
            </div>
            {error && <p className="error-message" style={{ color: '#ff0000', marginBottom: '10px' }}>{error}</p>}
            <button onClick={handleAddComment} className="button-primary">
            Dodaj komentar
            </button>

            <div className="comments-list" style={{ marginTop: '20px' }}>
                {comments.map((comment) => (
                    <div key={comment._id} style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', marginBottom: '10px', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }}>
                        <p><strong>{comment.sender.firstName} {comment.sender.lastName}:</strong> {comment.comment} </p>
                        <p style={{ fontSize: '0.8em', color: '#666' }}>{new Date(comment.timestamp).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MessageComponent;
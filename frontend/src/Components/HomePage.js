import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';

const HomePage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();

    const statusOptions = [
        'v pripravi',
        'aktivno',
        'prodajalni postopek',
        'pripravljanje pogodbe',
        'podpisovaje pogodbe',
        'FURS',
        'zakljuceno'
    ];

    // Fetch data only if user is authenticated
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await axios.get('http://localhost:3001/api/transactions/agentTransactions', {
                    withCredentials: true,
                });

                // Sort by status and then by handoverDeadline
                const sortedTransactions = (response.data || [])
                    .sort((a, b) => {
                        const statusOrder = statusOptions.indexOf(a.status) - statusOptions.indexOf(b.status);
                        return statusOrder === 0
                            ? new Date(a.handoverDeadline) - new Date(b.handoverDeadline)
                            : statusOrder;
                    });

                setSearchResults(sortedTransactions);
            } catch (err) {
                console.error('Error fetching data:', err);
                if (err.response?.status === 401) {
                    navigate('/login'); // Redirect to login if unauthorized
                } else {
                    setError('Failed to fetch data. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // Dynamic color based on handoverDeadline
    const getRowStyle = (handoverDeadline) => {
        const deadline = new Date(handoverDeadline);
        const now = new Date();

        if (deadline < now) {
            return { backgroundColor: '#ffcccc' }; // Red for overdue
        } else if (deadline - now < 7 * 24 * 60 * 60 * 1000) {
            return { backgroundColor: '#fff4cc' }; // Yellow for within a week
        } else {
            return { backgroundColor: '#ccffcc' }; // Green for more than a week
        }
    };

    return (
        <div className="page-container">
            {/* Error Message */}
            {error && <p className="error-message" style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

            {/* Loading Indicator */}
            {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}

            {/* Transactions */}
            {!loading && (
                <>
                    {['v pripravi', 'aktivno', 'zakljuceno'].map((statusGroup) => (
                        <div className="restricted-container" key={statusGroup}>
                            <div className="search-container">
                                <h2 className="form-header">{statusGroup.charAt(0).toUpperCase() + statusGroup.slice(1)}</h2>
                                {searchResults
                                    .filter((transaction) => {
                                        if (statusGroup === 'v pripravi') return transaction.status === 'v pripravi';
                                        if (statusGroup === 'aktivno') return [
                                            'aktivno',
                                            'prodajalni postopek',
                                            'pripravljanje pogodbe',
                                            'podpisovaje pogodbe',
                                            'FURS',
                                        ].includes(transaction.status);
                                        return transaction.status === 'zakljuceno';
                                    })
                                    .map((transaction) => (
                                        <div
                                            className="search-results"
                                            key={transaction._id}
                                            style={getRowStyle(transaction.handoverDeadline)}
                                        >
                                            <Link
                                                to={`/transaction/${transaction._id}`}
                                                style={{
                                                    display: 'block',
                                                    padding: '10px',
                                                    textDecoration: 'none',
                                                    color: '#333',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <strong>Property:</strong> {transaction.property?.mainPropertyId || 'N/A'} <br />
                                                <strong>Buyers:</strong> {transaction.buyers?.map(b => `${b.firstName} ${b.lastName}`).join(', ') || 'N/A'} <br />
                                                <strong>Sellers:</strong> {transaction.sellers?.map(s => `${s.firstName} ${s.lastName}`).join(', ') || 'N/A'} <br />
                                                <strong>Status:</strong> {transaction.status || 'N/A'} <br />
                                                <strong>Handover Deadline:</strong> {new Date(transaction.handoverDeadline).toLocaleDateString() || 'N/A'}
                                            </Link>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </>
            )}

            {/* No Results */}
            {!loading && searchResults.length === 0 && (
                <p style={{ textAlign: 'center' }}>No results found.</p>
            )}
        </div>
    );
};

export default HomePage;

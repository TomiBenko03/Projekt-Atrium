import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useContext } from 'react';

import axios from 'axios';
import '../App.css';

const HomePage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState({});
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const statusOptions = [
        'v pripravi',
        'aktivno',
        'prodajalni postopek',
        'pripravljanje pogodbe',
        'podpisovaje pogodbe',
        'FURS',
        'zakljuceno'
    ];
    
    
    useEffect(() => {
        const fetchUserRole = async () => {
          try {
            const response = await axios.get('http://localhost:3001/api/session', {
              withCredentials: true,
            });
            setUserRole(response.data.role);
          } catch (error) {
            console.error('Napaka pri pridobivanju uporabniške vloge:', error);
            setUserRole(null);
          } finally {
            setLoading(false);
          }
        };
    
        fetchUserRole();
    }, []); // changed from [userRole] to []


    useEffect(() => {
        // Ensure the userRole is valid before calling the fetchData function
        if (userRole) {
            const fetchData = async () => {
                setLoading(true);
                setError('');
                let endpoint = ''; // Use let instead of const
        
                try {
                    if (userRole === 'admin') {
                        endpoint = 'http://localhost:3001/api/transactions/adminTransactions';
                    } else if (userRole === 'agent' || userRole === 'odvetnik') {
                        endpoint = 'http://localhost:3001/api/transactions/agentTransactions';
                    }
        
                    if (!endpoint) {
                        throw new Error('No valid role or endpoint defined');
                    }
        
                    const response = await axios.get(endpoint, { withCredentials: true });
        
                    const sortedTransactions = (response.data || []).sort((a, b) => {
                        const statusOrder = statusOptions.indexOf(a.status) - statusOptions.indexOf(b.status);
                        return statusOrder === 0
                            ? new Date(a.handoverDeadline) - new Date(b.handoverDeadline)
                            : statusOrder;
                    });
        
                    setSearchResults(sortedTransactions);
                } catch (err) {
                    console.error('Error fetching data:', err);
                    if (err.response?.status === 401) {
                        navigate('/login');
                    } else {
                        setError('Failed to fetch data. Please try again.');
                    }
                } finally {
                    setLoading(false);
                }
            };
        
            fetchData();
        }
    }, [navigate, userRole]); // Ensure userRole change triggers this effect
    
    
const getRowStyle = (handoverDeadline, status) => {

    const deadline = new Date(handoverDeadline);
    const now = new Date();

    if (deadline < now) {
        if (status !== "zakljuceno")
            return { backgroundColor: '#ffcccc' };
        else
            return { backgroundColor: '#e6ffff' };
    } else if (deadline - now < 7 * 24 * 60 * 60 * 1000) {
        return { backgroundColor: '#fff4cc' };
    } else {
        return { backgroundColor: '#ccffcc' };
    }
};

const toggleExpand = (statusGroup) => {
    setExpandedGroups(prev => ({ ...prev, [statusGroup]: !prev[statusGroup] }));
};

return (
    <div className="page-container">
        {error && <p className="error-message" style={{ textAlign: 'center', color: 'red' }}>{error}</p>}
        {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}
        {!loading && (
            <>
        
                {['v pripravi', 'aktivno', 'zakljuceno'].map((statusGroup) => {
                    const filteredTransactions = searchResults.filter(transaction => {
                        if (statusGroup === 'v pripravi') return transaction.status === 'v pripravi';
                        if (statusGroup === 'aktivno') return [
                            'aktivno',
                            'prodajalni postopek',
                            'pripravljanje pogodbe',
                            'podpisovaje pogodbe',
                            'FURS',
                        ].includes(transaction.status);
                        return transaction.status === 'zakljuceno';
                    });

                    const isExpanded = expandedGroups[statusGroup];
                    const visibleTransactions = isExpanded ? filteredTransactions : filteredTransactions.slice(0, 5);

                    return (
                        <div className="restricted-container" key={statusGroup}>
                            <div className="search-container">
                                <h2 className="form-header">{statusGroup.charAt(0).toUpperCase() + statusGroup.slice(1)}</h2>
                                {visibleTransactions.map(transaction => (
                                    <div
                                        className="search-results"
                                        key={transaction._id}
                                        style={getRowStyle(transaction.handoverDeadline, transaction.status)}
                                    >
                                        <Link to={`/transaction/${transaction._id}`} style={{ display: 'block', padding: '10px', textDecoration: 'none', color: '#333' }}>
                                            <strong>Nepremičnina:</strong> {transaction.property?.mainPropertyId || 'N/A'} <br />
                                            <strong>Kupec:</strong> {transaction.buyers?.map(b => `${b.firstName} ${b.lastName}`).join(', ') || 'N/A'} <br />
                                            <strong>Prodajalec:</strong> {transaction.sellers?.map(s => `${s.firstName} ${s.lastName}`).join(', ') || 'N/A'} <br />
                                            <strong>Status:</strong> {transaction.status || 'N/A'} <br />
                                            <strong>Rok:</strong> {new Date(transaction.handoverDeadline).toLocaleDateString() || 'N/A'}<br />
                                            <strong>Agents/Odvetnik:</strong> {transaction.agents?.map(b => `${b.firstName} ${b.lastName}`).join(', ') || 'N/A'} <br />
                                        </Link>
                                    </div>
                                ))}
                                {filteredTransactions.length > 5 && (
                                    <button className="expand-button" onClick={() => toggleExpand(statusGroup)}>
                                        {isExpanded ? 'Show Less' : 'Show More'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </>
        )}
        {!loading && searchResults.length === 0 && (
            <p style={{ textAlign: 'center' }}>No results found.</p>
        )}

    </div>

);
};

export default HomePage;

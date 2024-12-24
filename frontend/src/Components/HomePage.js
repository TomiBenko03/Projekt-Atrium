
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';

const HomePage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchResults, setSearchResults] = useState([]);

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
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const transactionsRes = await axios.get('http://localhost:3001/api/transactions/agentTransactions', { withCredentials: true });

                const sortedTransactions = (transactionsRes.data || []).sort((a, b) => {
                    return statusOptions.indexOf(a.status) - statusOptions.indexOf(b.status);
                });

                setSearchResults(sortedTransactions);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const groupedResults = {
        "v pripravi": searchResults.filter(transaction => transaction.status === 'v pripravi'),
        "aktivno": searchResults.filter(transaction => [
            'aktivno',
            'prodajalni postopek',
            'pripravljanje pogodbe',
            'podpisovaje pogodbe',
            'FURS'
        ].includes(transaction.status)),
        "zakljuceno": searchResults.filter(transaction => transaction.status === 'zakljuceno')
    };

    return (
        <div className="page-container">
          
               
                   

                    {/* Error Message */}
                    {error && <p className="error-message" style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

                    {/* Loading Indicator */}
                    {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}

                    {/* Rows for Statuses */}
                    {!loading && (
                        <>
                            {/* Row: v pripravi */}
                            <div className="restricted-container">
                            <div className="search-container">
                                <h2 className="form-header">V pripravi</h2>
                               
                                    {groupedResults["v pripravi"].map((transaction) => (
                                          <div className="search-results" key={transaction._id}>
                                             <Link 
                                                        to={`/transaction/${transaction._id}`} 
                                                        style={{ 
                                                          display: 'block', 
                                                          padding: '0px', 
                                                          textDecoration: 'none', 
                                                          color: '#333', 
                                                          cursor: 'pointer' 
                                                        }}
                                                        >
                                            <strong>Property:</strong> {transaction.property?.mainPropertyId || 'N/A'} <br />
                                            <strong>Buyers:</strong> {transaction.buyers?.map(b => `${b.firstName} ${b.lastName}`).join(', ') || 'N/A'} <br />
                                            <strong>Sellers:</strong> {transaction.sellers?.map(s => `${s.firstName} ${s.lastName}`).join(', ') || 'N/A'} <br />
                                            <strong>Status:</strong> {transaction.status || 'N/A'}
                                            </Link> </div>
                                    ))}
                                
                                </div>
                            </div>

                            {/* Row: aktivno */}
                            <div className="restricted-container">
                            <div className="search-container">
                                <h2 className="form-header">Aktivno</h2>
                             
                                    {groupedResults["aktivno"].map((transaction) => (
                                        <div className="search-results" key={transaction._id}>
                                             <Link 
                                                        to={`/transaction/${transaction._id}`} 
                                                        style={{ 
                                                          display: 'block', 
                                                          padding: '0px', 
                                                          textDecoration: 'none', 
                                                          color: '#333', 
                                                          cursor: 'pointer' 
                                                        }}
                                                        >
                                            <strong>Property:</strong> {transaction.property?.mainPropertyId || 'N/A'} <br />
                                            <strong>Buyers:</strong> {transaction.buyers?.map(b => `${b.firstName} ${b.lastName}`).join(', ') || 'N/A'} <br />
                                            <strong>Sellers:</strong> {transaction.sellers?.map(s => `${s.firstName} ${s.lastName}`).join(', ') || 'N/A'} <br />
                                            <strong>Status:</strong> {transaction.status || 'N/A'}
                                        
                                            </Link></div>
                                    ))}
                            </div>
                                </div>
                           

                            {/* Row: zakljuceno */}
                            <div className="restricted-container">
                            <div className="search-container">
                                <h2 className="form-header">Zakljuceno</h2>
                               
                                    {groupedResults["zakljuceno"].map((transaction) => (
                                        <div className="search-results" key={transaction._id}>
                                            <Link 
                                                        to={`/transaction/${transaction._id}`} 
                                                        style={{ 
                                                          display: 'block', 
                                                          padding: '0px', 
                                                          textDecoration: 'none', 
                                                          color: '#333', 
                                                          cursor: 'pointer' 
                                                        }}
                                                        >
                                            <strong>Property:</strong> {transaction.property?.mainPropertyId || 'N/A'} <br />
                                            <strong>Buyers:</strong> {transaction.buyers?.map(b => `${b.firstName} ${b.lastName}`).join(', ') || 'N/A'} <br />
                                            <strong>Sellers:</strong> {transaction.sellers?.map(s => `${s.firstName} ${s.lastName}`).join(', ') || 'N/A'} <br />
                                            <strong>Status:</strong> {transaction.status || 'N/A'}
                                         </Link>
                                         </div>
                                    ))}
                               </div>
                            </div>
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

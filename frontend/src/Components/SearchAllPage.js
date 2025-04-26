import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const SearchAllPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchResults, setSearchResults] = useState({
        sellers: [],
        buyers: [],
        properties: [],
        transactions: [],
    });

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        setSearchResults({
            sellers: [],
            buyers: [],
            properties: [],
            transactions: [],
        });

        try {
            // Use your provided routes with POST requests
            const [sellersRes, buyersRes, propertiesRes, transactionsRes] = await Promise.all([
                axios.post('http://localhost:3001/api/sellers/agentSellers', {}, { withCredentials: true }),
                axios.post('http://localhost:3001/api/buyer/agentBuyers', {}, { withCredentials: true }),
                axios.post('http://localhost:3001/api/property/agentProperties', {}, { withCredentials: true }),
                axios.get('http://localhost:3001/api/transactions/agentTransactions', { withCredentials: true }),
            ]);

            setSearchResults({
                sellers: sellersRes.data || [],
                buyers: buyersRes.data || [],
                properties: propertiesRes.data || [],
                transactions: transactionsRes.data || [],
            });
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="restricted-container">
                <div className="search-container">
                    <h1 className="form-header">Iskanje po vseh podatkih po agentu</h1>

                    {/* Search Button */}
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <button onClick={handleSearch} className="button-primary" disabled={loading}>
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && <p className="error-message" style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

                    {/* Search Results */}
                    
                    <div className="search-results">
                        {/* Sellers */}
                        {searchResults.sellers.length > 0 && (
                            <div>
                                <h2>Sellers</h2>
                                <ul>
                                    {searchResults.sellers.map((seller) => (
                                        <li key={seller._id}>
                                            <strong>Ime:</strong> {seller.firstName} {seller.lastName} <br />
                                            <strong>Email:</strong> {seller.email} <br />
                                            <strong>Telefon:</strong> {seller.gsm}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Buyers */}
                        {searchResults.buyers.length > 0 && (
                            <div>
                                <h2>Buyers</h2>
                                <ul>
                                    {searchResults.buyers.map((buyer) => (
                                        <li key={buyer._id}>
                                            <strong>Ime:</strong> {buyer.firstName} {buyer.lastName} <br />
                                            <strong>Email:</strong> {buyer.email} <br />
                                            <strong>Telefon:</strong> {buyer.gsm}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Properties */}
                        {searchResults.properties.length > 0 && (
                            <div>
                                <h2>Properties</h2>
                                <ul>
                                    {searchResults.properties.map((property) => (
                                        <li key={property._id}>
                                            <strong>ID nepremičnine:</strong> {property.mainPropertyId} <br />
                                            <strong>Naslov:</strong> {property.address} <br />
                                            <strong>Cena:</strong> {property.price}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Transactions */}
                        {searchResults.transactions.length > 0 && (
                            <div>
                                <h2>Transactions</h2>
                                <ul>
                                    {searchResults.transactions.map((transaction) => (
                                        <li key={transaction._id}>
                                            <strong>Nepremičnina:</strong> {transaction.property?.mainPropertyId || 'N/A'} <br />
                                            <strong>Kupec:</strong> {transaction.buyers?.map(b => `${b.firstName} ${b.lastName}`).join(', ') || 'N/A'} <br />
                                            <strong>Prodajalec:</strong> {transaction.sellers?.map(s => `${s.firstName} ${s.lastName}`).join(', ') || 'N/A'} <br />
                                            <strong>Status:</strong> {transaction.status || 'N/A'}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* No Results */}
                    {!loading &&
                        searchResults.sellers.length === 0 &&
                        searchResults.buyers.length === 0 &&
                        searchResults.properties.length === 0 &&
                        searchResults.transactions.length === 0 && (
                            <p style={{ textAlign: 'center' }}>No results found.</p>
                        )}
                </div>
            </div>
        </div>
    );
};

export default SearchAllPage;

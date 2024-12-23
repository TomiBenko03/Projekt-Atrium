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

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchMode, setSearchMode] = useState('name'); // 'name' or 'agent'

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
    
    const handleSearch = async () => {
        try {
            let endpoint = '';

            switch(searchMode) {
                case 'name': 
                    endpoint = 'http://localhost:3001/api/buyer/searchBuyers';
                    break;
                case 'phone':
                    endpoint = 'http://localhost:3001/api/buyer/searchBuyersByPhone';
                    break;
                case 'agent':
                    endpoint = 'http://localhost:3001/api/buyer/agentBuyers';
                    break;
                default:
                    return;
            }

            const response = await axios.post(
                endpoint,
                searchMode === 'name' ? { query: searchQuery } : {},
                { withCredentials: true }
            );
            setSearchResults(response.data || []);
        }
        catch (error) {
            console.error('Error searching buyers: ', error);
            setSearchResults([]);
        }
    }

    useEffect(() => {
        const fetchResults = async() => {
            if(searchQuery.length > 0) {
                try{
                    const endpoint =
                        searchMode === 'name'
                            ? 'http://localhost:3001/api/buyer/searchBuyers'
                            : 'http://localhost:3001/api/buyer/searchBuyersByPhone';

                    const response = await axios.post(
                        endpoint,
                        { query: searchQuery },
                        { withCredentials: true }
                    );
                    setSearchResults(response.data || []);
                }
                catch (error) {
                    console.error('Error fetching search results: ', error);
                    setSearchResults([]);
                }
            }
            else {
                setSearchResults([]);
            }
        };

        const delayedFetch = setTimeout(() => {
            fetchResults();
        }, 300);

        return () => clearTimeout(delayedFetch);
    }, [searchQuery, searchMode]);

    if (loading) {
        return <div>Loading...</div>; // Display a loading message while fetching user role
    }

    if (userRole === 'odvetnik') {
        return (
            <div className='page-container'>
            <div className="restricted-container">
                 <div className='search-container'>
                <h2 className="form-header">Buyer Search</h2>
                <div className='search-options'>
                    <label>
                        <input
                            type="radio"
                            name="searchMode"
                            value="name"
                            checked={searchMode === 'name'}
                            onChange={() => setSearchMode('name')}
                        />
                        Search by Name/Surname
                    </label>

                    <label>
                        <input 
                            type="radio"
                            name="searchMode"
                            value="phone"
                            checked={searchMode === 'phone'}
                            onChange={() => setSearchMode('phone')}
                        />
                        Search by Phone Number
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="searchMode"
                            value="agent"
                            checked={searchMode === 'agent'}
                            onChange={() => setSearchMode('agent')}
                        />
                        Search by Logged-in Agent
                    </label>
                </div>
                {searchMode === 'name' && (
                    <input
                        type="text"
                        placeholder="Search buyers by name or surname..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                )}
                
                {searchMode === 'phone' && (
                    <input 
                        type="text"
                        placeholder="Search buyers by phone number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                )}
               
                {searchMode === 'agent' && (
                    <button onClick={handleSearch} className='button-primary'>
                        Search
                    </button>
                )}

                {searchResults.length > 0 && (
                    <div className='search-results'>
                        <h2>Search Results</h2>
                        <ul>
                            {searchResults.map((buyer) => (
                                <li key={buyer._id}>
                                    <strong>Name: </strong> {buyer.firstName} <br />
                                    <strong>Last Name: </strong> {buyer.lastName} <br />
                                    <strong>Email: </strong> {buyer.email} <br />
                                    <strong>Phone Number: </strong> {buyer.gsm} <br />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {searchQuery.length > 0 && searchResults.length === 0 && (
                    <p>No results found for "{searchQuery}"</p>
                )}
            </div>
        </div>
            </div>
        );
    }

    

    return (
        <div className='page-container'>
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
            <div className='search-container'>
                <h2 className="form-header">Buyer Search</h2>
                <div className='search-options'>
                    <label>
                        <input
                            type="radio"
                            name="searchMode"
                            value="name"
                            checked={searchMode === 'name'}
                            onChange={() => setSearchMode('name')}
                        />
                        Search by Name/Surname
                    </label>

                    <label>
                        <input 
                            type="radio"
                            name="searchMode"
                            value="phone"
                            checked={searchMode === 'phone'}
                            onChange={() => setSearchMode('phone')}
                        />
                        Search by Phone Number
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="searchMode"
                            value="agent"
                            checked={searchMode === 'agent'}
                            onChange={() => setSearchMode('agent')}
                        />
                        Search by Logged-in Agent
                    </label>
                </div>

                {searchMode === 'name' && (
                    <input
                        type="text"
                        placeholder="Search buyers by name or surname..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                )}

                {searchMode === 'phone' && (
                    <input 
                        type="text"
                        placeholder="Search buyers by phone number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                )}
               
                {searchMode === 'agent' && (
                    <button onClick={handleSearch} className='button-primary'>
                        Search
                    </button>
                )}

                {searchResults.length > 0 && (
                    <div className='search-results'>
                        <h2>Search Results</h2>
                        <ul>
                            {searchResults.map((buyer) => (
                                <li key={buyer._id}>
                                    <strong>Name: </strong> {buyer.firstName} <br />
                                    <strong>Last Name: </strong>{buyer.lastName} <br />
                                    <strong>Email: </strong>{buyer.email} <br />
                                    <strong>Phone Number: </strong> {buyer.gsm} <br />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {searchQuery.length > 0 && searchResults.length === 0 && (
                    <p>No results found for "{searchQuery}"</p>
                )}
            </div>
        </div>
    );
};

export default BuyerPage;

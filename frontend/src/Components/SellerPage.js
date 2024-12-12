import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const SellerPage = () => {
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
    const [searchMode, setSearchMode] = useState('name');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/api/sellers', formData, {
                withCredentials: true
            });
            setMessage(`Seller created successfully: ${response.data.seller.firstName} ${response.data.seller.lastName}`);
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
            console.error('Error creating seller:', error);
            setMessage('Failed to create seller. error.');
        }
    };
    const handleSearch = async () => {
        try {
            const endpoint =
                searchMode === 'name'
                    ? 'http://localhost:3001/api/sellers/searchSellers'
                    : 'http://localhost:3001/api/sellers/agentSellers';

            const response = await axios.post(
                endpoint,
                searchMode === 'name' ? { query: searchQuery } : {},
                { withCredentials: true }
            );
            setSearchResults(response.data || []);
        }
        catch (error) {
            console.error('Error searching sellers: ', error);
            setSearchResults([]);
        }
    }
    if (loading) {
        return <div>Loading...</div>; // Display a loading message while fetching user role
    }

    if (userRole === 'odvetnik') {
        return (
            <div className='page-container'>
            <div className="restricted-container">
                <div className='search-container'>
                <h2 className='form-header'>Seller Search</h2>
                <div className='search-options'>
                    <label >
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
                            value="agent"
                            checked={searchMode === 'agent'}
                            onChange={() => setSearchMode('agent')}
                        />
                        Search by Logged-in Agent
                    </label>
                </div>
                {searchMode === 'name' && (
                    <input
                        type='text'
                        placeholder='Search sellers by name or surname...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                )}
                <button onClick={handleSearch} className='button-primary'>
                    Search
                </button>
                {searchResults.length > 0 && (
                    <div className='search-results'>
                        <h2>Search Results</h2>
                        <ul>
                            {searchResults.map((seller) => (
                                <li key={seller._id}>
                                    {seller.firstName} {seller.lastName} ({seller.email})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
            </div>
        );
    }



    return (
        <div className='page-container'>

            <div className='form-container'>
                <h1 className='form-header'>Seller Registration</h1>
                {message && <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>}

                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
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
                    <div className='form-group'>
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
                    <div className='form-group'>
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
                    <div className='form-group'>
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
                    <div className='form-group'>
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
                    <div className='form-group'>
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
                    <div className='form-group'>
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
                    <div className='form-group'>
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
                    <div className='form-group'>
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
                    <button type="submit" className='button-primary'>
                        Add seller
                    </button>
                </form>
            </div>
            <div className='search-container'>
                <h2 className='form-header'>Seller Search</h2>
                <div className='search-options'>
                    <label >
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
                            value="agent"
                            checked={searchMode === 'agent'}
                            onChange={() => setSearchMode('agent')}
                        />
                        Search by Logged-in Agent
                    </label>
                </div>
                {searchMode === 'name' && (
                    <input
                        type='text'
                        placeholder='Search sellers by name or surname...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                )}
                <button onClick={handleSearch} className='button-primary'>
                    Search
                </button>
                {searchResults.length > 0 && (
                    <div className='search-results'>
                        <h2>Search Results</h2>
                        <ul>
                            {searchResults.map((seller) => (
                                <li key={seller._id}>
                                    {seller.firstName} {seller.lastName} ({seller.email})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerPage;

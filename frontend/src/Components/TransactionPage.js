import { Link } from 'react-router-dom';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const TransactionPage = () => {
    const [formData, setFormData] = useState({
        sellers: '',
        sellerSurnames: '',
        buyers: '',
        buyerSurnames: '',
        propertyName: '',
        paymentDetailsDepositAmount: '',
        paymentDetailsDepositDeadline: '',
        paymentDetailsDepositAccount: '',
        paymentDetailsRemainingAmount: '',
        paymentDetailsRemainingDeadline: '',
        paymentDetailsRemainingAccount: '',
        paymentDescriptor: '',
        buyerMortgage: false,
        mortgageAmount: '',
        handoverDeadline: '',
        sellerExpenses: '',
        buyerExpenses: '',
        contractPreparationDeadline: '',
        contractPreparedBy: '',
        status: 'v pripravi'
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState(null); // Store user role
    const [loading, setLoading] = useState(true); // To handle loading state

    const [searchQuery, setSearchQuery] = useState('');
    const [searchMode, setSearchMode] = useState('transactionId');
    const [searchResults, setSearchResults] = useState([]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
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
            // Parse sellers, buyers, and expenses
            const parsedData = {
                ...formData,
                sellers: formData.sellers.split(',').map((name) => name.trim()),
                sellerSurnames: formData.sellerSurnames.split(',').map((surname) => surname.trim()),
                buyers: formData.buyers.split(',').map((name) => name.trim()),
                buyerSurnames: formData.buyerSurnames.split(',').map((surname) => surname.trim()),
                sellerExpenses: formData.sellerExpenses
                    .split(';')
                    .map((item) => {
                        const [description, amount] = item.split(',');
                        return { description: description.trim(), amount: Number(amount) || 0 };
                    }),
                buyerExpenses: formData.buyerExpenses
                    .split(';')
                    .map((item) => {
                        const [description, amount] = item.split(',');
                        return { description: description.trim(), amount: Number(amount) || 0 };
                    }),
                buyerMortgage: formData.buyerMortgage,
                mortgageAmount: parseFloat(formData.mortgageAmount) || 0,
            };

            const response = await axios.post('http://localhost:3001/api/transactions', parsedData, {
                withCredentials: true
            });
            setMessage(`Transaction created successfully, for property: ${response.data.transaction.property.mainPropertyId}`);
            setError('');
            setFormData({
                sellers: '',
                sellerSurnames: '',
                buyers: '',
                buyerSurnames: '',
                propertyName: '',
                paymentDetailsDepositAmount: '',
                paymentDetailsDepositDeadline: '',
                paymentDetailsDepositAccount: '',
                paymentDetailsRemainingAmount: '',
                paymentDetailsRemainingDeadline: '',
                paymentDetailsRemainingAccount: '',
                paymentDescriptor: '',
                buyerMortgage: false,
                mortgageAmount: '',
                handoverDeadline: '',
                sellerExpenses: '',
                buyerExpenses: '',
                contractPreparationDeadline: '',
                contractPreparedBy: '',
                status: 'v pripravi'
            });
        } catch (error) {
            console.error('Error creating transaction:', error);
            setMessage('');
            setError('Failed to create transaction. Please check the input data.');
        }
    };

    const handleSearch = async () => {
        try {
            let requestData = {};

            const endpoint =
                searchMode === 'transactionId'
                    ? `http://localhost:3001/api/transactions/search/${searchQuery}`
                    : 'http://localhost:3001/api/transactions/agentTransactions';

            const response = await axios.get(endpoint, { withCredentials: true });
            setSearchResults(searchMode === 'transactionId' ? [response.data] : response.data);
        }
        catch (error) {
            console.error('Error searching transaction: ', error);
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
                        <h2 className='form-header'>Transaction Search</h2>
                        <div className='search-options'>
                            <label>
                                <input
                                    type="radio"
                                    name="searchMode"
                                    value="transactionId"
                                    checked={searchMode === 'transactionId'}
                                    onChange={() => setSearchMode('transactionId')}
                                />
                                Search by Transaction ID
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="searchMode"
                                    value="agentTransactions"
                                    checked={searchMode === 'agent'}
                                    onChange={() => setSearchMode('agent')}
                                />
                                Search Transactions by Lawyer
                            </label>
                        </div>

                        {searchMode === 'transactionId' && (
                            <input
                                type="text"
                                placeholder="Search by Transaction ID"
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
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {searchResults.map((transaction) => (
                                        <li key={transaction._id} style={{ marginBottom: '1em' }}>
                                            <Link
                                                to={`/transaction/${transaction._id}`}
                                                style={{
                                                    display: 'block',
                                                    padding: '1em',
                                                    textDecoration: 'none',
                                                    color: '#333',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <strong>Property: </strong>
                                                {transaction.property?.mainPropertyId || 'N/A'} <br />
                                                <strong>Buyers: </strong>
                                                {transaction.buyers?.map((b) => `${b.firstName} ${b.lastName}`).join(', ') || 'No buyers found'}<br />
                                                <strong>Sellers: </strong>
                                                {transaction.sellers?.map((s) => `${s.firstName} ${s.lastName}`).join(', ') || 'No sellers found' }<br />
                                                <strong>Status: </strong>{transaction.status || 'N/A'} <br />
                                            </Link>
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
                <h1 className='form-header'>Transaction Registration</h1>
                {message && <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>}

                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label>Sellers (comma-separated first names):</label>
                        <input
                            type="text"
                            name="sellers"
                            value={formData.sellers}
                            onChange={handleChange}

                        />
                    </div>
                    <div className='form-group'>
                        <label>Sellers (comma-separated last names):</label>
                        <input
                            type="text"
                            name="sellerSurnames"
                            value={formData.sellerSurnames}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='form-group'>
                        <label>Buyers (comma-separated first names):</label>
                        <input
                            type="text"
                            name="buyers"
                            value={formData.buyers}
                            onChange={handleChange}

                        />
                    </div>
                    <div className='form-group'>
                        <label>Buyers (comma-separated last names):</label>
                        <input
                            type="text"
                            name="buyerSurnames"
                            value={formData.buyerSurnames}
                            onChange={handleChange}

                        />
                    </div>
                    <div className='form-group'>
                        <label>Property Name:</label>
                        <input
                            type="text"
                            name="propertyName"
                            value={formData.propertyName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label>Deposit Amount:</label>
                        <input
                            type="number"
                            name="paymentDetailsDepositAmount"
                            value={formData.paymentDetailsDepositAmount}
                            onChange={handleChange}

                        />
                    </div>
                    <div className='form-group'>
                        <label>Deposit Deadline:</label>
                        <input
                            type="date"
                            name="paymentDetailsDepositDeadline"
                            value={formData.paymentDetailsDepositDeadline}
                            onChange={handleChange}

                        />
                    </div>
                    <div className='form-group'>
                        <label>Payment Descriptor:</label>
                        <textarea
                            name="paymentDescriptor"
                            value={formData.paymentDescriptor}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='form-group'>
                        <label>Buyer Mortgage:</label>
                        <input
                            type="checkbox"
                            name="buyerMortgage"
                            checked={formData.buyerMortgage}
                            onChange={handleChange}
                            style={{
                                marginRight: '10px',
                                width: '16px',
                                height: '16px',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                            }}
                        />
                    </div>
                    <div className='form-group'>
                        <label>Mortgage Amount:</label>
                        <input
                            type="number"
                            name="mortgageAmount"
                            value={formData.mortgageAmount}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='form-group'>
                        <label>Handover Deadline:</label>
                        <input
                            type="date"
                            name="handoverDeadline"
                            value={formData.handoverDeadline}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label>Seller Expenses (semicolon-separated, format: description,amount):</label>
                        <input
                            type="text"
                            name="sellerExpenses"
                            value={formData.sellerExpenses}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='form-group'>
                        <label>Buyer Expenses (semicolon-separated, format: description,amount):</label>
                        <input
                            type="text"
                            name="buyerExpenses"
                            value={formData.buyerExpenses}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='form-group'>
                        <label>Status:</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                        >
                            <option value="v pripravi">v pripravi</option>
                            <option value="aktivno">aktivno</option>
                            <option value="prodajalni postopek">prodajalni postopek</option>
                            <option value="pripravljanje pogodbe">pripravljanje pogodbe</option>
                            <option value="podpisovaje pogodbe">podpisovaje pogodbe</option>
                            <option value="FURS">FURS</option>
                            <option value="zakljuceno">zakljuceno</option>
                        </select>
                    </div>
                    <button type="login" className='button-primary'>
                        Add transaction
                    </button>
                </form>
            </div>
            <div className='search-container'>
                <h2 className='form-header'>Transaction Search</h2>
                <div className='search-options'>
                    <label>
                        <input
                            type="radio"
                            name="searchMode"
                            value="transactionId"
                            checked={searchMode === 'transactionId'}
                            onChange={() => setSearchMode('transactionId')}
                        />
                        Search by Transaction ID
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="searchMode"
                            value="agentTransactions"
                            checked={searchMode === 'agent'}
                            onChange={() => setSearchMode('agent')}
                        />
                        Search Transactions by Agent
                    </label>
                </div>

                {searchMode === 'transactionId' && (
                    <input
                        type="text"
                        placeholder="Search by Transaction ID"
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
    <ul style={{ listStyleType: 'none', padding: 0 }}>
      {searchResults.map((transaction) => (
        <li key={transaction._id} style={{ marginBottom: '1em' }}>
          <Link 
            to={`/transaction/${transaction._id}`} 
            style={{ 
              display: 'block', 
              padding: '1em', 
              textDecoration: 'none', 
              color: '#333', 
              cursor: 'pointer' 
            }}
          >
            <strong>Property: </strong>{transaction.property?.mainPropertyId || 'N/A'} <br />
            <strong>Buyers: </strong>{
              transaction.buyers?.map((b) => `${b.firstName} ${b.lastName}`).join(', ') || 'No buyers found'
            }<br />
            <strong>Sellers: </strong>{
              transaction.sellers?.map((s) => `${s.firstName} ${s.lastName}`).join(', ') || 'No sellers found'
            }<br />
            <strong>Status: </strong>{transaction.status || 'N/A'} <br />
          </Link>
        </li>
      ))}
    </ul>
  </div>
)}
 
            </div >
        </div >
    );
};

export default TransactionPage;

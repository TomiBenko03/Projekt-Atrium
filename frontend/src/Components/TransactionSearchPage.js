import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { useParams } from 'react-router-dom';
import '../App.css';

const TransactionSearchPage = () => {
  const { transactionId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('agent');
  const [sellers, setSellers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [transactionStatus, setTransactionStatus] = useState('');

  // Define available status options
  const statusOptions = [
    'v pripravi',
    'aktivno',
    'prodajalni postopek',
    'pripravljanje pogodbe',
    'podpisovaje pogodbe',
    'FURS',
    'zakljuceno'
  ];

  // If transactionId is provided in the URL, fetch that transaction on mount.
  useEffect(() => {
    const fetchTransactionById = async () => {
      if (transactionId) {
        try {
          const response = await axios.get(`http://localhost:3001/api/transactions/search/${transactionId}`);
          setTransaction(response.data);
          setSellers(response.data.sellers);
          setBuyers(response.data.buyers);
          setError('');
          setTransactionStatus(response.data.status || '');
        } catch (err) {
          console.error('Error fetching transaction by URL param:', err);
          setTransaction(null);
          setSellers([]);
          setBuyers([]);
          setError('Transaction not found');
        }
      }
    };
    fetchTransactionById();
  }, [transactionId]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError('Please enter a transaction ID.');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:3001/api/transactions/search/${searchTerm}`);
      setTransaction(response.data);
      setSellers(response.data.sellers);
      setBuyers(response.data.buyers);
      setError('');
      setTransactionStatus(response.data.status || '');
    } catch (err) {
      console.error('Error searching transaction:', err);
      setTransaction(null);
      setSellers([]);
      setBuyers([]);
      setError('Transaction not found');
    }
  };

  const fetchCommissionReport = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/transactions/report/${transaction._id}`,
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );
      const filename = transaction.agent.firstName + "_izplacilo_provizije.docx";
      saveAs(new Blob([response.data]), filename);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const fetchBindingOffer = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/transactions/bindingOffer/${transaction._id}`,
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );
      const filename = transaction.agent.firstName + "_zavezujoca_ponudba_za_nakup_nepremicnine.docx";
      saveAs(new Blob([response.data]), filename);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const fetchSalesContract = async() => {
    try{
    const response = await axios.get(
        `http://localhost:3001/api/transactions/salesContract/${transaction._id}`,
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );
      const filename = transaction.agent.firstName + "_narocilo_prodajne_pogodbe.docx";
      saveAs(new Blob([response.data]), filename);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  }

  const handleStatusUpdate = async () => {
    if (!transaction) return;
    try {
      const response = await axios.put(
        `http://localhost:3001/api/transactions/updatestatus/${transaction._id}`,
        { status: transactionStatus },
        { withCredentials: true }
      );
      console.log("Updating transaction ID:", transaction._id);
      // Update transaction status in state after successful update
      setTransaction((prev) => ({
        ...prev,
        status: response.data.status
      }));
      setError('');
    } catch (error) {
      console.error('Error updating transaction status:', error);
      setError('Failed to update status.');
    }
  };

  return (
    <div className='form-container'>
      <h1 className='form-header'>Search Transactions</h1>
      {/* Search form: still available even if URL param is used */}
      <form onSubmit={handleSearch} className='search-form'>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setError('');
          }}
          placeholder="Enter transaction ID"
          className='search-input'
        />
        <button type="submit" className='button-primary'>
          Search
        </button>
      </form>

      {error && <p className='error-message'>{error}</p>}

      {transaction && (
        <div>
          <div className='tab-buttons'>
            {['agent', 'sellers', 'buyers', 'property', 'payment Details', 'buyer Mortgage'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'agent' && transaction.agent && (
            <div className='tab-content active'>
              <h3>Agent Information</h3>
              <div className='tab-details'>
                <p><strong>Name:</strong> {transaction.agent.firstName} {transaction.agent.lastName} </p>
                <p><strong>Address:</strong> {transaction.agent.address} </p>
                <p><strong>GSM:</strong> {transaction.agent.gsm} </p>
                <p><strong>Email:</strong> {transaction.agent.email} </p>
                <p><strong>EMSO:</strong> {transaction.agent.emso} </p>
              </div>
            </div>
          )}

          {activeTab === 'sellers' && sellers.length > 0 && (
            <div className='tab-content active'>
              {sellers.map((seller, index) => (
                <div key={index} className='tab-details'>
                  <h3>Seller Information</h3>
                  <p><strong>Name:</strong> {`${seller.firstName} ${seller.lastName}`} </p>
                  <p><strong>Address:</strong> {seller.address} </p>
                  <p><strong>GSM:</strong> {seller.gsm} </p>
                  <p><strong>Email:</strong> {seller.email} </p>
                  <p><strong>Emso:</strong> {seller.emso} </p>
                  <p><strong>Tax Number:</strong> {seller.taxNumber} </p>
                  <p><strong>Bank Account:</strong> {seller.bankAccount} </p>
                  <p><strong>Bank Name:</strong> {seller.bankName} </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'buyers' && buyers.length > 0 && (
            <div className='tab-content active'>
              {buyers.map((buyer, index) => (
                <div key={index} className='tab-details'>
                  <h3>Buyer Information</h3>
                  <p><strong>Name:</strong> {`${buyer.firstName} ${buyer.lastName}`}</p>
                  <p><strong>Address:</strong> {buyer.address} </p>
                  <p><strong>GSM:</strong> {buyer.gsm} </p>
                  <p><strong>Email:</strong> {buyer.email} </p>
                  <p><strong>Emso:</strong> {buyer.emso} </p>
                  <p><strong>Tax Number:</strong> {buyer.taxNumber} </p>
                  <p><strong>Bank Account:</strong> {buyer.bankAccount} </p>
                  <p><strong>Bank Name:</strong> {buyer.bankName} </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'property' && transaction.property && (
            <div className='tab-content active'>
              <h3>Property Information</h3>
              <p><strong>ID:</strong> {transaction.property.mainPropertyId} </p>
              <p><strong>Address:</strong> {transaction.property.address} </p>
              <p><strong>Type:</strong> {transaction.property.type} </p>
              <p><strong>Price:</strong> €{transaction.property.price} </p>
              <p><strong>New build:</strong> {transaction.property.isNewBuild ? 'Yes' : 'No'} </p>
              <p><strong>Agricultural land:</strong> {transaction.property.isAgriculturalLand ? 'Yes' : 'No'} </p>
              <p><strong>Preemption right:</strong> {transaction.property.preemptionRight ? 'Yes' : 'No'} </p>
              <h3 className='tab-details'>Price Details</h3>
              <p><strong>Property:</strong> €{transaction.property.sellingPrice.property} </p>
              <p><strong>Equipment:</strong> €{transaction.property.sellingPrice.equipment} </p>
              <p><strong>Other:</strong> €{transaction.property.sellingPrice.other} </p>
              <p><strong>Total:</strong> €{(
                (transaction.property.sellingPrice.property || 0) +
                (transaction.property.sellingPrice.equipment || 0) +
                (transaction.property.sellingPrice.other || 0))} </p>
            </div>
          )}

          {activeTab === 'payment Details' && transaction.paymentDetails && (
            <div className='tab-content active'>
              <h3>Payment Details</h3>
              <h3>Deposit</h3>
              <p><strong>Amount:</strong> €{transaction.paymentDetails.deposit.amount} </p>
              <p><strong>Deadline:</strong> {transaction.paymentDetails.deposit.deadline && new Date(transaction.paymentDetails.deposit.deadline).toLocaleDateString()} </p>
              <p><strong>Account:</strong> {transaction.paymentDetails.deposit.account} </p>
              
              <h3>Remaining</h3>
              <p><strong>Amount:</strong> €{transaction.paymentDetails.remaining.amount} </p>
              <p><strong>Deadline:</strong> {transaction.paymentDetails.remaining.deadline && new Date(transaction.paymentDetails.remaining.deadline).toLocaleDateString()} </p>
              <p><strong>Account:</strong> {transaction.paymentDetails.remaining.account} </p>
            </div>
          )}

          {activeTab === 'buyer Mortgage' && (
            <div className='tab-content active'>
              <h3>Mortgage Information</h3>
              <p><strong>Mortgage Status:</strong> {transaction.buyerMortgage ? 'Yes' : 'No'} </p>
              <p><strong>Amount:</strong> €{transaction.mortgageAmount || 0} </p>
            </div>
          )}

          {/* Status dropdown and update button */}
          <div className='tab-details' style={{ marginTop: '20px' }}>
            <label><strong>Status:</strong></label>
            <select 
              value={transactionStatus} 
              onChange={(e) => setTransactionStatus(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              <option value="">Select Status</option>
              {statusOptions.map((statusOption) => (
                <option key={statusOption} value={statusOption}>{statusOption}</option>
              ))}
            </select>
            <button 
              onClick={handleStatusUpdate} 
              className='button-primary' 
              style={{ marginLeft: '10px', width: 'auto' }}
            >
              Update Status
            </button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button
              onClick={fetchCommissionReport}
              className='button-primary'
            >
              Generate Report
            </button>
          </div>

          <br />

          <div>
            <button
              onClick={fetchBindingOffer}
              className='button-primary'
            >
              Generate Binding Offer
            </button>
          </div>

          <br />

          <div>
            <button
              onClick={fetchSalesContract}
              className='button-primary'
            >
              Generate Sales Contract
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionSearchPage;

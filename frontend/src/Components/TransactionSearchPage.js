import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { useParams } from 'react-router-dom';
import '../App.css';
import MessageComponent from './MessageComponent';
import { UserContext } from '../userContext';

const TransactionSearchPage = () => {
  const { transactionId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('agent');
  const [sellers, setSellers] = useState([]);
  const [agent, setAgent] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [lawyerEmail, setLawyerEmail] = useState('');
  const [userRole, setUserRole] = useState(null);

  // New state for FF details
  const [ffDetails, setFFDetails] = useState({
    kontrola: '',
    referral: false,
    vpisanoFF: false,
    zakljucenoFF: false,
    stRacDoStranke: '',
    strankaPlacala: false,
    stRacunaAgenta: '',
    agentPlacano: false,
    arhivOk: false,
  });

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

  // Fetch transaction if transactionId is provided in URL, and fetch user role.
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
          // Initialize FF details from transaction if available
          setFFDetails({
            kontrola: response.data.kontrola || '',
            referral: response.data.referral || false,
            vpisanoFF: response.data.vpisanoFF || false,
            zakljucenoFF: response.data.zakljucenoFF || false,
            stRacDoStranke: response.data.stRacDoStranke || '',
            strankaPlacala: response.data.strankaPlacala || false,
            stRacunaAgenta: response.data.stRacunaAgenta || '',
            agentPlacano: response.data.agentPlacano || false,
            arhivOk: response.data.arhivOk || false,
          });
        } catch (err) {
          console.error('Error fetching transaction by URL param:', err);
          setTransaction(null);
          setSellers([]);
          setBuyers([]);
          setError('Transaction not found');
        }
      }
    };

    const fetchUserRole = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/session', { withCredentials: true });
        setUserRole(response.data.role);
      } catch (error) {
        console.error('Error fetching user role: ', error);
        setUserRole(null);
      }
    };

    fetchTransactionById();
    fetchUserRole();
  }, [transactionId]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError('Please enter a transaction ID.');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:3001/api/transactions/search/${searchTerm}`);
      setAgent(response.data.agents);
      setTransaction(response.data);
      setSellers(response.data.sellers);
      setBuyers(response.data.buyers);
      setError('');
      setTransactionStatus(response.data.status || '');
      setFFDetails({
        kontrola: response.data.kontrola || '',
        referral: response.data.referral || false,
        vpisanoFF: response.data.vpisanoFF || false,
        zakljucenoFF: response.data.zakljucenoFF || false,
        stRacDoStranke: response.data.stRacDoStranke || '',
        strankaPlacala: response.data.strankaPlacala || false,
        stRacunaAgenta: response.data.stRacunaAgenta || '',
        agentPlacano: response.data.agentPlacano || false,
        arhivOk: response.data.arhivOk || false,
      });
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
      const filename = transaction.agents.map(s => `${s.firstName} ${s.lastName}`).join(', ') + "_izplacilo_provizije.docx";
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
      const filename = transaction.agents.map(s => `${s.firstName} ${s.lastName}`).join(', ') + "_zavezujoca_ponudba_za_nakup_nepremicnine.docx";
      saveAs(new Blob([response.data]), filename);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const generateUpn = async (transactionid) => {
    if (!transactionid) {
      console.error("Transaction data is missing or invalid.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3001/api/apis/generateUpn/${transactionid}`,
        {}, // POST requests need a body, even if empty
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );

      // Generate a filename based on agents' names
      const filename = transaction.agents && transaction.agents.length > 0
        ? transaction.agents.map(agent => `${agent.firstName} ${agent.lastName}`).join(', ') + "_UPN.PDF"
        : `UPN_${transaction._id}.PDF`;

      // Save the PDF file
      saveAs(new Blob([response.data], { type: 'application/pdf' }), filename);
    } catch (error) {
      console.error('Error generating UPN PDF:', error);
      alert('Failed to generate UPN PDF. Please try again.');
    }
  };
  const generateAndSendHalcomXml = async (transactionid) => {
    if (!transactionid) {
      console.error("Transaction data is missing or invalid.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3001/api/apis/generateAndSendHalcomXml/${transactionid}`,
        {}, // Telo zahteve, čeprav je prazno
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );

      // Ustvarimo blob URL in simuliramo prenos
      const blob = new Blob([response.data], { type: 'application/xml' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `halcom_${transactionid}.xml`; // Določi ime datoteke
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating XML:', error);
      alert('Failed to generate XML. Please try again.');
    }
  };

  const fetchSalesContract = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/transactions/salesContract/${transaction._id}`,
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );
      const filename = transaction.agents.map(s => `${s.firstName} ${s.lastName}`).join(', ') + "_narocilo_prodajne_pogodbe.docx";
      saveAs(new Blob([response.data]), filename);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const fetchCalcOfRealEstateCosts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/transactions/calcEstateCosts/${transaction._id}`,
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );
      const filename = transaction.agents.map(s => `${s.firstName} ${s.lastName}`).join(', ') + "_izracun_stroskov_nepremicnine.xlsx";
      saveAs(new Blob([response.data]), filename);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

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

  const handleAssignLawyer = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3001/api/transactions/assignLawyer/${transaction._id}`,
        { lawyerEmail },
        { withCredentials: true }
      );
      alert(response.data.message);
    } catch (error) {
      console.error('Error assigning lawyer: ', error);
      alert('Failed to assign lawyer. Please check the email and try again.');
    }
  };

  // Handler for updating FF details.
  const handleFFUpdate = async () => {
    if (!transaction) return;
    try {
      const response = await axios.put(
        `http://localhost:3001/api/transactions/updateFF/${transaction._id}`,
        ffDetails,
        { withCredentials: true }
      );
      // Posodobimo transaction v stanju z novimi FF podatki
      setTransaction((prev) => ({
        ...prev,
        ...response.data
      }));
      alert('FF details updated successfully.');
    } catch (error) {
      console.error('Error updating FF details:', error);
      alert('Failed to update FF details.');
    }
  };

  // Tab gumbi (dodali smo nov zavihek "FF Details")
  const tabs = ['agent', 'sellers', 'buyers', 'property', 'payment Details', 'Kontrolne Značke'];

  return (
    <div className='page-container'>
      <div className='form-container'>

        <h1 className='form-header'>Search Transactions</h1>
        {/* Search form: na voljo tudi, če je URL parameter uporabljen */}
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
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === 'agent' && transaction.agents && (
              <div className={`tab-content ${activeTab === 'agent' ? 'active' : ''}`}>
                {transaction.agents.map((agentItem, index) => (
                  <div key={index} className='tab-details'>
                    <h3>Agent Information</h3>
                    <p><strong>Name:</strong> {agentItem.firstName} {agentItem.lastName}</p>
                    <p><strong>Address:</strong> {agentItem.address}</p>
                    <p><strong>GSM:</strong> {agentItem.gsm}</p>
                    <p><strong>Email:</strong> {agentItem.email}</p>
                    <p><strong>EMSO:</strong> {agentItem.emso}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'sellers' && sellers.length > 0 && (
              <div className='tab-content active'>
                {sellers.map((seller, index) => (
                  <div key={index} className='tab-details'>
                    <h3>Seller Information</h3>
                    <p><strong>Name:</strong> {`${seller.firstName} ${seller.lastName}`}</p>
                    <p><strong>Address:</strong> {seller.address}</p>
                    <p><strong>GSM:</strong> {seller.gsm}</p>
                    <p><strong>Email:</strong> {seller.email}</p>
                    <p><strong>Emso:</strong> {seller.emso}</p>
                    <p><strong>Tax Number:</strong> {seller.taxNumber}</p>
                    <p><strong>Bank Account:</strong> {seller.bankAccount}</p>
                    <p><strong>Bank Name:</strong> {seller.bankName}</p>
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
                    <p><strong>Address:</strong> {buyer.address}</p>
                    <p><strong>GSM:</strong> {buyer.gsm}</p>
                    <p><strong>Email:</strong> {buyer.email}</p>
                    <p><strong>Emso:</strong> {buyer.emso}</p>
                    <p><strong>Tax Number:</strong> {buyer.taxNumber}</p>
                    <p><strong>Bank Account:</strong> {buyer.bankAccount}</p>
                    <p><strong>Bank Name:</strong> {buyer.bankName}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'property' && transaction.property && (
              <div className='tab-content active'>
                <h3>Property Information</h3>
                <div className='tab-details'>
                  <p><strong>ID:</strong> {transaction.property.mainPropertyId}</p>
                  <p><strong>Address:</strong> {transaction.property.address}</p>
                  <p><strong>Type:</strong> {transaction.property.type}</p>
                  <p><strong>Price:</strong> €{transaction.property.price}</p>
                  <p><strong>New build:</strong> {transaction.property.isNewBuild ? 'Yes' : 'No'}</p>
                  <p><strong>Agricultural land:</strong> {transaction.property.isAgriculturalLand ? 'Yes' : 'No'}</p>
                  <p><strong>Preemption right:</strong> {transaction.property.preemptionRight ? 'Yes' : 'No'}</p>
                  <h3 className='tab-details'>Price Details</h3>
                  <p><strong>Property:</strong> €{transaction.property.sellingPrice.property}</p>
                  <p><strong>Equipment:</strong> €{transaction.property.sellingPrice.equipment}</p>
                  <p><strong>Other:</strong> €{transaction.property.sellingPrice.other}</p>
                  <p><strong>Total:</strong> €{(
                    (transaction.property.sellingPrice.property || 0) +
                    (transaction.property.sellingPrice.equipment || 0) +
                    (transaction.property.sellingPrice.other || 0)
                  )}</p>
                </div>
              </div>
            )}

            {activeTab === 'payment Details' && transaction.paymentDetails && (
              <div className='tab-content active'>
                <h3>Payment Details</h3>
                <p><strong>Additional notes:</strong> {transaction.paymentDescriptor}</p>
                <p><strong>Already paid:</strong> {transaction.paymentDetails.deposit.alreadyPaid.amount}</p>
                <div className='tab-details'>
                  <p>
                    <strong>Provizija:</strong> {
                      transaction.commissionGross !== 0
                        ? `${transaction.commissionGross}€`
                        : (transaction.commissionPercent !== 0 ? `${transaction.commissionPercent}%` : '0')
                    }
                  </p>

                  <h3>Deposit</h3>
                  <p><strong>Amount:</strong> €{transaction.paymentDetails.deposit.amount}</p>
                  <p>
                    <strong>Deadline:</strong>{' '}
                    {transaction.paymentDetails.deposit.deadline &&
                      new Date(transaction.paymentDetails.deposit.deadline).toLocaleDateString()}
                  </p>
                
                  
                  <h3>Remaining</h3>
                  <p><strong>Amount:</strong> €{transaction.paymentDetails.remaining.amount - transaction.paymentDetails.deposit.alreadyPaid.amount}</p>
                  <p>
                    <strong>Deadline:</strong>{' '}
                    {transaction.paymentDetails.remaining.deadline &&
                      new Date(transaction.paymentDetails.remaining.deadline).toLocaleDateString()}
                  </p>
                  
                  <h3>Mortgage Information</h3>
                  <div className='tab-details'>
                    <p><strong>Mortgage Status:</strong> {transaction.buyerMortgage ? 'Yes' : 'No'}</p>
                    <p><strong>Amount:</strong> €{transaction.mortgageAmount || 0}</p>
                  </div>
                  
                </div>
              </div>
            )}

            {/* Nov zavihek: FF Details */}
            {activeTab === 'Kontrolne Značke' && (
              <div className='tab-content active'>
                <h3>Kontrolne Značke</h3>
                <div className='tab-details'>
                  <div className='form-group'>
                    <label>Kontrola:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={ffDetails.kontrola}
                      onChange={(e) =>
                        setFFDetails((prev) => ({ ...prev, kontrola: e.target.value }))
                      }
                    />
                  </div>
                  <div className='form-group'>
                    <label>Referral:</label>
                    <input
                      type="checkbox"
                      checked={ffDetails.referral}
                      onChange={(e) =>
                        setFFDetails((prev) => ({ ...prev, referral: e.target.checked }))
                      }
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
                    <label>Vpisano v FF:</label>
                    <input
                      type="checkbox"
                      checked={ffDetails.vpisanoFF}
                      onChange={(e) =>
                        setFFDetails((prev) => ({ ...prev, vpisanoFF: e.target.checked }))
                      }
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
                    <label>Zaključeno v FF:</label>
                    <input
                      type="checkbox"
                      checked={ffDetails.zakljucenoFF}
                      onChange={(e) =>
                        setFFDetails((prev) => ({ ...prev, zakljucenoFF: e.target.checked }))
                      }
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
                    <label>Št. Rač. do stranke:</label>
                    <input
                      type="text"
                      value={ffDetails.stRacDoStranke}
                      onChange={(e) =>
                        setFFDetails((prev) => ({ ...prev, stRacDoStranke: e.target.value }))
                      }

                    />
                  </div>
                  <div className='form-group'>
                    <label>Stranka plačala:</label>
                    <input
                      type="checkbox"
                      checked={ffDetails.strankaPlacala}
                      onChange={(e) =>
                        setFFDetails((prev) => ({ ...prev, strankaPlacala: e.target.checked }))
                      }
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
                    <label>Številka računa agenta:</label>
                    <input
                      type="text"
                      value={ffDetails.stRacunaAgenta}
                      onChange={(e) =>
                        setFFDetails((prev) => ({ ...prev, stRacunaAgenta: e.target.value }))
                      }
                    />
                  </div>
                  <div className='form-group'>
                    <label>Agentu plačano:</label>
                    <input
                      type="checkbox"
                      checked={ffDetails.agentPlacano}
                      onChange={(e) =>
                        setFFDetails((prev) => ({ ...prev, agentPlacano: e.target.checked }))
                      } style={{
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
                    <label>Arhiv ok:</label>
                    <input
                      type="checkbox"
                      checked={ffDetails.arhivOk}
                      onChange={(e) =>
                        setFFDetails((prev) => ({ ...prev, arhivOk: e.target.checked }))
                      } style={{
                        marginRight: '10px',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}
                    />
                  </div>
                  <button onClick={handleFFUpdate} className='button-primary'>
                    Save FF Details
                  </button>
                </div>
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
                  <option key={statusOption} value={statusOption}>
                    {statusOption}
                  </option>
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

            {/* Assign to Lawyer - Only for Agents */}
            {userRole !== 'odvetnik' && (
              <div className='tab-details' style={{ marginTop: '20px' }}>
                <label><strong>Assign to lawyer (Email):</strong></label>
                <input
                  type="email"
                  value={lawyerEmail}
                  onChange={(e) => setLawyerEmail(e.target.value)}
                  className='search-input'
                />
                <button
                  onClick={handleAssignLawyer}
                  className='button-primary'
                  style={{ marginLeft: '10px', width: 'auto' }}
                >
                  Assign to Lawyer
                </button>
              </div>
            )}

            <div style={{ marginTop: '20px' }}>
              <button onClick={fetchCommissionReport} className='button-primary'>
                Generate Report
              </button>
            </div>
            <br />
            <div>
              <button onClick={fetchBindingOffer} className='button-primary'>
                Generate Binding Offer
              </button>
            </div>
            <br />
            <div>
              <button onClick={fetchSalesContract} className='button-primary'>
                Generate Sales Contract
              </button>
            </div>
            <br />
            <div>
              <button onClick={fetchCalcOfRealEstateCosts} className='button-primary'>
                Generate Calculation of Real Estate Costs
              </button>
            </div>
            <br />
            <div>
              <button onClick={() => generateUpn(transaction._id)} className="button-primary">
                Generate UPN
              </button>
            </div>
            <br />
            <div>
              <button onClick={() => generateAndSendHalcomXml(transaction._id)} className="button-primary">
                Generate Xml
              </button>
            </div>
          </div>
        )}
      </div>

      {transaction && (
        <div className='search-container'>
          <h2 className="form-header">Comments</h2>
          <MessageComponent transactionId={transaction._id} />      
        </div>
      )}

    </div>
  );
};

export default TransactionSearchPage;

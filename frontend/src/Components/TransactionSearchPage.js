import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { useParams } from 'react-router-dom';
import '../App.css';
import MessageComponent from './MessageComponent';
import { UserContext } from '../userContext';
import { Info } from 'lucide-react';

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
  const [editMode, setEditMode] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState(null);
  const [editedEntity, setEditedEntity] = useState(null);
  const [entityType, setEntityType] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

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

  const fetchPrimopredajniZapisnik = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/transactions/primopredajniZapisnik/${transaction._id}`,
        {
          withCredentials: true,
          responseType: 'blob'
        }
      )
      const filename = transaction.agents.map(s => `${s.firstName} ${s.lastName}`).join(', ') + "_primopredajni_zapisnik.docx";
      saveAs(new Blob([response.data]), filename);
    } catch (error) {
      console.error('Error generating report:', error);
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

  const toggleEditMode = () => {
    if (editMode) {
      // If exiting edit mode, reset edited data
      setEditedTransaction(null);
      setEditedEntity(null);
      setEntityType('');
    } else {
      // If entering edit mode, initialize edited data
      setEditedTransaction({ ...transaction });
      setAuditLogs([]);
      setShowAuditLogs(false);
    }
    setEditMode(!editMode);
  };

  const handleTransactionUpdate = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3001/api/transactions/${transaction._id}`,
        editedTransaction,
        { withCredentials: true }
      );

      setTransaction(response.data.transaction);
      setEditedTransaction({ ...response.data.transaction });
      alert('Tranzakcija uspešno posodobljena!');
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction');
    }
  };

  const handleEntityUpdate = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3001/api/transactions/${transaction._id}/${entityType}/${editedEntity._id}`,
        editedEntity,
        { withCredentials: true }
      );

      // Update the appropriate state based on entity type
      if (entityType === 'buyer') {
        const updatedBuyers = buyers.map(b =>
          b._id === editedEntity._id ? response.data.buyer : b
        );
        setBuyers(updatedBuyers);
      } else if (entityType === 'seller') {
        const updatedSellers = sellers.map(s =>
          s._id === editedEntity._id ? response.data.seller : s
        );
        setSellers(updatedSellers);
      } else if (entityType === 'property') {
        setTransaction(prev => ({
          ...prev,
          property: response.data.property
        }));
      }

      alert(`${entityType} uspešno posodobljeno!`);
      setEditedEntity(null);
      setEntityType('');
    } catch (error) {
      console.error(`Error updating ${entityType}:`, error);
      alert(`Failed to update ${entityType}`);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/transactions/audit/${transaction._id}`,
        { withCredentials: true }
      );
      setAuditLogs(response.data);
      setShowAuditLogs(true);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      alert('Failed to fetch audit logs');
    }
  };

  const toggleAuditLogs = () => {
    if (showAuditLogs) {
      setShowAuditLogs(false);
    } else {
      fetchAuditLogs();
    }
  };

  // Tab gumbi (dodali smo nov zavihek "FF Details")
  const tabs = ['Agent', 'Prodajalci', 'Kupci', 'Nepremičnina', 'Podrobnosti plačila', 'Kontrolne Značke'];
  return (
    <div className='page-container'>
      <div className='form-container'>

        <h1 className='form-header'>Iskanje transakcij</h1>
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
            Išči
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

            {/* Add this new edit button section right after tab buttons */}
            {['Prodajalci', 'Kupci', 'Nepremičnina', 'Podrobnosti plačila'].includes(activeTab) && (
              <div className='tab-details' style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={toggleEditMode}
                  className='button-primary'
                  style={{ width: 'auto' }}
                >
                  {editMode ? 'Prekini urejanje' : 'Uredi'}
                </button>

                {editMode && (
                  <button
                    onClick={toggleAuditLogs}
                    className='button-primary'
                    style={{ width: 'auto' }}
                  >
                    {showAuditLogs ? 'Skrij zgodovino sprememb' : 'Prikaži zgodovino sprememb'}
                  </button>
                )}
              </div>
            )}

            {activeTab === 'Agent' && transaction.agents && (
              <div className={`tab-content ${activeTab === 'Agent' ? 'active' : ''}`}>
                {transaction.agents.map((agentItem, index) => (
                  <div key={index} className='tab-details'>
                    <h3>Podatki o agentu</h3>
                    <p><strong>Ime:</strong> {agentItem.firstName} {agentItem.lastName}</p>
                    <p><strong>Naslov:</strong> {agentItem.address}</p>
                    <p><strong>Telefon:</strong> {agentItem.gsm}</p>
                    <p><strong>E-pošta:</strong> {agentItem.email}</p>
                    <p><strong>EMŠO:</strong> {agentItem.emso}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Prodajalci' && sellers.length > 0 && (
              <div className='tab-content active'>
                {sellers.map((seller, index) => (
                  <div key={index} className='tab-details'>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>Podatki o prodajalcu</h3>
                      {editMode && entityType !== 'seller' && (
                        <button
                          onClick={() => {
                            setEntityType('seller');
                            setEditedEntity({ ...seller });
                          }}
                          className='button-primary'
                          style={{ width: 'auto', padding: '5px 10px' }}
                        >
                          Uredi
                        </button>
                      )}
                    </div>

                    {entityType === 'seller' && editedEntity?._id === seller._id ? (
                      <div className='edit-form'>
                        <div className='form-group'>
                          <label>Ime:</label>
                          <input
                            type="text"
                            value={editedEntity.firstName}
                            onChange={(e) => setEditedEntity(prev => ({
                              ...prev,
                              firstName: e.target.value
                            }))}
                          />
                        </div>
                        <div className='form-group'>
                          <label>Priimek:</label>
                          <input
                            type="text"
                            value={editedEntity.lastName}
                            onChange={(e) => setEditedEntity(prev => ({
                              ...prev,
                              lastName: e.target.value
                            }))}
                          />
                        </div>
                        <div className='form-group'>
                          <label>Naslov:</label>
                          <input
                            type="text"
                            value={editedEntity.address}
                            onChange={(e) => setEditedEntity(prev => ({
                              ...prev,
                              address: e.target.value
                            }))}
                          />
                        </div>
                        <div className='form-group'>
                          <label>Telefon:</label>
                          <input
                            type="text"
                            value={editedEntity.gsm}
                            onChange={(e) => setEditedEntity(prev => ({
                              ...prev,
                              gsm: e.target.value
                            }))}
                          />
                        </div>
                        <div className='form-group'>
                          <label>E-pošta:</label>
                          <input
                            type="email"
                            value={editedEntity.email}
                            onChange={(e) => setEditedEntity(prev => ({
                              ...prev,
                              email: e.target.value
                            }))}
                          />
                        </div>
                        <div className='form-group'>
                          <label>EMŠO:</label>
                          <input
                            type="text"
                            value={editedEntity.emso}
                            onChange={(e) => setEditedEntity(prev => ({
                              ...prev,
                              emso: e.target.value
                            }))}
                          />
                        </div>
                        <div className='form-group'>
                          <label>Davčna številka:</label>
                          <input
                            type="text"
                            value={editedEntity.taxNumber}
                            onChange={(e) => setEditedEntity(prev => ({
                              ...prev,
                              taxNumber: e.target.value
                            }))}
                          />
                        </div>
                        <div className='form-group'>
                          <label>Bančni račun:</label>
                          <input
                            type="text"
                            value={editedEntity.bankAccount}
                            onChange={(e) => setEditedEntity(prev => ({
                              ...prev,
                              bankAccount: e.target.value
                            }))}
                          />
                        </div>
                        <div className='form-group'>
                          <label>Banka:</label>
                          <input
                            type="text"
                            value={editedEntity.bankName}
                            onChange={(e) => setEditedEntity(prev => ({
                              ...prev,
                              bankName: e.target.value
                            }))}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button
                            onClick={handleEntityUpdate}
                            className='button-primary'
                            style={{ width: 'auto' }}
                          >
                            Shrani
                          </button>
                          <button
                            onClick={() => {
                              setEditedEntity(null);
                              setEntityType('');
                            }}
                            className='button-primary'
                            style={{ width: 'auto', backgroundColor: '#666' }}
                          >
                            Prekliči
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p><strong>Ime:</strong> {`${seller.firstName} ${seller.lastName}`}</p>
                        <p><strong>Naslov:</strong> {seller.address}</p>
                        <p><strong>Telefon:</strong> {seller.gsm}</p>
                        <p><strong>E-pošta:</strong> {seller.email}</p>
                        <p><strong>EMŠO:</strong> {seller.emso}</p>
                        <p><strong>Davčna številka:</strong> {seller.taxNumber}</p>
                        <p><strong>Bančni račun:</strong> {seller.bankAccount}</p>
                        <p><strong>Banka:</strong> {seller.bankName}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}


            {activeTab === 'Kupci' && buyers.length > 0 && (
              <div className='tab-content active'>
                {buyers.map((buyer, index) => (
                  <div key={index} className='tab-details'>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>Podatki o kupcu</h3>
                      {editMode && entityType !== 'buyer' && (
                        <button
                          onClick={() => {
                            setEntityType('buyer');
                            setEditedEntity({ ...buyer });
                          }}
                          className='button-primary'
                          style={{ width: 'auto', padding: '5px 10px' }}
                        >
                          Uredi
                        </button>
                      )}
                    </div>

                    {entityType === 'buyer' && editedEntity?._id === buyer._id ? (
                      <div className='edit-form'>
                        <div className='form-group'>
                          <label>Ime:</label>
                          <input
                            type="text"
                            value={editedEntity.firstName}
                            onChange={(e) => setEditedEntity(prev => ({
                              ...prev,
                              firstName: e.target.value
                            }))}
                          />
                        </div>
                        <div className='form-group'>
                          <label>Priimek:</label>
                          <input
                            type="text"
                            value={editedEntity.lastName}
                            onChange={(e) => setEditedEntity(prev => ({
                              ...prev,
                              lastName: e.target.value
                            }))}
                          />
                        </div>
                        <div className='form-group'>
                          <label>Naslov:</label>
                          <input
                            type="text"
                            value={editedEntity.address}
                            onChange={(e) => setEditedEntity(prev => ({
                              ...prev,
                              address: e.target.value
                            }))}
                          />
                        </div>
                        <div className='form-group'>
                          <label>Telefon:</label>
                          <input
                            type="text"
                            value={editedEntity.gsm}
                            onChange={(e) => setEditedEntity(prev => ({
                              ...prev,
                              gsm: e.target.value
                            }))}
                          />
                        </div>
                        <div className='form-group'>
                          <label>E-pošta:</label>
                          <input
                            type="email"
                            value={editedEntity.email}
                            onChange={(e) => setEditedEntity(prev => ({
                              ...prev,
                              email: e.target.value
                            }))}
                          />
                        </div>
                        <div className='form-group'>
                          <label>EMŠO:</label>
                          <input
                            type="text"
                            value={editedEntity.emso}
                            onChange={(e) => setEditedEntity(prev => ({
                              ...prev,
                              emso: e.target.value
                            }))}
                          />
                        </div>
                        <div className='form-group'>
                          <label>Davčna številka:</label>
                          <input
                            type="text"
                            value={editedEntity.taxNumber}
                            onChange={(e) => setEditedEntity(prev => ({
                              ...prev,
                              taxNumber: e.target.value
                            }))}
                          />
                        </div>
                        <div className='form-group'>
                          <label>Bančni račun:</label>
                          <input
                            type="text"
                            value={editedEntity.bankAccount}
                            onChange={(e) => setEditedEntity(prev => ({
                              ...prev,
                              bankAccount: e.target.value
                            }))}
                          />
                        </div>
                        <div className='form-group'>
                          <label>Banka:</label>
                          <input
                            type="text"
                            value={editedEntity.bankName}
                            onChange={(e) => setEditedEntity(prev => ({
                              ...prev,
                              bankName: e.target.value
                            }))}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button
                            onClick={handleEntityUpdate}
                            className='button-primary'
                            style={{ width: 'auto' }}
                          >
                            Shrani
                          </button>
                          <button
                            onClick={() => {
                              setEditedEntity(null);
                              setEntityType('');
                            }}
                            className='button-primary'
                            style={{ width: 'auto', backgroundColor: '#666' }}
                          >
                            Prekliči
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p><strong>Ime:</strong> {`${buyer.firstName} ${buyer.lastName}`}</p>
                        <p><strong>Naslov:</strong> {buyer.address}</p>
                        <p><strong>Telefon:</strong> {buyer.gsm}</p>
                        <p><strong>E-pošta:</strong> {buyer.email}</p>
                        <p><strong>EMŠO:</strong> {buyer.emso}</p>
                        <p><strong>Davčna številka:</strong> {buyer.taxNumber}</p>
                        <p><strong>Bančni račun:</strong> {buyer.bankAccount}</p>
                        <p><strong>Banka:</strong> {buyer.bankName}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Nepremičnina' && transaction.property && (
              <div className='tab-content active'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Podatki o nepremičnini</h3>
                  {editMode && entityType !== 'property' && (
                    <button
                      onClick={() => {
                        setEntityType('property');
                        setEditedEntity({ ...transaction.property });
                      }}
                      className='button-primary'
                      style={{ width: 'auto', padding: '5px 10px' }}
                    >
                      Uredi
                    </button>
                  )}
                </div>

                {entityType === 'property' ? (
                  <div className='edit-form'>
                    <div className='form-group'>
                      <label>ID:</label>
                      <input
                        type="text"
                        value={editedEntity.mainPropertyId}
                        onChange={(e) => setEditedEntity(prev => ({
                          ...prev,
                          mainPropertyId: e.target.value
                        }))}
                      />
                    </div>
                    <div className='form-group'>
                      <label>Naslov:</label>
                      <input
                        type="text"
                        value={editedEntity.address}
                        onChange={(e) => setEditedEntity(prev => ({
                          ...prev,
                          address: e.target.value
                        }))}
                      />
                    </div>
                    <div className='form-group'>
                      <label>Tip:</label>
                      <input
                        type="text"
                        value={editedEntity.type}
                        onChange={(e) => setEditedEntity(prev => ({
                          ...prev,
                          type: e.target.value
                        }))}
                      />
                    </div>
                    <div className='form-group'>
                      <label>Cena (€):</label>
                      <input
                        type="number"
                        value={editedEntity.price}
                        onChange={(e) => setEditedEntity(prev => ({
                          ...prev,
                          price: Number(e.target.value)
                        }))}
                      />
                    </div>
                    <div className='form-group'>
                      <label>Nova gradnja:</label>
                      <input
                        type="checkbox"
                        checked={editedEntity.isNewBuild}
                        onChange={(e) => setEditedEntity(prev => ({
                          ...prev,
                          isNewBuild: e.target.checked
                        }))}
                      />
                    </div>
                    <div className='form-group'>
                      <label>Kmetijsko zemljišče:</label>
                      <input
                        type="checkbox"
                        checked={editedEntity.isAgriculturalLand}
                        onChange={(e) => setEditedEntity(prev => ({
                          ...prev,
                          isAgriculturalLand: e.target.checked
                        }))}
                      />
                    </div>
                    <div className='form-group'>
                      <label>Predkupna pravica:</label>
                      <input
                        type="checkbox"
                        checked={editedEntity.preemptionRight}
                        onChange={(e) => setEditedEntity(prev => ({
                          ...prev,
                          preemptionRight: e.target.checked
                        }))}
                      />
                    </div>

                    <h4>Podrobnosti cen</h4>
                    <div className='form-group'>
                      <label>Nepremičnina (€):</label>
                      <input
                        type="number"
                        value={editedEntity.sellingPrice?.property || 0}
                        onChange={(e) => setEditedEntity(prev => ({
                          ...prev,
                          sellingPrice: {
                            ...prev.sellingPrice,
                            property: Number(e.target.value)
                          }
                        }))}
                      />
                    </div>
                    <div className='form-group'>
                      <label>Oprema (€):</label>
                      <input
                        type="number"
                        value={editedEntity.sellingPrice?.equipment || 0}
                        onChange={(e) => setEditedEntity(prev => ({
                          ...prev,
                          sellingPrice: {
                            ...prev.sellingPrice,
                            equipment: Number(e.target.value)
                          }
                        }))}
                      />
                    </div>
                    <div className='form-group'>
                      <label>Drugo (€):</label>
                      <input
                        type="number"
                        value={editedEntity.sellingPrice?.other || 0}
                        onChange={(e) => setEditedEntity(prev => ({
                          ...prev,
                          sellingPrice: {
                            ...prev.sellingPrice,
                            other: Number(e.target.value)
                          }
                        }))}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button
                        onClick={handleEntityUpdate}
                        className='button-primary'
                        style={{ width: 'auto' }}
                      >
                        Shrani
                      </button>
                      <button
                        onClick={() => {
                          setEditedEntity(null);
                          setEntityType('');
                        }}
                        className='button-primary'
                        style={{ width: 'auto', backgroundColor: '#666' }}
                      >
                        Prekliči
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>
                      <strong>ID:</strong> {transaction.property.mainPropertyId}
                      <span className="info-icon-container">
                        <span className="info-icon">
                          <Info size={12} />
                          <span className="info-tooltip">ID značka</span>
                        </span>
                      </span>
                    </p>
                    <p><strong>Naslov:</strong> {transaction.property.address}</p>
                    <p><strong>Tip:</strong> {transaction.property.type}</p>
                    <p><strong>Cena:</strong> €{transaction.property.price}</p>
                    <p><strong>Nova gradnja:</strong> {transaction.property.isNewBuild ? 'Da' : 'Ne'}</p>
                    <p><strong>Kmetijsko zemljišče:</strong> {transaction.property.isAgriculturalLand ? 'Da' : 'Ne'}</p>
                    <p><strong>Predkupna pravica:</strong> {transaction.property.preemptionRight ? 'Da' : 'Ne'}</p>
                    <h3 className='tab-details'>Podrobnosti cen</h3>
                    <p><strong>Nepremičnina:</strong> €{transaction.property.sellingPrice.property}</p>
                    <p><strong>Oprema:</strong> €{transaction.property.sellingPrice.equipment}</p>
                    <p><strong>Drugo:</strong> €{transaction.property.sellingPrice.other}</p>
                    <p><strong>Skupaj:</strong> €{(
                      (transaction.property.sellingPrice.property || 0) +
                      (transaction.property.sellingPrice.equipment || 0) +
                      (transaction.property.sellingPrice.other || 0)
                    )}</p>
                  </>
                )}
              </div>
            )}


            {activeTab === 'Podrobnosti plačila' && transaction.paymentDetails && (
              <div className='tab-content active'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>
                    Podrobnosti plačila
                    <span className="info-icon-container">
                      <span className="info-icon">
                        <Info size={12} />
                        <span className="info-tooltip">Opis plačila</span>
                      </span>
                    </span>
                  </h3>
                  {editMode && (
                    <button
                      onClick={() => {
                        setEditedTransaction({
                          ...transaction,
                          paymentDetails: {
                            ...transaction.paymentDetails,
                            deposit: {
                              ...transaction.paymentDetails.deposit,
                              alreadyPaid: {
                                ...transaction.paymentDetails.deposit.alreadyPaid
                              }
                            },
                            remaining: {
                              ...transaction.paymentDetails.remaining
                            }
                          }
                        });
                      }}
                      className='button-primary'
                      style={{ width: 'auto', padding: '5px 10px' }}
                    >
                      Uredi
                    </button>
                  )}
                </div>

                {editMode && editedTransaction ? (
                  <div className='edit-form'>
                    <div className='form-group'>
                      <label>Dodatne opombe:</label>
                      <textarea
                        value={editedTransaction.paymentDescriptor}
                        onChange={(e) => setEditedTransaction(prev => ({
                          ...prev,
                          paymentDescriptor: e.target.value
                        }))}
                      />
                    </div>

                    <div className='form-group'>
                      <label>Provizija (%):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editedTransaction.commissionPercent}
                        onChange={(e) => setEditedTransaction(prev => ({
                          ...prev,
                          commissionPercent: Number(e.target.value)
                        }))}
                      />
                    </div>

                    <div className='form-group'>
                      <label>Provizija (€):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editedTransaction.commissionGross}
                        onChange={(e) => setEditedTransaction(prev => ({
                          ...prev,
                          commissionGross: Number(e.target.value)
                        }))}
                      />
                    </div>

                    <h4>Polog</h4>
                    <div className='form-group'>
                      <label>Znesek (€):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editedTransaction.paymentDetails.deposit.amount}
                        onChange={(e) => setEditedTransaction(prev => ({
                          ...prev,
                          paymentDetails: {
                            ...prev.paymentDetails,
                            deposit: {
                              ...prev.paymentDetails.deposit,
                              amount: Number(e.target.value)
                            }
                          }
                        }))}
                      />
                    </div>
                    <div className='form-group'>
                      <label>Rok:</label>
                      <input
                        type="date"
                        value={editedTransaction.paymentDetails.deposit.deadline?.split('T')[0] || ''}
                        onChange={(e) => setEditedTransaction(prev => ({
                          ...prev,
                          paymentDetails: {
                            ...prev.paymentDetails,
                            deposit: {
                              ...prev.paymentDetails.deposit,
                              deadline: e.target.value
                            }
                          }
                        }))}
                      />
                    </div>
                    <div className='form-group'>
                      <label>Že plačano (€):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editedTransaction.paymentDetails.deposit.alreadyPaid.amount}
                        onChange={(e) => setEditedTransaction(prev => ({
                          ...prev,
                          paymentDetails: {
                            ...prev.paymentDetails,
                            deposit: {
                              ...prev.paymentDetails.deposit,
                              alreadyPaid: {
                                amount: Number(e.target.value)
                              }
                            }
                          }
                        }))}
                      />
                    </div>

                    <h4>Preostanek</h4>
                    <div className='form-group'>
                      <label>Znesek (€):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editedTransaction.paymentDetails.remaining.amount}
                        onChange={(e) => setEditedTransaction(prev => ({
                          ...prev,
                          paymentDetails: {
                            ...prev.paymentDetails,
                            remaining: {
                              ...prev.paymentDetails.remaining,
                              amount: Number(e.target.value)
                            }
                          }
                        }))}
                      />
                    </div>
                    <div className='form-group'>
                      <label>Rok:</label>
                      <input
                        type="date"
                        value={editedTransaction.paymentDetails.remaining.deadline?.split('T')[0] || ''}
                        onChange={(e) => setEditedTransaction(prev => ({
                          ...prev,
                          paymentDetails: {
                            ...prev.paymentDetails,
                            remaining: {
                              ...prev.paymentDetails.remaining,
                              deadline: e.target.value
                            }
                          }
                        }))}
                      />
                    </div>

                    <h4>Podatki o hipoteki</h4>
                    <div className='form-group'>
                      <label>Stanje hipoteke:</label>
                      <input
                        type="checkbox"
                        checked={editedTransaction.buyerMortgage}
                        onChange={(e) => setEditedTransaction(prev => ({
                          ...prev,
                          buyerMortgage: e.target.checked
                        }))}
                      />
                    </div>
                    <div className='form-group'>
                      <label>Znesek hipoteke (€):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editedTransaction.mortgageAmount}
                        onChange={(e) => setEditedTransaction(prev => ({
                          ...prev,
                          mortgageAmount: Number(e.target.value)
                        }))}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button
                        onClick={handleTransactionUpdate}
                        className='button-primary'
                        style={{ width: 'auto' }}
                      >
                        Shrani
                      </button>
                      <button
                        onClick={() => {
                          setEditedTransaction(null);
                        }}
                        className='button-primary'
                        style={{ width: 'auto', backgroundColor: '#666' }}
                      >
                        Prekliči
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p><strong>Dodatne opombe:</strong> {transaction.paymentDescriptor}</p>
                    <p><strong>Že plačano:</strong> {transaction.paymentDetails.deposit.alreadyPaid.amount}€</p>
                    <div className='tab-details'>
                      <p>
                        <strong>Provizija:</strong> {
                          transaction.commissionGross !== 0
                            ? `${transaction.commissionGross}€`
                            : (transaction.commissionPercent !== 0 ? `${transaction.commissionPercent}%` : '0')
                        }
                      </p>
                      <p>
                        <strong>Vrednost:</strong>
                        {
                          transaction.commissionGross !== 0
                            ? `${transaction.commissionGross}€`
                            : (transaction.commissionPercent !== 0 ? `${transaction.paymentDetails.remaining.amount / 100 * transaction.commissionPercent}€` : '0')
                        }
                      </p>

                      <h3>Polog</h3>
                      <p><strong>Znesek:</strong> €{transaction.paymentDetails.deposit.amount}</p>
                      <p>
                        <strong>Rok:</strong>{' '}
                        {transaction.paymentDetails.deposit.deadline &&
                          new Date(transaction.paymentDetails.deposit.deadline).toLocaleDateString()}
                      </p>

                      <h3>Preostanek</h3>
                      <p><strong>Znesek:</strong> €{transaction.paymentDetails.remaining.amount - transaction.paymentDetails.deposit.alreadyPaid.amount}</p>
                      <p>
                        <strong>Rok:</strong>{' '}
                        {transaction.paymentDetails.remaining.deadline &&
                          new Date(transaction.paymentDetails.remaining.deadline).toLocaleDateString()}
                      </p>

                      <h3>Podatki o hipoteki</h3>
                      <div className='tab-details'>
                        <p><strong>Stanje hipoteke:</strong> {transaction.buyerMortgage ? 'Da' : 'Ne'}</p>
                        <p><strong>Znesek:</strong> €{transaction.mortgageAmount || 0}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Nov zavihek: FF Details */}
            {activeTab === 'Kontrolne Značke' && (
              <div className='tab-content active'>
                <h3>Kontrolne Značke</h3>
                <div className='tab-details'>


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

            {/* Audit logs */}
            {showAuditLogs && (
              <div className='audit-logs-container'>
                <h3>Zgodovina sprememb</h3>
                {auditLogs.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Spremenil</th>
                        <th>Datum</th>
                        <th>Spremembe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log, index) => {
                        // Extract the actual field changes from the nested structure
                        const fieldChanges = log.changes?.changes || log.changes;

                        return (
                          <tr key={index}>
                            <td>{log.changedBy?.name || 'Sistem'}</td>
                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                            <td>
                              {fieldChanges && typeof fieldChanges === 'object' ? (
                                Object.entries(fieldChanges).map(([field, values]) => {
                                  if (field === 'entityId' || field === 'entityType') return null;

                                  const oldValue = values.oldValue !== undefined ? values.oldValue : values.old;
                                  const newValue = values.newValue !== undefined ? values.newValue : values.new;

                                  // Skip if no actual change in values
                                  if (String(oldValue) === String(newValue)) return null;

                                  // Format field names to be more readable
                                  const formattedField = {
                                    'firstName': 'Ime',
                                    'lastName': 'Priimek',
                                    'address': 'Naslov',
                                    'gsm': 'Telefon',
                                    'email': 'E-pošta',
                                    'emso': 'EMŠO',
                                    'taxNumber': 'Davčna številka',
                                    'bankAccount': 'Bančni račun',
                                    'bankName': 'Banka'
                                  }[field] || field;

                                  return (
                                    <div key={field}>
                                      <strong>{formattedField}:</strong> {String(oldValue || '')} → {String(newValue || '')}
                                    </div>
                                  );
                                })
                              ) : (
                                <div>Brez sprememb</div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p>Ni zgodovine sprememb za to transakcijo.</p>
                )}
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
                <label><strong>Dodeli odvetniku (Email):</strong></label>
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
                  Dodeli odvetniku
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
              <button onClick={fetchPrimopredajniZapisnik} className='button-primary'>
                Generate Primopredajni Zapisnik
              </button>
            </div>
            <br />
            <div>
              <button onClick={() => generateUpn(transaction._id)} className="button-primary">
                Generate UPN
              </button>
            </div>
            <br />
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

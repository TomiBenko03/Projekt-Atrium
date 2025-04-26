import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import { Info } from 'lucide-react';

const TransactionPage = () => {
  const [formData, setFormData] = useState({
    sellers: '',
    buyers: '',
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
    status: 'v pripravi',
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

  const [commissionType, setCommissionType] = useState('percent');
  const [commissionPercent, setCommissionPercent] = useState('');
  const [commissionGross, setCommissionGross] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

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
        console.error('Napaka pri pridobivanju uporabniške vloge:', error);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  const parseNames = (namesString) => {
    return namesString.split(',').map(name => {
      const parts = name.trim().split(' ');
      return {
        firstName: parts.slice(0, -1).join(' '),
        lastName: parts[parts.length - 1] || ''
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const parsedData = {
        ...formData,
        sellers: parseNames(formData.sellers).map(p => p.firstName),
        sellerSurnames: parseNames(formData.sellers).map(p => p.lastName),
        buyers: parseNames(formData.buyers).map(p => p.firstName),
        buyerSurnames: parseNames(formData.buyers).map(p => p.lastName),
        sellerExpenses: formData.sellerExpenses
          ? formData.sellerExpenses.split(';').map((item) => {
            const [description, amount] = item.split(',');
            return { description: description.trim(), amount: Number(amount) || 0 };
          })
          : [],
        buyerExpenses: formData.buyerExpenses
          ? formData.buyerExpenses.split(';').map((item) => {
            const [description, amount] = item.split(',');
            return { description: description.trim(), amount: Number(amount) || 0 };
          })
          : [],
        mortgageAmount: parseFloat(formData.mortgageAmount) || 0,
        kontrola: parseFloat(formData.kontrola) || 0,
        commissionPercent: commissionType === 'percent' ? Number(commissionPercent) || 0 : 0,
        commissionGross: commissionType === 'gross' ? Number(commissionGross) || 0 : 0,
      };


      const response = await axios.post('http://localhost:3001/api/transactions', parsedData, {
        withCredentials: true,
      });
      setMessage(`Transakcija uspešno ustvarjena za nepremičnino: ${response.data.transaction.property.mainPropertyId}`);
      setError('');
      setFormData({
        ...formData,
        sellers: '',
        buyers: '',
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
        status: 'v pripravi',
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
      setCommissionType('percent');
      setCommissionPercent('');
      setCommissionGross('');
    } catch (error) {
      console.error('Napaka pri ustvarjanju transakcije:', error);
      setMessage('');
      setError('Napaka pri ustvarjanju transakcije. Preverite vnesene podatke.');
    }
  };

  const handleSearch = async () => {
    try {
      const endpoint =
        searchMode === 'transactionId'
          ? `http://localhost:3001/api/transactions/search/${searchQuery}`
          : 'http://localhost:3001/api/transactions/agentTransactions';

      const response = await axios.get(endpoint, { withCredentials: true });
      setSearchResults(searchMode === 'transactionId' ? [response.data] : response.data);
    } catch (error) {
      console.error('Napaka pri iskanju transakcije: ', error);
      setSearchResults([]);
    }
  };

  if (loading) {
    return <div>Nalagam...</div>;
  }

  if (userRole === 'odvetnik') {
    return (
      <div className='page-container'>
        <div className="restricted-container">
          <div className='search-container'>
            <h2 className='form-header'>Iskanje transakcij</h2>
            <div className='search-options'>
              <label>
                <input
                  type="radio"
                  name="searchMode"
                  value="transactionId"
                  checked={searchMode === 'transactionId'}
                  onChange={() => setSearchMode('transactionId')}
                />
                Iskanje po ID transakcije
              </label>
              <label>
                <input
                  type="radio"
                  name="searchMode"
                  value="agent"
                  checked={searchMode === 'agent'}
                  onChange={() => setSearchMode('agent')}
                />
                Transakcije po odvetniku
              </label>
            </div>

            {searchMode === 'transactionId' && (
              <input
                type="text"
                placeholder="Iskanje po ID transakcije"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            )}
            <button onClick={handleSearch} className='button-primary'>
              Išči
            </button>

            {searchResults.length > 0 && (
              <div className='search-results'>
                <h2>Rezultati iskanja</h2>
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
                        <strong>Nepremičnina: </strong>
                        {transaction.property?.mainPropertyId || 'N/A'} <br />
                        <strong>Kupci: </strong>
                        {transaction.buyers?.map(b => `${b.firstName} ${b.lastName}`).join(', ') || 'Ni kupcev'}<br />
                        <strong>Prodajalci: </strong>
                        {transaction.sellers?.map(s => `${s.firstName} ${s.lastName}`).join(', ') || 'Ni prodajalcev'}<br />
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
        <h1 className='form-header'>Registracija transakcije</h1>
        {message && <p className={`message ${message.includes('uspešno') ? 'success' : 'error'}`}>{message}</p>}
        {error && <p className="message error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label>Prodajalci (ločeni z vejico, ime in priimek):</label>
            <input
              type="text"
              name="sellers"
              value={formData.sellers}
              onChange={handleChange}
            />
          </div>
          <div className='form-group'>
            <label>Kupci (ločeni z vejico, ime in priimek):</label>
            <input
              type="text"
              name="buyers"
              value={formData.buyers}
              onChange={handleChange}
            />
          </div>
          <div className='form-group'>
            <label>Naziv nepremičnine:</label>
            <input
              type="text"
              name="propertyName"
              value={formData.propertyName}
              onChange={handleChange}
              required
            />
          </div>
          <div className='form-group'>
            <label>Znesek pologa:</label>
            <input
              type="number"
              name="paymentDetailsDepositAmount"
              value={formData.paymentDetailsDepositAmount}
              onChange={handleChange}
            />
          </div>
          <div className='form-group'>
            <label>Rok za polog:</label>
            <input
              type="date"
              name="paymentDetailsDepositDeadline"
              value={formData.paymentDetailsDepositDeadline}
              onChange={handleChange}
            />
          </div>
          <div className='form-group'>
            <label>
              Opis plačila:
              <span className="info-icon-container">
                <span className="info-icon">
                  <Info size={12} />
                  <span className="info-tooltip">Podrobnosti o plačilu</span>
                </span>
              </span>
            </label>
            <textarea
              name="paymentDescriptor"
              value={formData.paymentDescriptor}
              onChange={handleChange}
            />
          </div>
          <div className='form-group'>
            <label>Kupčeva hipoteka:</label>
            <input
              type="checkbox"
              name="buyerMortgage"
              checked={formData.buyerMortgage}
              onChange={handleChange}
            />
          </div>
          <div className='form-group'>
            <label>Znesek hipoteke:</label>
            <input
              type="number"
              name="mortgageAmount"
              value={formData.mortgageAmount}
              onChange={handleChange}
            />
          </div>
          <div className='form-group'>
            <label>Rok za predajo:</label>
            <input
              type="date"
              name="handoverDeadline"
              value={formData.handoverDeadline}
              onChange={handleChange}
              required
            />
          </div>
          <div className='form-group'>
            <label>Stroški prodajalca (opis,znesek; ločeni s podpičjem):</label>
            <input
              type="text"
              name="sellerExpenses"
              value={formData.sellerExpenses}
              onChange={handleChange}
            />
          </div>
          <div className='form-group'>
            <label>Stroški kupca (opis,znesek; ločeni s podpičjem):</label>
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

          {/* Provizija */}
          <div className='form-group'>
            <label>Način izračuna provizije:</label>
            <div>
              <label>
                <input
                  type="radio"
                  name="commissionType"
                  value="percent"
                  checked={commissionType === 'percent'}
                  onChange={() => setCommissionType('percent')}
                />
                Odstotek
              </label>
              <label>
                <input
                  type="radio"
                  name="commissionType"
                  value="gross"
                  checked={commissionType === 'gross'}
                  onChange={() => setCommissionType('gross')}
                />
                Fiksni znesek
              </label>
            </div>
          </div>
          {commissionType === 'percent' && (
            <div className='form-group'>
              <label>Provizija (%):</label>
              <input
                type="number"
                step="0.01"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(e.target.value)}
              />
            </div>
          )}
          {commissionType === 'gross' && (
            <div className='form-group'>
              <label>Znesek provizije:</label>
              <input
                type="number"
                step="0.01"
                value={commissionGross}
                onChange={(e) => setCommissionGross(e.target.value)}
              />
            </div>
          )}

          <button type="submit" className='button-primary'>
            Dodaj transakcijo
          </button>
        </form>
      </div>
      <div className='search-container'>
        <h2 className='form-header'>Iskanje transakcij</h2>
        <div className='search-options'>
          <label>
            <input
              type="radio"
              name="searchMode"
              value="transactionId"
              checked={searchMode === 'transactionId'}
              onChange={() => setSearchMode('transactionId')}
            />
            Iskanje po ID transakcije
          </label>
          <label>
            <input
              type="radio"
              name="searchMode"
              value="agent"
              checked={searchMode === 'agent'}
              onChange={() => setSearchMode('agent')}
            />
            Transakcije po agentu
          </label>
        </div>

        {searchMode === 'transactionId' && (
          <input
            type="text"
            placeholder="Vnesite ID transakcije"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
        <button onClick={handleSearch} className='button-primary'>
          Išči
        </button>

        {searchResults.length > 0 && (
          <div className='search-results'>
            <h2>Rezultati iskanja</h2>
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
                    <strong>Nepremičnina: </strong>{transaction.property?.mainPropertyId || 'N/A'} <br />
                    <strong>Kupci: </strong>{
                      transaction.buyers?.map(b => `${b.firstName} ${b.lastName}`).join(', ') || 'Ni kupcev'
                    }<br />
                    <strong>Prodajalci: </strong>{
                      transaction.sellers?.map(s => `${s.firstName} ${s.lastName}`).join(', ') || 'Ni prodajalcev'
                    }<br />
                    <strong>Status: </strong>{transaction.status || 'N/A'} <br />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionPage;
import React, { useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

const TransactionSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost:3001/api/transactions/search/${searchTerm}`);
      setTransaction(response.data);
      setError('');
    } catch (error) {
      console.error('Error searching transaction:', error);
      setTransaction(null);
      setError('Transaction not found');
    }
  };


const formatCheckbox = (value) => {
  return `${value ? '☒' : '☐'} DA ${!value ? '☒' : '☐'} NE`;
};
const generateReport = () => {
    if (!transaction) return;

     // Existing calculations
     const commissionPercentage = 4;
     const totalPrice = transaction.property.price;
     const commissionAmount = (totalPrice * commissionPercentage) / 100;
     const kwCaresDeduction = 20;
     const finalCommissionAmount = commissionAmount - kwCaresDeduction;
 
     // Calculate additional services
     const equipmentPrice = transaction.property.sellingPrice?.equipment || 0;
     const otherPrice = transaction.property.sellingPrice?.other || 0;
     const totalAdditionalServices = equipmentPrice + otherPrice;
 
     // Format additional services string
     const additionalServicesString = totalAdditionalServices > 0 
         ? `Oprema: ${equipmentPrice}€, Ostalo: ${otherPrice}€, Skupaj: ${totalAdditionalServices}€`
         : 'N/A';

    const today = new Date().toLocaleDateString();
    const content = `
Agent: ${transaction.agent.firstName} ${transaction.agent.lastName}
Datum oddaje obračuna: ${today}
Naslov nepremičnine in ID znak (št. stanovanja): ${transaction.property.address}, ID: ${transaction.property.mainPropertyId}

Prodajalec: ${transaction.sellers.map(s => `${s.firstName} ${s.lastName}`).join(', ')}
Plačnik: ${formatCheckbox(transaction.sellers[0]?.isPayer)} 
št. računa: ${transaction.sellers[0]?.bankAccount || 'N/A'} 
plačano: ${formatCheckbox(transaction.sellers[0]?.hasPaid)}

Kdo je zastopal prodajalca (ime in priimek agenta): ${transaction.agent.firstName} ${transaction.agent.lastName}

Kupec: ${transaction.buyers.map(b => `${b.firstName} ${b.lastName}`).join(', ')}
Plačnik: ${formatCheckbox(transaction.buyers[0]?.isPayer)} 
št. računa: ${transaction.buyers[0]?.bankAccount || 'N/A'} 
plačano: ${formatCheckbox(transaction.buyers[0]?.hasPaid)}

Kdo je zastopal kupca (ime in priimek agenta): ${transaction.agent.firstName} ${transaction.agent.lastName}

Prodajna cena: ${transaction.property.price}€
Skupaj (%): ${commissionPercentage}%
Skupaj provizija znesek: ${commissionAmount}€
(-20 € - KW cares): -${kwCaresDeduction}€

Znesek provizije, ki vam ga je potrebno nakazati: ${finalCommissionAmount}€

REFERRAL/NAPOTITEV: 
napotitev ste prejeli: ${transaction.referralReceived ? 'DA' : 'NE'}
Kdo vam ga je posredoval: ${transaction.referralFrom || 'N/A'}
napotitev ste posredovali: ${transaction.referralGiven ? 'DA' : 'NE'}
Komu ste ga posredovali: ${transaction.referralTo || 'N/A'}
Višina dogovorjenega refferal-a za obračun: ${transaction.referralPercentage || '0'}%

Interne dodatne storitve: ${additionalServicesString}
Zunanji pogodbeni dobavitelji: ${transaction.externalContractors || 'N/A'}
Provizija od dobavitelja: ${transaction.contractorCommission || 'N/A'}

Kdo je vodil prodajni postopek (ime in priimek): ${transaction.agent.firstName} ${transaction.agent.lastName}
Odgovoren za prodajno pogodbo (ime, priimek in naziv družbe): ${transaction.contractPreparedBy || 'N/A'}
Datum zaključka: ${new Date(transaction.handoverDeadline).toLocaleDateString()}
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `transaction_report_${transaction.property.mainPropertyId}.txt`);
};

  return (
    <div style={{ padding: '20px' }}>
      <h2>Transaction Search</h2>
      
      <form onSubmit={handleSearch}>
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter transaction ID"
          style={{ padding: '5px', marginRight: '10px' }}
        />
        <button type="submit">Search</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {transaction && (
        <div style={{ marginTop: '20px', width: '80%', margin: '0 auto' }}>
          <h3>Transaction Details</h3>
          
          <h4>Agent Information</h4>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerStyle}>Name</th>
                <th style={headerStyle}>Address</th>
                <th style={headerStyle}>GSM</th>
                <th style={headerStyle}>Email</th>
                <th style={headerStyle}>EMSO</th>
                <th style={headerStyle}>Tax Number</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={cellStyle}>{`${transaction.agent.firstName} ${transaction.agent.lastName}`}</td>
                <td style={cellStyle}>{transaction.agent.address}</td>
                <td style={cellStyle}>{transaction.agent.gsm}</td>
                <td style={cellStyle}>{transaction.agent.email}</td>
                <td style={cellStyle}>{transaction.agent.emso}</td>
                <td style={cellStyle}>{transaction.agent.taxNumber}</td>
              </tr>
            </tbody>
          </table>

          <h4>Sellers Information</h4>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerStyle}>Name</th>
                <th style={headerStyle}>Address</th>
                <th style={headerStyle}>GSM</th>
                <th style={headerStyle}>Email</th>
                <th style={headerStyle}>EMSO</th>
                <th style={headerStyle}>Tax Number</th>
                <th style={headerStyle}>Bank Account</th>
                <th style={headerStyle}>Bank Name</th>
              </tr>
            </thead>
            <tbody>
              {transaction.sellers.map((seller, index) => (
                <tr key={index}>
                  <td style={cellStyle}>{`${seller.firstName} ${seller.lastName}`}</td>
                  <td style={cellStyle}>{seller.address}</td>
                  <td style={cellStyle}>{seller.gsm}</td>
                  <td style={cellStyle}>{seller.email}</td>
                  <td style={cellStyle}>{seller.emso}</td>
                  <td style={cellStyle}>{seller.taxNumber}</td>
                  <td style={cellStyle}>{seller.bankAccount}</td>
                  <td style={cellStyle}>{seller.bankName}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4>Buyers Information</h4>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerStyle}>Name</th>
                <th style={headerStyle}>Address</th>
                <th style={headerStyle}>GSM</th>
                <th style={headerStyle}>Email</th>
                <th style={headerStyle}>EMSO</th>
                <th style={headerStyle}>Tax Number</th>
                <th style={headerStyle}>Bank Account</th>
                <th style={headerStyle}>Bank Name</th>
              </tr>
            </thead>
            <tbody>
              {transaction.buyers.map((buyer, index) => (
                <tr key={index}>
                  <td style={cellStyle}>{`${buyer.firstName} ${buyer.lastName}`}</td>
                  <td style={cellStyle}>{buyer.address}</td>
                  <td style={cellStyle}>{buyer.gsm}</td>
                  <td style={cellStyle}>{buyer.email}</td>
                  <td style={cellStyle}>{buyer.emso}</td>
                  <td style={cellStyle}>{buyer.taxNumber}</td>
                  <td style={cellStyle}>{buyer.bankAccount}</td>
                  <td style={cellStyle}>{buyer.bankName}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4>Property Information</h4>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerStyle}>ID</th>
                <th style={headerStyle}>Address</th>
                <th style={headerStyle}>Type</th>
                <th style={headerStyle}>Price</th>
                <th style={headerStyle}>New Build</th>
                <th style={headerStyle}>Agricultural</th>
                <th style={headerStyle}>Preemption</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={cellStyle}>{transaction.property.mainPropertyId}</td>
                <td style={cellStyle}>{transaction.property.address}</td>
                <td style={cellStyle}>{transaction.property.type}</td>
                <td style={cellStyle}>{transaction.property.price}</td>
                <td style={cellStyle}>{transaction.property.isNewBuild ? 'Yes' : 'No'}</td>
                <td style={cellStyle}>{transaction.property.isAgriculturalLand ? 'Yes' : 'No'}</td>
                <td style={cellStyle}>{transaction.property.preemptionRight ? 'Yes' : 'No'}</td>
              </tr>
            </tbody>
          </table>

          <h4>Property Pricing Details</h4>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerStyle}>Property Price</th>
                <th style={headerStyle}>Equipment Price</th>
                <th style={headerStyle}>Other Price</th>
                <th style={headerStyle}>Total Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={cellStyle}>{transaction.property.sellingPrice?.property || 0}</td>
                <td style={cellStyle}>{transaction.property.sellingPrice?.equipment || 0}</td>
                <td style={cellStyle}>{transaction.property.sellingPrice?.other || 0}</td>
                <td style={cellStyle}>
                  {(transaction.property.sellingPrice?.property || 0) + 
                   (transaction.property.sellingPrice?.equipment || 0) + 
                   (transaction.property.sellingPrice?.other || 0)}
                </td>
              </tr>
            </tbody>
          </table>

          <h4>Payment Details</h4>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerStyle}>Type</th>
                <th style={headerStyle}>Amount</th>
                <th style={headerStyle}>Deadline</th>
                <th style={headerStyle}>Account</th>
                <th style={headerStyle}>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={cellStyle}>Deposit</td>
                <td style={cellStyle}>{transaction.paymentDetails.deposit.amount}</td>
                <td style={cellStyle}>
                  {transaction.paymentDetails.deposit.deadline && 
                   new Date(transaction.paymentDetails.deposit.deadline).toLocaleDateString()}
                </td>
                <td style={cellStyle}>{transaction.paymentDetails.deposit.account}</td>
                <td style={cellStyle}>
                  Already paid: {transaction.paymentDetails.deposit.alreadyPaid?.amount || 0} to 
                  {transaction.paymentDetails.deposit.alreadyPaid?.account}
                </td>
              </tr>
              <tr>
                <td style={cellStyle}>Remaining</td>
                <td style={cellStyle}>{transaction.paymentDetails.remaining.amount}</td>
                <td style={cellStyle}>
                  {transaction.paymentDetails.remaining.deadline && 
                   new Date(transaction.paymentDetails.remaining.deadline).toLocaleDateString()}
                </td>
                <td style={cellStyle}>{transaction.paymentDetails.remaining.account}</td>
                <td style={cellStyle}>{transaction.paymentDetails.remaining.additionalNotes}</td>
              </tr>
            </tbody>
          </table>

<button 
  onClick={generateReport} 
  style={{ 
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }}
  disabled={!transaction}
>
  Generate Report
</button>

        </div>
      )}
    </div>
    
  );
};

const tableStyle = {
  width: '80%', 
  maxWidth: '1000px', 
  borderCollapse: 'collapse',
  marginBottom: '20px',
  marginLeft: 'auto', 
  marginRight: 'auto' 
};

const headerStyle = {
  backgroundColor: '#f4f4f4',
  padding: '8px',
  borderBottom: '2px solid #ddd',
  textAlign: 'left'
};

const cellStyle = {
  padding: '6px',
  borderBottom: '1px solid #ddd'
};

export default TransactionSearchPage;
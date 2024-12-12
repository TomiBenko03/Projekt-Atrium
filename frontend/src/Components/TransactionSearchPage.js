import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import '../App.css';

const TransactionSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('agent');
  const [sellers, setSellers] = useState([]);
  const [buyers, setBuyers] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost:3001/api/transactions/search/${searchTerm}`);
      setTransaction(response.data);
      setSellers(response.data.sellers);
      setBuyers(response.data.buyers);
      setError('');
    } catch (error) {
      console.error('Error searching transaction:', error);
      setTransaction(null);
      setSellers([]);
      setBuyers([]);
      setError('Transaction not found');
    }
  };

  const formatCheckbox = (value) => {
    return `${value ? '☒' : '☐'} DA ${!value ? '☒' : '☐'} NE`;
  };

  const generateReport = () => {
    if (!transaction) return;

    // some calculations needed for the report
    const commissionPercentage = 4;
    const totalPrice = transaction.property.price;
    const commissionAmount = (totalPrice * commissionPercentage) / 100;
    const kwCaresDeduction = 20;
    const finalCommissionAmount = commissionAmount - kwCaresDeduction;

    // additional services (if data is available)
    const equipmentPrice = transaction.property.sellingPrice?.equipment || 0;
    const otherPrice = transaction.property.sellingPrice?.other || 0;
    const totalAdditionalServices = equipmentPrice + otherPrice;

    // to string
    const additionalServicesString = totalAdditionalServices > 0
      ? `Oprema: ${equipmentPrice}€, Ostalo: ${otherPrice}€, Skupaj: ${totalAdditionalServices}€`
      : 'N/A';

    const today = new Date().toLocaleDateString();

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: "Calibri",
              size: 22 //11pt
            }
          }
        }
      },

      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun(`Agent: ${transaction.agent.firstName} ${transaction.agent.lastName}. `),
              new TextRun(`Datum oddaje obračuna: ${today}`,),
              new TextRun({
                text: `Naslov nepremičnine in ID znak (št. stanovanja): ${transaction.property.address}, ID: ${transaction.property.mainPropertyId}`,
                break: true
              }),
              new TextRun({
                text: "",
                break: true
              })
            ]
          }),

          new Paragraph({
            children: [
              new TextRun(`Prodajalec: ${transaction.sellers.map(s => `${s.firstName} ${s.lastName}`).join(', ')}. `),
              new TextRun(`Plačnik: ${formatCheckbox(transaction.sellers[0]?.isPayer)}, `),
              new TextRun(`št. računa: ${transaction.sellers[0]?.bankAccount || 'N/A'}`),
              new TextRun({
                text: `plačano: ${formatCheckbox(transaction.sellers[0]?.hasPaid)}.`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Kdo je zastopal prodajalca (ime in priimek agenta): ${transaction.agent.firstName} ${transaction.agent.lastName}.`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun(`Kupec: ${transaction.buyers.map(b => `${b.firstName} ${b.lastName}`).join(', ')}. `),
              new TextRun(`Plačnik: ${formatCheckbox(transaction.buyers[0]?.isPayer)}, `),
              new TextRun(`št. računa: ${transaction.buyers[0]?.bankAccount || 'N/A'}, `),
              new TextRun({
                text: `plačano: ${formatCheckbox(transaction.buyers[0]?.hasPaid)}.`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Kdo je zastopal kupca (ime in priimek agenta): ${transaction.agent.firstName} ${transaction.agent.lastName}.`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun(`Prodajna cena: ${transaction.property.price}€. `),
              new TextRun(`Skupaj (%): ${commissionPercentage}%. `),
              new TextRun(`Skupaj provizija znesek: ${commissionAmount}€, `),
              new TextRun({
                text: `(-20 € - KW cares): -${kwCaresDeduction}€`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Znesek provizije, ki vam ga je potrebno nakazati: ${finalCommissionAmount}€. (če gre za delitev potem je to 70%, v kolikor ste capper potem odštejete 10% franšize). `,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `REFERRAL/NAPOTITEV: `,
                bold: true,
                underline: true,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun(`napotitev ste prejeli: ${transaction.referralReceived ? 'DA' : 'NE'}. `),
              new TextRun(`Kdo vam ga je posredoval: ${transaction.referralFrom || 'N/A'}, `),
              new TextRun(`napotitev ste posredovali: ${transaction.referralGiven ? 'DA' : 'NE'}. `),
              new TextRun(`Komu ste ga posredovali: ${transaction.referralTo || 'N/A'}. `),
              new TextRun({
                text: `Višina dogovorjenega refferal-a za obračun: ${transaction.referralPercentage || '0'}%.`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun(`Interne dodatne storitve: ${additionalServicesString}. `),
              new TextRun(`Zunanji pogodbeni dobavitelji: ${transaction.externalContractors || 'N/A'}. `),
              new TextRun({
                text: `Provizija od dobavitelja: ${transaction.contractorCommission || 'N/A'}. `,
                break: true
              }),

            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Kdo je vodil prodajni postopek (ime in priimek): ${transaction.agent.firstName} ${transaction.agent.lastName}`,
                break: true
              }),

            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Odgovoren za prodajno pogodbo (ime, priimek in naziv družbe): ${transaction.contractPreparedBy || 'N/A'}`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Datum zaključka: ${new Date(transaction.handoverDeadline).toLocaleDateString()}`,
                break: true
              }),
            ]
          }),
        ]
      }]
    })

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `transakcija_${transaction.property.mainPropertyId}.docx`);
    });
  };

  return (
    
      <div className='form-container'>
        <h1 className='form-header'>Search Transactions</h1>
        <form onSubmit={handleSearch} className='search-form'>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          {/* headers */}
          <div className='tab-buttons'>
            {/* creates a clickable tab of each input */}
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

          {/* content for each tab */}
          <div className={`tab-content ${activeTab === "agent" ? "active" : ""}`}>
          {activeTab === "agent" && (
              <div>
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
           </div>
           <div className={`tab-content ${activeTab === "sellers" ? "active" : ""}`}>
           {activeTab === "sellers" && (
              sellers.map((seller, index) => (
                <div key={index} className='tab-details'>
                  <h3>Seller Information</h3>
                  <div className='tab-details'>
                    <p><strong>Name:</strong> {`${seller.firstName} ${seller.lastName}`} </p>
                    <p><strong>Address:</strong> {seller.address} </p>
                    <p><strong>GSM:</strong> {seller.gsm} </p>
                    <p><strong>Email:</strong> {seller.email} </p>
                    <p><strong>Emso:</strong> {seller.emso} </p>
                    <p><strong>Tax Number:</strong> {seller.taxNumber} </p>
                    <p><strong>Bank Account:</strong> {seller.bankAccount} </p>
                    <p><strong>Bank Name:</strong> {seller.bankName} </p>
                  </div>
                </div>
              ))
            )}
              </div>

          <div className={`tab-content ${activeTab === "buyers" ? "active" : ""}`}>
            {activeTab === 'buyers' && (
              buyers.map((buyer, index) => (
                <div key={index} className='tab-details'>
                  <h3>Buyer Information</h3>
                  <div className='tab-details'>
                    <p><strong>Name:</strong> {`${buyer.firstName} ${buyer.lastName}`}</p>
                    <p><strong>Address:</strong> {buyer.address} </p>
                    <p><strong>GSM:</strong> {buyer.gsm} </p>
                    <p><strong>Email:</strong> {buyer.email} </p>
                    <p><strong>Emso:</strong> {buyer.emso} </p>
                    <p><strong>Tax Number:</strong> {buyer.taxNumber} </p>
                    <p><strong>Bank Account:</strong> {buyer.bankAccount} </p>
                    <p><strong>Bank Name:</strong> {buyer.bankName} </p>
                  </div>
                </div>
              ))
            )}
            </div>
            <div className={`tab-content ${activeTab === "property" ? "active" : ""}`}>
            
            {activeTab === 'property' && (
              <div className='tab-details'>
                <h3>Property Information</h3>
                <div className='tab-details'>
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
              </div>
            )}
          </div>
          <div className={`tab-content ${activeTab === "payment Details" ? "active" : ""}`}>
    
            {activeTab === 'payment Details' && (
              <div className='tab-details'>
                <h3>Payment Details</h3>
                <div className='tab-details'>
                  <h3>Deposit</h3>
                  <p><strong>Amount:</strong> €{transaction.paymentDetails.deposit.amount} </p>
                  <p><strong>Deadline:</strong> {transaction.paymentDetails.deposit.deadline && new Date(transaction.paymentDetails.deposit.deadline).toLocaleDateString()} </p>
                  <p><strong>Account:</strong> {transaction.paymentDetails.deposit.account} </p>
                  
                  <h3>Remaining</h3>
                  <p><strong>Amount:</strong> €{transaction.paymentDetails.remaining.amount} </p>
                  <p><strong>Deadline:</strong> {transaction.paymentDetails.remaining.deadline && new Date(transaction.paymentDetails.remaining.deadline).toLocaleDateString()} </p>
                  <p><strong>Account:</strong> {transaction.paymentDetails.remaining.account} </p>
                </div>
              </div>
            )}
          </div>
          <div className={`tab-content ${activeTab === "buyer Mortgage" ? "active" : ""}`}>
    
            {activeTab === 'buyer Mortgage' && (
              <div className='tab-details'>
                <h3>Mortgage Information</h3>
                <div className='tab-details'>
                  <p><strong>Mortgage Status:</strong> {transaction.buyerMortgage ? 'Yes' : 'No' } </p>
                  <p><strong>Amount:</strong> €{transaction.mortgageAmount || 0} </p>
                </div>
              </div>
            )}
          </div>
            <button
              onClick={generateReport}
              className='button-primary'
            >
              Generate Report
            </button>
          
        </div>
      )}
    </div>
  );
};

export default TransactionSearchPage;
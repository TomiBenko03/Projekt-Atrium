import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AgentPage from './Components/AgentPage';
import BuyerPage from './Components/BuyerPage';
import PropertyPage from './Components/PropertyPage'; // Adjust the path based on where you saved AgentPage.js
import SellerPage from './Components/SellerPage';
import TransactionPage from './Components/TransactionPage';
import TransactionSearchPage from './Components/TransactionSearchPage';

function App() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('/api') // Fetch from the Express server
            .then((res) => res.json())
            .then((data) => setData(data.message));
    }, []);

    return (
        <Router>
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/agent">Agent Page</Link></li>
                    <li><Link to="/buyer">Buyer Page</Link></li>
                    <li><Link to="/seller">Seller Page</Link></li>
                    <li><Link to="/property">Property Page</Link></li>
                    <li><Link to="/transaction">Transaction Page</Link></li>
                    <li><Link to="/transaction/search">Transaction Search</Link></li>
                </ul>
            </nav>
            <Routes>
                <Route path="/" element={
                    <div>
                        <h1>React + Express Example</h1>
                        <p>{data ? data : "Loading..."}</p>
                    </div>
                } />
                <Route path="/agent" element={<AgentPage />} />
                <Route path="/buyer" element={<BuyerPage />} />
                <Route path="/seller" element={<SellerPage />} />
                <Route path="/property" element={<PropertyPage/>} />
                <Route path="/transaction" element={<TransactionPage/>} />
                <Route path="/transaction/search" element={<TransactionSearchPage/>} />
            </Routes>
        </Router>
    );
}

export default App;

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AgentPage from './Components/AgentPage'; // Adjust the path based on where you saved AgentPage.js
import SellerPage from './Components/SellerPage';

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
                    <li><Link to="/seller">Seller Page</Link></li>

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
                <Route path="/seller" element={<SellerPage />} />
            </Routes>
        </Router>
    );
}

export default App;

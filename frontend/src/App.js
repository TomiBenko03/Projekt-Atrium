import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AgentPage from './Components/AgentPage';
import BuyerPage from './Components/BuyerPage';
import PropertyPage from './Components/PropertyPage'; // Adjust the path based on where you saved AgentPage.js
import SellerPage from './Components/SellerPage';
import TransactionPage from './Components/TransactionPage';
import TransactionSearchPage from './Components/TransactionSearchPage';
import LoginPage from './Components/LoginPage';
import { UserContext } from './userContext';
import LogoutPage from './Components/LogoutPage';

function App() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('/api') // Fetch from the Express server
            .then((res) => res.json())
            .then((data) => setData(data.message));
    }, []);

    const [user, setUser] = useState(localStorage.user ? JSON.parse(localStorage.user) : null);
    const updateUserData = (userInfo) => {
        localStorage.setItem("user", JSON.stringify(userInfo));
        setUser(userInfo);
    };

    return (
        <Router>
            <UserContext.Provider value = {{
                user: user,
                setUserContext: updateUserData
            }}>
                
            <nav>
                <ul>
                    {user ? (
                        <>
                        <span className="username">Welcome, {user.firstName} {user.lastName}</span>

                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/logout">Logout</Link></li>
                        <li><Link to="/buyer">Buyer Page</Link></li>
                        <li><Link to="/seller">Seller Page</Link></li>
                        <li><Link to="/property">Property Page</Link></li>
                        <li><Link to="/transaction">Transaction Page</Link></li>
                        <li><Link to="/transaction/search">Transaction Search</Link></li>
                        </>
                    ) : (
                        <>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/agent">Register</Link></li>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/buyer">Buyer Page</Link></li>
                        <li><Link to="/seller">Seller Page</Link></li>
                        <li><Link to="/property">Property Page</Link></li>
                        <li><Link to="/transaction">Transaction Page</Link></li>
                        <li><Link to="/transaction/search">Transaction Search</Link></li>
                        </>
                    )}
                   
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
                <Route path="/login" element={<LoginPage />}  />
                <Route path="/logout" element={<LogoutPage />}  />
                <Route path="/buyer" element={<BuyerPage />} />
                <Route path="/seller" element={<SellerPage />} />
                <Route path="/property" element={<PropertyPage/>} />
                <Route path="/transaction" element={<TransactionPage/>} />
                <Route path="/transaction/search" element={<TransactionSearchPage/>} />
            </Routes>

            </UserContext.Provider>
        </Router>
    );
}

export default App;

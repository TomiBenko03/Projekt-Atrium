import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import AgentPage from "./Components/AgentPage";
import BuyerPage from "./Components/BuyerPage";
import PropertyPage from "./Components/PropertyPage";
import SellerPage from "./Components/SellerPage";
import TransactionPage from "./Components/TransactionPage";
import TransactionSearchPage from "./Components/TransactionSearchPage";
import SearchAllPage from './Components/SearchAllPage';
import LoginPage from "./Components/LoginPage";
import LogoutPage from "./Components/LogoutPage";
import HomePage from "./Components/HomePage";
import { UserContext } from "./userContext";
import "./App.css";
import Logo from "./logo.svg"; // Adjust the path if needed

function App() {
  const [user, setUser] = useState(localStorage.user ? JSON.parse(localStorage.user) : null);

  const updateUserData = (userInfo) => {
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);
  };

  return (
    <Router>
      <UserContext.Provider value={{ user: user, setUserContext: updateUserData }}>
        {/* Premium Navigation Bar with Logo */}
        <nav className="nav-bar fade-in">
          <div className="nav-brand">
            <img src={Logo} alt="Atrium Logo" className="nav-logo" />
            <span className="username">
              {user ? `Welcome, ${user.firstName} ${user.lastName}` : "Atrium Luxe"}
            </span>
          </div>
          <ul className="nav-links">
            <li><Link className="nav-link" to="/">Domov</Link></li>
            {user ? (
              <>
                <li><Link className="nav-link" to="/buyer">Kupci</Link></li>
                <li><Link className="nav-link" to="/seller">Prodajalci</Link></li>
                <li><Link className="nav-link" to="/property">Nepremičnine</Link></li>
                <li><Link className="nav-link" to="/transaction">Transakcije</Link></li>
                <li><Link className="nav-link" to="/search/all">Išči</Link></li>
                <li><Link className="nav-link" to="/logout">Odjava</Link></li>
              </>
            ) : (
              <>
                <li><Link className="nav-link" to="/agent">Registracija</Link></li>
                <li><Link className="nav-link" to="/login">Vpis</Link></li>
              </>
            )}
          </ul>
        </nav>

        {/* Main Container */}
        <main className="main-container fade-in">
          <Routes>
            <Route path="/" element={<HomePage />}/>
            <Route path="/agent" element={<AgentPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="/buyer" element={<BuyerPage />} />
            <Route path="/seller" element={<SellerPage />} />
            <Route path="/property" element={<PropertyPage />} />
            <Route path="/transaction" element={<TransactionPage />} />
            <Route path="/search/all" element={<SearchAllPage />} />
            <Route path="/transaction/:transactionId" element={<TransactionSearchPage />} />
          </Routes>
        </main>

        {/* Premium Footer */}
        <footer className="app-footer fade-in">
          <p>&copy; {new Date().getFullYear()} Atrium Luxe | Elevating Real Estate Solutions</p>
        </footer>
      </UserContext.Provider>
    </Router>
  );
}

export default App;

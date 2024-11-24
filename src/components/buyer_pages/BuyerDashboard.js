import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import '../../css/style.css'; // Adjust the path if necessary

function BuyerDashboard() {
  const [account, setAccount] = useState("Not Connected");

  // Function to connect to MetaMask and display the connected account address
  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error accessing MetaMask accounts:", error);
        alert("MetaMask connection failed. Please try again.");
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask to interact with this website.');
    }
  };

  // Logout function to disconnect the session
  const logout = () => {
    alert("Logging out...");
    window.location.href = "../index.html";
  };

  // Automatically connect to MetaMask when the component mounts
  useEffect(() => {
    connectMetaMask();
  }, []);

  return (
    <div>
      <header>
        <div className="logo">
          <img src="logo.png" alt="Logo" />
        </div>
        <div className="brand-name">Greenhouse Management System</div>
        <div className="account-info" id="accountAddress">MetaMask Address: {account}</div>
        <button id="logoutButton" onClick={logout}>Log Out</button>
      </header>
      <nav>
        <a href="/buyerDashboard">Home</a> | <a href="#">View Plants</a> | <a href="#">About Us</a>
      </nav>
      <main>
        <h1>Buyer Dashboard</h1>
      </main>
      <footer>
        <p>© 2024 Greenhouse Management System</p>
      </footer>
    </div>
  );
}

export default BuyerDashboard;

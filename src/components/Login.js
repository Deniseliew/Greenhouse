import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import '../css/style.css';

function Login() {
  const [isConnected, setIsConnected] = useState(false);
  const [web3Instance, setWeb3Instance] = useState(null);
  const navigate = useNavigate();

  // Function to connect to MetaMask
  const connectMetamask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(window.ethereum);
        setWeb3Instance(web3);
        console.log('MetaMask is connected.');
        setIsConnected(true);
      } catch (error) {
        console.error('User denied account access or error occurred:', error);
        alert('MetaMask connection is required to use this site.');
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask to interact with this page.');
    }
  };

  // Automatically connect to MetaMask on component load
  useEffect(() => {
    connectMetamask();
  }, []);

  // Function to handle form submission
  const handleLogin = async (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;

    // Retrieve stored user data (using localStorage for demo; replace with your logic)
    const storedUser = JSON.parse(localStorage.getItem('registeredUser'));

    if (storedUser && storedUser.name === username && storedUser.password === password) {
      console.log('Login successful.');

      if (web3Instance) {
        try {
          const blockchainAccounts = await web3Instance.eth.getAccounts();
          console.log('Blockchain accounts fetched:', blockchainAccounts);

          if (blockchainAccounts.length === 0) {
            alert('Please connect to MetaMask.');
          } else {
            const userAccount = blockchainAccounts[0].toLowerCase();
            console.log('Connected Blockchain Account:', userAccount);

            // Check if the MetaMask account matches the stored address
            if (userAccount === storedUser.address.toLowerCase()) {
              alert('Welcome, ${storedUser.name}!');

              // Retrieve and handle role properly
              const role = storedUser.role ? storedUser.role.toLowerCase() : 'unknown'; // Ensure role is defined and lowercase
              console.log('User Role:', role);

              switch (role) {
                case 'buyer':
                  navigate('/buyerDashboard');
                  break;
                case 'seller':
                  navigate('/sellerDashboard');
                  break;
                case 'exporter':
                  navigate('/exporterDashboard');
                  break;
                case 'ghop':
                  navigate('/ghopDashboard');
                  break;
                default:
                  alert('Unknown role. Please check your registration.');
              }

            } else {
              alert('Connected MetaMask address does not match the registered user. Please connect the correct MetaMask account.');
            }
          }
        } catch (error) {
          console.error('Error accessing blockchain accounts:', error);
          alert('Error accessing blockchain accounts. Please try again.');
        }
      } else {
        alert('Please connect to MetaMask first.');
      }
    } else {
      alert('Incorrect username or password.');
    }
  };

  // Navigate to the register page
  const handleRegisterRedirect = () => {
    navigate('/register'); // Adjust the route if necessary
  };

  return (
    <div>
      <header>
        <div className="logo">
          <img src="logo.png" alt="Logo" />
        </div>
        <div className="brand-name">Greenhouse Management System</div>
      </header>
      <nav>
      <a href="/">Home</a> | <a href="#">View Plants</a> | <a href="#">About Us</a>
      </nav>
      <main>
        <h1>Greenhouse Management System - Login</h1>
        <form id="loginForm" onSubmit={handleLogin}>
          <div>
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit">Login</button>
        </form>
        <button onClick={handleRegisterRedirect} className="register-button">Register</button>
      </main>
      <footer>
        <p>© 2024 Greenhouse Management System</p>
      </footer>
    </div>
  );
}

export default Login;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import '../css/style.css'; // Adjust the path if necessary

function Register() {
  const [web3Instance, setWeb3Instance] = useState(null);
  const [role, setRole] = useState(''); // Updated from 'status' to 'role'
  const [name, setName] = useState('');
  const [password, setPassword] = useState(''); // State for password
  const navigate = useNavigate();

  // Function to connect to MetaMask
  const connectMetamask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(window.ethereum);
        setWeb3Instance(web3);
        console.log('MetaMask is connected.');
      } catch (error) {
        console.error('User denied account access or error occurred:', error);
        alert('MetaMask connection is required to use this site.');
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask to interact with this page.');
    }
  };

  // Automatically connect to MetaMask on component load
  React.useEffect(() => {
    connectMetamask();
  }, []);

  // Handle registration
  const handleRegister = async (event) => {
    event.preventDefault();

    if (!web3Instance) {
      alert('Please connect to MetaMask.');
      return;
    }

    const blockchainAccounts = await web3Instance.eth.getAccounts();
    if (blockchainAccounts.length === 0) {
      alert('Please connect to MetaMask.');
      return;
    }

    const userAddress = blockchainAccounts[0].toLowerCase();
    console.log('Connected MetaMask address:', userAddress);

    // Example: Save user data (replace with your logic for storing users)
    const userData = {
      name,
      role, // Using 'role' instead of 'status'
      password, // Save the password entered by the user
      address: userAddress
    };

    console.log('User data:', userData);

    // Save user data (using localStorage for demo purposes; replace with database logic as needed)
    localStorage.setItem('registeredUser', JSON.stringify(userData));
    alert('User registered successfully!');

    // Redirect to login page
    navigate('/login');
  };

  return (
    <div>
      <header>
        <div className="logo">
          <img src="logo.png" alt="Logo" />
        </div>
        <div className="brand-name">Greenhouse Management System - Register</div>
      </header>
      <nav>
        <a href="/">Home</a> | <a href="#">View Plants</a> | <a href="#">About Us</a>
      </nav>
      <main>
        <h1>Register</h1>
        <form id="registerForm" onSubmit={handleRegister}>
          <div>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="role">Role (e.g., Buyer/Seller):</label> {/* Updated label */}
            <input
              type="text"
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Register</button>
        </form>
      </main>
      <footer>
        <p>© 2024 Greenhouse Management System</p>
      </footer>
    </div>
  );
}

export default Register;
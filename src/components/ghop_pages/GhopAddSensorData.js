import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Web3 from 'web3';
import '../../css/ghopAddSensorData.css';

function GhopAddSensorData() {
  const [web3, setWeb3] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const [cropId, setCropId] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Function to load contract data
  const loadContractData = async (web3) => {
    try {
      const response = await fetch('/contractData/GreenHouseContract.json');
      if (!response.ok) {
        throw new Error('Failed to fetch contract JSON');
      }
      const contractData = await response.json();
      const contractABI = contractData.abi;
      const networkId = await web3.eth.net.getId();
      const contractAddress = contractData.networks[networkId]?.address;

      if (contractAddress) {
        const instance = new web3.eth.Contract(contractABI, contractAddress);
        setContractInstance(instance);
        console.log('Contract instance created:', instance);
      } else {
        console.error('Contract address not found for the current network');
        alert(`Contract address not found for network ID: ${networkId}. Please ensure the contract is deployed on the correct network.`);
      }
    } catch (error) {
      console.error('Error loading contract data:', error);
    }
  };

  // Function to initialize Web3 and contract
  const initializeWeb3AndContract = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          console.log('MetaMask connected with account:', accounts[0]);
          await loadContractData(web3Instance);
        } else {
          alert('No accounts found. Please ensure MetaMask is connected.');
        }
      } catch (error) {
        console.error('Error accessing MetaMask accounts:', error);
        alert('Error accessing MetaMask accounts. Please check MetaMask and try again.');
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask to interact with this website.');
    }
  };

  // Function to handle form submission
  const handleAddSensorData = async (event) => {
    event.preventDefault();

    const system = event.target.system.value;
    const temperature = event.target.temperature.value;
    const humidity = event.target.humidity.value;
    const water = event.target.water.value;
    const nutrition = event.target.nutrition.value;

    try {
      if (web3 && contractInstance && account) {
        console.log('Attempting to add sensor data...');

        const result = await contractInstance.methods
          .addSensorData(cropId, system, temperature, humidity, water, nutrition)
          .send({ from: account });

        console.log('Sensor data added:', result);
        alert('Sensor data successfully added!');
      } else {
        alert('MetaMask not connected or contract not loaded.');
      }
    } catch (error) {
      console.error('Error adding sensor data:', error);
      alert('An error occurred while adding the sensor data. Check the console for details.');
    }
  };

  // Function to handle logout
  const logout = () => {
    alert('Logging out...');
    navigate('/');
  };

  useEffect(() => {
    const initialize = async () => {
      await initializeWeb3AndContract();

      // Extract cropId from URL params
      const params = new URLSearchParams(location.search);
      setCropId(params.get('cropId'));
    };
    initialize();
  }, [location.search]);

  return (
    <div>
      <header>
        <div className="logo">
          <img src="../logo.png" alt="Logo" />
        </div>
        <div className="brand-name">Greenhouse Management System</div>
        <div className="account-info">
          MetaMask Address: {account ? account : 'Not Connected'}
        </div>
        <button id="logoutButton" onClick={logout}>
          Log Out
        </button>
      </header>
      <nav>
        <button onClick={() => navigate('/ghopDashboard')}>Home</button> |
        <a href="#">View Plants</a> |
        <a href="#">About Us</a>
      </nav>
      <main>
        <h1>
          Add Sensor Data for Crop ID: <span>{cropId}</span>
        </h1>
        <div className="form-container">
          <form id="addSensorDataForm" onSubmit={handleAddSensorData}>
            <label htmlFor="system">System:</label>
            <input type="text" id="system" name="system" required />

            <label htmlFor="temperature">Temperature (°C):</label>
            <input type="number" id="temperature" name="temperature" required />

            <label htmlFor="humidity">Humidity (%):</label>
            <input type="number" id="humidity" name="humidity" required />

            <label htmlFor="water">Water Level:</label>
            <input type="number" id="water" name="water" required />

            <label htmlFor="nutrition">Nutrition Level:</label>
            <input type="number" id="nutrition" name="nutrition" required />

            <button type="submit" className="button">
              Add Sensor Data
            </button>
          </form>
        </div>
      </main>
      <footer>
        <p>© 2024 Greenhouse Management System</p>
      </footer>
    </div>
  );
}

export default GhopAddSensorData;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import '../../css/ghopsmartcontracts.css'; // Adjust the path if necessary

function GhopAddCrops() {
  const [web3, setWeb3] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const navigate = useNavigate();

  // Function to check MetaMask connection
  const checkMetaMaskConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const web3Instance = new Web3(window.ethereum);
      const accounts = await web3Instance.eth.getAccounts();
      if (accounts.length > 0) {
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        console.log("MetaMask is already connected with account:", accounts[0]);
        loadContractData(web3Instance);
      } else {
        console.log("MetaMask not connected. Prompting user to connect.");
        connectMetaMask();
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask to interact with this website.');
    }
  };

  // Function to connect MetaMask
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3(window.ethereum);
        const accounts = await web3Instance.eth.getAccounts();
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        console.log("MetaMask connected with account:", accounts[0]);
        loadContractData(web3Instance);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask to interact with this website.');
    }
  };

  // Function to load contract data
  const loadContractData = async (web3Instance) => {
    try {
      const response = await fetch('/contractData/GreenHouseContract.json');
      if (!response.ok) {
        throw new Error("Failed to fetch contract JSON");
      }
      const contractData = await response.json();
      const contractABI = contractData.abi;
      const networkId = await web3Instance.eth.net.getId();
      const contractAddress = contractData.networks[networkId]?.address;

      if (contractAddress) {
        const contract = new web3Instance.eth.Contract(contractABI, contractAddress);
        setContractInstance(contract);
        console.log("Contract instance created:", contract);
      } else {
        console.error("Contract address not found for the current network");
        alert(`Contract address not found for network ID: ${networkId}. Please ensure the contract is deployed on the correct network.`);
      }
    } catch (error) {
      console.error("Error loading contract data:", error);
    }
  };

  // Function to handle crop addition
  const handleAddCrop = async (event) => {
    event.preventDefault();

    const cropName = event.target.cropName.value;
    const cropType = event.target.cropType.value;
    const location = event.target.location.value;
    const sowingDate = event.target.sowingDate.value;
    const transplantDate = event.target.transplantDate.value;
    const harvestDate = event.target.harvestDate.value;
    const remarks = event.target.remarks.value;
    const weight = event.target.weight.value;
    const price = event.target.price.value;

    try {
      if (web3 && contractInstance && account) {
        const result = await contractInstance.methods.addCrop(
          cropName,
          location,
          cropType,
          remarks,
          sowingDate,
          transplantDate,
          harvestDate,
          weight,
          web3.utils.toWei(price, 'ether')
        ).send({ from: account });

        console.log('Crop added:', result);
        alert('Crop successfully added!');
      } else {
        alert("MetaMask not connected or contract not loaded.");
      }
    } catch (error) {
      console.error("Error adding crop:", error);
      alert('An error occurred while adding the crop. Please check the console for details.');
    }
  };

  // Function to handle logout
  const logout = () => {
    alert("Logging out...");
    navigate("/"); // Use React Router's navigate function for better navigation
  };

  // useEffect to check MetaMask connection on component mount
  useEffect(() => {
    checkMetaMaskConnection();
  }, []);

  return (
    <div>
      <header>
        <div className="logo">
          <img src="../logo.png" alt="Logo" />
        </div>
        <div className="brand-name">Greenhouse Management System</div>
        <div className="account-info">
          MetaMask Address: {account ? account : "Not Connected"}
        </div>
        <button id="logoutButton" onClick={logout}>Log Out</button>
      </header>
      <nav>
        <button onClick={() => navigate("/ghopDashboard")}>Home</button> |
        <a href="#">View Plants</a> |
        <a href="#">About Us</a>
      </nav>
      <main>
        <h1>Add Crop to Blockchain</h1>
        <div className="form-container">
          <form id="addCropForm" onSubmit={handleAddCrop}>
            <label htmlFor="cropName">Crop Name:</label>
            <input type="text" id="cropName" name="cropName" required />

            <label htmlFor="cropType">Crop Type:</label>
            <input type="text" id="cropType" name="cropType" required />

            <label htmlFor="location">Location:</label>
            <input type="text" id="location" name="location" required />

            <label htmlFor="sowingDate">Date of Sowing:</label>
            <input type="date" id="sowingDate" name="sowingDate" required />

            <label htmlFor="transplantDate">Date of Transplant:</label>
            <input type="date" id="transplantDate" name="transplantDate" />

            <label htmlFor="harvestDate">Date of Harvest:</label>
            <input type="date" id="harvestDate" name="harvestDate" required />

            <label htmlFor="remarks">Remarks:</label>
            <input type="text" id="remarks" name="remarks" />

            <label htmlFor="weight">Weight (kg):</label>
            <input type="number" id="weight" name="weight" required />

            <label htmlFor="price">Price (ETH):</label>
            <input type="text" id="price" name="price" required />

            <button type="submit" className="button">Add Crop</button>
          </form>
        </div>
      </main>
      <footer>
        <p>© 2024 Greenhouse Management System</p>
      </footer>
    </div>
  );
}

export default GhopAddCrops;
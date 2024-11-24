import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook
import Web3 from 'web3';
import '../../css/ghopDashboard.css'; // Corrected import path to point to the css folder

function GhopDashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [crops, setCrops] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  // Function to check if MetaMask is already connected and get the account
  const checkMetaMaskConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        setIsConnected(true);
        setAccount(accounts[0]);
        initializeContract(web3);
      }
    }
  };

  // Function to connect MetaMask and load the contract
  const connectMetamaskAndLoadContract = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request MetaMask access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(window.ethereum);
        setIsConnected(true);
        console.log("MetaMask is connected.");

        // Get user's MetaMask account
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        console.log("Account connected:", accounts[0]);

        // Initialize contract
        initializeContract(web3);
      } catch (error) {
        console.error("Error connecting to MetaMask or loading contract:", error);
        alert('MetaMask connection is required to use this website.');
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask to interact with this page.');
    }
  };

  // Function to initialize the contract instance
  const initializeContract = async (web3) => {
    try {
      // Fetch contract data
      const response = await fetch('/contractData/GreenHouseContract.json');
      if (!response.ok) {
        throw new Error("Failed to fetch contract JSON");
      }
      const contractData = await response.json();
      const contractABI = contractData.abi;
      const networkId = await web3.eth.net.getId();
      const contractAddress = contractData.networks[networkId]?.address;

      if (contractAddress) {
        const instance = new web3.eth.Contract(contractABI, contractAddress);
        setContractInstance(instance);
        console.log("Contract instance created:", instance);
        // Load existing crops
        loadCrops(instance);
      } else {
        console.error("Contract address not found for the current network");
      }
    } catch (error) {
      console.error("Error initializing contract:", error);
    }
  };

  // Function to load existing crops
  const loadCrops = async (contractInstance) => {
    try {
      console.log("Loading existing crops...");
      const cropIds = await contractInstance.methods.getAllCropIds().call();
      console.log("Crop IDs retrieved:", cropIds);

      const loadedCrops = [];
      for (let i = 0; i < cropIds.length; i++) {
        try {
          const crop = await contractInstance.methods.getCropDetails(cropIds[i]).call();
          console.log(`Crop ${i} details:`, crop);

          // Extract and parse values
          const id = cropIds[i].toString(); // Ensure ID is properly converted to string
          console.log(`Crop ID: ${id}`);
          
          const name = crop[1];
          const cropType = crop[3];
          const location = crop[2];
          const weight = parseFloat(crop[8]); // Ensure weight is a number
          const priceWei = crop[9];
          const status = crop[11];

          const priceEth = Web3.utils.fromWei(priceWei.toString(), 'ether');

          let statusValue = Number(status);
          let statusText = 'Unknown Status';
          if (!isNaN(statusValue)) {
            switch (statusValue) {
              case 0:
                statusText = 'Available';
                break;
              case 1:
                statusText = 'In Manufacturer';
                break;
              case 2:
                statusText = 'In Supplier';
                break;
              case 3:
                statusText = 'In Seller';
                break;
              case 4:
                statusText = 'Ready for Sale';
                break;
              case 5:
                statusText = 'Sold';
                break;
              default:
                statusText = 'Unknown Status';
            }
          }

          // Add the parsed crop to the list
          loadedCrops.push({ id, name, cropType, location, weight, priceEth, status: statusText, statusValue });
        } catch (innerError) {
          console.error(`Error fetching crop details for ID ${cropIds[i]}:`, innerError);
        }
      }

      setCrops(loadedCrops);
    } catch (error) {
      console.error("Error loading crops:", error);
    }
  };

  // Function to handle sending crop to manufacturer
  const handleSendToManufacturer = async (cropId) => {
    try {
      if (contractInstance && account) {
        await contractInstance.methods.sendToManufacturer(cropId).send({ from: account });
        console.log(`Crop ID ${cropId} sent to Manufacturer`);
        alert('Crop successfully sent to Manufacturer!');
        // Update status in the state after successful transaction
        setCrops(prevCrops =>
          prevCrops.map(crop =>
            crop.id === cropId
              ? { ...crop, status: 'In Manufacturer', statusValue: 1 }
              : crop
          )
        );
      } else {
        alert("MetaMask not connected or contract not loaded.");
      }
    } catch (error) {
      console.error("Error sending crop to Manufacturer:", error);
    }
  };

  // useEffect to check MetaMask connection when the component mounts
  useEffect(() => {
    checkMetaMaskConnection();
  }, []);

  return (
    <div>
      <header>
        <div className="logo">
          <img src="logo.png" alt="Logo" />
        </div>
        <div className="brand-name">Greenhouse Management System</div>
        <div className="account-info" id="accountAddress">
          MetaMask Address: {isConnected && account ? account : "Not Connected"}
        </div>
        <button id="logoutButton" onClick={() => navigate("/")}>Log Out</button>
      </header>
      <nav>
        <button onClick={() => navigate("/ghopDashboard")}>Home</button> |
        <a href="#">View Plants</a> |
        <a href="#">About Us</a>
      </nav>
      <main>
        <h1>Ghop Dashboard</h1>
        <div className="card-container">
          <div className="card" onClick={() => navigate('/ghopAddCrops')}>
            <div className="card-title">Blockchain & Smart Contracts Page</div>
          </div>
          <div className="card" onClick={() => navigate('/supplyChain')}>
            <div className="card-title">Supply Chain Tracking Page</div>
          </div>
          <div className="card" onClick={() => navigate('/reportsAnalytics')}>
            <div className="card-title">Reports & Analytics Page</div>
          </div>
        </div>

        <div className="table-container">
          <h2>Existing Crops</h2>
          <table>
            <thead>
              <tr>
                <th>Contract ID</th>
                <th>Crop Name</th>
                <th>Crop Type</th>
                <th>Location</th>
                <th>Weight (kg)</th>
                <th>Price (ETH)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {crops.map((crop, index) => (
                <tr key={index}>
                  <td>{crop.id}</td>
                  <td>{crop.name}</td>
                  <td>{crop.cropType}</td>
                  <td>{crop.location}</td>
                  <td>{crop.weight}</td>
                  <td>{crop.priceEth}</td>
                  <td>{crop.status}</td>
                  <td>
                    <button onClick={() => navigate(`/ghopPlantData?cropId=${crop.id}`)}>
                      View Details
                    </button>
                    {crop.statusValue === 0 && (
                      <button onClick={() => handleSendToManufacturer(crop.id)}>Send to Manufacturer</button>
                    )}
                    <button onClick={() => navigate(`/ghopAddSensorData?cropId=${crop.id}`)}>
                      Add Sensor Data
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <footer>
        <p>© 2024 Greenhouse Management System</p>
      </footer>
    </div>
  );
}

export default GhopDashboard;

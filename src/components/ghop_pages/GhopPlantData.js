import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import '../../css/ghopPlantsData.css'; // Adjust the path to point to your CSS

function GhopPlantData() {
  const [web3, setWeb3] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const [cropDetails, setCropDetails] = useState({});
  const [sensorData, setSensorData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    initializeWeb3AndContract();
  }, []);

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
        }

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

          // Get crop ID from URL query params
          const params = new URLSearchParams(window.location.search);
          const cropId = params.get('cropId');
          if (cropId) {
            // Pass the cropId to both functions and set cropDetails
            setCropDetails(prevDetails => ({ ...prevDetails, id: cropId }));
            await loadCropDetails(contract, cropId, web3Instance);
            await loadSensorData(contract, cropId);
          }
        } else {
          console.error("Contract address not found for the current network");
        }
      } catch (error) {
        console.error("Error initializing Web3 or accessing MetaMask accounts:", error);
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask to interact with this website.');
    }
  };

  // Function to load crop details
  const loadCropDetails = async (contract, cropId, web3Instance) => {
    try {
      if (!contract || !web3Instance) {
        console.error('Contract instance or Web3 instance is not loaded yet.');
        return;
      }

      console.log('Loading crop details for crop ID:', cropId);
      const crop = await contract.methods.getCropDetails(cropId).call();
      console.log("Crop Details:", crop);

      setCropDetails({
        id: cropId, // Explicitly set cropId here
        name: crop[1] || 'N/A',
        location: crop[2] || 'N/A',
        cropType: crop[3] || 'N/A',
        remarks: crop[4] || 'N/A',
        sowingDate: crop[5] || 'N/A',
        transplantDate: crop[6] || 'N/A',
        harvestDate: crop[7] || 'N/A',
        weight: crop[8] ? parseFloat(crop[8]) : 'N/A',
        price: crop[9] ? web3Instance.utils.fromWei(crop[9], 'ether') : 'N/A',
        owner: crop[10] || 'N/A'
      });
    } catch (error) {
      console.error('Error loading crop details:', error);
    }
  };

  // Function to load sensor data
  const loadSensorData = async (contract, cropId) => {
    try {
      if (!contract) {
        console.error('Contract instance is not loaded yet.');
        return;
      }

      console.log('Loading sensor data for crop ID:', cropId);
      const data = await contract.methods.getSensorData(cropId).call();
      console.log("Sensor Data:", data);

      setSensorData({
        system: data[0] || 'N/A',
        temperature: data[1] ? parseFloat(data[1]) : 'N/A',
        humidity: data[2] ? parseFloat(data[2]) : 'N/A',
        waterLevel: data[3] ? parseFloat(data[3]) : 'N/A',
        nutritionLevel: data[4] ? parseFloat(data[4]) : 'N/A'
      });
    } catch (error) {
      console.error('Error loading sensor data:', error);
    }
  };

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
        <button id="logoutButton" onClick={() => navigate("/")}>Log Out</button>
      </header>
      <nav>
        <button onClick={() => navigate("/ghopDashboard")}>Home</button> |
        <a href="#">View Plants</a> |
        <a href="#">About Us</a>
      </nav>
      <main>
        <h1>Plant Details for Crop ID: {cropDetails.id}</h1>
        <div className="details-container">
          <h2>Crop Information</h2>
          <table id="cropDetailsTable">
            <tbody>
              <tr><th>ID</th><td>{cropDetails.id}</td></tr>
              <tr><th>Name</th><td>{cropDetails.name}</td></tr>
              <tr><th>Location</th><td>{cropDetails.location}</td></tr>
              <tr><th>Crop Type</th><td>{cropDetails.cropType}</td></tr>
              <tr><th>Remarks</th><td>{cropDetails.remarks}</td></tr>
              <tr><th>Date of Sowing</th><td>{cropDetails.sowingDate}</td></tr>
              <tr><th>Date of Transplant</th><td>{cropDetails.transplantDate}</td></tr>
              <tr><th>Date of Harvest</th><td>{cropDetails.harvestDate}</td></tr>
              <tr><th>Weight (kg)</th><td>{cropDetails.weight}</td></tr>
              <tr><th>Price (ETH)</th><td>{cropDetails.price}</td></tr>
              <tr><th>Owner</th><td>{cropDetails.owner}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="sensor-data-container">
          <h2>Sensor Data</h2>
          {sensorData ? (
            <table id="sensorDataTable">
              <thead>
                <tr>
                  <th>System</th>
                  <th>Temperature (°C)</th>
                  <th>Humidity (%)</th>
                  <th>Water Level</th>
                  <th>Nutrition Level</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{sensorData.system}</td>
                  <td>{sensorData.temperature}</td>
                  <td>{sensorData.humidity}</td>
                  <td>{sensorData.waterLevel}</td>
                  <td>{sensorData.nutritionLevel}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p>Loading sensor data...</p>
          )}
        </div>
      </main>
      <footer>
        <p>© 2024 Greenhouse Management System</p>
      </footer>
    </div>
  );
}

export default GhopPlantData;

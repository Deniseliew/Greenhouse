import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import '../../css/exporterdashboard.css'; // Adjust the path if necessary

function ExporterDashboard() {
  const [account, setAccount] = useState("Not Connected");
  const [contractInstance, setContractInstance] = useState(null);
  const [crops, setCrops] = useState([]);

  // Function to connect MetaMask and initialize Web3
  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });

        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const web3 = new Web3(window.ethereum);

          // Load the contract ABI and address dynamically
          const response = await fetch('../contractData/GreenHouseContract.json');
          if (!response.ok) throw new Error("Failed to fetch contract JSON");

          const contractData = await response.json();
          const contractABI = contractData.abi;
          const networkId = await web3.eth.net.getId(); // Dynamically get network ID
          const contractAddress = contractData.networks[networkId]?.address;

          if (contractAddress) {
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            setContractInstance(contract);
            console.log("Contract instance created:", contract);

            // Load crops from the contract
            await loadCrops(contract);
          } else {
            console.error("Contract address not found for the current network");
            alert(`Contract address not found for network ID: ${networkId}. Please ensure the contract is deployed on the correct network.`);
          }
        }
      } catch (error) {
        console.error("Error accessing MetaMask accounts:", error);
        alert("MetaMask connection failed. Please try again.");
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask to interact with this website.');
    }
  };

  // Function to load existing crops from the contract
  const loadCrops = async (contract) => {
    try {
      if (!contract) {
        console.error("Contract instance is not initialized yet.");
        return;
      }

      const cropIds = await contract.methods.getAllCropIds().call();
      console.log("Crop IDs retrieved:", cropIds);

      const loadedCrops = [];

      for (let i = 0; i < cropIds.length; i++) {
        try {
          const crop = await contract.methods.getCropDetails(cropIds[i]).call();
          console.log(`Crop ${i} details:`, crop);

          // Extract values
          const id = crop[0];
          const name = crop[1];
          const cropType = crop[3];
          const location = crop[2];
          const weight = crop[8];
          const priceWei = crop[9];
          const status = crop[11];

          // Convert price from Wei to Ether
          const priceEth = Web3.utils.fromWei(priceWei.toString(), 'ether');

          // Determine status text
          let statusText = 'Unknown Status';
          switch (Number(status)) {
            case 0: statusText = 'Available'; break;
            case 1: statusText = 'In Manufacturer'; break;
            case 2: statusText = 'In Supplier'; break;
            case 3: statusText = 'In Seller'; break;
            case 4: statusText = 'Ready for Sale'; break;
            case 5: statusText = 'Sold'; break;
            default: break;
          }

          console.log(`Status Text for Crop ID ${id}: ${statusText}`);

          // Only display crops that are "In Manufacturer"
          if (Number(status) === 1) {
            loadedCrops.push({ id, name, cropType, location, weight, priceEth, statusText });
          }
        } catch (innerError) {
          console.error(`Error fetching crop details for ID ${cropIds[i]}:`, innerError);
        }
      }

      setCrops(loadedCrops);
    } catch (error) {
      console.error("Error loading crops:", error);
    }
  };

  // Function to send crop to supplier
  const sendToSupplier = async (cropId) => {
    if (!contractInstance) {
      alert("Contract instance not initialized. Please connect MetaMask.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        alert("No MetaMask account found. Please log in to MetaMask.");
        return;
      }

      const result = await contractInstance.methods.updateCropStatus(cropId, 3).send({ from: accounts[0] });
      console.log('Crop sent to supplier:', result);
      alert(`Crop ID ${cropId} has been sent to the supplier!`);

      // Refresh crops data
      await loadCrops(contractInstance);
    } catch (error) {
      console.error(`Error sending crop ID ${cropId} to supplier:`, error);
      alert('An error occurred while sending the crop to the supplier. Check the console for details.');
    }
  };

  // Logout function
  const logout = () => {
    alert("Logging out...");
    window.location.href = "../index.html";
  };

  // Automatically connect MetaMask when component mounts
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
        <div className="account-info">MetaMask Address: {account}</div>
        <button id="logoutButton" onClick={logout}>Log Out</button>
      </header>
      <nav>
        <a href="/exporterDashboard">Home</a> | <a href="#">View Crops</a> | <a href="#">About Us</a>
      </nav>
      <main>
        <h1>Exporter Dashboard</h1>
        <div className="table-container">
          <h2>Crops In Manufacturer</h2>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {crops.length === 0 ? (
                <tr>
                  <td colSpan="8">No crops available in manufacturer.</td>
                </tr>
              ) : (
                crops.map((crop, index) => (
                  <tr key={index}>
                    <td>{crop.id}</td>
                    <td>{crop.name}</td>
                    <td>{crop.cropType}</td>
                    <td>{crop.location}</td>
                    <td>{crop.weight}</td>
                    <td>{crop.priceEth}</td>
                    <td>{crop.statusText}</td>
                    <td>
                      <button onClick={() => sendToSupplier(crop.id)}>Send to Supplier</button>
                    </td>
                  </tr>
                ))
              )}
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

export default ExporterDashboard;

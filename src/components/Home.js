import React from 'react';

function Home() {
  const connectMetamask = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("MetaMask is connected");
        document.getElementById('connectMetamask').innerText = "Connected";
      } catch (error) {
        console.error("User denied account access or error occurred:", error);
        alert('MetaMask connection is required to use this website.');
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask to interact with this website.');
    }
  };

  return (
    <div>
      <header>
        <div className="logo">
          <img src="logo.png" alt="Logo" />
        </div>
        <div className="brand-name">Greenhouse Management System</div>
        <button id="connectMetamask" onClick={connectMetamask}>Connect MetaMask</button>
      </header>
      <nav>
        <a href="/">Home</a> | 
        <a href="#">View Plants</a> | 
        <a href="#">About Us</a> | 
        <a href="/login">Login</a>
      </nav>
      <main>
        <h1>Welcome to the Greenhouse Management System!</h1>
        <p>Manage and monitor your plants efficiently using blockchain technology.</p>
      </main>
      <footer>
        <p>© 2024 Greenhouse Management System</p>
      </footer>
    </div>
  );
}

export default Home;

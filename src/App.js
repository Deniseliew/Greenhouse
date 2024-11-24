import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GhopDashboard from './components/ghop_pages/GhopDashboard';
import GhopAddCrops from './components/ghop_pages/GhopAddCrops';
import GhopAddSensorData from './components/ghop_pages/GhopAddSensorData';
import GhopPlantData from './components/ghop_pages/GhopPlantData';
import Home from './components/Home'; // Make sure this path is correct
import Login from './components/Login'; // Make sure this path is correct
import ExporterDashboard from './components/exporter_pages/ExporterDashboard'; // Import ExporterDashboard

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} /> {/* Default route goes to Home */}
          <Route path="/login" element={<Login />} /> {/* Route for Login */}
          <Route path="/ghopDashboard" element={<GhopDashboard />} />
          <Route path="/ghopAddCrops" element={<GhopAddCrops />} />
          <Route path="/ghopAddSensorData" element={<GhopAddSensorData />} />
          <Route path="/ghopPlantData" element={<GhopPlantData />} />
          <Route path="/exporterDashboard" element={<ExporterDashboard />} /> {/* Route for ExporterDashboard */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

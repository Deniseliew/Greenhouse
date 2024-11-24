import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './css/style.css'; // Corrected path for your style.css

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root') // Mounts the App component to the root div in index.html
);

import React from 'react';
import ReactDOM from 'react-dom/client'; // Use ReactDOM
import { AuthProvider } from './contexts/AuthContext.jsx';
import App from './App.jsx';
// If you have a global CSS file, import it here
// import './index.css';

// Find the root element in your HTML
const rootElement = document.getElementById('root');

// Create the root and render the application
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
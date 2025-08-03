// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';
import AppContent from './App'; // Import AppContent, not App wrapper
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> 
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
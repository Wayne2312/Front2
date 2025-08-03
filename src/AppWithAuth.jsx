// src/AppWithAuth.jsx (if you prefer a separate component file)
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import CheckoutPage from './CheckoutPage';

const AppWithAuth = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route path="/*" element={<App />} />
      <Route 
        path="/checkout/:orderId" 
        element={
          <React.Suspense fallback={<div>Loading payment...</div>}>
            <CheckoutPage />
          </React.Suspense>
        } 
      />
    </Routes>
  </Suspense>
);

export default AppWithAuth;
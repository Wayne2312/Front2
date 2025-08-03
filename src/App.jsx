import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import Header from './Header';
import LoginForm from './LoginForm';
import CustomerDashboard from './CustomerDashboard';
import AdminDashboard from './AdminDashboard';
import Home from './Home';
import CheckoutPage from './CheckoutPage';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/dashboard/*" element={<DashboardRouter />} />
          <Route path="/checkout/:orderId" element={<CheckoutPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};
const DashboardRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  } else if (user) { 
    return <CustomerDashboard />;
  }
  return <Navigate to="/" replace />;
};

export default AppContent; // Export the main component
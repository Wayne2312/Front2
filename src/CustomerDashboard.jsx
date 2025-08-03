// src/CustomerDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import usePaymentStatus from './usePaymentStatus';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [todaysMenu, setTodaysMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('menu');
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [currentPaymentOrderId, setCurrentPaymentOrderId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paymentError, setPaymentError] = useState(null);
  const navigate = useNavigate();

  const fetchTodaysMenu = async () => {
    try {
      const response = await axios.get(`${API}/daily-menu/`);
      setTodaysMenu(response.data.meals || []);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders/`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchTodaysMenu();
    fetchOrders();
  }, []);

  const { status: polledStatus, error: polledError } = usePaymentStatus(currentPaymentOrderId, paymentStatus);

  useEffect(() => {
    if (polledStatus && polledStatus !== paymentStatus) {
      setPaymentStatus(polledStatus);
    }
    if (polledError && polledError !== paymentError) {
      setPaymentError(polledError);
    }
    if (polledStatus === 'completed' || polledStatus === 'failed') {
      setPaymentProcessing(false);
      fetchOrders();
    }
  }, [polledStatus, polledError, paymentStatus, paymentError]);

  const placeOrder = async (mealId) => {
    setLoading(true);
    try {
      await axios.post(`${API}/orders/`, { meal_id: mealId, quantity: 1 });
      await fetchOrders();
      alert('Order placed successfully!');
    } catch (error) {
      alert('Error placing order: ' + (error.response?.data?.error || error.response?.data?.detail || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    }
    if (cleaned.startsWith('7') && cleaned.length === 9) {
      return '254' + cleaned;
    }
    return cleaned;
  };

  const initiateMpesaPayment = async (orderId) => {
    const phone = prompt('Enter your M-Pesa phone number (e.g., 0712345678):');
    if (!phone) return;
    const formattedPhone = formatPhoneNumber(phone);
    if (!formattedPhone.startsWith('254') || formattedPhone.length !== 12) {
      alert('Please enter a valid Kenyan phone number (e.g., 0712345678)');
      return;
    }
    setPaymentProcessing(true);
    setCurrentPaymentOrderId(orderId);
    setPaymentStatus('pending');
    setPaymentError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/mpesa-payment/`,
        {
          order_id: orderId,
          phone: formattedPhone
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        console.log(`Payment request sent to ${formattedPhone}. Please complete the transaction on your phone.`);
      } else {
        setPaymentStatus('failed');
        setPaymentError(response.data.error || 'Payment initiation failed');
        setPaymentProcessing(false);
        alert(response.data.error || 'Payment initiation failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || 'Unknown error';
      setPaymentStatus('failed');
      setPaymentError(errorMessage);
      setPaymentProcessing(false);
      alert('Payment failed: ' + errorMessage);
    }
  };

  const pollPaymentStatus = async (orderId) => {
    let attempts = 0;
    const maxAttempts = 12;
    const checkStatus = async () => {
      attempts++;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API}/orders/${orderId}/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data.payment_status === 'completed') {
          await fetchOrders();
          alert('Payment completed successfully!');
          return true;
        } else if (response.data.payment_status === 'failed') {
          alert('Payment failed: ' + (response.data.payment_error || 'Unknown error'));
          return true;
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        if (attempts >= maxAttempts) {
          alert('Payment status check timed out. Please verify your payment and refresh the page.');
        }
      }
      if (attempts < maxAttempts) {
        setTimeout(checkStatus, 5000);
      }
      return false;
    };
    await checkStatus();
  };

  const cancelOrder = async (orderId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API}/orders/cancel/`, {
        order_id: orderId
      });
      if (response.data.message) {
        alert(response.data.message);
        await fetchOrders();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || 'Unknown error';
      alert('Cancellation failed: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h2>
        <p className="text-gray-600">What would you like to eat today?</p>
      </div>
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'menu'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Today's Menu
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Orders ({orders.length})
          </button>
        </nav>
      </div>
      {activeTab === 'menu' && (
        <div>
          {todaysMenu.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-gray-400 text-2xl">🍽️</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No menu available today</h3>
              <p className="text-gray-500">Check back later or contact your caterer.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todaysMenu.map((meal) => (
                <div key={meal.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {meal.image_url ? (
                      <img
                        src={meal.image_url}
                        alt={meal.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl">🍽️</span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{meal.name}</h3>
                    <p className="text-gray-600 mb-4">{meal.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-600">KSh {meal.price}</span>
                      <button
                        onClick={() => placeOrder(meal.id)}
                        disabled={loading}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                      >
                        {loading ? 'Ordering...' : 'Order Now'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-gray-400 text-2xl">📦</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500">Place your first order from today's menu!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.meal_name || 'Order Item'}</h3>
                      <p>Total: KSh {order.total_amount}</p>
                      <p className="text-sm text-gray-500">
                        Ordered on: {order.order_date ? new Date(order.order_date).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600 mb-2">KSh {order.total}</div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : order.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'preparing' || order.status === 'ready'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                        </span>
                        {(order.status === 'pending' || order.status === 'confirmed') ? (
                          <>
                            {order.payment_status === 'pending' && (
                              <button
                                onClick={() => initiateMpesaPayment(order.id)}
                                disabled={paymentProcessing}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50"
                              >
                                {paymentProcessing ? 'Processing...' : 'Pay with M-Pesa'}
                              </button>
                            )}
                            {order.payment_status !== 'completed' && (
                              <button
                                onClick={() => cancelOrder(order.id)}
                                disabled={loading}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50"
                              >
                                Cancel Order
                              </button>
                            )}
                          </>
                        ) : order.status === 'cancelled' ? (
                          <span className="text-sm text-gray-500 italic">Order Cancelled</span>
                        ) : order.status === 'completed' ? (
                          <span className="text-sm text-gray-500 italic">Order Completed</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
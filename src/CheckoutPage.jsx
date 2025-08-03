import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MpesaPaymentForm from './MpesaPaymentForm';
import PaymentStatus from './PaymentStatus';
import usePaymentStatus from './usePaymentStatus';

const CheckoutPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  
  const { status: paymentStatus } = usePaymentStatus(
    orderId, 
    order?.payment_status || 'pending'
  );

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${orderId}/`);
        setOrder(response.data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
       fetchOrder();
    } else {
       setError('Invalid order ID.');
       setLoading(false);
    }
  }, [orderId]);
  useEffect(() => {
    if (paymentStatus === 'completed') {
      const timer = setTimeout(() => {
        navigate('/customer-dashboard', { 
          state: { message: 'Payment completed successfully!' } 
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, navigate]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading order details...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!order) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-gray-400 text-2xl">❓</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Order Not Found</h3>
        <p className="text-gray-500">We couldn't find the order details.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Complete Your Payment</h2>
        <p className="mt-2 text-gray-600">Securely pay for your order using M-Pesa.</p>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-3xl mx-auto">
        <div className="p-6 sm:p-8">
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h3>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-medium text-gray-900">Order #{order.id}</h4>
                <p className="text-gray-600">Meal: {order.meal_name}</p>
                <p className="text-gray-600">Quantity: {order.quantity}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">KSh {parseFloat(order.total).toFixed(2)}</div>
                <div className="mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {paymentStatus === 'completed' ? 'Payment Successful!' : 'M-Pesa Payment'}
            </h3>
            
            {paymentStatus !== 'completed' ? (
              <>
                {!paymentInitiated ? (
                  <MpesaPaymentForm
                    orderId={orderId}
                    amount={parseFloat(order.total)}
                    onPaymentSuccess={() => setPaymentInitiated(true)}
                  />
                ) : (
                  <PaymentStatus status={paymentStatus} />
                )}
              </>
            ) : (
              <PaymentStatus status={paymentStatus} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
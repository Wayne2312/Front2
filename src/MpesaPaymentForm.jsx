import React, { useState } from 'react';
import axios from 'axios';

const MpesaPaymentForm = ({ orderId, amount, onPaymentSuccess }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formattedPhone = formatPhoneNumber(phone);
    if (formattedPhone.length !== 12 || !formattedPhone.startsWith('2547')) {
       setError('Please enter a valid Kenyan M-Pesa phone number (e.g., 0712345678).');
       setLoading(false);
       return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/mpesa-payment/`,
        {
          order_id: orderId,
          phone: formattedPhone,
          amount: amount
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.data.success) {
        setPaymentInitiated(true);
      } else {
        setError(response.data.error || 'Payment initiation failed. Please try again.');
      }
    } catch (err) {
      console.error("M-Pesa Payment Error:", err);
      setError(err.response?.data?.error || 'Failed to initiate payment. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">M-Pesa Payment</h3>
      <div className="mb-6 p-4 bg-orange-50 rounded-md border border-orange-100">
        <p className="text-lg font-medium text-orange-800">Amount: <span className="font-bold">KSh {parseFloat(amount).toFixed(2)}</span></p>
        <p className="text-sm text-orange-600 mt-1">Please ensure your phone number is registered with M-Pesa.</p>
      </div>

      {paymentInitiated ? (
        <div className="text-center py-6">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-orange-500 text-2xl">📱</span>
            </div>
            <h4 className="text-lg font-medium text-gray-900">Payment Initiated</h4>
          </div>
          <div className="space-y-2 text-gray-600">
            <p className="flex items-center justify-center">
              <svg className="h-5 w-5 text-orange-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Check your phone for an M-Pesa prompt.
            </p>
            <p className="flex items-center justify-center">
              <svg className="h-5 w-5 text-orange-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Enter your M-Pesa PIN to complete payment.
            </p>
          </div>
          <div className="mt-4 text-sm text-gray-500 italic">
            This page will update automatically once payment is confirmed.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="mpesa-phone" className="block text-sm font-medium text-gray-700 mb-1">
              M-Pesa Phone Number
            </label>
            <input
              id="mpesa-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0712345678 or 254712345678"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="mt-1 text-xs text-gray-500">Must be registered with M-Pesa.</p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading
                ? 'bg-orange-400 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Pay with M-Pesa'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default MpesaPaymentForm;
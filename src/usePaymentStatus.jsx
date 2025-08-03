import { useEffect, useState } from 'react';
import axios from 'axios';

const usePaymentStatus = (orderId, initialStatus) => {
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId || status === 'completed') return;

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/orders/${orderId}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        const newStatus = response.data.payment_status;
        setStatus(newStatus);

        if (newStatus === 'completed' || newStatus === 'failed') {
          clearInterval(interval);
        }
      } catch (err) {
        setError('Error checking payment status');
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, status]);

  return { status, error };
};

export default usePaymentStatus;
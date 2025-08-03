import React from 'react';

const PaymentStatus = ({ status, error }) => {
  const statusMessages = {
    pending: 'Waiting for payment confirmation...',
    completed: 'Payment completed successfully!',
    failed: error || 'Payment failed. Please try again.'
  };

  const statusClasses = {
    pending: 'payment-status-pending',
    completed: 'payment-status-completed',
    failed: 'payment-status-failed'
  };

  return (
    <div className={`payment-status ${statusClasses[status]}`}>
      <div className="status-icon">
        {status === 'completed' ? '✓' : status === 'failed' ? '✗' : '⏳'}
      </div>
      <p>{statusMessages[status]}</p>
    </div>
  );
};

export default PaymentStatus;
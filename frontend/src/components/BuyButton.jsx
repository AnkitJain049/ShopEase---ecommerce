import React, { useState } from 'react';
import PaymentModal from './PaymentModal';

function BuyButton({ product, className = "", children = "Buy Now" }) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handlePaymentSuccess = (transaction) => {
    // You can add custom success handling here
    console.log('Payment successful:', transaction);
  };

  return (
    <>
      <button
        onClick={() => setIsPaymentModalOpen(true)}
        className={className}
      >
        {children}
      </button>

      <PaymentModal
        product={product}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}

export default BuyButton; 
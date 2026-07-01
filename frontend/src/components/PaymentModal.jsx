import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from './Notification';

function PaymentModal({ product, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [razorpayKey, setRazorpayKey] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch Razorpay key when modal opens
    if (isOpen) {
      fetchRazorpayKey();
    }
  }, [isOpen]);

  const fetchRazorpayKey = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payment/razorpay-key`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setRazorpayKey(data.keyId);
      }
    } catch (error) {
      console.error('Error fetching Razorpay key:', error);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const handlePayment = async () => {
    if (!product) return;

    setLoading(true);
    try {
      // Step 1: Create order
      const orderResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: product._id,
          amount: product.price,
          currency: 'INR'
        }),
      });

      const orderData = await orderResponse.json();
      
      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Step 2: Initialize Razorpay
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShopEase',
        description: `Payment for ${product.name}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Step 3: Verify payment
            const verifyResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                productId: product._id,
                totalAmount: product.price
              }),
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyResponse.ok) {
              // Close modal and redirect to success page
              onClose();
              navigate(`/payment-success?productId=${product._id}&transactionId=${verifyData.transaction._id}`);
              if (onSuccess) {
                onSuccess(verifyData.transaction);
              }
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            showNotification(error.message || 'Payment verification failed', 'error');
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      showNotification(error.message || 'Payment failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Notification Component */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Complete Purchase
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {product && (
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={
                  product.image.startsWith("http")
                    ? product.image
                    : `${import.meta.env.VITE_API_BASE_URL}/uploads/productImages/${product.image}`
                }
                alt={product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">₹{product.price}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">₹{product.price}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading || !razorpayKey}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          You will be redirected to Razorpay for secure payment processing
        </p>
      </div>
    </div>
  );
}

export default PaymentModal; 
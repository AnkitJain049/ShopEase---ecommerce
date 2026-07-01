import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  
  const productId = searchParams.get('productId');
  const transactionId = searchParams.get('transactionId');
  
  const { data: product, loading, error } = useFetch(
    productId ? `${import.meta.env.VITE_API_BASE_URL}/api/products/${productId}` : null
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/products');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600 dark:text-red-400">
          Error loading order details. Redirecting to homepage...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-16 px-4 sm:px-8 lg:px-16 flex justify-center items-start">
      <div className="w-full max-w-2xl mt-5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        
        {/* Success Header */}
        <div className="bg-green-500 dark:bg-green-600 p-6 text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-green-100">Your order has been placed successfully</p>
        </div>

        {/* Product Details */}
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-6">
            <img
              src={
                product.image.startsWith("http")
                  ? product.image
                  : `${import.meta.env.VITE_API_BASE_URL}/uploads/productImages/${product.image}`
              }
              alt={product.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h2>
              <p className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
                ₹{product.price}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Brand: {product.brand || 'N/A'}
              </p>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Order Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                <span className="font-medium text-gray-900 dark:text-white">{transactionId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Order Date:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Payment Status:</span>
                <span className="font-medium text-green-600 dark:text-green-400">Paid</span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Delivery Information
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  Your order will be delivered within <span className="font-bold">2 days</span>
                </p>
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div className="text-center">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                You will be redirected to Home page within
              </p>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {countdown} seconds
              </div>
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Go to Home Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess; 
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-650 mx-auto"></div>
          <p className="mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center text-red-550 font-bold font-display">
          Error loading order details. Redirecting to homepage...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-gray-50 dark:bg-gray-900 py-16 px-4 sm:px-8 lg:px-16 flex justify-center items-start transition-colors duration-300">
      <div className="w-full max-w-2xl mt-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-200/80 dark:border-gray-700/80">
        
        {/* Success Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border border-white/25">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mb-2 font-display">Payment Successful!</h1>
          <p className="text-emerald-100 text-sm font-medium">Your order has been placed successfully</p>
        </div>

        {/* Product Details */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center space-x-6">
            <img
              src={
                product.image.startsWith("http")
                  ? product.image
                  : `${import.meta.env.VITE_API_BASE_URL}/uploads/productImages/${product.image}`
              }
              alt={product.name}
              className="w-20 h-20 object-cover rounded-xl border border-gray-200/40 dark:border-gray-700/40"
            />
            <div className="flex-1 space-y-1">
              <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white leading-tight">
                {product.name}
              </h2>
              <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400 font-display">
                ₹{product.price}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Brand: {product.brand || 'N/A'}
              </p>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-gray-50/50 dark:bg-gray-900/40 rounded-2xl p-5 border border-gray-150 dark:border-gray-750">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 font-display">
              Order Information
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Order ID:</span>
                <span className="font-bold text-gray-800 dark:text-white font-display text-xs">{transactionId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Order Date:</span>
                <span className="font-semibold text-gray-850 dark:text-gray-200">
                  {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Payment Status:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100/50 dark:bg-green-950/20 text-green-700 dark:text-green-450 border border-green-200/20 dark:border-green-900/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Paid
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-blue-50/30 dark:bg-blue-950/10 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/30 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center border border-blue-200/20 dark:border-blue-800 text-lg flex-shrink-0">
              🚚
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-450 dark:text-gray-300 font-display">
                Delivery Estimate
              </h3>
              <p className="text-blue-700 dark:text-blue-400 text-sm">
                Your order is scheduled for delivery in <span className="font-bold">2 days</span>
              </p>
            </div>
          </div>

          {/* Countdown & Actions */}
          <div className="pt-4 border-t border-gray-150 dark:border-gray-750 text-center">
            <div className="bg-gray-55 dark:bg-gray-800/60 rounded-2xl p-6 border border-gray-200/40 dark:border-gray-700/40 space-y-4">
              <p className="text-sm text-gray-550 dark:text-gray-400 font-medium">
                You will be redirected back to the Home catalog in
              </p>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-display">
                {countdown} seconds
              </div>
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold font-display text-sm rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
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
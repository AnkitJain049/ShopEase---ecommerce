import React from 'react';
import useFetch from '../hooks/useFetch';

function OrderHistory() {
  const { data: transactions, loading, error } = useFetch(`${import.meta.env.VITE_API_BASE_URL}/api/payment/transactions`);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600 dark:text-red-400">
        Error loading orders: {error.message}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        No orders found. Start shopping to see your order history!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Order History</h3>
      {transactions.map((transaction) => (
        <div
          key={transaction._id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-4">
            {transaction.productId && (
              <img
                src={
                  transaction.productId.image.startsWith("http")
                    ? transaction.productId.image
                    : `${import.meta.env.VITE_API_BASE_URL}/uploads/productImages/${transaction.productId.image}`
                }
                alt={transaction.productId.name}
                className="w-16 h-16 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {transaction.productId ? transaction.productId.name : 'Product'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Order ID: {transaction.orderId}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Payment ID: {transaction.paymentId}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Date: {new Date(transaction.date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                ₹{transaction.amount}
              </p>
              <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                {transaction.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OrderHistory; 
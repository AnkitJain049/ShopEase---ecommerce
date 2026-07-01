import React, { useState } from 'react';
import useFetch from '../hooks/useFetch'; // Assuming useFetch is in ../hooks/useFetch.js
import Card from '../components/Card'; // Assuming Card is in the same directory or correctly imported
import Notification from '../components/Notification';

function Wishlist() {
  // Fetch wishlist data using the custom useFetch hook
  const { data: wishlist, loading, error } = useFetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/wishlist`);

  // State for notification
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  // Show error notification when there's an error
  React.useEffect(() => {
    if (error) {
      showNotification(`Error fetching wishlist: ${error.message || "Something went wrong."}`, 'error');
    }
  }, [error]);

  return (
    // Outer container for the entire Wishlist component
    <div className="bg-white mt-20 dark:bg-gray-700 shadow-lg rounded-lg p-6 my-8 max-w-5xl mx-auto min-h-[400px]">
      {/* Notification Component */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        My Wishlist ❤️
      </h2>

      {loading && (
        <p className="text-center text-gray-600 dark:text-gray-300 py-8">
          Loading wishlist...
        </p>
      )}

      {!loading && !error && (
        <>
          {wishlist && wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map((product) => (
                // Render each product using the Card component
                <Card key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-300 py-8">
              Your wishlist is empty. Start adding some products!
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default Wishlist;

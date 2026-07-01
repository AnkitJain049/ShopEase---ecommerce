// src/hooks/useWishlist.js
import { useState, useEffect } from 'react';
import axios from 'axios';

function useWishlist(productId) {
  const [isInWishlist, setIsInWishlist] = useState(false); // Default to false
  const [loading, setLoading] = useState(true); // Set to true initially for fetching
  const [error, setError] = useState(null);
  const [wishlistData, setWishlistData] = useState([]); // Store the fetched wishlist

  // Effect to fetch the user's wishlist
  useEffect(() => {
    const fetchUserWishlist = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/wishlist`, {
          withCredentials: true,
        });
        setWishlistData(response.data);
        // Determine if the current productId is in the fetched wishlist
        setIsInWishlist(response.data.some(item => item._id === productId));
      } catch (err) {
        console.error('Error fetching user wishlist:', err);
        setError(err.response?.data?.error || 'Failed to fetch wishlist status.');
        setIsInWishlist(false); // Assume not in wishlist on error
      } finally {
        setLoading(false);
      }
    };

    if (productId) { // Only fetch if productId is available
      fetchUserWishlist();
    } else {
      setLoading(false); // If no productId, it's not in wishlist and not loading
      setIsInWishlist(false);
    }
  }, [productId]); // Re-run when productId changes

  const addToWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/wishlist/${productId}`,
        {}, // Empty body for POST request
        { withCredentials: true }
      );
      setIsInWishlist(true);
      // Update local wishlistData state
      setWishlistData(prev => [...prev, { _id: productId }]); // Add new product ID to local state
      return response.data;
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError(err.response?.data?.error || 'Failed to add to wishlist.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/wishlist/${productId}`,
        { withCredentials: true }
      );
      setIsInWishlist(false);
      // Update local wishlistData state
      setWishlistData(prev => prev.filter(item => item._id !== productId)); // Remove product ID from local state
      return response.data;
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError(err.response?.data?.error || 'Failed to remove from wishlist.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Return the fetched wishlist data as well, useful for the Wishlist component itself
  return { isInWishlist, loading, error, addToWishlist, removeFromWishlist, wishlistData };
}

export default useWishlist;

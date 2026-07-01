import React, { useState } from "react"; // Import useState for notification state
import { useParams, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useAggregateRating from "../hooks/useAggregateRating";
import useWishlist from "../hooks/useWishlist";
import Notification from "../components/Notification"; // Import the Notification component

function Productdetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for managing the notification
  const [notification, setNotification] = useState(null); // { message: '', type: 'success' | 'error' }
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Fetch product details
  const { data: product, loading: productLoading, error: productError } = useFetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`);
  // Fetch reviews for the product
  const { data: reviews, loading: reviewsLoading, error: reviewsError } = useFetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/product/${id}`);

  // Utilize the useWishlist hook. It now handles fetching its own initial state.
  const {
    isInWishlist,
    loading: wishlistActionLoading, // This now covers initial fetch of wishlist status and add/remove actions
    error: wishlistActionError,
    addToWishlist,
    removeFromWishlist
  } = useWishlist(id); // Pass only productId

  // Calculate average rating
  const { avgRating, total } = useAggregateRating(reviews);

  // Function to show a notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  // Function to clear the notification
  const clearNotification = () => {
    setNotification(null);
  };

  // Handle direct Razorpay Buy Now payment
  const handleBuyNow = async () => {
    if (!product) return;
    setPaymentLoading(true);
    try {
      // 1. Fetch Razorpay Key
      const keyRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payment/razorpay-key`, {
        credentials: 'include'
      });
      const keyData = await keyRes.json();
      if (!keyRes.ok) throw new Error(keyData.error || 'Failed to fetch payment gateway key');

      // 2. Create Order
      const orderRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: product._id,
          amount: product.price,
          currency: 'INR'
        })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to initialize checkout');

      // 3. Open Razorpay Modal directly
      const options = {
        key: keyData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShopEase',
        description: `Purchase of ${product.name}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                productId: product._id,
                totalAmount: product.price
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              navigate(`/payment-success?productId=${product._id}&transactionId=${verifyData.transaction._id}`);
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (err) {
            console.error('Verification error:', err);
            showNotification(err.message || 'Payment verification failed', 'error');
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com'
        },
        theme: {
          color: '#4f46e5'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Checkout error:', err);
      showNotification(err.message || 'Could not start transaction', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle overall loading states
  if (productLoading || reviewsLoading || wishlistActionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white dark:text-gray-300">
        Loading product details...
      </div>
    );
  }

  // Handle overall error states
  if (productError || reviewsError || wishlistActionError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 dark:text-red-400">
        Error loading product: {productError?.message || reviewsError?.message || wishlistActionError?.message || "Unknown error"}
      </div>
    );
  }

  // Handle case where product is not found after loading
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700 dark:text-gray-300">
        Product not found.
      </div>
    );
  }

  // Handle wishlist button click
  const handleWishlistClick = async () => {
    try {
      if (isInWishlist) {
        await removeFromWishlist();
        showNotification("Removed from wishlist!", "success");
      } else {
        await addToWishlist();
        showNotification("Added to wishlist!", "success");
      }
    } catch (err) {
      showNotification(wishlistActionError || "Failed to update wishlist.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4 sm:px-8 lg:px-16 flex justify-center items-start transition-colors duration-300">
      {/* Notification Component */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}

      <div className="w-full max-w-6xl mt-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-200/80 dark:border-gray-700/80">

        {/* Product Layout (Row) */}
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-1/2 bg-gray-50/50 dark:bg-gray-900/10 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-200/50 dark:border-gray-700/50 md:h-[520px]">
            <img
              className="max-h-[380px] w-auto object-contain rounded-2xl hover:scale-[1.02] transition-transform duration-300"
              src={
                product.image.startsWith("http")
                  ? product.image
                  : `${import.meta.env.VITE_API_BASE_URL}/uploads/productImages/${product.image}`
              }
              alt={product.name}
            />
          </div>

          {/* Info */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-between md:h-[520px] overflow-hidden">
            <div className="space-y-4 overflow-hidden flex flex-col flex-1">
              <div className="flex-shrink-0 space-y-3">
                <h1 className="text-3xl md:text-4xl font-black font-display text-gray-900 dark:text-white leading-tight">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(avgRating)
                          ? "text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.044 3.21a1 1 0 00.95.69h3.396c.969 0 1.371 1.24.588 1.81l-2.748 2.006a1 1 0 00-.364 1.118l1.045 3.21c.3.921-.755 1.688-1.538 1.118L10 13.348l-2.748 2.006c-.783.57-1.838-.197-1.538-1.118l1.045-3.21a1 1 0 00-.364-1.118L3.647 8.637c-.783-.57-.38-1.81.588-1.81h3.396a1 1 0 00.95-.69l1.044-3.21z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {avgRating} ({total} review{total !== 1 ? 's' : ''})
                  </span>
                </div>

                <h2 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-display">₹{product.price}</h2>
              </div>

              {/* Description (Scrollable) */}
              <div className="pt-4 border-t border-gray-150 dark:border-gray-750 flex-1 overflow-hidden flex flex-col min-h-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 font-display flex-shrink-0">Description</h3>
                <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base overflow-y-auto pr-2 flex-1 scrollable-description min-h-0 max-h-[170px] no-scrollbar">
                  {product.description}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleBuyNow}
                  disabled={paymentLoading}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold font-display rounded-xl shadow-md hover:shadow-lg transition-all text-center cursor-pointer text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentLoading ? 'Processing...' : 'Buy Now'}
                </button>
                <button
                  className={`flex-1 px-6 py-3 font-bold font-display rounded-xl border transition-all shadow-md hover:shadow-lg text-base cursor-pointer ${
                    isInWishlist
                      ? "bg-red-50 hover:bg-red-100 dark:bg-red-950/10 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30"
                      : "bg-green-600 hover:bg-green-700 text-white border-transparent"
                  } ${wishlistActionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleWishlistClick}
                  disabled={wishlistActionLoading}
                >
                  {wishlistActionLoading
                    ? (isInWishlist ? "Removing..." : "Adding...")
                    : (isInWishlist ? "Remove from Wishlist" : "Add to Wishlist")}
                </button>
              </div>
              {wishlistActionError && (
                <p className="text-red-550 text-xs mt-2 text-center">
                  {wishlistActionError}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* User Reviews Section — Placed Right Below */}
        {reviews && reviews.length > 0 && (
          <div className="w-full p-8 md:p-12 border-t border-gray-150 dark:border-gray-700/50 bg-gray-50/20 dark:bg-gray-800/10">
            <h3 className="text-2xl font-black font-display text-gray-900 dark:text-white mb-8">Customer Reviews</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.map((r) => (
                <div key={r._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-650 dark:text-indigo-400 font-black text-sm font-display">
                          {r.userName?.charAt(0).toUpperCase()}
                        </div>
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm font-display">{r.userName}</h4>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-yellow-100/50 dark:bg-yellow-950/20 text-yellow-750 dark:text-yellow-400 rounded-full flex items-center gap-1">
                        ⭐ {r.rating} / 5
                      </span>
                    </div>
                    <p className="text-gray-650 dark:text-gray-300 text-sm leading-relaxed italic">"{r.comment}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Productdetails;

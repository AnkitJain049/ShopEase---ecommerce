import React, { useState } from "react";
import useFetch from "../hooks/useFetch";
import ReviewForm from "../components/ReviewForm";
import EditProduct from "../components/EditProduct"; // Import the EditProduct component
import Notification from "./Notification";

function ToggleUserData() {
  const [activeTab, setActiveTab] = useState("orders");
  const [reviewingProductId, setReviewingProductId] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [notification, setNotification] = useState(null);

  const { data: listings, refetch: refetchListings } = useFetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/products`);
  const { data: orders } = useFetch(`${import.meta.env.VITE_API_BASE_URL}/api/payment/transactions`);

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const toggleReviewForm = (productId) => {
    if (reviewingProductId === productId) {
      setReviewingProductId(null);
    } else {
      setReviewingProductId(productId);
    }
    setEditingProductId(null);
  };

  const handleEditListing = (productId) => {
    if (editingProductId === productId) {
      setEditingProductId(null);
    } else {
      setEditingProductId(productId);
    }
    setReviewingProductId(null);
  };

  const handleProductUpdated = (updatedProduct) => {
    console.log("Product updated:", updatedProduct);
    setEditingProductId(null);
    refetchListings();
    showNotification("Listing updated successfully!", "success");
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-3xl p-8 my-10 max-w-5xl mx-auto border border-gray-200/60 dark:border-gray-700/60 transition-all duration-300">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}

      {/* Pill Tab Switcher */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 bg-gray-55 dark:bg-gray-900 rounded-2xl border border-gray-200/40 dark:border-gray-800/40">
          <button
            onClick={() => {
              setActiveTab("orders");
              setReviewingProductId(null);
              setEditingProductId(null);
            }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold font-display transition-all duration-200 cursor-pointer ${
              activeTab === "orders"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200/30 dark:border-gray-700/30"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            My Orders
          </button>
          <button
            onClick={() => {
              setActiveTab("listings");
              setReviewingProductId(null);
              setEditingProductId(null);
            }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold font-display transition-all duration-200 cursor-pointer ${
              activeTab === "listings"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200/30 dark:border-gray-700/30"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            My Listings
          </button>
        </div>
      </div>

      {/* Orders Section */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {orders?.length > 0 ? (
            orders.map((order) => (
              <div
                key={order._id}
                className="border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-5 bg-gray-50/50 dark:bg-gray-800/30 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <img
                    src={order.productId?.image}
                    alt={order.productId?.name}
                    className="w-24 h-24 object-cover rounded-xl border border-gray-200/40 dark:border-gray-700/40"
                  />
                  <div className="flex-1 space-y-1 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white">
                        {order.productId?.name}
                      </h3>
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-green-150/40 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200/30 dark:border-green-900/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {order.status}
                      </span>
                    </div>
                    
                    <p className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-display">
                      ₹{order.productId?.price}
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Ordered on: {new Date(order.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      
                      <button
                        className="inline-flex items-center gap-1.5 text-xs font-bold font-display text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/20 px-3.5 py-2 rounded-xl border border-blue-100 dark:border-blue-900/30 cursor-pointer transition-all hover:bg-blue-100/50"
                        onClick={() => toggleReviewForm(order.productId._id)}
                      >
                        {reviewingProductId === order.productId._id
                          ? "Cancel Review"
                          : "Leave Review"}
                      </button>
                    </div>
                  </div>
                </div>
                {reviewingProductId === order.productId._id && (
                  <div className="mt-5 pt-5 border-t border-gray-150 dark:border-gray-750">
                    <ReviewForm productId={order.productId._id} onCancel={() => setReviewingProductId(null)} />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No orders found.</p>
            </div>
          )}
        </div>
      )}

      {/* Listings Section */}
      {activeTab === "listings" && (
        <div className="space-y-6">
          {listings?.length > 0 ? (
            listings.map((product) => (
              <React.Fragment key={product._id}>
                <div
                  className="border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-5 bg-gray-50/50 dark:bg-gray-800/30 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-xl border border-gray-200/40 dark:border-gray-700/40"
                    />
                    <div className="flex-1 space-y-1 w-full">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white">
                          {product.name}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-650">
                          Brand: {product.brand || "N/A"}
                        </span>
                      </div>
                      
                      <p className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-display">
                        ₹{product.price}
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Product ID: {product._id}
                        </p>
                        
                        <button
                          className="inline-flex items-center gap-1.5 text-xs font-bold font-display text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/20 px-3.5 py-2 rounded-xl border border-blue-100 dark:border-blue-900/30 cursor-pointer transition-all hover:bg-blue-100/50"
                          onClick={() => handleEditListing(product._id)}
                        >
                          Edit Listing
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {editingProductId === product._id && (
                  <div className="mt-5">
                    <EditProduct
                      product={product}
                      onUpdate={handleProductUpdated}
                      onCancel={handleCancelEdit}
                    />
                  </div>
                )}
              </React.Fragment>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No listings found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ToggleUserData;
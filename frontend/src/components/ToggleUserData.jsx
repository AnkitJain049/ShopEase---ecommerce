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
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 my-8 max-w-5xl mx-auto">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => {
            setActiveTab("orders");
            setReviewingProductId(null);
            setEditingProductId(null);
          }}
          className={`px-4 py-2 rounded ${
            activeTab === "orders"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white"
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
          className={`px-4 py-2 rounded ${
            activeTab === "listings"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white"
          }`}
        >
          My Listings
        </button>
      </div>

      {/* Orders Section */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {orders?.length > 0 ? (
            orders.map((order) => (
              <div
                key={order._id}
                className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <img
                    // Corrected Image Source
                    src={order.productId?.image}
                    alt={order.productId?.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {order.productId?.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      ₹{order.productId?.price}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Ordered on: {new Date(order.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Status: {order.status}
                    </p>
                    <button
                      className="text-blue-600 hover:underline text-sm mt-2"
                      onClick={() => toggleReviewForm(order.productId._id)}
                    >
                      {reviewingProductId === order.productId._id
                        ? "Cancel Review"
                        : "Leave Review"}
                    </button>
                  </div>
                </div>
                {reviewingProductId === order.productId._id && (
                  <div className="mt-4">
                    <ReviewForm productId={order.productId._id} onCancel={() => setReviewingProductId(null)} />
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-300 text-center py-8">
              No orders found.
            </p>
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
                  className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <img
                      // Corrected Image Source
                      src={product.image}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        ₹{product.price}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Brand: {product.brand || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Product ID: {product._id}
                      </p>
                      <button
                        className="text-blue-600 hover:underline text-sm mt-2"
                        onClick={() => handleEditListing(product._id)}
                      >
                        Edit Listing
                      </button>
                    </div>
                  </div>
                </div>
                {editingProductId === product._id && (
                  <div>
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
            <p className="text-gray-600 dark:text-gray-300 text-center py-8">
              No listings found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ToggleUserData;
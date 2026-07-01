import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// EditProduct now accepts product, onUpdate, and onCancel as props
function EditProduct({ product, onUpdate, onCancel }) {
  // State to hold form data, initialized with product prop data
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    brand: product?.brand || '',
  });
  // State for the product image, separate from formData for file handling
  const [productImage, setProductImage] = useState(null);
  // Ref for the hidden file input to clear its value
  const fileInputRef = useRef(null);

  // State for status messages (success/error)
  const [status, setStatus] = useState("");
  // State for loading indicator during form submission
  const [loading, setLoading] = useState(false);

  // useEffect to populate form data when the 'product' prop changes
  // This ensures the form updates if a different product is passed in
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        brand: product.brand || '',
      });
      // Clear any previously selected file when product changes
      setProductImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [product]); // Dependency array includes 'product'

  // Handler for text and number input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for file input change
  const handleFileChange = (e) => {
    setProductImage(e.target.files[0]);
  };

  // Handler to clear the selected image
  const handleClearImage = () => {
    setProductImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(""); // Clear previous status

    // Ensure product ID is available from the prop
    if (!product || !product._id) {
      setStatus("Error: Product data is missing for update.");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("brand", formData.brand);
      if (productImage) { // Only append image if a new one is selected
        data.append("image", productImage);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/products/${product._id}`, // Use product._id from prop
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setStatus("Product updated successfully!");
      // Call the onUpdate callback with the updated product data
      if (onUpdate) {
        onUpdate(response.data);
      }
      // Optionally call onCancel to close the form/modal
      if (onCancel) {
        onCancel();
      }

    } catch (error) {
      console.error("Error updating product:", error);
      setStatus(error.response?.data?.error || "Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  // No loading/error states for fetching here, as data comes from props
  // The parent component (ToggleUserData) will handle initial loading of listings

  return (
    <div className="
      p-6
      border border-gray-200 dark:border-gray-700
      rounded-xl
      bg-white dark:bg-gray-800
      shadow-lg
      my-8 max-w-xl mx-auto
    ">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-5 text-center">
        Edit Product {/* Static heading, or you could add a 'title' prop if needed */}
      </h2>

      {status && (
        <p className={`mb-4 text-sm text-center font-medium ${status.includes("successfully") ? "text-green-500" : "text-red-500"}`}>
          {status}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div className="relative z-0 w-full group">
          <input
            type="text"
            name="name"
            id="productName"
            value={formData.name}
            onChange={handleChange}
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 dark:text-white dark:border-gray-600 focus:border-blue-600 focus:outline-none peer"
            placeholder=" "
            required
          />
          <label
            htmlFor="productName"
            className="absolute text-sm text-gray-500 dark:text-gray-400 transition-all transform -translate-y-6 scale-75 top-3 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:text-blue-600 dark:peer-focus:text-blue-500"
          >
            Product Name
          </label>
        </div>

        {/* Product Description */}
        <div className="relative z-0 w-full group">
          <textarea
            name="description"
            id="productDescription"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 dark:text-white dark:border-gray-600 focus:border-blue-600 focus:outline-none peer"
            placeholder=" "
            required
          ></textarea>
          <label
            htmlFor="productDescription"
            className="absolute text-sm text-gray-500 dark:text-gray-400 transition-all transform -translate-y-6 scale-75 top-3 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:text-blue-600 dark:peer-focus:text-blue-500"
          >
            Product Description
          </label>
        </div>

        {/* Product Price */}
        <div className="relative z-0 w-full group">
          <input
            type="number"
            name="price"
            id="productPrice"
            value={formData.price}
            onChange={handleChange}
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 dark:text-white dark:border-gray-600 focus:border-blue-600 focus:outline-none peer"
            placeholder=" "
            required
          />
          <label
            htmlFor="productPrice"
            className="absolute text-sm text-gray-500 dark:text-gray-400 transition-all transform -translate-y-6 scale-75 top-3 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:text-blue-600 dark:peer-focus:text-blue-500"
          >
            Price
          </label>
        </div>

        {/* Product Brand */}
        <div className="relative z-0 w-full group">
          <input
            type="text"
            name="brand"
            id="productBrand"
            value={formData.brand}
            onChange={handleChange}
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 dark:text-white dark:border-gray-600 focus:border-blue-600 focus:outline-none peer"
            placeholder=" "
            required
          />
          <label
            htmlFor="productBrand"
            className="absolute text-sm text-gray-500 dark:text-gray-400 transition-all transform -translate-y-6 scale-75 top-3 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:text-blue-600 dark:peer-focus:text-blue-500"
          >
            Brand
          </label>
        </div>

        {/* Product Image Input (Styled like EditProfile) */}
        <div className="relative z-0 w-full group">
          <input
            type="file"
            id="productImage"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="sr-only peer"
          />
          <label
            htmlFor="productImage"
            className={`
              block py-2.5 px-0 w-full text-sm
              bg-transparent border-0 border-b-2
              border-gray-300 dark:border-gray-600
              focus:border-blue-600 focus:outline-none
              cursor-pointer
              ${productImage ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}
            `}
          >
            {productImage ? productImage.name : "\u00A0"}
          </label>
          <label
            htmlFor="productImage"
            className={`
              absolute text-sm
              text-gray-500 dark:text-gray-400
              duration-300 transform
              top-3 origin-[0]
              peer-focus:text-blue-600 dark:peer-focus:text-blue-500
              ${productImage ? '-translate-y-6 scale-75' : 'translate-y-0 scale-100'}
            `}
          >
            Upload New Image (optional)
          </label>
          {productImage && (
            <button
              type="button"
              onClick={handleClearImage}
              className="absolute right-0 top-3 text-red-500 hover:text-red-700 text-xs font-medium z-10"
              title="Clear selected image"
            >
              Clear
            </button>
          )}
        </div>

        {/* Submit & Cancel Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          {/* Cancel Button */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="
                px-5 py-2.5
                border border-gray-300 dark:border-gray-500
                rounded-lg
                shadow-sm
                text-base font-medium
                text-gray-700 dark:text-gray-200
                bg-white dark:bg-gray-600
                hover:bg-gray-100 dark:hover:bg-gray-500
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
                transition-colors duration-200 ease-in-out
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              disabled={loading}
            >
              Cancel
            </button>
          )}
          {/* Save Changes Button */}
          <button
            type="submit"
            className="
              px-5 py-2.5
              border border-transparent
              rounded-lg
              shadow-sm
              text-base font-medium
              text-white
              bg-blue-600 hover:bg-blue-700
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              transition-colors duration-200 ease-in-out
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProduct;

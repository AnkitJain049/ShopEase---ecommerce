import React, { useState, useRef } from 'react'; // Import useRef
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function AddProduct(props) {
  const navigate = useNavigate(); // Initialize navigate hook

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    brand: '',
  });

  const [productImage, setProductImage] = useState(null); // State for the image file
  const fileInputRef = useRef(null); // Ref for the hidden file input

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setProductImage(e.target.files[0]);
  };

  const handleClearImage = () => {
    setProductImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input element itself
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true
    setStatus(""); // Clear previous status

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("brand", formData.brand);
      if (productImage) {
        data.append("image", productImage);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/products`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setStatus("Product added successfully!");
      setFormData({ name: "", description: "", price: "", brand: "" }); // Clear text fields
      setProductImage(null); // Clear image state
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear file input element
      }

      // Redirect to /product with a success message in URL params
      navigate('/products?status=ProductAddedSuccessfully');

    } catch (error) {
      console.error("Error adding product:", error);
      setStatus(error.response?.data?.error || "Failed to add product.");
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return (
    <div className="m-10 min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"> {/* Increased padding, rounded, shadow */}
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">
          {props.title || "Add New Product"}
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
              Upload Product Image
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-base transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading} // Disable button when loading
          >
            {loading ? 'Adding Product...' : 'Add Product'} {/* Change text based on loading state */}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;

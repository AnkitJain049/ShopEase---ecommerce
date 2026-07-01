import React, { useState, useRef } from "react";
import Notification from "./Notification";

function EditProfile({ user, onCancel, onUpdate }) {
  const [formData, setFormData] = useState({
    firstName: user.name.split(" ")[0] || "",
    lastName: user.name.split(" ")[1] || "",
    contactNumber: user.contactNumber || "",
    password: "",
    confirmPassword: "",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null); // Ref for the hidden file input

  // State for notification
  const [notification, setNotification] = useState(null);

  // Validation functions
  const validateName = (name, fieldName) => {
    if (!name) return `${fieldName} is required`;
    if (name.length < 2) return `${fieldName} must be at least 2 characters long`;
    if (name.length > 50) return `${fieldName} must be less than 50 characters`;
    if (!/^[a-zA-Z\s]+$/.test(name)) return `${fieldName} can only contain letters and spaces`;
    return "";
  };

  const validatePhoneNumber = (phone) => {
    if (!phone) return "Phone number is required";
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) return "Phone number must be exactly 10 digits";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return ""; // Password is optional in edit profile
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number";
    if (!/(?=.*[@$!%*?&])/.test(password)) return "Password must contain at least one special character (@$!%*?&)";
    return "";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!password) return ""; // If no password, no need to confirm
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(value, formData.password);
      case 'firstName':
        return validateName(value, 'First name');
      case 'lastName':
        return validateName(value, 'Last name');
      case 'contactNumber':
        return validatePhoneNumber(value);
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }

    // Real-time validation for password confirmation
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = validateConfirmPassword(formData.confirmPassword, value);
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'contactNumber'];
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Validate password fields only if password is provided
    if (formData.password) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
      
      const confirmError = validateConfirmPassword(formData.confirmPassword, formData.password);
      if (confirmError) {
        newErrors.confirmPassword = confirmError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  const handleClearProfilePic = () => {
    setProfilePic(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input value
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const fullName = `${formData.firstName} ${formData.lastName}`;
    const form = new FormData();
    form.append("name", fullName);
    form.append("contactNumber", formData.contactNumber);
    if (formData.password) {
      form.append("password", formData.password);
    }
    if (profilePic) {
      form.append("profilePic", profilePic);
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/profile`, {
        method: "PUT",
        body: form,
        credentials: "include",
      });

      if (res.ok) {
        const updatedUser = await res.json();
        onUpdate(updatedUser);
        showNotification("User Details Updated!", "success");
        // Clear password fields after successful update
        setFormData(prev => ({
          ...prev,
          password: "",
          confirmPassword: ""
        }));
        setErrors({});
      } else {
        const data = await res.json();
        showNotification(data.error || "Update failed", "error");
      }
    } catch (err) {
      console.error("Update error:", err);
      showNotification("Something went wrong. Try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 focus:outline-none peer";
    const errorClass = "border-red-500 dark:border-red-400 focus:border-red-600";
    const normalClass = "text-gray-900 border-gray-300 dark:text-white dark:border-gray-600 focus:border-blue-600";
    
    return `${baseClass} ${errors[fieldName] ? errorClass : normalClass}`;
  };

  const getLabelClassName = (fieldName) => {
    const baseClass = "absolute text-sm transition-all transform -translate-y-6 scale-75 top-3 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100";
    const errorClass = "text-red-500 dark:text-red-400 peer-focus:text-red-600";
    const normalClass = "text-gray-500 dark:text-gray-400 peer-focus:text-blue-600 dark:peer-focus:text-blue-500";
    
    return `${baseClass} ${errors[fieldName] ? errorClass : normalClass}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 mt-6 max-w-lg mx-auto">
      {/* Notification Component */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Edit Profile
      </h1>

      <form onSubmit={handleSubmit}>
        {/* First & Last Name */}
        <div className="grid md:grid-cols-2 md:gap-6">
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClassName('firstName')}
              placeholder=" "
              required
            />
            <label
              htmlFor="firstName"
              className={getLabelClassName('firstName')}
            >
              First Name
            </label>
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          <div className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClassName('lastName')}
              placeholder=" "
              required
            />
            <label
              htmlFor="lastName"
              className={getLabelClassName('lastName')}
            >
              Last Name
            </label>
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Contact Number */}
        <div className="relative z-0 w-full mb-5 group">
          <input
            type="tel"
            name="contactNumber"
            id="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClassName('contactNumber')}
            placeholder=" "
            required
          />
          <label
            htmlFor="contactNumber"
            className={getLabelClassName('contactNumber')}
          >
            Phone Number
          </label>
          {errors.contactNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>
          )}
        </div>

        {/* Email (disabled) */}
        <div className="relative z-0 w-full mb-5 group">
          <input
            type="email"
            id="email"
            value={user.email}
            disabled
            className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 text-gray-400 border-gray-300 dark:text-gray-400 dark:border-gray-600 focus:outline-none"
          />
          <label
            htmlFor="email"
            className="absolute text-sm text-gray-400 dark:text-gray-400 top-3 origin-[0] scale-75 -translate-y-6"
          >
            Email (cannot be changed)
          </label>
        </div>

        {/* Password */}
        <div className="relative z-0 w-full mb-5 group">
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClassName('password')}
            placeholder=" "
          />
          <label
            htmlFor="password"
            className={getLabelClassName('password')}
          >
            New Password (optional)
          </label>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
          {formData.password && !errors.password && (
            <div className="text-xs text-gray-500 mt-1">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside ml-2">
                <li className={formData.password.length >= 8 ? 'text-green-500' : 'text-gray-400'}>At least 8 characters</li>
                <li className={/(?=.*[a-z])/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}>One lowercase letter</li>
                <li className={/(?=.*[A-Z])/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}>One uppercase letter</li>
                <li className={/(?=.*\d)/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}>One number</li>
                <li className={/(?=.*[@$!%*?&])/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}>One special character (@$!%*?&)</li>
              </ul>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative z-0 w-full mb-5 group">
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClassName('confirmPassword')}
            placeholder=" "
          />
          <label
            htmlFor="confirmPassword"
            className={getLabelClassName('confirmPassword')}
          >
            Confirm New Password
          </label>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Profile Picture Input - Final Alignment Fix */}
        <div className="relative z-0 w-full mb-5 group">
          {/* Hidden native file input */}
          <input
            type="file"
            id="profilePic" // Unique ID for this input
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef} // Attach ref here
            className="sr-only peer" // Ensure 'peer' is here
          />

          {/* The visible, styled "input" area */}
          <label
            htmlFor="profilePic"
            className={`
              block py-2.5 px-0 w-full text-sm
              bg-transparent border-0 border-b-2
              border-gray-300 dark:border-gray-600
              focus:border-blue-600 focus:outline-none
              cursor-pointer
              ${profilePic ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}
            `}
          >
            {/* Display selected file name or a non-breaking space for alignment when empty */}
            {profilePic ? profilePic.name : "\u00A0"}
          </label>

          {/* The floating label - Adjusted `top` and `transform` logic */}
          <label
            htmlFor="profilePic"
            className={`
              absolute text-sm
              text-gray-500 dark:text-gray-400
              duration-300 transform
              origin-[0]
              peer-focus:text-blue-600 dark:peer-focus:text-blue-500
              ${profilePic ? 'top-3 -translate-y-6 scale-75' : 'top-3 translate-y-0 scale-100'}
            `}
            // We explicitly set top-3 for both states and control `translate-y` and `scale` based on `profilePic`
          >
            Choose New Profile Picture
          </label>

          {/* Clear button for selected image */}
          {profilePic && (
            <button
              type="button"
              onClick={handleClearProfilePic}
              className="absolute right-0 top-3 text-red-500 hover:text-red-700 text-xs font-medium z-10"
              title="Clear selected image"
            >
              Clear
            </button>
          )}
        </div>

        {/* Submit & Cancel Buttons */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 mb-4 ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full text-sm text-blue-600 hover:underline dark:text-blue-400 text-center disabled:opacity-50"
        >
          ← Cancel
        </button>
      </form>
    </div>
  );
}

export default EditProfile; 
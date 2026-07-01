import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register({ onBack }) {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number";
    if (!/(?=.*[@$!%*?&])/.test(password)) return "Password must contain at least one special character (@$!%*?&)";
    return "";
  };

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

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return validateEmail(value);
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
    
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const body = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password,
      contactNumber: formData.contactNumber,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        // Clear form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          contactNumber: "",
        });
        setErrors({});

        // Redirect to Landing page with success message
        navigate('/?message=' + encodeURIComponent('User registered! Please login') + '&status=success');
      } else {
        navigate('/?message=' + encodeURIComponent(data.error || 'Registration failed'));
      }
    } catch (err) {
      console.error("Registration error:", err);
      navigate('/?message=' + encodeURIComponent('Network error. Please try again.'));
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
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Register
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div className="relative z-0 w-full mb-5 group">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClassName('email')}
            placeholder=" "
            required
          />
          <label
            htmlFor="email"
            className={getLabelClassName('email')}
          >
            Email Address
          </label>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative z-0 w-full mb-5 group">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClassName('password')}
            placeholder=" "
            required
          />
          <label
            htmlFor="password"
            className={getLabelClassName('password')}
          >
            Password
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
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClassName('confirmPassword')}
            placeholder=" "
            required
          />
          <label
            htmlFor="confirmPassword"
            className={getLabelClassName('confirmPassword')}
          >
            Confirm Password
          </label>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* First & Last Name */}
        <div className="grid md:grid-cols-2 md:gap-6">
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name="firstName"
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

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 mb-4 ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>

        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full text-sm text-blue-600 hover:underline dark:text-blue-400 text-center disabled:opacity-50"
        >
          ← Back
        </button>
      </form>
    </div>
  );
}

export default Register;

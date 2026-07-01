import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../lib/auth';

function Login({ onBack }) {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) {
          setToken(data.token);
        }
        // ✅ Redirect with URL param
        navigate('/products?message=logged in successfully');
      } else {
        navigate('/?message=' + encodeURIComponent(data.error || 'Login failed'));
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Login
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div className="relative z-0 w-full mb-6 group">
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 dark:text-white dark:border-gray-600 focus:border-blue-600 focus:outline-none peer"
            placeholder=" "
            required
          />
          <label
            htmlFor="email"
            className="absolute text-sm text-gray-500 dark:text-gray-400 transition-all transform -translate-y-6 scale-75 top-3 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:text-blue-600 dark:peer-focus:text-blue-500"
          >
            Email Address
          </label>
        </div>

        {/* Password */}
        <div className="relative z-0 w-full mb-6 group">
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 dark:text-white dark:border-gray-600 focus:border-blue-600 focus:outline-none peer"
            placeholder=" "
            required
          />
          <label
            htmlFor="password"
            className="absolute text-sm text-gray-500 dark:text-gray-400 transition-all transform -translate-y-6 scale-75 top-3 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:text-blue-600 dark:peer-focus:text-blue-500"
          >
            Password
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 mb-4"
        >
          Login
        </button>

        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="w-full text-sm text-blue-600 hover:underline dark:text-blue-400 text-center"
        >
          ← Back
        </button>
      </form>
    </div>
  );
}

export default Login;

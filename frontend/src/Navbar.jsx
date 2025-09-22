import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearToken } from './lib/auth';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      clearToken();
      navigate('/?message=Logged Out');
    } catch (err) {
      // fallback: still redirect, but could show error notification if desired
      clearToken();
      navigate('/?message=Logged Out');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      console.log('Searching for:', searchQuery.trim());
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/search/${encodeURIComponent(searchQuery.trim())}`, {
        credentials: 'include',
      });

      console.log('Search response status:', response.status);
      
      if (response.ok) {
        const searchData = await response.json();
        console.log('Search response data:', searchData);
        
        // Extract products from the response structure
        const searchResults = searchData.products || searchData;
        console.log('Extracted search results:', searchResults);
        
        // Navigate to home with search results
        navigate('/products', { 
          state: { 
            searchResults, 
            searchQuery: searchQuery.trim() 
          } 
        });
        setSearchQuery('');
      } else {
        console.error('Search failed with status:', response.status);
        const errorData = await response.json();
        console.error('Search error data:', errorData);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow dark:bg-gray-800">
      <div className="container px-6 py-3 mx-auto md:flex">
        <div className="flex items-center justify-between w-full">
          <Link
            to="/products"
            className="text-3xl font-bold text-gray-800 dark:text-gray-200"
          >
            SHOPEASE
          </Link>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-gray-500 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none"
              aria-label="toggle menu"
            >
              {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isOpen ? 'block opacity-100 translate-x-0' : 'hidden opacity-0 -translate-x-full'
          } md:flex md:items-center md:justify-between md:opacity-100 md:translate-x-0 md:relative md:w-full`}
        >
          {/* Search Bar */}
          <div className="relative mt-4 md:mt-0 md:flex-1 md:max-w-md">
            <form onSubmit={handleSearch} className="flex">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-opacity-40 focus:ring-blue-300"
                placeholder="Search products..."
                disabled={searchLoading}
              />
              <button
                type="submit"
                disabled={searchLoading || !searchQuery.trim()}
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {searchLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Search'
                )}
              </button>
            </form>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col px-2 mt-4 -mx-4 md:flex-row md:mt-0 md:mx-6 md:py-0 md:space-x-1">
            <Link
              to="/products/add-product"
              className="px-3 py-2.5 text-gray-700 transition-colors duration-300 transform rounded-lg dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 md:mx-1 text-sm md:text-base whitespace-nowrap text-center"
            >
              Add a Product
            </Link>
            <Link
              to="/user/profile"
              className="px-3 py-2.5 text-gray-700 transition-colors duration-300 transform rounded-lg dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 md:mx-1 text-sm md:text-base whitespace-nowrap text-center"
            >
              Profile
            </Link>
            <Link
              to="/user/wishlist"
              className="px-3 py-2.5 text-gray-700 transition-colors duration-300 transform rounded-lg dark:text-gray-200 hover:bg-pink-100 dark:hover:bg-gray-700 md:mx-1 text-sm md:text-base whitespace-nowrap text-center"
            >
              Wishlist
            </Link>
            <a
              href="#logout"
              onClick={handleLogout}
              className="px-3 py-2.5 text-gray-700 transition-colors duration-300 transform rounded-lg dark:text-gray-200 hover:bg-red-100 dark:hover:bg-red-800 md:mx-1 text-sm md:text-base whitespace-nowrap text-center cursor-pointer"
            >
              Logout
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

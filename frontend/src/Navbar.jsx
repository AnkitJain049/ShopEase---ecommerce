import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios'; // Import Axios
import { clearToken } from './lib/auth';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

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
      clearToken();
      navigate('/?message=Logged Out');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/80 border-b border-gray-200/40 dark:border-gray-800/40 shadow-sm transition-all duration-300">
      <div className="container px-6 py-2.5 mx-auto md:flex">
        <div className="flex items-center justify-between w-full">
          <Link
            to="/products"
            className="text-3xl font-black tracking-tight font-display bg-gradient-to-r from-blue-600 to-indigo-650 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
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
                className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white/60 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                placeholder="Search products..."
                disabled={searchLoading}
              />
              <button
                type="submit"
                disabled={searchLoading || !searchQuery.trim()}
                className="ml-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold font-display text-sm rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="px-3 py-2 text-gray-600 dark:text-gray-300 font-semibold font-display text-sm tracking-wide transition-all rounded-lg hover:bg-gray-100/60 dark:hover:bg-gray-800/60 hover:text-blue-600 dark:hover:text-blue-400 md:mx-1 whitespace-nowrap text-center flex items-center justify-center"
            >
              Add a Product
            </Link>
            <Link
              to="/user/profile"
              className="px-3 py-2 text-gray-600 dark:text-gray-300 font-semibold font-display text-sm tracking-wide transition-all rounded-lg hover:bg-gray-100/60 dark:hover:bg-gray-800/60 hover:text-blue-600 dark:hover:text-blue-400 md:mx-1 whitespace-nowrap text-center flex items-center justify-center"
            >
              Profile
            </Link>
            <Link
              to="/user/wishlist"
              className="px-3 py-2 text-gray-600 dark:text-gray-300 font-semibold font-display text-sm tracking-wide transition-all rounded-lg hover:bg-pink-50 dark:hover:bg-pink-950/20 hover:text-pink-600 dark:hover:text-pink-400 md:mx-1 whitespace-nowrap text-center flex items-center justify-center"
            >
              Wishlist
            </Link>
            <a
              href="#logout"
              onClick={handleLogout}
              className="px-3 py-2 text-gray-600 dark:text-gray-300 font-semibold font-display text-sm tracking-wide transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-650 dark:hover:text-red-400 md:mx-1 whitespace-nowrap text-center cursor-pointer flex items-center justify-center"
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
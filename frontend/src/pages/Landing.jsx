import React, { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import { useSearchParams } from "react-router-dom";
import Notification from "../components/Notification";

function Landing() {
  const [view, setView] = useState(null); // 'login' | 'register' | null
  const [searchParams] = useSearchParams();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const message = searchParams.get('message');
    const status = searchParams.get('status');
    
    if (message) {
      setNotification({ message, type: status === 'success' ? 'success' : 'error' });
    }
  }, [searchParams]);

  const clearNotification = () => setNotification(null);

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative overflow-hidden">
      {/* Notification Component */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}

      {/* Left Column - Showcase Column (Visible on Desktop) */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-16 bg-gradient-to-br from-indigo-950 via-slate-900 to-gray-950 text-white relative overflow-hidden">
        {/* Background meshes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        {/* Branding header */}
        <div className="relative z-10">
          <span className="text-sm font-extrabold tracking-widest text-indigo-400 uppercase font-display">
            The Modern Retail Platform
          </span>
          <h1 className="text-5xl font-black tracking-tight leading-tight mt-6 font-display">
            Discover, Shop, and <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-350 to-purple-400 bg-clip-text text-transparent">
              Elevate Your Style
            </span>
          </h1>
          <p className="text-gray-300 text-lg mt-6 max-w-lg leading-relaxed">
            Experience a fully optimized e-commerce marketplace powered by next-generation search capabilities and secure, automated transactions.
          </p>
        </div>

        {/* Features list */}
        <div className="relative z-10 grid grid-cols-2 gap-6 my-auto max-w-2xl">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 border border-blue-400/20 text-lg">
              ⚡
            </div>
            <h3 className="font-bold text-white font-display text-sm tracking-wide">Instant Delivery</h3>
            <p className="text-xs text-gray-400 mt-1">Guaranteed package shipment with local delivery within 2 days.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-4 border border-green-400/20 text-lg">
              🛡️
            </div>
            <h3 className="font-bold text-white font-display text-sm tracking-wide">Secure Capture</h3>
            <p className="text-xs text-gray-400 mt-1">Reconciled Razorpay checkout with secure HMAC signatures.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 col-span-2">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-400/20 flex-shrink-0 text-lg">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-white font-display text-sm tracking-wide">Gemini Support Assistant</h3>
                <p className="text-xs text-gray-400 mt-1">Continuous contextual chat history powered by Google Gemini Pro.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-gray-500 border-t border-white/10 pt-6">
          © 2025 ShopEase Premium. All rights reserved.
        </div>
      </div>

      {/* Right Column - Authentication Column */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center p-8 relative">
        {/* Decorative background blobs for right side */}
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Mobile Brand Title (visible only on small screens) */}
        <div className="lg:hidden flex flex-col items-center mb-10 text-center relative z-10">
          <h1 className="text-4xl font-black font-display bg-gradient-to-r from-blue-600 to-indigo-650 bg-clip-text text-transparent">
            SHOPEASE
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-bold tracking-widest uppercase">Premium Retail Platform</p>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md relative z-10">
          {!view ? (
            <div className="text-center space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 transition-all duration-300">
              <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white font-display">Welcome Back</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Please select an option to sign in or register a new customer profile.</p>
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => setView('login')}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold font-display rounded-xl transition-all shadow-sm hover:shadow"
                >
                  Sign In to ShopEase
                </button>
                <button
                  onClick={() => setView('register')}
                  className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-800 dark:text-white font-bold font-display rounded-xl border border-gray-200 dark:border-gray-600 transition-all"
                >
                  Create New Account
                </button>
              </div>
            </div>
          ) : (
            <div className="transition-all duration-500 transform opacity-100 translate-y-0 scale-100">
              {view === "login" && <Login onBack={() => setView(null)} />}
              {view === "register" && <Register onBack={() => setView(null)} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Landing;

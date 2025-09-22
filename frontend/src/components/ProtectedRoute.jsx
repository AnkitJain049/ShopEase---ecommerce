import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders } from '../lib/auth';

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/status`, {
          credentials: 'include',
          headers: {
            ...getAuthHeaders(),
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            navigate('/?message=You are not logged in');
          }
        } else {
          setIsAuthenticated(false);
          navigate('/?message=You are not logged in');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        navigate('/?message=You are not logged in');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to landing page
  }

  return children;
}

export default ProtectedRoute; 
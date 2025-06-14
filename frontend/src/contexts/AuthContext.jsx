import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, logout } from '../api/auth';

// Create the auth context
export const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user on component mount if authenticated
  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Session expired or invalid');
          // Clear invalid token
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  // Update auth context with new user data
  const updateUser = userData => {
    setUser(userData);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setUser(null);
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    updateUser,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

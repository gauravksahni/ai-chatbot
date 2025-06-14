import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { login as apiLogin, register as apiRegister } from '../api/auth';

// Custom hook for authentication functionality
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Enhance with login and register methods
  const login = async (email, password) => {
    try {
      await apiLogin({ email, password });
      // Refresh user data from server
      window.location.href = '/chat'; // Redirect to chat page after login
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.detail || 'Invalid email or password',
      };
    }
  };

  const register = async userData => {
    try {
      await apiRegister(userData);
      // After successful registration, redirect to login
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.detail || 'Registration failed',
      };
    }
  };

  return {
    ...context,
    login,
    register,
  };
};

export default useAuth;

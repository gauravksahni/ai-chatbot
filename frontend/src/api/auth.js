import api from '../utils/api';

// Register a new user
export const register = async userData => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Error registering user' };
  }
};

// Login a user
export const login = async credentials => {
  try {
    // Using URLSearchParams for form data format that FastAPI expects for OAuth2
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await api.post('/auth/login', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Store the token in localStorage
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Error logging in' };
  }
};

// Get current user info
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Error getting user info' };
  }
};

// Update user profile
export const updateUser = async userData => {
  try {
    const response = await api.put('/auth/me', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Error updating user' };
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

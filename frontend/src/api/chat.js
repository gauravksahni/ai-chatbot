import api from '../utils/api';

// Get chat history for the current user
export const getChatHistory = async () => {
  try {
    const response = await api.get('/chat/history');
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Error fetching chat history' };
  }
};

// Create a new chat session
export const createChatSession = async (title = null) => {
  try {
    const response = await api.post('/chat/sessions', { title });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Error creating chat session' };
  }
};

// Get a specific chat session
export const getChatSession = async sessionId => {
  try {
    const response = await api.get(`/chat/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Error fetching chat session' };
  }
};

// Update a chat session (e.g., change title)
export const updateChatSession = async (sessionId, updates) => {
  try {
    const response = await api.put(`/chat/sessions/${sessionId}`, updates);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Error updating chat session' };
  }
};

// Delete a chat session
export const deleteChatSession = async sessionId => {
  try {
    const response = await api.delete(`/chat/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Error deleting chat session' };
  }
};

// Send a message to Claude
export const sendMessage = async (message, sessionId = null) => {
  try {
    const response = await api.post('/chat/message', {
      message,
      session_id: sessionId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Error sending message' };
  }
};

// Get API status (for health checks)
export const getApiStatus = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'API is unreachable' };
  }
};

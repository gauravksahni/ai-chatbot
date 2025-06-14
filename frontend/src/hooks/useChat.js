import { useContext, useState } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import {
  createChatSession,
  updateChatSession,
  deleteChatSession,
  sendMessage as apiSendMessage,
} from '../api/chat';

// Custom hook for chat functionality
const useChat = () => {
  const context = useContext(ChatContext);
  const [loading, setLoading] = useState(false);

  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }

  // Start a new chat session
  const startNewChat = async (title = null) => {
    try {
      const session = await createChatSession(title);
      await context.selectSession(session.session_id);
      context.fetchChatHistory(); // Refresh the session list
      return { success: true, session };
    } catch (error) {
      return {
        success: false,
        error: error.detail || 'Failed to create new chat',
      };
    }
  };

  // Update session title
  const updateSessionTitle = async (sessionId, title) => {
    try {
      await updateChatSession(sessionId, { title });
      context.fetchChatHistory(); // Refresh the session list

      // Update current session if it's the one being modified
      if (context.currentSession && context.currentSession.session_id === sessionId) {
        context.selectSession(sessionId);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.detail || 'Failed to update chat title',
      };
    }
  };

  // Delete a chat session
  const deleteChat = async sessionId => {
    try {
      // Call the API to delete the session
      await deleteChatSession(sessionId);

      // Update the UI state after successful deletion
      context.fetchChatHistory(); // Refresh the session list

      // If we're deleting the currently selected session, clear it
      if (context.currentSession && context.currentSession.session_id === sessionId) {
        if (typeof context.setCurrentSession === 'function') {
          context.setCurrentSession(null);
        }
        if (typeof context.setMessages === 'function') {
          context.setMessages([]);
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.detail || 'Failed to delete chat',
      };
    }
  };

  // Add a user message to the UI immediately
  const addUserMessageToUI = message => {
    if (typeof context.setMessages !== 'function') {
      return; // Can't update UI if setMessages isn't available
    }

    const tempMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    context.setMessages(prevMessages => [...prevMessages, tempMessage]);
    return tempMessage;
  };

  // Show loading indicator in the UI
  const showLoadingIndicator = () => {
    setLoading(true);

    // If your ChatWindow component shows a "Claude is thinking..." message based on loading state,
    // you don't need anything else here. If not, you could add a temporary system message.

    // Optionally, if you want to show a specific loading message in the UI:
    if (typeof context.setMessages === 'function') {
      context.setMessages(prevMessages => [
        ...prevMessages,
        {
          id: `loading-${Date.now()}`,
          role: 'system',
          content: 'Claude is thinking...',
          isLoading: true,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  // Send a message and handle the response
  const sendMessage = async (message, sessionId = null) => {
    if (!message || !message.trim()) {
      return { success: false, error: 'Message cannot be empty' };
    }

    try {
      // Add user message to UI immediately for better UX
      const userMessage = addUserMessageToUI(message);

      // Show loading indicator
      showLoadingIndicator();

      const targetSessionId =
        sessionId || (context.currentSession ? context.currentSession.session_id : null);

      // Send the message to the API
      const response = await apiSendMessage(message, targetSessionId);

      // If this is the first message in a new session, update the session ID
      if (!targetSessionId && response.session_id && typeof context.selectSession === 'function') {
        await context.selectSession(response.session_id);
      } else if (response.session_id && typeof context.selectSession === 'function') {
        // Refresh the session to get the latest messages
        await context.selectSession(response.session_id);
      }

      // Refresh the chat history to show updated titles
      if (typeof context.fetchChatHistory === 'function') {
        context.fetchChatHistory();
      }

      setLoading(false);
      return { success: true, response, userMessage };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        error: error.detail || 'Failed to send message',
      };
    }
  };

  // Export all context values and enhanced methods
  return {
    ...context,
    loading, // This will be true while waiting for Claude's response
    startNewChat,
    updateSessionTitle,
    deleteChat,
    sendMessage,
    addUserMessageToUI,
  };
};

export default useChat;

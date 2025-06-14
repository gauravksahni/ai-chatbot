import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { getChatHistory, getChatSession, sendMessage } from '../api/chat';
import { AuthContext } from './AuthContext';
import {
  initializeWebSocket,
  sendWebSocketMessage,
  closeWebSocket,
  onMessage,
  onClose,
  isConnected,
} from '../api/websocket';

// Create the chat context
export const ChatContext = createContext();

// Chat provider component
export const ChatProvider = ({ children }) => {
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [lastUserMessageTimestamp, setLastUserMessageTimestamp] = useState(null);

  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          initializeWebSocket(token);
          setWsConnected(true);

          const unsubscribeMessage = onMessage(data => {
            if (data.error) {
              setError(data.error);
              return;
            }

            if (data.message && data.session_id) {
              if (currentSession && data.session_id === currentSession.session_id) {
                const messageId = data.message_id || `assistant-${Date.now().toString()}`;

                if (messageId === lastMessageId) {
                  console.log('Duplicate message detected, ignoring', messageId);
                  return;
                }

                setLastMessageId(messageId);

                const newMessage = {
                  id: messageId,
                  role: 'assistant',
                  content: data.message,
                  timestamp: data.timestamp || new Date().toISOString(),
                };

                setMessages(prevMessages => {
                  const reversed = [...prevMessages].reverse();
                  const lastUserIndex = reversed.findIndex(msg => msg.role === 'user');

                  if (lastUserIndex !== -1) {
                    const idx = prevMessages.length - 1 - lastUserIndex;
                    const trimmedMessages = prevMessages.slice(0, idx + 1);
                    return [...trimmedMessages, newMessage];
                  }

                  return [...prevMessages, newMessage];
                });
              }

              setChatSessions(prevSessions => {
                const sessionIndex = prevSessions.findIndex(s => s.session_id === data.session_id);
                if (sessionIndex >= 0) {
                  const updatedSessions = [...prevSessions];
                  updatedSessions[sessionIndex] = {
                    ...updatedSessions[sessionIndex],
                    updated_at: new Date().toISOString(),
                  };
                  return updatedSessions;
                }
                fetchChatHistory();
                return prevSessions;
              });
            }
          });

          const unsubscribeClose = onClose(() => {
            setWsConnected(false);
          });

          return () => {
            unsubscribeMessage();
            unsubscribeClose();
            closeWebSocket();
            setWsConnected(false);
          };
        } catch (err) {
          console.error('WebSocket initialization error:', err);
          setError('Failed to connect to chat server');
          setWsConnected(false);
        }
      }
    }
  }, [isAuthenticated, currentSession, lastMessageId]);

  const fetchChatHistory = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const history = await getChatHistory();
      setChatSessions(history.sessions || []);
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setError('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchChatHistory();
    }
  }, [isAuthenticated, fetchChatHistory]);

  const selectSession = useCallback(async sessionId => {
    if (!sessionId) {
      setCurrentSession(null);
      setMessages([]);
      setLastMessageId(null);
      setLastUserMessageTimestamp(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const session = await getChatSession(sessionId);
      setCurrentSession(session);
      setMessages(session.messages || []);

      setLastMessageId(null);
      setLastUserMessageTimestamp(null);

      if (session.messages && session.messages.length > 0) {
        const userMessages = session.messages.filter(msg => msg.role === 'user');
        if (userMessages.length > 0) {
          const lastUserMsg = userMessages[userMessages.length - 1];
          setLastUserMessageTimestamp(new Date(lastUserMsg.timestamp).getTime());
        }
      }
    } catch (err) {
      console.error('Error fetching chat session:', err);
      setError('Failed to load chat session');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendChatMessage = useCallback(
    async (messageText, sessionId = null) => {
      if (!messageText.trim()) return;

      const useSessionId = sessionId || currentSession?.session_id || null;
      const messageTimestamp = new Date().toISOString();
      setLastUserMessageTimestamp(new Date(messageTimestamp).getTime());

      const userMessage = {
        id: `user-${Date.now().toString()}`,
        role: 'user',
        content: messageText,
        timestamp: messageTimestamp,
      };

      setMessages(prevMessages => [...prevMessages, userMessage]);
      setLastMessageId(null);

      try {
        if (wsConnected && isConnected()) {
          sendWebSocketMessage(messageText, useSessionId);
        } else {
          setLoading(true);
          const response = await sendMessage(messageText, useSessionId);

          if (!currentSession || !useSessionId) {
            await fetchChatHistory();
            await selectSession(response.session_id);
          } else {
            const assistantMessage = {
              id: `assistant-${Date.now().toString()}`,
              role: 'assistant',
              content: response.message,
              timestamp: new Date().toISOString(),
            };

            setMessages(prevMessages => {
              const reversed = [...prevMessages].reverse();
              const lastUserIndex = reversed.findIndex(msg => msg.role === 'user');
              if (lastUserIndex !== -1) {
                const idx = prevMessages.length - 1 - lastUserIndex;
                const trimmedMessages = prevMessages.slice(0, idx + 1);
                return [...trimmedMessages, assistantMessage];
              }
              return [...prevMessages, assistantMessage];
            });

            setLastMessageId(assistantMessage.id);
          }
        }
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Failed to send message');
      } finally {
        setLoading(false);
      }
    },
    [currentSession, wsConnected, fetchChatHistory, selectSession]
  );

  const startNewChat = useCallback(async () => {
    setCurrentSession(null);
    setMessages([]);
    setLastMessageId(null);
    setLastUserMessageTimestamp(null);
    return true;
  }, []);

  const value = {
    chatSessions,
    currentSession,
    messages,
    loading,
    error,
    wsConnected,
    fetchChatHistory,
    selectSession,
    sendMessage: sendChatMessage,
    startNewChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatProvider;

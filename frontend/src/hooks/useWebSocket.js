import { useState, useEffect, useRef } from 'react';
import {
  initializeWebSocket,
  sendWebSocketMessage,
  onMessage,
  onError,
  onClose,
  onOpen,
  isConnected,
} from '../api/websocket';

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const HEARTBEAT_PAYLOAD = '__ping__';

const useWebSocket = token => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);

  const retryCount = useRef(0);
  const reconnectTimeout = useRef(null);
  const heartbeatInterval = useRef(null);
  const isManuallyClosed = useRef(false);

  const setupListeners = () => {
    const messageUnsubscribe = onMessage(data => {
      if (data === '__pong__') return;
      setLastMessage(data);
    });

    const errorUnsubscribe = onError(err => {
      console.error('WebSocket error:', err);
      setError('WebSocket error');
      setConnected(false);
    });

    const closeUnsubscribe = onClose(() => {
      console.warn('WebSocket closed');
      setConnected(false);

      if (!isManuallyClosed.current) {
        attemptReconnect();
      }
    });

    const openUnsubscribe = onOpen(() => {
      console.log('WebSocket opened');
      setConnected(true);
      setError(null);
      retryCount.current = 0;
    });

    return () => {
      messageUnsubscribe();
      errorUnsubscribe();
      closeUnsubscribe();
      openUnsubscribe();
    };
  };

  const attemptReconnect = () => {
    if (retryCount.current >= MAX_RETRIES) {
      console.error('Max reconnect attempts reached');
      return;
    }

    const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount.current);
    console.log(`Reconnecting in ${delay / 1000}s...`);
    reconnectTimeout.current = setTimeout(() => {
      retryCount.current++;
      initializeWebSocket(token);
    }, delay);
  };

  const startHeartbeat = () => {
    stopHeartbeat(); // prevent duplicates
    heartbeatInterval.current = setInterval(() => {
      if (isConnected()) {
        sendWebSocketMessage(HEARTBEAT_PAYLOAD);
      }
    }, HEARTBEAT_INTERVAL);
  };

  const stopHeartbeat = () => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
  };

  useEffect(() => {
    if (!token) return;

    console.log('Initializing WebSocket with token:', token.slice(0, 10) + '...');
    isManuallyClosed.current = false;

    initializeWebSocket(token);
    const cleanupListeners = setupListeners();
    startHeartbeat();

    setConnected(isConnected());

    return () => {
      console.log('Cleaning up WebSocket listeners...');
      cleanupListeners();
      stopHeartbeat();
      clearTimeout(reconnectTimeout.current);
      isManuallyClosed.current = true;
    };
  }, [token]);

  const sendMessage = (message, sessionId = null) => {
    if (!connected) {
      console.error('Cannot send message: WebSocket not connected');
      setError('WebSocket not connected');
      return false;
    }

    try {
      sendWebSocketMessage(message, sessionId);
      return true;
    } catch (err) {
      console.error('Send error:', err);
      setError('Failed to send message');
      return false;
    }
  };

  return {
    connected,
    error,
    lastMessage,
    sendMessage,
  };
};

export default useWebSocket;

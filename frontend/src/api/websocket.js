// WebSocket connection management
let websocket = null;
let messageCallbacks = [];
let errorCallbacks = [];
let closeCallbacks = [];
let openCallbacks = [];
let reconnectAttempts = 0;
let reconnectInterval = null;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL_MS = 3000;

export const WS_BASE_URL = process.env.REACT_APP_WS_BASE_URL;

// Initialize WebSocket connection
export const initializeWebSocket = token => {
  if (websocket) {
    websocket.close();
  }

  // Create a new WebSocket connection
  // Important: This URL must match the FastAPI WebSocket endpoint
  const wsUrl = `${WS_BASE_URL}/chat/ws/${token}`;
  console.log('Connecting to WebSocket at:', wsUrl);
  websocket = new WebSocket(wsUrl);

  websocket.onopen = event => {
    console.log('WebSocket connection established');
    reconnectAttempts = 0;
    clearInterval(reconnectInterval);
    openCallbacks.forEach(callback => callback(event));
  };

  websocket.onmessage = event => {
    try {
      const data = JSON.parse(event.data);
      messageCallbacks.forEach(callback => callback(data));
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  websocket.onerror = event => {
    console.error('WebSocket error:', event);
    errorCallbacks.forEach(callback => callback(event));
  };

  websocket.onclose = event => {
    console.log('WebSocket connection closed');
    closeCallbacks.forEach(callback => callback(event));

    // Attempt to reconnect if the close wasn't clean and we haven't exceeded max attempts
    if (!event.wasClean && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);

      reconnectInterval = setTimeout(() => {
        initializeWebSocket(token);
      }, RECONNECT_INTERVAL_MS);
    }
  };

  return websocket;
};

// Send a message through the WebSocket
export const sendWebSocketMessage = (message, sessionId = null) => {
  if (!websocket || websocket.readyState !== WebSocket.OPEN) {
    throw new Error('WebSocket is not connected');
  }

  const payload = {
    message,
    session_id: sessionId,
  };

  websocket.send(JSON.stringify(payload));
};

// Close the WebSocket connection
export const closeWebSocket = () => {
  if (websocket) {
    websocket.close();
    websocket = null;
  }
};

// Event listeners
export const onMessage = callback => {
  messageCallbacks.push(callback);
  return () => {
    messageCallbacks = messageCallbacks.filter(cb => cb !== callback);
  };
};

export const onError = callback => {
  errorCallbacks.push(callback);
  return () => {
    errorCallbacks = errorCallbacks.filter(cb => cb !== callback);
  };
};

export const onClose = callback => {
  closeCallbacks.push(callback);
  return () => {
    closeCallbacks = closeCallbacks.filter(cb => cb !== callback);
  };
};

export const onOpen = callback => {
  openCallbacks.push(callback);
  return () => {
    openCallbacks = openCallbacks.filter(cb => cb !== callback);
  };
};

// Check if WebSocket is connected
export const isConnected = () => {
  return websocket && websocket.readyState === WebSocket.OPEN;
};

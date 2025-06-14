/**
 * Utility for building WebSocket URLs
 */

/**
 * Builds a WebSocket URL using the environment variable and current host
 *
 * @param {string} path - The path to append to the WebSocket URL
 * @returns {string} - The complete WebSocket URL
 */
export const buildWebSocketUrl = path => {
  const baseUrl = process.env.REACT_APP_WS_BASE_URL;

  // If we're in development, use the full URL from env
  if (process.env.NODE_ENV === 'development') {
    return `${baseUrl}${path}`;
  }

  // In production, use the current host
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}${path}`;
};

export default buildWebSocketUrl;

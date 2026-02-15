import morgan from 'morgan';
import logger from '../config/logger.js';

// Custom token for user ID
morgan.token('user-id', (req) => {
  return req.user?.id || 'anonymous';
});

// Custom token for user role
morgan.token('user-role', (req) => {
  return req.user?.role || 'guest';
});

// Define custom format
const morganFormat = ':remote-addr - :user-id [:user-role] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

// Create Morgan middleware
const httpLogger = morgan(morganFormat, {
  stream: logger.stream,
  skip: (req) => {
    // Skip logging for health check endpoints
    return req.url === '/health' || req.url === '/api/health';
  },
});

export default httpLogger;

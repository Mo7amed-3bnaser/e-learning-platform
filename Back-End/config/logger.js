import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define console format (more readable for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Define which transports to use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
  }),
  
  // Error log file
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/error.log'),
    level: 'error',
    format,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/combined.log'),
    format,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // HTTP requests log file
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/http.log'),
    level: 'http',
    format,
    maxsize: 5242880, // 5MB
    maxFiles: 3,
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/exceptions.log'),
      maxsize: 5242880,
      maxFiles: 3,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/rejections.log'),
      maxsize: 5242880,
      maxFiles: 3,
    }),
  ],
});

// Create a stream object for Morgan HTTP logger
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

export default logger;

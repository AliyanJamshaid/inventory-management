/**
 * Winston Logger Configuration
 * Provides comprehensive logging capabilities with both console and file outputs
 */

import winston from 'winston';
import path from 'path';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }

    return msg;
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

/**
 * Winston logger instance
 * Logs to both console and files (error.log and combined.log)
 */
const logger = winston.createLogger({
  level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'inventory-management-api' },
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write error logs to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
    }),
  ],
});

// Add console transport in non-production environments
if (process.env['NODE_ENV'] !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
} else {
  // In production, still log to console but with JSON format
  logger.add(
    new winston.transports.Console({
      format: logFormat,
    })
  );
}

/**
 * Helper function to create a child logger with additional metadata
 * @param metadata - Additional metadata to include in all logs
 */
export const createChildLogger = (metadata: Record<string, any>) => {
  return logger.child(metadata);
};

/**
 * Log HTTP request information
 * @param method - HTTP method
 * @param url - Request URL
 * @param statusCode - Response status code
 * @param duration - Request duration in ms
 */
export const logRequest = (
  method: string,
  url: string,
  statusCode: number,
  duration: number
) => {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  logger.log(level, `${method} ${url} ${statusCode} - ${duration}ms`);
};

/**
 * Log database operations
 * @param operation - Database operation type
 * @param collection - Collection/table name
 * @param details - Additional details
 */
export const logDatabase = (
  operation: string,
  collection: string,
  details?: Record<string, any>
) => {
  logger.info(`Database ${operation}`, {
    collection,
    ...details,
  });
};

/**
 * Log authentication events
 * @param event - Authentication event type
 * @param userId - User ID
 * @param details - Additional details
 */
export const logAuth = (
  event: string,
  userId?: string,
  details?: Record<string, any>
) => {
  logger.info(`Auth: ${event}`, {
    userId,
    ...details,
  });
};

/**
 * Log error with context
 * @param error - Error object or message
 * @param context - Additional context
 */
export const logError = (
  error: Error | string,
  context?: Record<string, any>
) => {
  if (error instanceof Error) {
    logger.error(error.message, {
      stack: error.stack,
      ...context,
    });
  } else {
    logger.error(error, context);
  }
};

export default logger;

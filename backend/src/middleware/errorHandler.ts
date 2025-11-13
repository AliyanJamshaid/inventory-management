/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { sendError, sendValidationError } from '../utils/responses';
import { logError } from '../utils/logger';
import { ErrorCode } from '../types';
import config from '../config/config';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  statusCode: number;
  errorCode: ErrorCode;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Mongoose validation errors
 */
const handleValidationError = (
  error: MongooseError.ValidationError,
  res: Response
): Response => {
  const errors = Object.values(error.errors).map((err) => ({
    field: err.path,
    message: err.message,
  }));

  return sendValidationError(res, errors, 'Validation failed');
};

/**
 * Handle Mongoose cast errors (invalid ObjectId, etc.)
 */
const handleCastError = (
  error: MongooseError.CastError,
  res: Response
): Response => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return sendError(res, message, 400);
};

/**
 * Handle duplicate key errors (MongoDB E11000)
 */
const handleDuplicateKeyError = (error: any, res: Response): Response => {
  const keyValue = error.keyValue || {};
  const field = Object.keys(keyValue)[0];
  const value = field ? keyValue[field] : undefined;
  const message = field
    ? `Duplicate value for field '${field}': ${value}`
    : 'Duplicate entry detected';

  return sendError(res, message, 409);
};

/**
 * Handle JWT errors
 */
const handleJWTError = (res: Response): Response => {
  return sendError(res, 'Invalid token. Please log in again.', 401);
};

/**
 * Handle JWT expired errors
 */
const handleJWTExpiredError = (res: Response): Response => {
  return sendError(res, 'Token expired. Please log in again.', 401);
};

/**
 * Send error response in development mode (includes stack trace)
 */
const sendErrorDev = (error: any, res: Response): Response => {
  logError(error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: error,
    stack: error.stack,
    errorCode: error.errorCode || ErrorCode.INTERNAL_ERROR,
  });
};

/**
 * Send error response in production mode (sanitized)
 */
const sendErrorProd = (error: any, res: Response): Response => {
  // Operational, trusted error: send message to client
  if (error.isOperational) {
    return sendError(res, error.message, error.statusCode);
  }

  // Programming or unknown error: don't leak error details
  logError(error, { isOperational: false });

  return sendError(
    res,
    'An unexpected error occurred. Please try again later.',
    500
  );
};

/**
 * Global error handling middleware
 * Must have 4 parameters to be recognized as error middleware by Express
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
): Response | void => {
  // Set default status code and error code
  error.statusCode = error.statusCode || 500;
  error.errorCode = error.errorCode || ErrorCode.INTERNAL_ERROR;

  // Log the error
  logError(error, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return handleValidationError(error, res);
  }

  if (error.name === 'CastError') {
    return handleCastError(error, res);
  }

  if (error.code === 11000) {
    return handleDuplicateKeyError(error, res);
  }

  if (error.name === 'JsonWebTokenError') {
    return handleJWTError(res);
  }

  if (error.name === 'TokenExpiredError') {
    return handleJWTExpiredError(res);
  }

  // Send appropriate error response based on environment
  if (config.nodeEnv === 'development') {
    return sendErrorDev(error, res);
  }

  return sendErrorProd(error, res);
};

/**
 * Handle 404 - Not Found errors
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = new ApiError(
    `Cannot find ${req.originalUrl} on this server`,
    404,
    ErrorCode.NOT_FOUND
  );
  next(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass them to error middleware
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;

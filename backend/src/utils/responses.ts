/**
 * Standard API Response Utilities
 * Provides consistent response formatting across all API endpoints
 */

import { Response } from 'express';
import { IApiResponse } from '../types';

/**
 * Send success response
 * @param res - Express response object
 * @param data - Response data
 * @param message - Success message
 * @param statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): Response => {
  const response: IApiResponse<T> = {
    success: true,
    message,
    data,
  };

  return res.status(statusCode).json(response);
};

/**
 * Send success response with pagination metadata
 * @param res - Express response object
 * @param data - Response data
 * @param meta - Pagination metadata
 * @param message - Success message
 * @param statusCode - HTTP status code (default: 200)
 */
export const sendSuccessWithPagination = <T>(
  res: Response,
  data: T,
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message: string = 'Success',
  statusCode: number = 200
): Response => {
  const response: IApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param res - Express response object
 * @param error - Error message
 * @param statusCode - HTTP status code (default: 500)
 * @param errors - Array of field-specific errors
 */
export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 500,
  errors?: Array<{ field: string; message: string }>
): Response => {
  const response: IApiResponse = {
    success: false,
    message: 'Error',
    error,
    ...(errors && { errors }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Send validation error response
 * @param res - Express response object
 * @param errors - Array of validation errors
 * @param message - Error message
 */
export const sendValidationError = (
  res: Response,
  errors: Array<{ field: string; message: string }>,
  message: string = 'Validation failed'
): Response => {
  const response: IApiResponse = {
    success: false,
    message,
    errors,
  };

  return res.status(400).json(response);
};

/**
 * Send not found response
 * @param res - Express response object
 * @param message - Not found message
 */
export const sendNotFound = (
  res: Response,
  message: string = 'Resource not found'
): Response => {
  return sendError(res, message, 404);
};

/**
 * Send unauthorized response
 * @param res - Express response object
 * @param message - Unauthorized message
 */
export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized access'
): Response => {
  return sendError(res, message, 401);
};

/**
 * Send forbidden response
 * @param res - Express response object
 * @param message - Forbidden message
 */
export const sendForbidden = (
  res: Response,
  message: string = 'Access forbidden'
): Response => {
  return sendError(res, message, 403);
};

/**
 * Send bad request response
 * @param res - Express response object
 * @param message - Bad request message
 */
export const sendBadRequest = (
  res: Response,
  message: string = 'Bad request'
): Response => {
  return sendError(res, message, 400);
};

/**
 * Send created response
 * @param res - Express response object
 * @param data - Created resource data
 * @param message - Success message
 */
export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): Response => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Send no content response
 * @param res - Express response object
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

/**
 * Send conflict response
 * @param res - Express response object
 * @param message - Conflict message
 */
export const sendConflict = (
  res: Response,
  message: string = 'Resource already exists'
): Response => {
  return sendError(res, message, 409);
};

/**
 * Send internal server error response
 * @param res - Express response object
 * @param message - Error message
 */
export const sendInternalError = (
  res: Response,
  message: string = 'Internal server error'
): Response => {
  return sendError(res, message, 500);
};

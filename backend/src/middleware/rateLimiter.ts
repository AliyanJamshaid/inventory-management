/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse by limiting request rates
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import config from '../config/config';
import logger from '../utils/logger';
import { sendError } from '../utils/responses';

/**
 * Custom rate limit handler
 */
const rateLimitHandler = (req: Request, res: Response): Response => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    url: req.url,
    method: req.method,
  });

  return sendError(
    res,
    'Too many requests from this IP, please try again later.',
    429
  );
};

/**
 * General API rate limiter
 * Applies to all API routes
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindow, // Time window in milliseconds
  max: config.rateLimitMax, // Maximum number of requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: rateLimitHandler,
  skip: (req: Request) => {
    // Skip rate limiting for health check endpoint
    return req.path === '/health' || req.path === '/api/v1/health';
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * More restrictive to prevent brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true, // Only count failed login attempts
});

/**
 * Strict rate limiter for password reset endpoints
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per window
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * Rate limiter for resource creation endpoints
 * Prevents spam and abuse
 */
export const createResourceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: 'Too many creation requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * Rate limiter for file upload endpoints
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per window
  message: 'Too many upload requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * Rate limiter for data export endpoints
 */
export const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 exports per window
  message: 'Too many export requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

export default {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  createResourceLimiter,
  uploadLimiter,
  exportLimiter,
};

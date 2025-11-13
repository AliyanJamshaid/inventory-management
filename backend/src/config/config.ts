/**
 * Application Configuration
 * Centralizes all environment variables and configuration settings
 */

import dotenv from 'dotenv';
import path from 'path';
import { IConfig } from '../types';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Validates that all required environment variables are set
 * @throws Error if any required variable is missing
 */
const validateEnv = (): void => {
  const required = [
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'NODE_ENV',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

// Validate environment variables
validateEnv();

/**
 * Application configuration object
 * All configuration values are accessed through this object
 */
const config: IConfig = {
  // Server configuration
  port: parseInt(process.env['PORT'] || '5000', 10),
  nodeEnv: process.env['NODE_ENV'] || 'development',

  // Database configuration
  mongoUri: process.env['MONGODB_URI'] || '',

  // JWT configuration
  jwtSecret: process.env['JWT_SECRET'] || '',
  jwtRefreshSecret: process.env['JWT_REFRESH_SECRET'] || '',
  jwtExpire: process.env['JWT_EXPIRE'] || '15m',
  jwtRefreshExpire: process.env['JWT_REFRESH_EXPIRE'] || '7d',

  // CORS configuration
  corsOrigin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',

  // Rate limiting configuration
  rateLimitWindow: parseInt(process.env['RATE_LIMIT_WINDOW'] || '900000', 10), // 15 minutes
  rateLimitMax: parseInt(process.env['RATE_LIMIT_MAX'] || '100', 10), // 100 requests per window
};

/**
 * Check if application is in production mode
 */
export const isProduction = (): boolean => {
  return config.nodeEnv === 'production';
};

/**
 * Check if application is in development mode
 */
export const isDevelopment = (): boolean => {
  return config.nodeEnv === 'development';
};

/**
 * Check if application is in test mode
 */
export const isTest = (): boolean => {
  return config.nodeEnv === 'test';
};

export default config;

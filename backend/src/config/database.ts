/**
 * MongoDB Database Configuration
 * Handles database connection with retry logic and connection pooling
 */

import mongoose from 'mongoose';
import config from './config';
import logger, { logDatabase, logError } from '../utils/logger';
import { DatabaseStatus } from '../types';

// Connection options for MongoDB
const options: mongoose.ConnectOptions = {
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 5, // Minimum number of connections in the pool
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  serverSelectionTimeoutMS: 5000, // Timeout for initial server selection
  family: 4, // Use IPv4, skip trying IPv6
};

// Track connection status
let connectionStatus: DatabaseStatus = DatabaseStatus.DISCONNECTED;

/**
 * Get current database connection status
 */
export const getConnectionStatus = (): DatabaseStatus => {
  return connectionStatus;
};

/**
 * Connect to MongoDB with retry logic
 * @param retries - Number of retry attempts (default: 5)
 * @param delay - Delay between retries in milliseconds (default: 5000)
 */
export const connectDatabase = async (
  retries: number = 5,
  delay: number = 5000
): Promise<void> => {
  let attempt = 0;

  while (attempt < retries) {
    try {
      attempt++;
      connectionStatus = DatabaseStatus.CONNECTING;

      logger.info(`Attempting to connect to MongoDB (Attempt ${attempt}/${retries})...`);

      await mongoose.connect(config.mongoUri, options);

      connectionStatus = DatabaseStatus.CONNECTED;
      logger.info('MongoDB connected successfully');
      logDatabase('connect', 'MongoDB', {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      });

      return;
    } catch (error) {
      connectionStatus = DatabaseStatus.ERROR;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error(`MongoDB connection attempt ${attempt} failed: ${errorMessage}`);

      if (attempt === retries) {
        logError(
          new Error('Failed to connect to MongoDB after all retry attempts'),
          { attempts: retries }
        );
        throw new Error(`Failed to connect to MongoDB: ${errorMessage}`);
      }

      logger.info(`Retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

/**
 * Disconnect from MongoDB gracefully
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    connectionStatus = DatabaseStatus.DISCONNECTED;
    logger.info('MongoDB disconnected successfully');
    logDatabase('disconnect', 'MongoDB');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(new Error(`Error disconnecting from MongoDB: ${errorMessage}`));
    throw error;
  }
};

/**
 * Setup database event listeners
 */
export const setupDatabaseListeners = (): void => {
  // Connection successful
  mongoose.connection.on('connected', () => {
    connectionStatus = DatabaseStatus.CONNECTED;
    logger.info('Mongoose connected to MongoDB');
  });

  // Connection error
  mongoose.connection.on('error', (error) => {
    connectionStatus = DatabaseStatus.ERROR;
    logError(new Error('Mongoose connection error'), { error: error.message });
  });

  // Connection disconnected
  mongoose.connection.on('disconnected', () => {
    connectionStatus = DatabaseStatus.DISCONNECTED;
    logger.warn('Mongoose disconnected from MongoDB');
  });

  // Handle application termination
  process.on('SIGINT', async () => {
    try {
      await disconnectDatabase();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    } catch (error) {
      logger.error('Error closing MongoDB connection on app termination');
      process.exit(1);
    }
  });

  // Handle nodemon restarts
  process.once('SIGUSR2', async () => {
    try {
      await disconnectDatabase();
      logger.info('MongoDB connection closed through nodemon restart');
      process.kill(process.pid, 'SIGUSR2');
    } catch (error) {
      logger.error('Error closing MongoDB connection on nodemon restart');
    }
  });
};

/**
 * Check if database is connected
 */
export const isDatabaseConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async (): Promise<any> => {
  try {
    if (!isDatabaseConnected()) {
      throw new Error('Database not connected');
    }

    const stats = await mongoose.connection.db?.stats();
    return stats;
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to get database stats'));
    throw error;
  }
};

export default {
  connectDatabase,
  disconnectDatabase,
  setupDatabaseListeners,
  isDatabaseConnected,
  getDatabaseStats,
  getConnectionStatus,
};

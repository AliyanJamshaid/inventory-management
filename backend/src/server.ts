/**
 * Express Server Entry Point
 * Configures and starts the Express application with all middleware and routes
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import fs from 'fs';

// Configuration imports
import config from './config/config';
import {
  connectDatabase,
  setupDatabaseListeners,
  isDatabaseConnected,
} from './config/database';

// Middleware imports
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

// Utility imports
import logger, { logRequest } from './utils/logger';
import { sendSuccess } from './utils/responses';

// Route imports
import routes from './routes';

// Job imports
import { scheduleRateUpdates } from './jobs/currencyRateUpdater';

/**
 * Create Express application
 */
const app: Application = express();

/**
 * Security Middleware
 */

// Helmet - Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/**
 * General Middleware
 */

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Request logging middleware (Morgan + Winston)
const morganFormat = config.nodeEnv === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  })
);

// Custom request logging middleware
app.use((req: Request, res: Response, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logRequest(req.method, req.url, res.statusCode, duration);
  });

  next();
});

// Rate limiting middleware
app.use('/api', apiLimiter);

/**
 * Swagger API Documentation Configuration
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inventory Management System API',
      version: '1.0.0',
      description:
        'Enterprise-grade Inventory Management System REST API with TypeScript, Express, and MongoDB',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: 'Development server',
      },
      {
        url: 'https://api.example.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'], // Path to API docs
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

// Swagger UI endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

/**
 * Health Check Endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    database: isDatabaseConnected() ? 'Connected' : 'Disconnected',
  };

  sendSuccess(res, healthStatus, 'Service is healthy');
});

/**
 * Root Endpoint
 */
app.get('/', (_req: Request, res: Response) => {
  sendSuccess(
    res,
    {
      message: 'Inventory Management System API',
      version: '1.0.0',
      documentation: '/api-docs',
      health: '/health',
    },
    'Welcome to the Inventory Management System API'
  );
});

/**
 * API Routes
 * All routes are mounted under /api/v1
 */
app.use('/api/v1', routes);

/**
 * API v1 Health Check
 */
app.get('/api/v1/health', (_req: Request, res: Response) => {
  sendSuccess(res, { status: 'OK' }, 'API v1 is healthy');
});

/**
 * Error Handling
 */

// 404 Not Found handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

/**
 * Create logs directory if it doesn't exist
 */
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Start Server
 */
const startServer = async (): Promise<void> => {
  try {
    // Setup database event listeners
    setupDatabaseListeners();

    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await connectDatabase();

    // Start scheduled jobs
    logger.info('Starting scheduled jobs...');
    scheduleRateUpdates();

    // Start Express server
    app.listen(config.port, () => {
      logger.info(`=================================`);
      logger.info(`Server running in ${config.nodeEnv} mode`);
      logger.info(`Server listening on port ${config.port}`);
      logger.info(`API Documentation: http://localhost:${config.port}/api-docs`);
      logger.info(`Health Check: http://localhost:${config.port}/health`);
      logger.info(`=================================`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful Shutdown Handler
 */
const gracefulShutdown = (signal: string): void => {
  logger.info(`${signal} signal received: closing HTTP server`);

  // Close server and database connections
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;

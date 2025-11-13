/**
 * System Controller
 * Example controller demonstrating the application structure
 * Handles system-level operations like health checks and status
 */

import { Request, Response } from 'express';
import { sendSuccess } from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import { isDatabaseConnected, getDatabaseStats } from '../config/database';
import config from '../config/config';
import logger from '../utils/logger';

/**
 * @swagger
 * /system/status:
 *   get:
 *     summary: Get detailed system status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */
export const getSystemStatus = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    logger.info('System status requested');

    const status = {
      server: {
        status: 'running',
        environment: config.nodeEnv,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
      database: {
        connected: isDatabaseConnected(),
        status: isDatabaseConnected() ? 'connected' : 'disconnected',
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
      api: {
        version: '1.0.0',
        documentation: '/api-docs',
      },
    };

    sendSuccess(res, status, 'System status retrieved successfully');
  }
);

/**
 * @swagger
 * /system/database:
 *   get:
 *     summary: Get database statistics
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export const getDatabaseStatus = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    logger.info('Database status requested');

    if (!isDatabaseConnected()) {
      sendSuccess(
        res,
        { connected: false },
        'Database is not connected',
        200
      );
      return;
    }

    const stats = await getDatabaseStats();

    sendSuccess(
      res,
      {
        connected: true,
        stats,
      },
      'Database statistics retrieved successfully'
    );
  }
);

export default {
  getSystemStatus,
  getDatabaseStatus,
};

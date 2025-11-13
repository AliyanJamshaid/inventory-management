/**
 * System Routes
 * Example routes demonstrating the application structure
 */

import { Router } from 'express';
import { getSystemStatus, getDatabaseStatus } from '../controllers/systemController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: System
 *   description: System management and monitoring endpoints
 */

/**
 * GET /api/v1/system/status
 * Public endpoint - Get system status
 */
router.get('/status', getSystemStatus);

/**
 * GET /api/v1/system/database
 * Protected endpoint - Get database statistics
 * Requires authentication and admin role
 */
router.get('/database', authenticate, isAdmin, getDatabaseStatus);

export default router;

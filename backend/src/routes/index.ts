/**
 * Routes Index
 * Central location for all API routes
 */

import { Router } from 'express';
import systemRoutes from './systemRoutes';

const router = Router();

/**
 * Mount all route modules
 */
router.use('/system', systemRoutes);

// Add more routes here as you create them
// Example:
// router.use('/users', userRoutes);
// router.use('/inventory', inventoryRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/suppliers', supplierRoutes);
// router.use('/orders', orderRoutes);
// router.use('/reports', reportRoutes);

export default router;

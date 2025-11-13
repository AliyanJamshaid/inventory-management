/**
 * Warehouse Routes
 * Routes for warehouse management
 */

import { Router } from 'express';
import {
  getAllWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseStock,
} from '../controllers/warehouseController';
import { authenticate, isAdminOrManager } from '../middleware/auth';
import { validateObjectId, validatePagination } from '../middleware/validate';

const router = Router();

/**
 * GET /api/v1/warehouses
 * Get all warehouses
 * Public endpoint - all authenticated users can view
 */
router.get('/', authenticate, validatePagination, getAllWarehouses);

/**
 * GET /api/v1/warehouses/:id
 * Get warehouse by ID
 * Public endpoint - all authenticated users can view
 */
router.get('/:id', authenticate, validateObjectId('id'), getWarehouseById);

/**
 * POST /api/v1/warehouses
 * Create new warehouse
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.post('/', authenticate, isAdminOrManager, createWarehouse);

/**
 * PUT /api/v1/warehouses/:id
 * Update warehouse
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.put(
  '/:id',
  authenticate,
  isAdminOrManager,
  validateObjectId('id'),
  updateWarehouse
);

/**
 * DELETE /api/v1/warehouses/:id
 * Delete warehouse
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.delete(
  '/:id',
  authenticate,
  isAdminOrManager,
  validateObjectId('id'),
  deleteWarehouse
);

/**
 * GET /api/v1/warehouses/:id/stock
 * Get stock in warehouse
 * Public endpoint - all authenticated users can view
 */
router.get(
  '/:id/stock',
  authenticate,
  validateObjectId('id'),
  validatePagination,
  getWarehouseStock
);

export default router;

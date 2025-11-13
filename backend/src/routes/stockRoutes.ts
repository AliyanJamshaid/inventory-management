/**
 * Stock Routes
 * Routes for stock management and inventory operations
 */

import { Router } from 'express';
import {
  getAllStock,
  getStockById,
  adjustStock,
  transferStock,
  getLowStock,
  getExpiringStock,
  getProductStock,
  reserveStock,
  releaseStock,
} from '../controllers/stockController';
import { authenticate, isAdminOrManager, isStaffOrAbove } from '../middleware/auth';
import { validateObjectId, validatePagination, validateRequest } from '../middleware/validate';
import {
  adjustStockValidator,
  transferStockValidator,
  reserveStockValidator,
  releaseStockValidator,
  expiringStockValidator,
} from '../validators/stockValidators';

const router = Router();

/**
 * GET /api/v1/stock/low
 * Get low stock items
 * Must be before /:id route to avoid conflict
 */
router.get('/low', authenticate, getLowStock);

/**
 * GET /api/v1/stock/expiring
 * Get expiring items
 * Must be before /:id route to avoid conflict
 */
router.get(
  '/expiring',
  authenticate,
  expiringStockValidator,
  validateRequest(expiringStockValidator),
  getExpiringStock
);

/**
 * GET /api/v1/stock/product/:productId
 * Get stock for specific product
 */
router.get(
  '/product/:productId',
  authenticate,
  validateObjectId('productId'),
  getProductStock
);

/**
 * GET /api/v1/stock
 * Get all stock (with filters)
 * Public endpoint - all authenticated users can view
 */
router.get('/', authenticate, validatePagination, getAllStock);

/**
 * GET /api/v1/stock/:id
 * Get stock by ID
 * Public endpoint - all authenticated users can view
 */
router.get('/:id', authenticate, validateObjectId('id'), getStockById);

/**
 * POST /api/v1/stock/adjust
 * Adjust stock quantity
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.post(
  '/adjust',
  authenticate,
  isAdminOrManager,
  adjustStockValidator,
  validateRequest(adjustStockValidator),
  adjustStock
);

/**
 * POST /api/v1/stock/transfer
 * Transfer stock between warehouses
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.post(
  '/transfer',
  authenticate,
  isAdminOrManager,
  transferStockValidator,
  validateRequest(transferStockValidator),
  transferStock
);

/**
 * POST /api/v1/stock/reserve
 * Reserve stock
 * Protected endpoint - requires STAFF or above
 */
router.post(
  '/reserve',
  authenticate,
  isStaffOrAbove,
  reserveStockValidator,
  validateRequest(reserveStockValidator),
  reserveStock
);

/**
 * POST /api/v1/stock/release
 * Release reserved stock
 * Protected endpoint - requires STAFF or above
 */
router.post(
  '/release',
  authenticate,
  isStaffOrAbove,
  releaseStockValidator,
  validateRequest(releaseStockValidator),
  releaseStock
);

export default router;

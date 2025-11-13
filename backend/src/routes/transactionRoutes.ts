/**
 * Stock Transaction Routes
 * Routes for stock transaction history and reporting
 */

import { Router } from 'express';
import {
  getAllTransactions,
  getTransactionById,
  getProductTransactions,
  getWarehouseTransactions,
  getTransactionSummary,
} from '../controllers/transactionController';
import { authenticate } from '../middleware/auth';
import { validateObjectId, validatePagination } from '../middleware/validate';

const router = Router();

/**
 * GET /api/v1/transactions/summary
 * Get transaction summary/statistics
 * Must be before /:id route to avoid conflict
 */
router.get('/summary', authenticate, getTransactionSummary);

/**
 * GET /api/v1/transactions/product/:productId
 * Get transactions for a product
 */
router.get(
  '/product/:productId',
  authenticate,
  validateObjectId('productId'),
  validatePagination,
  getProductTransactions
);

/**
 * GET /api/v1/transactions/warehouse/:warehouseId
 * Get transactions for a warehouse
 */
router.get(
  '/warehouse/:warehouseId',
  authenticate,
  validateObjectId('warehouseId'),
  validatePagination,
  getWarehouseTransactions
);

/**
 * GET /api/v1/transactions
 * Get all transactions
 * Public endpoint - all authenticated users can view
 */
router.get('/', authenticate, validatePagination, getAllTransactions);

/**
 * GET /api/v1/transactions/:id
 * Get transaction by ID
 * Public endpoint - all authenticated users can view
 */
router.get('/:id', authenticate, validateObjectId('id'), getTransactionById);

export default router;

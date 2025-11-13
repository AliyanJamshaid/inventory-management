/**
 * Supplier Routes
 * Defines all supplier-related API endpoints
 */

import { Router } from 'express';
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierPurchaseOrders,
  getSupplierPerformance,
} from '../controllers/supplierController';
import {
  createSupplierValidators,
  updateSupplierValidators,
  supplierIdValidator,
  supplierQueryValidators,
} from '../validators/supplierValidators';
import { authenticate, isAdmin, isAdminOrManager } from '../middleware/auth';
import { validateRequest, validatePagination } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/suppliers
 * @desc    Get all suppliers with pagination and filtering
 * @access  Private
 */
router.get(
  '/',
  validatePagination,
  validateRequest(supplierQueryValidators),
  getAllSuppliers
);

/**
 * @route   GET /api/v1/suppliers/:id
 * @desc    Get supplier by ID
 * @access  Private
 */
router.get(
  '/:id',
  validateRequest(supplierIdValidator),
  getSupplierById
);

/**
 * @route   GET /api/v1/suppliers/:id/purchase-orders
 * @desc    Get supplier purchase orders
 * @access  Private
 */
router.get(
  '/:id/purchase-orders',
  validateRequest(supplierIdValidator),
  validatePagination,
  getSupplierPurchaseOrders
);

/**
 * @route   GET /api/v1/suppliers/:id/performance
 * @desc    Get supplier performance metrics
 * @access  Private
 */
router.get(
  '/:id/performance',
  validateRequest(supplierIdValidator),
  getSupplierPerformance
);

/**
 * @route   POST /api/v1/suppliers
 * @desc    Create new supplier
 * @access  Private (Admin/Manager)
 */
router.post(
  '/',
  isAdminOrManager,
  validateRequest(createSupplierValidators),
  createSupplier
);

/**
 * @route   PUT /api/v1/suppliers/:id
 * @desc    Update supplier
 * @access  Private (Admin/Manager)
 */
router.put(
  '/:id',
  isAdminOrManager,
  validateRequest(updateSupplierValidators),
  updateSupplier
);

/**
 * @route   DELETE /api/v1/suppliers/:id
 * @desc    Delete supplier
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  isAdmin,
  validateRequest(supplierIdValidator),
  deleteSupplier
);

export default router;

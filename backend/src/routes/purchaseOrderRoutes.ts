/**
 * Purchase Order Routes
 * Defines all purchase order-related API endpoints
 */

import { Router } from 'express';
import {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  approvePurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
  getOverduePurchaseOrders,
} from '../controllers/purchaseOrderController';
import {
  createPurchaseOrderValidators,
  updatePurchaseOrderValidators,
  purchaseOrderStatusValidators,
  receivePurchaseOrderValidators,
  purchaseOrderQueryValidators,
} from '../validators/orderValidators';
import { authenticate, isAdmin, isAdminOrManager, isStaffOrAbove } from '../middleware/auth';
import { validateRequest, validatePagination, validateObjectId } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/purchase-orders/overdue
 * @desc    Get overdue purchase orders
 * @access  Private
 * @note    This must be before /:id route
 */
router.get(
  '/overdue',
  getOverduePurchaseOrders
);

/**
 * @route   GET /api/v1/purchase-orders
 * @desc    Get all purchase orders with pagination and filtering
 * @access  Private
 */
router.get(
  '/',
  validatePagination,
  validateRequest(purchaseOrderQueryValidators),
  getAllPurchaseOrders
);

/**
 * @route   GET /api/v1/purchase-orders/:id
 * @desc    Get purchase order by ID
 * @access  Private
 */
router.get(
  '/:id',
  validateObjectId('id'),
  getPurchaseOrderById
);

/**
 * @route   POST /api/v1/purchase-orders
 * @desc    Create new purchase order
 * @access  Private (Admin/Manager)
 */
router.post(
  '/',
  isAdminOrManager,
  validateRequest(createPurchaseOrderValidators),
  createPurchaseOrder
);

/**
 * @route   PUT /api/v1/purchase-orders/:id
 * @desc    Update purchase order
 * @access  Private (Admin/Manager)
 */
router.put(
  '/:id',
  isAdminOrManager,
  validateRequest(updatePurchaseOrderValidators),
  updatePurchaseOrder
);

/**
 * @route   PUT /api/v1/purchase-orders/:id/approve
 * @desc    Approve purchase order
 * @access  Private (Admin/Manager)
 */
router.put(
  '/:id/approve',
  isAdminOrManager,
  validateRequest(purchaseOrderStatusValidators),
  approvePurchaseOrder
);

/**
 * @route   PUT /api/v1/purchase-orders/:id/receive
 * @desc    Mark purchase order as received and update stock
 * @access  Private (Staff or above)
 */
router.put(
  '/:id/receive',
  isStaffOrAbove,
  validateRequest(receivePurchaseOrderValidators),
  receivePurchaseOrder
);

/**
 * @route   PUT /api/v1/purchase-orders/:id/cancel
 * @desc    Cancel purchase order
 * @access  Private (Admin/Manager)
 */
router.put(
  '/:id/cancel',
  isAdminOrManager,
  validateRequest(purchaseOrderStatusValidators),
  cancelPurchaseOrder
);

/**
 * @route   DELETE /api/v1/purchase-orders/:id
 * @desc    Delete purchase order
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  isAdmin,
  validateObjectId('id'),
  deletePurchaseOrder
);

export default router;

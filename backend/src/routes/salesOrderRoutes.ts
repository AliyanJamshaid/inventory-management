/**
 * Sales Order Routes
 * Defines all sales order-related API endpoints
 */

import { Router } from 'express';
import {
  getAllSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
  confirmSalesOrder,
  processSalesOrder,
  shipSalesOrder,
  deliverSalesOrder,
  cancelSalesOrder,
  generateInvoice,
} from '../controllers/salesOrderController';
import {
  createSalesOrderValidators,
  updateSalesOrderValidators,
  salesOrderStatusValidators,
  shipSalesOrderValidators,
  salesOrderQueryValidators,
} from '../validators/orderValidators';
import { authenticate, isAdmin, isStaffOrAbove } from '../middleware/auth';
import { validateRequest, validatePagination, validateObjectId } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/sales-orders
 * @desc    Get all sales orders with pagination and filtering
 * @access  Private
 */
router.get(
  '/',
  validatePagination,
  validateRequest(salesOrderQueryValidators),
  getAllSalesOrders
);

/**
 * @route   GET /api/v1/sales-orders/:id
 * @desc    Get sales order by ID
 * @access  Private
 */
router.get(
  '/:id',
  validateObjectId('id'),
  getSalesOrderById
);

/**
 * @route   POST /api/v1/sales-orders
 * @desc    Create new sales order
 * @access  Private (Staff or above)
 */
router.post(
  '/',
  isStaffOrAbove,
  validateRequest(createSalesOrderValidators),
  createSalesOrder
);

/**
 * @route   PUT /api/v1/sales-orders/:id
 * @desc    Update sales order
 * @access  Private (Staff or above)
 */
router.put(
  '/:id',
  isStaffOrAbove,
  validateRequest(updateSalesOrderValidators),
  updateSalesOrder
);

/**
 * @route   PUT /api/v1/sales-orders/:id/confirm
 * @desc    Confirm sales order
 * @access  Private (Staff or above)
 */
router.put(
  '/:id/confirm',
  isStaffOrAbove,
  validateRequest(salesOrderStatusValidators),
  confirmSalesOrder
);

/**
 * @route   PUT /api/v1/sales-orders/:id/process
 * @desc    Mark sales order as processing
 * @access  Private (Staff or above)
 */
router.put(
  '/:id/process',
  isStaffOrAbove,
  validateRequest(salesOrderStatusValidators),
  processSalesOrder
);

/**
 * @route   PUT /api/v1/sales-orders/:id/ship
 * @desc    Mark sales order as shipped and update stock
 * @access  Private (Staff or above)
 */
router.put(
  '/:id/ship',
  isStaffOrAbove,
  validateRequest(shipSalesOrderValidators),
  shipSalesOrder
);

/**
 * @route   PUT /api/v1/sales-orders/:id/deliver
 * @desc    Mark sales order as delivered
 * @access  Private (Staff or above)
 */
router.put(
  '/:id/deliver',
  isStaffOrAbove,
  validateRequest(salesOrderStatusValidators),
  deliverSalesOrder
);

/**
 * @route   PUT /api/v1/sales-orders/:id/cancel
 * @desc    Cancel sales order
 * @access  Private (Staff or above)
 */
router.put(
  '/:id/cancel',
  isStaffOrAbove,
  validateRequest(salesOrderStatusValidators),
  cancelSalesOrder
);

/**
 * @route   POST /api/v1/sales-orders/:id/invoice
 * @desc    Generate invoice from sales order
 * @access  Private (Staff or above)
 */
router.post(
  '/:id/invoice',
  isStaffOrAbove,
  validateObjectId('id'),
  generateInvoice
);

/**
 * @route   DELETE /api/v1/sales-orders/:id
 * @desc    Delete sales order
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  isAdmin,
  validateObjectId('id'),
  deleteSalesOrder
);

export default router;

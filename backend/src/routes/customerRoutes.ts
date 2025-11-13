/**
 * Customer Routes
 * Defines all customer-related API endpoints
 */

import { Router } from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerSalesOrders,
  getCustomerInvoices,
  updateLoyaltyPoints,
} from '../controllers/customerController';
import {
  createCustomerValidators,
  updateCustomerValidators,
  customerIdValidator,
  customerQueryValidators,
  updateLoyaltyValidators,
} from '../validators/customerValidators';
import { authenticate, isAdmin, isStaffOrAbove } from '../middleware/auth';
import { validateRequest, validatePagination } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/customers
 * @desc    Get all customers with pagination and filtering
 * @access  Private
 */
router.get(
  '/',
  validatePagination,
  validateRequest(customerQueryValidators),
  getAllCustomers
);

/**
 * @route   GET /api/v1/customers/:id
 * @desc    Get customer by ID
 * @access  Private
 */
router.get(
  '/:id',
  validateRequest(customerIdValidator),
  getCustomerById
);

/**
 * @route   GET /api/v1/customers/:id/sales-orders
 * @desc    Get customer sales orders
 * @access  Private
 */
router.get(
  '/:id/sales-orders',
  validateRequest(customerIdValidator),
  validatePagination,
  getCustomerSalesOrders
);

/**
 * @route   GET /api/v1/customers/:id/invoices
 * @desc    Get customer invoices
 * @access  Private
 */
router.get(
  '/:id/invoices',
  validateRequest(customerIdValidator),
  validatePagination,
  getCustomerInvoices
);

/**
 * @route   POST /api/v1/customers
 * @desc    Create new customer
 * @access  Private (Staff or above)
 */
router.post(
  '/',
  isStaffOrAbove,
  validateRequest(createCustomerValidators),
  createCustomer
);

/**
 * @route   PUT /api/v1/customers/:id
 * @desc    Update customer
 * @access  Private (Staff or above)
 */
router.put(
  '/:id',
  isStaffOrAbove,
  validateRequest(updateCustomerValidators),
  updateCustomer
);

/**
 * @route   PUT /api/v1/customers/:id/loyalty
 * @desc    Update customer loyalty points
 * @access  Private (Staff or above)
 */
router.put(
  '/:id/loyalty',
  isStaffOrAbove,
  validateRequest(updateLoyaltyValidators),
  updateLoyaltyPoints
);

/**
 * @route   DELETE /api/v1/customers/:id
 * @desc    Delete customer
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  isAdmin,
  validateRequest(customerIdValidator),
  deleteCustomer
);

export default router;

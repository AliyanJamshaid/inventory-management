/**
 * Invoice Routes
 * Defines all invoice-related API endpoints
 */

import { Router } from 'express';
import {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoice,
  recordPayment,
  getOverdueInvoices,
} from '../controllers/invoiceController';
import {
  createInvoiceValidators,
  updateInvoiceValidators,
  recordInvoicePaymentValidators,
  invoiceQueryValidators,
} from '../validators/orderValidators';
import { authenticate, isAdmin, isStaffOrAbove } from '../middleware/auth';
import { validateRequest, validatePagination, validateObjectId } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/invoices/overdue
 * @desc    Get overdue invoices
 * @access  Private
 * @note    This must be before /:id route
 */
router.get(
  '/overdue',
  getOverdueInvoices
);

/**
 * @route   GET /api/v1/invoices
 * @desc    Get all invoices with pagination and filtering
 * @access  Private
 */
router.get(
  '/',
  validatePagination,
  validateRequest(invoiceQueryValidators),
  getAllInvoices
);

/**
 * @route   GET /api/v1/invoices/:id
 * @desc    Get invoice by ID
 * @access  Private
 */
router.get(
  '/:id',
  validateObjectId('id'),
  getInvoiceById
);

/**
 * @route   POST /api/v1/invoices
 * @desc    Create new invoice
 * @access  Private (Staff or above)
 */
router.post(
  '/',
  isStaffOrAbove,
  validateRequest(createInvoiceValidators),
  createInvoice
);

/**
 * @route   PUT /api/v1/invoices/:id
 * @desc    Update invoice
 * @access  Private (Staff or above)
 */
router.put(
  '/:id',
  isStaffOrAbove,
  validateRequest(updateInvoiceValidators),
  updateInvoice
);

/**
 * @route   PUT /api/v1/invoices/:id/send
 * @desc    Mark invoice as sent
 * @access  Private (Staff or above)
 */
router.put(
  '/:id/send',
  isStaffOrAbove,
  validateObjectId('id'),
  sendInvoice
);

/**
 * @route   POST /api/v1/invoices/:id/payment
 * @desc    Record payment for invoice
 * @access  Private (Staff or above)
 */
router.post(
  '/:id/payment',
  isStaffOrAbove,
  validateRequest(recordInvoicePaymentValidators),
  recordPayment
);

/**
 * @route   DELETE /api/v1/invoices/:id
 * @desc    Delete invoice
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  isAdmin,
  validateObjectId('id'),
  deleteInvoice
);

export default router;

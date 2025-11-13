/**
 * Payment Routes
 * Defines all payment-related API endpoints
 */

import { Router } from 'express';
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  getPaymentSummary,
} from '../controllers/paymentController';
import {
  createPaymentValidators,
  paymentQueryValidators,
  paymentSummaryQueryValidators,
} from '../validators/orderValidators';
import { authenticate, isStaffOrAbove } from '../middleware/auth';
import { validateRequest, validatePagination, validateObjectId } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/payments/summary
 * @desc    Get payment summary by date range
 * @access  Private
 * @note    This must be before /:id route
 */
router.get(
  '/summary',
  validateRequest(paymentSummaryQueryValidators),
  getPaymentSummary
);

/**
 * @route   GET /api/v1/payments
 * @desc    Get all payments with pagination and filtering
 * @access  Private
 */
router.get(
  '/',
  validatePagination,
  validateRequest(paymentQueryValidators),
  getAllPayments
);

/**
 * @route   GET /api/v1/payments/:id
 * @desc    Get payment by ID
 * @access  Private
 */
router.get(
  '/:id',
  validateObjectId('id'),
  getPaymentById
);

/**
 * @route   POST /api/v1/payments
 * @desc    Create new payment
 * @access  Private (Staff or above)
 */
router.post(
  '/',
  isStaffOrAbove,
  validateRequest(createPaymentValidators),
  createPayment
);

export default router;

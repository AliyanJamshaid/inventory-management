/**
 * Stock Validators
 * Validation schemas for stock-related endpoints
 */

import { body, param, query } from 'express-validator';

/**
 * Validation for adjusting stock
 */
export const adjustStockValidator = [
  body('product')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('variant')
    .optional()
    .isMongoId()
    .withMessage('Invalid variant ID'),

  body('warehouse')
    .notEmpty()
    .withMessage('Warehouse ID is required')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),

  body('location')
    .optional()
    .isMongoId()
    .withMessage('Invalid location ID'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isNumeric()
    .withMessage('Quantity must be a number'),

  body('reasonCode')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Reason code cannot exceed 50 characters'),

  body('reference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Reference cannot exceed 100 characters'),

  body('batchNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Batch number cannot exceed 100 characters'),

  body('serialNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Serial number cannot exceed 100 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),

  body('minStockLevel')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum stock level must be a positive number'),

  body('maxStockLevel')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum stock level must be a positive number'),

  body('reorderPoint')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Reorder point must be a positive number'),

  body('expirationDate')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid date'),
];

/**
 * Validation for transferring stock
 */
export const transferStockValidator = [
  body('product')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('variant')
    .optional()
    .isMongoId()
    .withMessage('Invalid variant ID'),

  body('fromWarehouse')
    .notEmpty()
    .withMessage('Source warehouse ID is required')
    .isMongoId()
    .withMessage('Invalid source warehouse ID'),

  body('toWarehouse')
    .notEmpty()
    .withMessage('Destination warehouse ID is required')
    .isMongoId()
    .withMessage('Invalid destination warehouse ID'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  body('reference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Reference cannot exceed 100 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

/**
 * Validation for reserving stock
 */
export const reserveStockValidator = [
  body('product')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('variant')
    .optional()
    .isMongoId()
    .withMessage('Invalid variant ID'),

  body('warehouse')
    .notEmpty()
    .withMessage('Warehouse ID is required')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  body('reference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Reference cannot exceed 100 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

/**
 * Validation for releasing stock
 */
export const releaseStockValidator = [
  body('product')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('variant')
    .optional()
    .isMongoId()
    .withMessage('Invalid variant ID'),

  body('warehouse')
    .notEmpty()
    .withMessage('Warehouse ID is required')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  body('reference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Reference cannot exceed 100 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

/**
 * Validation for getting expiring stock
 */
export const expiringStockValidator = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),

  query('warehouse')
    .optional()
    .isMongoId()
    .withMessage('Invalid warehouse ID'),
];

/**
 * Validation for transaction date range
 */
export const transactionDateRangeValidator = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),

  query('warehouse')
    .optional()
    .isMongoId()
    .withMessage('Invalid warehouse ID'),
];

export default {
  adjustStockValidator,
  transferStockValidator,
  reserveStockValidator,
  releaseStockValidator,
  expiringStockValidator,
  transactionDateRangeValidator,
};

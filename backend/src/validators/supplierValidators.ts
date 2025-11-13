/**
 * Supplier Validators
 * Validation rules for supplier-related endpoints
 */

import { body, param, query } from 'express-validator';

/**
 * Validation rules for creating a supplier
 */
export const createSupplierValidators = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Supplier name is required')
    .isLength({ max: 200 })
    .withMessage('Supplier name cannot exceed 200 characters'),

  body('code')
    .trim()
    .notEmpty()
    .withMessage('Supplier code is required')
    .isLength({ max: 20 })
    .withMessage('Supplier code cannot exceed 20 characters')
    .isAlphanumeric()
    .withMessage('Supplier code must be alphanumeric'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s()-]+$/)
    .withMessage('Please provide a valid phone number'),

  body('website').optional().trim().isURL().withMessage('Please provide a valid website URL'),

  body('contactPerson').optional().trim().isLength({ max: 200 }).withMessage('Contact person name is too long'),

  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('zipCode').optional().trim(),
  body('taxId').optional().trim(),

  body('paymentTerms').optional().trim().isLength({ max: 100 }).withMessage('Payment terms is too long'),

  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),
];

/**
 * Validation rules for updating a supplier
 */
export const updateSupplierValidators = [
  param('id').isMongoId().withMessage('Invalid supplier ID'),

  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Supplier name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Supplier name cannot exceed 200 characters'),

  body('code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Supplier code cannot be empty')
    .isLength({ max: 20 })
    .withMessage('Supplier code cannot exceed 20 characters')
    .isAlphanumeric()
    .withMessage('Supplier code must be alphanumeric'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s()-]+$/)
    .withMessage('Please provide a valid phone number'),

  body('website').optional().trim().isURL().withMessage('Please provide a valid website URL'),

  body('contactPerson').optional().trim().isLength({ max: 200 }).withMessage('Contact person name is too long'),

  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('zipCode').optional().trim(),
  body('taxId').optional().trim(),

  body('paymentTerms').optional().trim().isLength({ max: 100 }).withMessage('Payment terms is too long'),

  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),
];

/**
 * Validation rules for supplier ID param
 */
export const supplierIdValidator = [
  param('id').isMongoId().withMessage('Invalid supplier ID'),
];

/**
 * Validation rules for supplier query filters
 */
export const supplierQueryValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('search').optional().trim(),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  query('minRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('minRating must be between 1 and 5'),

  query('sortBy')
    .optional()
    .isIn(['name', 'code', 'rating', 'createdAt'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

/**
 * Validation rules for updating supplier rating
 */
export const updateRatingValidators = [
  param('id').isMongoId().withMessage('Invalid supplier ID'),

  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
];

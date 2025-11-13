/**
 * Customer Validators
 * Validation rules for customer-related endpoints
 */

import { body, param, query } from 'express-validator';
import { CustomerType } from '../types/models';

/**
 * Validation rules for creating a customer
 */
export const createCustomerValidators = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ max: 200 })
    .withMessage('Customer name cannot exceed 200 characters'),

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

  body('type')
    .notEmpty()
    .withMessage('Customer type is required')
    .isIn(Object.values(CustomerType))
    .withMessage('Invalid customer type'),

  body('contactPerson').optional().trim().isLength({ max: 200 }).withMessage('Contact person name is too long'),

  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('zipCode').optional().trim(),
  body('taxId').optional().trim(),

  body('creditLimit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Credit limit cannot be negative'),

  body('paymentTerms').optional().trim().isLength({ max: 100 }).withMessage('Payment terms is too long'),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),
];

/**
 * Validation rules for updating a customer
 */
export const updateCustomerValidators = [
  param('id').isMongoId().withMessage('Invalid customer ID'),

  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Customer name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Customer name cannot exceed 200 characters'),

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

  body('type')
    .optional()
    .isIn(Object.values(CustomerType))
    .withMessage('Invalid customer type'),

  body('contactPerson').optional().trim().isLength({ max: 200 }).withMessage('Contact person name is too long'),

  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('zipCode').optional().trim(),
  body('taxId').optional().trim(),

  body('creditLimit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Credit limit cannot be negative'),

  body('paymentTerms').optional().trim().isLength({ max: 100 }).withMessage('Payment terms is too long'),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),
];

/**
 * Validation rules for customer ID param
 */
export const customerIdValidator = [
  param('id').isMongoId().withMessage('Invalid customer ID'),
];

/**
 * Validation rules for customer query filters
 */
export const customerQueryValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('search').optional().trim(),

  query('type')
    .optional()
    .isIn(Object.values(CustomerType))
    .withMessage('Invalid customer type'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  query('sortBy')
    .optional()
    .isIn(['name', 'customerNumber', 'createdAt', 'loyaltyPoints'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

/**
 * Validation rules for updating loyalty points
 */
export const updateLoyaltyValidators = [
  param('id').isMongoId().withMessage('Invalid customer ID'),

  body('points')
    .notEmpty()
    .withMessage('Points is required')
    .isInt()
    .withMessage('Points must be an integer'),

  body('operation')
    .notEmpty()
    .withMessage('Operation is required')
    .isIn(['add', 'redeem', 'set'])
    .withMessage('Operation must be add, redeem, or set'),
];

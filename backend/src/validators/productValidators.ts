/**
 * Product Validators
 * Validation schemas for product-related endpoints
 */

import { body, param, query } from 'express-validator';

/**
 * Validation for creating a product
 */
export const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),

  body('sku')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3 and 50 characters')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('SKU can only contain uppercase letters, numbers, and hyphens'),

  body('barcode')
    .optional()
    .trim()
    .isLength({ min: 8, max: 50 })
    .withMessage('Barcode must be between 8 and 50 characters'),

  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('supplier')
    .optional()
    .isMongoId()
    .withMessage('Invalid supplier ID'),

  body('unit')
    .trim()
    .notEmpty()
    .withMessage('Unit is required')
    .isLength({ max: 50 })
    .withMessage('Unit cannot exceed 50 characters'),

  body('costPrice')
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),

  body('sellingPrice')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),

  body('tax')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax must be between 0 and 100'),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),

  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
];

/**
 * Validation for updating a product
 */
export const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),

  body('sku')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3 and 50 characters')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('SKU can only contain uppercase letters, numbers, and hyphens'),

  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('supplier')
    .optional()
    .isMongoId()
    .withMessage('Invalid supplier ID'),

  body('costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),

  body('sellingPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),

  body('tax')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax must be between 0 and 100'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

/**
 * Validation for product search
 */
export const searchProductValidator = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

/**
 * Validation for creating a product variant
 */
export const createVariantValidator = [
  body('variantName')
    .trim()
    .notEmpty()
    .withMessage('Variant name is required')
    .isLength({ max: 200 })
    .withMessage('Variant name cannot exceed 200 characters'),

  body('sku')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3 and 50 characters')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('SKU can only contain uppercase letters, numbers, and hyphens'),

  body('costPrice')
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),

  body('sellingPrice')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),

  body('attributes')
    .optional()
    .isObject()
    .withMessage('Attributes must be an object'),
];

/**
 * Validation for bulk import
 */
export const bulkImportValidator = [
  body('products')
    .isArray({ min: 1 })
    .withMessage('Products array is required and must contain at least one product'),

  body('products.*.name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required for all products'),

  body('products.*.unit')
    .trim()
    .notEmpty()
    .withMessage('Unit is required for all products'),

  body('products.*.costPrice')
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number for all products'),

  body('products.*.sellingPrice')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number for all products'),
];

export default {
  createProductValidator,
  updateProductValidator,
  searchProductValidator,
  createVariantValidator,
  bulkImportValidator,
};

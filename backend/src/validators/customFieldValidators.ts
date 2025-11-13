/**
 * Custom Field Validators
 * Validation schemas for custom field endpoints
 */

import { body, param, query } from 'express-validator';
import { CustomFieldType, CustomFieldEntityType } from '../types/models';

/**
 * Validation for creating a custom field
 */
export const createCustomFieldValidator = [
  body('entityType')
    .notEmpty()
    .withMessage('Entity type is required')
    .isIn(Object.values(CustomFieldEntityType))
    .withMessage('Invalid entity type'),

  body('fieldName')
    .trim()
    .notEmpty()
    .withMessage('Field name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Field name must be between 2 and 50 characters')
    .matches(/^[a-z][a-z0-9_]*$/)
    .withMessage('Field name must start with a letter and contain only lowercase letters, numbers, and underscores'),

  body('fieldLabel')
    .trim()
    .notEmpty()
    .withMessage('Field label is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Field label must be between 2 and 100 characters'),

  body('fieldType')
    .notEmpty()
    .withMessage('Field type is required')
    .isIn(Object.values(CustomFieldType))
    .withMessage('Invalid field type'),

  body('required')
    .optional()
    .isBoolean()
    .withMessage('Required must be a boolean'),

  body('defaultValue')
    .optional(),

  body('validation')
    .optional()
    .isObject()
    .withMessage('Validation must be an object'),

  body('validation.min')
    .optional()
    .isNumeric()
    .withMessage('Validation min must be a number'),

  body('validation.max')
    .optional()
    .isNumeric()
    .withMessage('Validation max must be a number'),

  body('validation.pattern')
    .optional()
    .isString()
    .withMessage('Validation pattern must be a string'),

  body('validation.options')
    .optional()
    .isArray()
    .withMessage('Validation options must be an array')
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      return value.every(item => typeof item === 'string');
    })
    .withMessage('Validation options must be an array of strings'),

  body('helpText')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Help text cannot exceed 500 characters'),

  body('placeholder')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Placeholder cannot exceed 200 characters'),

  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),

  body('section')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Section name cannot exceed 100 characters'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

/**
 * Validation for updating a custom field
 */
export const updateCustomFieldValidator = [
  body('entityType')
    .optional()
    .isIn(Object.values(CustomFieldEntityType))
    .withMessage('Invalid entity type'),

  body('fieldName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Field name must be between 2 and 50 characters')
    .matches(/^[a-z][a-z0-9_]*$/)
    .withMessage('Field name must start with a letter and contain only lowercase letters, numbers, and underscores'),

  body('fieldLabel')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Field label must be between 2 and 100 characters'),

  body('fieldType')
    .optional()
    .isIn(Object.values(CustomFieldType))
    .withMessage('Invalid field type'),

  body('required')
    .optional()
    .isBoolean()
    .withMessage('Required must be a boolean'),

  body('defaultValue')
    .optional(),

  body('validation')
    .optional()
    .isObject()
    .withMessage('Validation must be an object'),

  body('validation.min')
    .optional()
    .isNumeric()
    .withMessage('Validation min must be a number'),

  body('validation.max')
    .optional()
    .isNumeric()
    .withMessage('Validation max must be a number'),

  body('validation.pattern')
    .optional()
    .isString()
    .withMessage('Validation pattern must be a string'),

  body('validation.options')
    .optional()
    .isArray()
    .withMessage('Validation options must be an array')
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      return value.every(item => typeof item === 'string');
    })
    .withMessage('Validation options must be an array of strings'),

  body('helpText')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Help text cannot exceed 500 characters'),

  body('placeholder')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Placeholder cannot exceed 200 characters'),

  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),

  body('section')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Section name cannot exceed 100 characters'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

/**
 * Validation for reordering custom fields
 */
export const reorderFieldsValidator = [
  body('fieldOrders')
    .notEmpty()
    .withMessage('Field orders array is required')
    .isArray({ min: 1 })
    .withMessage('Field orders must be a non-empty array'),

  body('fieldOrders.*.id')
    .notEmpty()
    .withMessage('Field ID is required')
    .isMongoId()
    .withMessage('Invalid field ID'),

  body('fieldOrders.*.order')
    .notEmpty()
    .withMessage('Order is required')
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
];

/**
 * Validation for field name availability check
 */
export const validateFieldNameValidator = [
  body('entityType')
    .notEmpty()
    .withMessage('Entity type is required')
    .isIn(Object.values(CustomFieldEntityType))
    .withMessage('Invalid entity type'),

  body('fieldName')
    .trim()
    .notEmpty()
    .withMessage('Field name is required')
    .matches(/^[a-z][a-z0-9_]*$/)
    .withMessage('Field name must start with a letter and contain only lowercase letters, numbers, and underscores'),

  body('excludeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid exclude ID'),
];

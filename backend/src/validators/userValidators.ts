/**
 * User Management Validators
 * Express-validator schemas for user management endpoints
 */

import { body } from 'express-validator';

/**
 * Validator for updating user (admin function)
 */
export const updateUserValidator = [
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s()-]+$/)
    .withMessage('Please provide a valid phone number'),

  body('avatar')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid URL for avatar'),

  body('role')
    .optional()
    .isIn(['ADMIN', 'MANAGER', 'STAFF', 'VIEWER'])
    .withMessage('Invalid role specified'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

export default {
  updateUserValidator,
};

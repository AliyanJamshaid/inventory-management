/**
 * Request Validation Middleware
 * Validates incoming requests using express-validator
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { sendValidationError } from '../utils/responses';
import { logError } from '../utils/logger';

/**
 * Validation middleware that checks for validation errors
 * and returns formatted error response if validation fails
 */
export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
    }));

    logError('Validation failed', {
      url: req.url,
      method: req.method,
      errors: formattedErrors,
    });

    return sendValidationError(res, formattedErrors);
  }

  next();
};

/**
 * Run validation chains and check for errors
 * This is a helper function to reduce boilerplate in routes
 */
export const validateRequest = (validations: ValidationChain[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((error) => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
      }));

      logError('Validation failed', {
        url: req.url,
        method: req.method,
        errors: formattedErrors,
      });

      sendValidationError(res, formattedErrors);
      return;
    }

    next();
  };
};

/**
 * Sanitize request body by removing specified fields
 * Useful for preventing mass assignment vulnerabilities
 */
export const sanitizeBody = (fieldsToRemove: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.body) {
      fieldsToRemove.forEach((field) => {
        delete req.body[field];
      });
    }
    next();
  };
};

/**
 * Ensure request body is not empty
 */
export const requireBody = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return sendValidationError(
      res,
      [{ field: 'body', message: 'Request body cannot be empty' }],
      'Request body is required'
    );
  }
  next();
};

/**
 * Validate MongoDB ObjectId format
 */
export const validateObjectId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const id = req.params[paramName];

    if (!id) {
      return sendValidationError(
        res,
        [{ field: paramName, message: `${paramName} is required` }],
        'Missing required parameter'
      );
    }

    const objectIdPattern = /^[0-9a-fA-F]{24}$/;

    if (!objectIdPattern.test(id)) {
      return sendValidationError(
        res,
        [{ field: paramName, message: `Invalid ${paramName} format` }],
        'Invalid ID format'
      );
    }

    next();
  };
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { page, limit } = req.query;

  // Set defaults if not provided
  if (!page) {
    req.query['page'] = '1';
  }

  if (!limit) {
    req.query['limit'] = '10';
  }

  // Validate page
  const pageNum = parseInt(req.query['page'] as string, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    req.query['page'] = '1';
  }

  // Validate limit (max 100)
  const limitNum = parseInt(req.query['limit'] as string, 10);
  if (isNaN(limitNum) || limitNum < 1) {
    req.query['limit'] = '10';
  } else if (limitNum > 100) {
    req.query['limit'] = '100';
  }

  next();
};

/**
 * Validate sort parameters
 */
export const validateSort = (allowedFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const { sortBy, sortOrder } = req.query;

    if (sortBy && !allowedFields.includes(sortBy as string)) {
      return sendValidationError(
        res,
        [
          {
            field: 'sortBy',
            message: `Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`,
          },
        ],
        'Invalid sort parameters'
      );
    }

    if (sortOrder && !['asc', 'desc'].includes(sortOrder as string)) {
      return sendValidationError(
        res,
        [
          {
            field: 'sortOrder',
            message: 'Sort order must be either "asc" or "desc"',
          },
        ],
        'Invalid sort parameters'
      );
    }

    next();
  };
};

export default {
  validate,
  validateRequest,
  sanitizeBody,
  requireBody,
  validateObjectId,
  validatePagination,
  validateSort,
};

/**
 * Custom Field Routes
 * Routes for custom field management
 */

import { Router } from 'express';
import {
  getAllCustomFields,
  getCustomFieldsByEntityType,
  getCustomFieldsBySection,
  getCustomFieldById,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  restoreCustomField,
  reorderCustomFields,
  validateFieldName,
} from '../controllers/customFieldController';
import { authenticate, isAdminOrManager } from '../middleware/auth';
import { validateObjectId, validatePagination, validateRequest } from '../middleware/validate';
import {
  createCustomFieldValidator,
  updateCustomFieldValidator,
  reorderFieldsValidator,
  validateFieldNameValidator,
} from '../validators/customFieldValidators';

const router = Router();

/**
 * GET /api/v1/custom-fields
 * Get all custom fields (with optional filtering)
 * Protected endpoint - all authenticated users can view
 */
router.get('/', authenticate, validatePagination, getAllCustomFields);

/**
 * GET /api/v1/custom-fields/entity/:entityType
 * Get custom fields for a specific entity type
 * Public endpoint - all authenticated users can view
 */
router.get('/entity/:entityType', authenticate, getCustomFieldsByEntityType);

/**
 * GET /api/v1/custom-fields/entity/:entityType/grouped
 * Get custom fields grouped by section for a specific entity type
 * Public endpoint - all authenticated users can view
 */
router.get('/entity/:entityType/grouped', authenticate, getCustomFieldsBySection);

/**
 * POST /api/v1/custom-fields/validate-name
 * Validate field name availability
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.post(
  '/validate-name',
  authenticate,
  isAdminOrManager,
  validateFieldNameValidator,
  validateRequest(validateFieldNameValidator),
  validateFieldName
);

/**
 * POST /api/v1/custom-fields/reorder
 * Reorder custom fields
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.post(
  '/reorder',
  authenticate,
  isAdminOrManager,
  reorderFieldsValidator,
  validateRequest(reorderFieldsValidator),
  reorderCustomFields
);

/**
 * GET /api/v1/custom-fields/:id
 * Get custom field by ID
 * Public endpoint - all authenticated users can view
 */
router.get('/:id', authenticate, validateObjectId('id'), getCustomFieldById);

/**
 * POST /api/v1/custom-fields
 * Create new custom field
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.post(
  '/',
  authenticate,
  isAdminOrManager,
  createCustomFieldValidator,
  validateRequest(createCustomFieldValidator),
  createCustomField
);

/**
 * PUT /api/v1/custom-fields/:id
 * Update custom field
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.put(
  '/:id',
  authenticate,
  isAdminOrManager,
  validateObjectId('id'),
  updateCustomFieldValidator,
  validateRequest(updateCustomFieldValidator),
  updateCustomField
);

/**
 * DELETE /api/v1/custom-fields/:id
 * Delete (or archive) custom field
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.delete(
  '/:id',
  authenticate,
  isAdminOrManager,
  validateObjectId('id'),
  deleteCustomField
);

/**
 * POST /api/v1/custom-fields/:id/restore
 * Restore archived custom field
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.post(
  '/:id/restore',
  authenticate,
  isAdminOrManager,
  validateObjectId('id'),
  restoreCustomField
);

export default router;

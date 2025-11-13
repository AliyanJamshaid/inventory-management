/**
 * Custom Field Controller
 * Handles custom field management operations
 */

import { Response } from 'express';
import { IAuthRequest } from '../types';
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendBadRequest,
  sendSuccessWithPagination,
} from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import { CustomField } from '../models';
import { CustomFieldEntityType } from '../types/models';
import logger from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Get all custom fields (with optional filtering by entity type)
 * GET /api/v1/custom-fields
 */
export const getAllCustomFields = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const sortBy = (req.query.sortBy as string) || 'order';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

    // Build filter query
    const filter: any = {};

    // Filter by entity type
    if (req.query.entityType) {
      filter.entityType = req.query.entityType;
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    // Filter by section
    if (req.query.section) {
      filter.section = req.query.section;
    }

    logger.info('Getting custom fields', {
      filter,
      page,
      limit,
      user: req.user?.id,
    });

    const customFields = await CustomField.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email');

    const total = await CustomField.countDocuments(filter);

    sendSuccessWithPagination(res, customFields, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  }
);

/**
 * Get custom fields for a specific entity type
 * GET /api/v1/custom-fields/entity/:entityType
 */
export const getCustomFieldsByEntityType = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { entityType } = req.params;
    const activeOnly = req.query.activeOnly !== 'false'; // Default to true

    logger.info('Getting custom fields by entity type', {
      entityType,
      activeOnly,
      user: req.user?.id,
    });

    const customFields = await CustomField.findByEntityType(
      entityType as CustomFieldEntityType,
      activeOnly
    );

    sendSuccess(res, customFields);
  }
);

/**
 * Get custom fields grouped by section for a specific entity type
 * GET /api/v1/custom-fields/entity/:entityType/grouped
 */
export const getCustomFieldsBySection = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { entityType } = req.params;

    logger.info('Getting custom fields by section', {
      entityType,
      user: req.user?.id,
    });

    const groupedFields = await CustomField.getFieldsBySection(
      entityType as CustomFieldEntityType
    );

    sendSuccess(res, groupedFields);
  }
);

/**
 * Get custom field by ID
 * GET /api/v1/custom-fields/:id
 */
export const getCustomFieldById = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    logger.info('Getting custom field by ID', { id, user: req.user?.id });

    const customField = await CustomField.findById(id).populate(
      'createdBy',
      'firstName lastName email'
    );

    if (!customField) {
      sendNotFound(res, 'Custom field not found');
      return;
    }

    sendSuccess(res, customField);
  }
);

/**
 * Create new custom field
 * POST /api/v1/custom-fields
 */
export const createCustomField = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const {
      entityType,
      fieldName,
      fieldLabel,
      fieldType,
      required,
      defaultValue,
      validation,
      helpText,
      placeholder,
      order,
      section,
      isActive,
    } = req.body;

    logger.info('Creating custom field', {
      entityType,
      fieldName,
      user: req.user?.id,
    });

    // Check if field name already exists for this entity type
    const isAvailable = await CustomField.isFieldNameAvailable(entityType, fieldName);

    if (!isAvailable) {
      sendBadRequest(
        res,
        `Custom field with name "${fieldName}" already exists for ${entityType}`
      );
      return;
    }

    // Get the highest order number for this entity type
    let fieldOrder = order;
    if (fieldOrder === undefined || fieldOrder === null) {
      const lastField = await CustomField.findOne({ entityType })
        .sort({ order: -1 })
        .select('order');
      fieldOrder = lastField ? lastField.order + 1 : 0;
    }

    // Create custom field
    const customField = await CustomField.create({
      entityType,
      fieldName: fieldName.toLowerCase(),
      fieldLabel,
      fieldType,
      required: required || false,
      defaultValue,
      validation,
      helpText,
      placeholder,
      order: fieldOrder,
      section,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user?.id,
    });

    logger.info('Custom field created successfully', {
      id: customField._id,
      entityType,
      fieldName,
      user: req.user?.id,
    });

    sendCreated(res, customField, 'Custom field created successfully');
  }
);

/**
 * Update custom field
 * PUT /api/v1/custom-fields/:id
 */
export const updateCustomField = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updates = req.body;

    logger.info('Updating custom field', { id, updates, user: req.user?.id });

    const customField = await CustomField.findById(id);

    if (!customField) {
      sendNotFound(res, 'Custom field not found');
      return;
    }

    // If updating field name, check availability
    if (updates.fieldName && updates.fieldName !== customField.fieldName) {
      const isAvailable = await CustomField.isFieldNameAvailable(
        customField.entityType,
        updates.fieldName,
        customField._id
      );

      if (!isAvailable) {
        sendBadRequest(
          res,
          `Custom field with name "${updates.fieldName}" already exists for ${customField.entityType}`
        );
        return;
      }

      updates.fieldName = updates.fieldName.toLowerCase();
    }

    // Update custom field
    Object.assign(customField, updates);
    await customField.save();

    logger.info('Custom field updated successfully', {
      id,
      user: req.user?.id,
    });

    sendSuccess(res, customField, 'Custom field updated successfully');
  }
);

/**
 * Delete custom field
 * DELETE /api/v1/custom-fields/:id
 */
export const deleteCustomField = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { hardDelete } = req.query; // Option to hard delete vs soft delete

    logger.info('Deleting custom field', { id, hardDelete, user: req.user?.id });

    const customField = await CustomField.findById(id);

    if (!customField) {
      sendNotFound(res, 'Custom field not found');
      return;
    }

    if (hardDelete === 'true') {
      // Hard delete - permanently remove
      await customField.deleteOne();
      logger.info('Custom field permanently deleted', { id, user: req.user?.id });
      sendSuccess(res, null, 'Custom field permanently deleted');
    } else {
      // Soft delete - archive
      await customField.archive();
      logger.info('Custom field archived', { id, user: req.user?.id });
      sendSuccess(res, customField, 'Custom field archived successfully');
    }
  }
);

/**
 * Restore archived custom field
 * POST /api/v1/custom-fields/:id/restore
 */
export const restoreCustomField = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    logger.info('Restoring custom field', { id, user: req.user?.id });

    const customField = await CustomField.findById(id);

    if (!customField) {
      sendNotFound(res, 'Custom field not found');
      return;
    }

    await customField.restore();

    logger.info('Custom field restored', { id, user: req.user?.id });

    sendSuccess(res, customField, 'Custom field restored successfully');
  }
);

/**
 * Reorder custom fields
 * POST /api/v1/custom-fields/reorder
 */
export const reorderCustomFields = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { fieldOrders } = req.body; // Array of { id, order }

    if (!Array.isArray(fieldOrders) || fieldOrders.length === 0) {
      sendBadRequest(res, 'fieldOrders array is required');
      return;
    }

    logger.info('Reordering custom fields', {
      count: fieldOrders.length,
      user: req.user?.id,
    });

    await CustomField.reorderFields(fieldOrders);

    logger.info('Custom fields reordered successfully', {
      user: req.user?.id,
    });

    sendSuccess(res, null, 'Custom fields reordered successfully');
  }
);

/**
 * Validate field name availability
 * POST /api/v1/custom-fields/validate-name
 */
export const validateFieldName = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { entityType, fieldName, excludeId } = req.body;

    if (!entityType || !fieldName) {
      sendBadRequest(res, 'entityType and fieldName are required');
      return;
    }

    const isAvailable = await CustomField.isFieldNameAvailable(
      entityType,
      fieldName,
      excludeId ? new mongoose.Types.ObjectId(excludeId) : undefined
    );

    sendSuccess(res, { available: isAvailable });
  }
);

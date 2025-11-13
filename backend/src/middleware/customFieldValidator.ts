/**
 * Custom Field Validator Middleware
 * Validates custom field values when creating/updating entities
 */

import { Request, Response, NextFunction } from 'express';
import { CustomField } from '../models';
import { CustomFieldEntityType, CustomFieldType, ICustomField } from '../types/models';
import { sendBadRequest } from '../utils/responses';
import logger from '../utils/logger';

/**
 * Validates custom field values for an entity
 * @param entityType - The type of entity being validated
 */
export const validateCustomFieldsMiddleware = (entityType: CustomFieldEntityType) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customFieldsData = req.body.customFields;

      // If no custom fields provided, skip validation
      if (!customFieldsData || Object.keys(customFieldsData).length === 0) {
        return next();
      }

      // Get all active custom fields for this entity type
      const customFields = await CustomField.findByEntityType(entityType, true);

      // Validate each custom field
      for (const customField of customFields) {
        const fieldName = customField.fieldName;
        const fieldValue = customFieldsData[fieldName];

        // Check required fields
        if (customField.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
          sendBadRequest(res, `Custom field "${customField.fieldLabel}" is required`);
          return;
        }

        // Skip validation if field is optional and not provided
        if (fieldValue === undefined || fieldValue === null) {
          continue;
        }

        // Validate based on field type
        const validationError = validateFieldValue(customField, fieldValue);
        if (validationError) {
          sendBadRequest(res, validationError);
          return;
        }
      }

      // Check for invalid custom fields (fields that don't exist)
      const validFieldNames = customFields.map(f => f.fieldName);
      const providedFieldNames = Object.keys(customFieldsData);
      const invalidFields = providedFieldNames.filter(name => !validFieldNames.includes(name));

      if (invalidFields.length > 0) {
        logger.warn('Invalid custom fields provided', {
          entityType,
          invalidFields,
        });
        // Optionally, you can remove invalid fields instead of throwing an error
        invalidFields.forEach(fieldName => {
          delete customFieldsData[fieldName];
        });
      }

      next();
    } catch (error) {
      logger.error('Error validating custom fields', { error, entityType });
      sendBadRequest(res, 'Error validating custom fields');
    }
  };
};

/**
 * Validates a single field value based on field type and validation rules
 * @param customField - The custom field definition
 * @param value - The value to validate
 * @returns Error message if invalid, null if valid
 */
function validateFieldValue(customField: ICustomField, value: any): string | null {
  const { fieldType, fieldLabel, validation } = customField;

  switch (fieldType) {
    case CustomFieldType.TEXT:
    case CustomFieldType.TEXTAREA:
      if (typeof value !== 'string') {
        return `${fieldLabel} must be a string`;
      }
      if (validation?.min && value.length < validation.min) {
        return `${fieldLabel} must be at least ${validation.min} characters`;
      }
      if (validation?.max && value.length > validation.max) {
        return `${fieldLabel} cannot exceed ${validation.max} characters`;
      }
      if (validation?.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          return `${fieldLabel} format is invalid`;
        }
      }
      break;

    case CustomFieldType.NUMBER:
      if (typeof value !== 'number' && !isNumericString(value)) {
        return `${fieldLabel} must be a number`;
      }
      const numValue = typeof value === 'number' ? value : parseFloat(value);
      if (validation?.min !== undefined && numValue < validation.min) {
        return `${fieldLabel} must be at least ${validation.min}`;
      }
      if (validation?.max !== undefined && numValue > validation.max) {
        return `${fieldLabel} cannot exceed ${validation.max}`;
      }
      break;

    case CustomFieldType.DATE:
      const dateValue = new Date(value);
      if (isNaN(dateValue.getTime())) {
        return `${fieldLabel} must be a valid date`;
      }
      break;

    case CustomFieldType.BOOLEAN:
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        return `${fieldLabel} must be a boolean`;
      }
      break;

    case CustomFieldType.EMAIL:
      if (typeof value !== 'string') {
        return `${fieldLabel} must be a string`;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return `${fieldLabel} must be a valid email address`;
      }
      break;

    case CustomFieldType.PHONE:
      if (typeof value !== 'string') {
        return `${fieldLabel} must be a string`;
      }
      const phoneRegex = /^[+]?[\d\s()-]+$/;
      if (!phoneRegex.test(value)) {
        return `${fieldLabel} must be a valid phone number`;
      }
      break;

    case CustomFieldType.URL:
      if (typeof value !== 'string') {
        return `${fieldLabel} must be a string`;
      }
      try {
        new URL(value);
      } catch (error) {
        return `${fieldLabel} must be a valid URL`;
      }
      break;

    case CustomFieldType.SELECT:
      if (typeof value !== 'string') {
        return `${fieldLabel} must be a string`;
      }
      if (validation?.options && !validation.options.includes(value)) {
        return `${fieldLabel} must be one of: ${validation.options.join(', ')}`;
      }
      break;

    case CustomFieldType.MULTISELECT:
      if (!Array.isArray(value)) {
        return `${fieldLabel} must be an array`;
      }
      if (validation?.options) {
        const invalidOptions = value.filter(v => !validation.options?.includes(v));
        if (invalidOptions.length > 0) {
          return `${fieldLabel} contains invalid options: ${invalidOptions.join(', ')}`;
        }
      }
      break;

    case CustomFieldType.FILE:
      if (typeof value !== 'string') {
        return `${fieldLabel} must be a file URL string`;
      }
      break;

    case CustomFieldType.JSON:
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
        } catch (error) {
          return `${fieldLabel} must be valid JSON`;
        }
      } else if (typeof value !== 'object') {
        return `${fieldLabel} must be a valid JSON object`;
      }
      break;

    default:
      return `Invalid field type for ${fieldLabel}`;
  }

  return null;
}

/**
 * Helper function to check if a value is a numeric string
 */
function isNumericString(value: any): boolean {
  if (typeof value !== 'string') return false;
  return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
}

/**
 * Helper function to create validation middleware for specific entity types
 */
export const validateProductCustomFields = validateCustomFieldsMiddleware(CustomFieldEntityType.PRODUCT);
export const validateCustomerCustomFields = validateCustomFieldsMiddleware(CustomFieldEntityType.CUSTOMER);
export const validateSupplierCustomFields = validateCustomFieldsMiddleware(CustomFieldEntityType.SUPPLIER);
export const validateSalesOrderCustomFields = validateCustomFieldsMiddleware(CustomFieldEntityType.SALES_ORDER);
export const validatePurchaseOrderCustomFields = validateCustomFieldsMiddleware(CustomFieldEntityType.PURCHASE_ORDER);
export const validateInvoiceCustomFields = validateCustomFieldsMiddleware(CustomFieldEntityType.INVOICE);
export const validateWarehouseCustomFields = validateCustomFieldsMiddleware(CustomFieldEntityType.WAREHOUSE);
export const validateCategoryCustomFields = validateCustomFieldsMiddleware(CustomFieldEntityType.CATEGORY);

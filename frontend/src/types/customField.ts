/**
 * Custom Field Type Definitions
 * Frontend types for custom fields system
 */

export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'url'
  | 'file'
  | 'json';

export type EntityType =
  | 'product'
  | 'customer'
  | 'supplier'
  | 'sales_order'
  | 'purchase_order'
  | 'invoice'
  | 'warehouse'
  | 'category';

export interface CustomFieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  options?: string[];
}

export interface CustomField {
  _id: string;
  entityType: EntityType;
  fieldName: string;
  fieldLabel: string;
  fieldType: FieldType;
  required: boolean;
  defaultValue?: any;
  validation?: CustomFieldValidation;
  helpText?: string;
  placeholder?: string;
  order: number;
  section?: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CustomFieldFormData {
  entityType: EntityType;
  fieldName: string;
  fieldLabel: string;
  fieldType: FieldType;
  required: boolean;
  defaultValue?: any;
  validation?: CustomFieldValidation;
  helpText?: string;
  placeholder?: string;
  order?: number;
  section?: string;
  isActive: boolean;
}

export interface CustomFieldValue {
  [fieldName: string]: any;
}

export interface GroupedCustomFields {
  [section: string]: CustomField[];
}

export interface FieldTypeOption {
  value: FieldType;
  label: string;
  icon: string;
  description: string;
}

export interface EntityTypeOption {
  value: EntityType;
  label: string;
  icon: string;
}

// Field type options with metadata
export const FIELD_TYPE_OPTIONS: FieldTypeOption[] = [
  {
    value: 'text',
    label: 'Text',
    icon: '📝',
    description: 'Single line text input',
  },
  {
    value: 'textarea',
    label: 'Text Area',
    icon: '📄',
    description: 'Multi-line text input',
  },
  {
    value: 'number',
    label: 'Number',
    icon: '🔢',
    description: 'Numeric input',
  },
  {
    value: 'date',
    label: 'Date',
    icon: '📅',
    description: 'Date picker',
  },
  {
    value: 'boolean',
    label: 'Boolean',
    icon: '✓',
    description: 'Yes/No toggle',
  },
  {
    value: 'select',
    label: 'Select',
    icon: '📋',
    description: 'Single selection dropdown',
  },
  {
    value: 'multiselect',
    label: 'Multi-Select',
    icon: '☑️',
    description: 'Multiple selection',
  },
  {
    value: 'email',
    label: 'Email',
    icon: '✉️',
    description: 'Email address input',
  },
  {
    value: 'phone',
    label: 'Phone',
    icon: '📞',
    description: 'Phone number input',
  },
  {
    value: 'url',
    label: 'URL',
    icon: '🔗',
    description: 'Website URL input',
  },
  {
    value: 'file',
    label: 'File',
    icon: '📎',
    description: 'File upload',
  },
  {
    value: 'json',
    label: 'JSON',
    icon: '{ }',
    description: 'JSON data editor',
  },
];

// Entity type options
export const ENTITY_TYPE_OPTIONS: EntityTypeOption[] = [
  {
    value: 'product',
    label: 'Products',
    icon: '📦',
  },
  {
    value: 'customer',
    label: 'Customers',
    icon: '👥',
  },
  {
    value: 'supplier',
    label: 'Suppliers',
    icon: '🏭',
  },
  {
    value: 'sales_order',
    label: 'Sales Orders',
    icon: '🛒',
  },
  {
    value: 'purchase_order',
    label: 'Purchase Orders',
    icon: '📥',
  },
  {
    value: 'invoice',
    label: 'Invoices',
    icon: '🧾',
  },
  {
    value: 'warehouse',
    label: 'Warehouses',
    icon: '🏪',
  },
  {
    value: 'category',
    label: 'Categories',
    icon: '🏷️',
  },
];

// Helper functions
export function getFieldTypeLabel(fieldType: FieldType): string {
  return FIELD_TYPE_OPTIONS.find((opt) => opt.value === fieldType)?.label || fieldType;
}

export function getFieldTypeIcon(fieldType: FieldType): string {
  return FIELD_TYPE_OPTIONS.find((opt) => opt.value === fieldType)?.icon || '📝';
}

export function getEntityTypeLabel(entityType: EntityType): string {
  return ENTITY_TYPE_OPTIONS.find((opt) => opt.value === entityType)?.label || entityType;
}

export function getEntityTypeIcon(entityType: EntityType): string {
  return ENTITY_TYPE_OPTIONS.find((opt) => opt.value === entityType)?.icon || '📄';
}

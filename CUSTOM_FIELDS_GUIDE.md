# Custom Fields System - Comprehensive Guide

## Overview

The Custom Fields System allows you to add dynamic, user-defined fields to any entity in the inventory management system. This provides flexibility to extend the data model without modifying the core schema.

---

## Features

### Backend Features
- **Dynamic Field Management**: Create, update, delete, and restore custom fields
- **Type-Safe Validation**: Comprehensive validation for 12 different field types
- **Entity Support**: Works with Products, Customers, Suppliers, Orders, Invoices, Warehouses, and Categories
- **Field Ordering**: Drag-and-drop reordering of fields
- **Section Grouping**: Organize related fields into sections
- **Soft Delete**: Archive fields without losing data
- **Reserved Field Protection**: Prevents use of system reserved field names

### Frontend Features
- **Visual Field Builder**: Intuitive UI for creating custom fields
- **Drag-and-Drop Ordering**: Reorder fields easily
- **Field Type Preview**: See how each field type looks before creating
- **Section Organization**: Group related fields together
- **Real-time Validation**: Instant feedback on field configuration
- **Dynamic Form Rendering**: Automatically renders custom fields in entity forms

---

## Architecture

### Backend Structure

```
backend/
├── src/
│   ├── models/
│   │   ├── CustomField.ts          # Custom field model
│   │   ├── Product.ts              # Updated with customFields Map
│   │   ├── Customer.ts             # Updated with customFields Map
│   │   └── ...                     # All entity models updated
│   ├── controllers/
│   │   └── customFieldController.ts
│   ├── routes/
│   │   └── customFieldRoutes.ts
│   ├── middleware/
│   │   └── customFieldValidator.ts
│   ├── validators/
│   │   └── customFieldValidators.ts
│   └── types/
│       └── models.ts               # Updated with CustomField types
```

### Frontend Structure

```
frontend/
├── src/
│   ├── types/
│   │   └── customField.ts          # Type definitions
│   ├── hooks/
│   │   └── useCustomFields.ts      # API hooks
│   ├── components/
│   │   └── features/
│   │       ├── CustomFieldBuilder.tsx
│   │       ├── DynamicFormFields.tsx
│   │       └── customFields/
│   │           └── CustomFieldInput.tsx
│   └── app/
│       └── (dashboard)/
│           └── settings/
│               └── custom-fields/
│                   └── page.tsx    # Management page
```

---

## Database Schema

### CustomField Model

```typescript
{
  entityType: 'product' | 'customer' | 'supplier' | 'sales_order' | 'purchase_order' | 'invoice' | 'warehouse' | 'category',
  fieldName: string,              // e.g., "warranty_period"
  fieldLabel: string,             // e.g., "Warranty Period"
  fieldType: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'email' | 'phone' | 'url' | 'file' | 'json',
  required: boolean,
  defaultValue?: any,
  validation?: {
    min?: number,
    max?: number,
    pattern?: string,
    options?: string[]
  },
  helpText?: string,
  placeholder?: string,
  order: number,
  section?: string,
  isActive: boolean,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Entity Models (Product, Customer, etc.)

All entity models now include:
```typescript
customFields: Map<string, any>
```

---

## API Endpoints

### Custom Field Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/custom-fields` | Get all custom fields with filters |
| GET | `/api/v1/custom-fields/:id` | Get single custom field |
| GET | `/api/v1/custom-fields/entity/:entityType` | Get fields for entity type |
| GET | `/api/v1/custom-fields/entity/:entityType/grouped` | Get fields grouped by section |
| POST | `/api/v1/custom-fields` | Create new custom field |
| PUT | `/api/v1/custom-fields/:id` | Update custom field |
| DELETE | `/api/v1/custom-fields/:id` | Delete/archive custom field |
| POST | `/api/v1/custom-fields/:id/restore` | Restore archived field |
| POST | `/api/v1/custom-fields/reorder` | Reorder fields |
| POST | `/api/v1/custom-fields/validate-name` | Check field name availability |

---

## Usage Guide

### 1. Creating Custom Fields

Navigate to **Settings > Custom Fields** and:

1. Select the entity type (Products, Customers, etc.)
2. Click "New Custom Field"
3. Configure the field:
   - **Field Label**: Display name (e.g., "Warranty Period")
   - **Field Name**: Internal identifier (auto-generated from label)
   - **Field Type**: Choose from 12 types
   - **Validation**: Set min/max, options, patterns
   - **Section**: Group related fields
   - **Required**: Make field mandatory
   - **Help Text**: Provide user guidance

### 2. Field Types

#### Text Types
- **Text**: Single-line input
- **Textarea**: Multi-line input
- **Email**: Email validation
- **Phone**: Phone number validation
- **URL**: Website URL validation

#### Number & Date
- **Number**: Numeric input with min/max
- **Date**: Date picker

#### Boolean
- **Boolean**: Yes/No toggle switch

#### Selection
- **Select**: Single selection dropdown
- **Multiselect**: Multiple selection checkboxes

#### Advanced
- **File**: File upload
- **JSON**: JSON data editor

### 3. Using Custom Fields in Forms

#### Backend (Validation)

Add the validation middleware to your routes:

```typescript
import { validateProductCustomFields } from '../middleware/customFieldValidator';

router.post(
  '/products',
  authenticate,
  validateProductCustomFields,  // Add this
  createProduct
);
```

#### Frontend (Rendering)

Add `DynamicFormFields` to your entity forms:

```tsx
import { DynamicFormFields } from "@/components/features/DynamicFormFields";
import { useState } from "react";

function ProductForm() {
  const [customFields, setCustomFields] = useState({});

  return (
    <form>
      {/* Your existing form fields */}

      {/* Add custom fields */}
      <DynamicFormFields
        entityType="product"
        values={customFields}
        onChange={setCustomFields}
      />

      {/* Submit button */}
    </form>
  );
}
```

### 4. Accessing Custom Field Data

#### Backend

Custom fields are stored in a Map:

```typescript
// Reading custom fields
const warrantyPeriod = product.customFields.get('warranty_period');

// Setting custom fields
product.customFields.set('warranty_period', '2 years');
await product.save();

// Converting to object
const customFieldsObj = Object.fromEntries(product.customFields);
```

#### Frontend

Custom fields are returned as objects:

```typescript
// In API response
{
  _id: "...",
  name: "Product Name",
  customFields: {
    warranty_period: "2 years",
    color: "blue",
    certified: true
  }
}
```

---

## Example Scenarios

### Scenario 1: Adding Warranty Information to Products

1. **Create Custom Fields**:
   - Field: "warranty_period" (text) - "12 months"
   - Field: "warranty_type" (select) - Options: "Manufacturer", "Extended", "None"
   - Field: "warranty_document" (file) - Upload warranty certificate

2. **Section**: "Warranty Information"

3. **Usage**: These fields appear in product forms and can be filled when creating/editing products.

### Scenario 2: Customer Preferences

1. **Create Custom Fields for Customers**:
   - Field: "preferred_contact_method" (select) - Options: "Email", "Phone", "SMS"
   - Field: "marketing_opt_in" (boolean)
   - Field: "special_instructions" (textarea)

2. **Section**: "Preferences"

### Scenario 3: Supplier Certifications

1. **Create Custom Fields for Suppliers**:
   - Field: "iso_certified" (boolean)
   - Field: "certification_number" (text)
   - Field: "certification_expiry" (date)
   - Field: "audit_score" (number) - Min: 0, Max: 100

2. **Section**: "Certifications"

---

## Advanced Features

### Field Ordering

Drag and drop fields in the Custom Fields manager to reorder them. The order affects how they appear in forms.

### Section Grouping

Group related fields under a section name (e.g., "Warranty Information", "Shipping Details"). Fields with the same section are displayed together in a card.

### Validation Rules

- **Text/Textarea**: Min/max length, regex pattern
- **Number**: Min/max value
- **Email**: Automatic email format validation
- **Phone**: Phone number format validation
- **URL**: URL format validation
- **Select/Multiselect**: Define available options

### Conditional Display

Fields can be shown/hidden based on the `isActive` flag. Archived fields don't appear in forms but data is preserved.

---

## Data Migration

When deleting custom fields:

1. **Soft Delete (Archive)**: Field is hidden but data remains
2. **Hard Delete**: Field and its data are permanently removed
3. **Restore**: Bring back archived fields

---

## Performance Considerations

1. **Indexing**: Custom fields are indexed by `entityType` and `order`
2. **Caching**: Frontend queries use React Query with 60s stale time
3. **Lazy Loading**: Custom fields load only when needed
4. **Pagination**: API supports pagination for large field lists

---

## Security

1. **Authentication Required**: All endpoints require authentication
2. **Role-Based Access**: Only ADMIN and MANAGER can create/modify fields
3. **Validation**: Server-side validation prevents invalid data
4. **Reserved Names**: System field names are protected
5. **XSS Protection**: All inputs are sanitized

---

## Troubleshooting

### Field Not Appearing in Form

1. Check field is active (`isActive: true`)
2. Verify entity type matches
3. Check `DynamicFormFields` component is included in form

### Validation Errors

1. Ensure field configuration matches data type
2. Check required fields are filled
3. Verify validation rules (min/max, options)

### API Errors

1. Check user has ADMIN or MANAGER role
2. Verify field name is unique for entity type
3. Ensure field name follows naming rules (lowercase, underscores only)

---

## Future Enhancements

Potential improvements:

1. **Conditional Fields**: Show/hide based on other field values
2. **Field Dependencies**: Link fields together
3. **Calculated Fields**: Auto-compute values
4. **Field Templates**: Predefined field sets
5. **Import/Export**: Bulk field management
6. **Field History**: Track changes over time
7. **Multi-language**: Internationalize field labels

---

## API Response Examples

### Get Custom Fields for Products

**Request:**
```
GET /api/v1/custom-fields/entity/product
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c8b1f8e4e1a1",
      "entityType": "product",
      "fieldName": "warranty_period",
      "fieldLabel": "Warranty Period",
      "fieldType": "text",
      "required": false,
      "placeholder": "e.g., 12 months",
      "helpText": "Specify the warranty duration",
      "order": 0,
      "section": "Warranty Information",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Create Custom Field

**Request:**
```
POST /api/v1/custom-fields
Content-Type: application/json

{
  "entityType": "product",
  "fieldName": "warranty_period",
  "fieldLabel": "Warranty Period",
  "fieldType": "text",
  "required": false,
  "placeholder": "e.g., 12 months",
  "helpText": "Specify the warranty duration",
  "section": "Warranty Information"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c8b1f8e4e1a1",
    "entityType": "product",
    "fieldName": "warranty_period",
    "fieldLabel": "Warranty Period",
    "fieldType": "text",
    "required": false,
    "order": 0,
    "section": "Warranty Information",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Custom field created successfully"
}
```

---

## Best Practices

1. **Naming Convention**: Use descriptive, snake_case field names
2. **Organization**: Group related fields in sections
3. **Documentation**: Use help text to guide users
4. **Validation**: Set appropriate min/max and patterns
5. **Required Fields**: Use sparingly to avoid form friction
6. **Testing**: Test custom fields with various data types
7. **Cleanup**: Archive unused fields instead of deleting
8. **Performance**: Limit the number of fields per entity (< 20)

---

## Support

For issues or questions:
- Check validation errors in browser console
- Review backend logs for API errors
- Ensure proper authentication and permissions
- Verify field configuration matches entity type

---

## Version History

- **v1.0.0** (2025-01-13): Initial release
  - 12 field types
  - 8 entity types
  - Full CRUD operations
  - Drag-and-drop ordering
  - Section grouping
  - Soft delete/restore

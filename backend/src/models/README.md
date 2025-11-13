# Models Directory

This directory contains Mongoose models for the inventory management system.

## Pre-existing Models

There are pre-existing model files in the `../models_temp` directory that were created before the backend structure setup. These models have TypeScript errors that need to be fixed to work with strict mode:

1. **ActivityLog.ts** - Activity logging model
2. **Category.ts** - Product category model
3. **Customer.ts** - Customer management model
4. **Invoice.ts** - Invoice model
5. **Notification.ts** - Notification system model
6. **Payment.ts** - Payment tracking model
7. **Permission.ts** - Permission management
8. **Product.ts** - Product model
9. **ProductVariant.ts** - Product variant model
10. **PurchaseOrder.ts** - Purchase order model
11. **Role.ts** - User role model
12. **SalesOrder.ts** - Sales order model
13. **Settings.ts** - Application settings
14. **Stock.ts** - Stock tracking model
15. **StockLocation.ts** - Stock location model
16. **StockTransaction.ts** - Stock transaction model
17. **Supplier.ts** - Supplier management model
18. **User.ts** - User authentication model
19. **Warehouse.ts** - Warehouse management model
20. **index.ts** - Model exports

## Known Issues with Pre-existing Models

The models in `../models_temp` have the following TypeScript strict mode issues:

1. **Property Access**: Need to use bracket notation for index signature access (e.g., `obj['property']` instead of `obj.property`)
2. **JWT Signing**: Need to use proper type assertions for `expiresIn` in jwt.sign calls
3. **Process.env**: Need to use bracket notation (e.g., `process.env['VAR']`)
4. **Unused Parameters**: Need to prefix unused parameters with underscore
5. **Type Assertions**: Need proper type assertions for Mongoose documents and methods

## How to Fix

To fix these models:

1. Update all `process.env.VAR` to `process.env['VAR']`
2. Fix index signature property access issues
3. Add proper type assertions for Mongoose static methods
4. Fix JWT token generation to use SignOptions type assertion
5. Add underscore prefix to unused parameters
6. Test each model individually before moving to the main models directory

## Creating New Models

When creating new models, use this structure:

```typescript
import { Schema, model, Document } from 'mongoose';

// Define interface
export interface IYourModel extends Document {
  field1: string;
  field2: number;
  // ... other fields
  createdAt: Date;
  updatedAt: Date;
}

// Define schema
const yourModelSchema = new Schema<IYourModel>(
  {
    field1: { type: String, required: true },
    field2: { type: Number, required: true },
    // ... other fields
  },
  {
    timestamps: true,
  }
);

// Export model
export default model<IYourModel>('YourModel', yourModelSchema);
```

## Example: Simple Model

See the User model in `../models_temp/User.ts` for a comprehensive example of:
- Pre-save hooks for password hashing
- Instance methods for password comparison
- Static methods for querying
- Proper TypeScript typing

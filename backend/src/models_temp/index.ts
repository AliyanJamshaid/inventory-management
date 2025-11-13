/**
 * Models Index
 * Central export point for all Mongoose models
 */

// User and Authentication
export { default as User } from './User';
export { default as Role } from './Role';
export { default as Permission } from './Permission';

// Product Management
export { default as Product } from './Product';
export { default as ProductVariant } from './ProductVariant';
export { default as Category } from './Category';

// Warehouse and Stock Management
export { default as Warehouse } from './Warehouse';
export { default as StockLocation } from './StockLocation';
export { default as Stock } from './Stock';
export { default as StockTransaction } from './StockTransaction';

// Supplier Management
export { default as Supplier } from './Supplier';
export { default as PurchaseOrder } from './PurchaseOrder';

// Customer Management
export { default as Customer } from './Customer';
export { default as SalesOrder } from './SalesOrder';

// Financial Management
export { default as Invoice } from './Invoice';
export { default as Payment } from './Payment';

// System Management
export { default as Notification } from './Notification';
export { default as ActivityLog } from './ActivityLog';
export { default as Settings } from './Settings';

// Re-export types and enums for convenience
export * from '../types/models';

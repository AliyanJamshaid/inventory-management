/**
 * Order Validators
 * Validation rules for purchase orders, sales orders, invoices, and payments
 */

import { body, param, query } from 'express-validator';
import {
  PurchaseOrderStatus,
  SalesOrderStatus,
  InvoiceStatus,
  PaymentMethod,
  PaymentTransactionStatus,
} from '../types/models';

/**
 * Validation rules for order items
 */
const orderItemValidators = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),

  body('items.*.product')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('items.*.variant')
    .optional()
    .isMongoId()
    .withMessage('Invalid variant ID'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('items.*.unitPrice')
    .notEmpty()
    .withMessage('Unit price is required')
    .isFloat({ min: 0 })
    .withMessage('Unit price cannot be negative'),

  body('items.*.tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax cannot be negative'),
];

// ===== PURCHASE ORDER VALIDATORS =====

/**
 * Validation rules for creating a purchase order
 */
export const createPurchaseOrderValidators = [
  body('supplier')
    .notEmpty()
    .withMessage('Supplier is required')
    .isMongoId()
    .withMessage('Invalid supplier ID'),

  body('orderDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid order date format'),

  body('expectedDeliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expected delivery date format'),

  ...orderItemValidators,

  body('shipping')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Shipping cost cannot be negative'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),
];

/**
 * Validation rules for updating a purchase order
 */
export const updatePurchaseOrderValidators = [
  param('id').isMongoId().withMessage('Invalid purchase order ID'),

  body('supplier')
    .optional()
    .isMongoId()
    .withMessage('Invalid supplier ID'),

  body('expectedDeliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expected delivery date format'),

  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),

  body('items.*.product')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('items.*.variant')
    .optional()
    .isMongoId()
    .withMessage('Invalid variant ID'),

  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('items.*.unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price cannot be negative'),

  body('items.*.tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax cannot be negative'),

  body('shipping')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Shipping cost cannot be negative'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),
];

/**
 * Validation rules for purchase order status update
 */
export const purchaseOrderStatusValidators = [
  param('id').isMongoId().withMessage('Invalid purchase order ID'),
];

/**
 * Validation rules for receiving purchase order
 */
export const receivePurchaseOrderValidators = [
  param('id').isMongoId().withMessage('Invalid purchase order ID'),

  body('warehouse')
    .notEmpty()
    .withMessage('Warehouse is required')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),

  body('location')
    .optional()
    .isMongoId()
    .withMessage('Invalid location ID'),
];

/**
 * Validation rules for purchase order queries
 */
export const purchaseOrderQueryValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('supplier')
    .optional()
    .isMongoId()
    .withMessage('Invalid supplier ID'),

  query('status')
    .optional()
    .isIn(Object.values(PurchaseOrderStatus))
    .withMessage('Invalid status'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),

  query('sortBy')
    .optional()
    .isIn(['poNumber', 'orderDate', 'expectedDeliveryDate', 'total'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

// ===== SALES ORDER VALIDATORS =====

/**
 * Validation rules for creating a sales order
 */
export const createSalesOrderValidators = [
  body('customer')
    .notEmpty()
    .withMessage('Customer is required')
    .isMongoId()
    .withMessage('Invalid customer ID'),

  body('orderDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid order date format'),

  body('deliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid delivery date format'),

  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),

  body('items.*.product')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('items.*.variant')
    .optional()
    .isMongoId()
    .withMessage('Invalid variant ID'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('items.*.unitPrice')
    .notEmpty()
    .withMessage('Unit price is required')
    .isFloat({ min: 0 })
    .withMessage('Unit price cannot be negative'),

  body('items.*.discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount cannot be negative'),

  body('items.*.tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax cannot be negative'),

  body('shipping')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Shipping cost cannot be negative'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),
];

/**
 * Validation rules for updating a sales order
 */
export const updateSalesOrderValidators = [
  param('id').isMongoId().withMessage('Invalid sales order ID'),

  body('customer')
    .optional()
    .isMongoId()
    .withMessage('Invalid customer ID'),

  body('deliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid delivery date format'),

  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),

  body('items.*.product')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('items.*.variant')
    .optional()
    .isMongoId()
    .withMessage('Invalid variant ID'),

  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('items.*.unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price cannot be negative'),

  body('items.*.discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount cannot be negative'),

  body('items.*.tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax cannot be negative'),

  body('shipping')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Shipping cost cannot be negative'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),
];

/**
 * Validation rules for sales order status update
 */
export const salesOrderStatusValidators = [
  param('id').isMongoId().withMessage('Invalid sales order ID'),
];

/**
 * Validation rules for shipping sales order
 */
export const shipSalesOrderValidators = [
  param('id').isMongoId().withMessage('Invalid sales order ID'),

  body('warehouse')
    .notEmpty()
    .withMessage('Warehouse is required')
    .isMongoId()
    .withMessage('Invalid warehouse ID'),

  body('location')
    .optional()
    .isMongoId()
    .withMessage('Invalid location ID'),
];

/**
 * Validation rules for sales order queries
 */
export const salesOrderQueryValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('customer')
    .optional()
    .isMongoId()
    .withMessage('Invalid customer ID'),

  query('status')
    .optional()
    .isIn(Object.values(SalesOrderStatus))
    .withMessage('Invalid status'),

  query('paymentStatus')
    .optional()
    .isIn(['PENDING', 'PARTIAL', 'PAID'])
    .withMessage('Invalid payment status'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),

  query('sortBy')
    .optional()
    .isIn(['soNumber', 'orderDate', 'deliveryDate', 'total'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

// ===== INVOICE VALIDATORS =====

/**
 * Validation rules for creating an invoice
 */
export const createInvoiceValidators = [
  body('customer')
    .notEmpty()
    .withMessage('Customer is required')
    .isMongoId()
    .withMessage('Invalid customer ID'),

  body('salesOrder')
    .optional()
    .isMongoId()
    .withMessage('Invalid sales order ID'),

  body('invoiceDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid invoice date format'),

  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Invalid due date format'),

  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),

  body('items.*.product')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('items.*.variant')
    .optional()
    .isMongoId()
    .withMessage('Invalid variant ID'),

  body('items.*.description')
    .notEmpty()
    .withMessage('Item description is required')
    .trim(),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('items.*.unitPrice')
    .notEmpty()
    .withMessage('Unit price is required')
    .isFloat({ min: 0 })
    .withMessage('Unit price cannot be negative'),

  body('items.*.discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount cannot be negative'),

  body('items.*.tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax cannot be negative'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),
];

/**
 * Validation rules for updating an invoice
 */
export const updateInvoiceValidators = [
  param('id').isMongoId().withMessage('Invalid invoice ID'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),

  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),
];

/**
 * Validation rules for recording invoice payment
 */
export const recordInvoicePaymentValidators = [
  param('id').isMongoId().withMessage('Invalid invoice ID'),

  body('amount')
    .notEmpty()
    .withMessage('Payment amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be positive'),

  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(Object.values(PaymentMethod))
    .withMessage('Invalid payment method'),

  body('transactionId')
    .optional()
    .trim(),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

/**
 * Validation rules for invoice queries
 */
export const invoiceQueryValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('customer')
    .optional()
    .isMongoId()
    .withMessage('Invalid customer ID'),

  query('status')
    .optional()
    .isIn(Object.values(InvoiceStatus))
    .withMessage('Invalid status'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),

  query('sortBy')
    .optional()
    .isIn(['invoiceNumber', 'invoiceDate', 'dueDate', 'total'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

// ===== PAYMENT VALIDATORS =====

/**
 * Validation rules for creating a payment
 */
export const createPaymentValidators = [
  body('invoice')
    .notEmpty()
    .withMessage('Invoice is required')
    .isMongoId()
    .withMessage('Invalid invoice ID'),

  body('amount')
    .notEmpty()
    .withMessage('Payment amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be positive'),

  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(Object.values(PaymentMethod))
    .withMessage('Invalid payment method'),

  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid payment date format'),

  body('transactionId')
    .optional()
    .trim(),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

/**
 * Validation rules for payment queries
 */
export const paymentQueryValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('invoice')
    .optional()
    .isMongoId()
    .withMessage('Invalid invoice ID'),

  query('status')
    .optional()
    .isIn(Object.values(PaymentTransactionStatus))
    .withMessage('Invalid status'),

  query('paymentMethod')
    .optional()
    .isIn(Object.values(PaymentMethod))
    .withMessage('Invalid payment method'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),

  query('sortBy')
    .optional()
    .isIn(['paymentDate', 'amount'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

/**
 * Validation rules for payment summary queries
 */
export const paymentSummaryQueryValidators = [
  query('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),

  query('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format'),
];

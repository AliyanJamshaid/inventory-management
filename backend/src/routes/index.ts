/**
 * Routes Index
 * Central location for all API routes
 */

import { Router } from 'express';
import systemRoutes from './systemRoutes';
import analyticsRoutes from './analyticsRoutes';
import reportRoutes from './reportRoutes';
import notificationRoutes from './notificationRoutes';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import categoryRoutes from './categoryRoutes';
import productRoutes from './productRoutes';
import warehouseRoutes from './warehouseRoutes';
import stockRoutes from './stockRoutes';
import transactionRoutes from './transactionRoutes';
import supplierRoutes from './supplierRoutes';
import customerRoutes from './customerRoutes';
import purchaseOrderRoutes from './purchaseOrderRoutes';
import salesOrderRoutes from './salesOrderRoutes';
import invoiceRoutes from './invoiceRoutes';
import paymentRoutes from './paymentRoutes';
import customFieldRoutes from './customFieldRoutes';
import workflowRoutes from './workflowRoutes';
import roleRoutes from './roleRoutes';
import permissionRoutes from './permissionRoutes';

const router = Router();

/**
 * Mount all route modules
 */

// Authentication routes
router.use('/auth', authRoutes);

// User management routes
router.use('/users', userRoutes);

// Role and Permission routes
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);

// System routes
router.use('/system', systemRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);

// Custom fields routes
router.use('/custom-fields', customFieldRoutes);

// Product and Inventory Management routes
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/stock', stockRoutes);
router.use('/transactions', transactionRoutes);

// Supplier and customer management routes
router.use('/suppliers', supplierRoutes);
router.use('/customers', customerRoutes);

// Order management routes
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/sales-orders', salesOrderRoutes);

// Invoice and payment routes
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);

// Workflow routes
router.use('/workflows', workflowRoutes);

export default router;

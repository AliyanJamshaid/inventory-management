/**
 * Analytics Routes
 * API routes for analytics and dashboard statistics
 */

import { Router } from 'express';
import {
  getDashboardStats,
  getSalesAnalytics,
  getInventoryAnalytics,
  getRevenueAnalytics,
  getTopProducts,
  getLowStockAlerts,
  getExpiringProducts,
} from '../controllers/analyticsController';
import { authenticate, isStaffOrAbove } from '../middleware/auth';

const router = Router();

/**
 * All analytics routes require authentication
 */
router.use(authenticate);

/**
 * @route GET /api/v1/analytics/dashboard
 * @desc Get dashboard statistics
 * @access Private (Staff and above)
 */
router.get('/dashboard', isStaffOrAbove, getDashboardStats);

/**
 * @route GET /api/v1/analytics/sales
 * @desc Get sales analytics with date range and grouping options
 * @access Private (Staff and above)
 */
router.get('/sales', isStaffOrAbove, getSalesAnalytics);

/**
 * @route GET /api/v1/analytics/inventory
 * @desc Get inventory analytics including turnover, dead stock, ABC analysis
 * @access Private (Staff and above)
 */
router.get('/inventory', isStaffOrAbove, getInventoryAnalytics);

/**
 * @route GET /api/v1/analytics/revenue
 * @desc Get revenue analytics with profit/loss calculations
 * @access Private (Staff and above)
 */
router.get('/revenue', isStaffOrAbove, getRevenueAnalytics);

/**
 * @route GET /api/v1/analytics/top-products
 * @desc Get top selling products
 * @access Private (Staff and above)
 */
router.get('/top-products', isStaffOrAbove, getTopProducts);

/**
 * @route GET /api/v1/analytics/low-stock
 * @desc Get low stock alerts
 * @access Private (Staff and above)
 */
router.get('/low-stock', isStaffOrAbove, getLowStockAlerts);

/**
 * @route GET /api/v1/analytics/expiring
 * @desc Get expiring products within specified days
 * @access Private (Staff and above)
 */
router.get('/expiring', isStaffOrAbove, getExpiringProducts);

export default router;

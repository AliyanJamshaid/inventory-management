/**
 * Report Routes
 * API routes for report generation and export
 */

import { Router } from 'express';
import {
  getStockValuationReport,
  getSalesSummaryReport,
  getPurchaseSummaryReport,
  getProfitLossReport,
  getCustomerSummaryReport,
  getSupplierSummaryReport,
  exportReport,
} from '../controllers/reportController';
import { authenticate, isStaffOrAbove, isAdminOrManager } from '../middleware/auth';

const router = Router();

/**
 * All report routes require authentication
 */
router.use(authenticate);

/**
 * @route GET /api/v1/reports/stock-valuation
 * @desc Get stock valuation report with FIFO calculations
 * @access Private (Staff and above)
 */
router.get('/stock-valuation', isStaffOrAbove, getStockValuationReport);

/**
 * @route GET /api/v1/reports/sales-summary
 * @desc Get sales summary report by date range
 * @access Private (Staff and above)
 */
router.get('/sales-summary', isStaffOrAbove, getSalesSummaryReport);

/**
 * @route GET /api/v1/reports/purchase-summary
 * @desc Get purchase summary report by date range
 * @access Private (Staff and above)
 */
router.get('/purchase-summary', isStaffOrAbove, getPurchaseSummaryReport);

/**
 * @route GET /api/v1/reports/profit-loss
 * @desc Get profit and loss report
 * @access Private (Manager and above)
 */
router.get('/profit-loss', isAdminOrManager, getProfitLossReport);

/**
 * @route GET /api/v1/reports/customer-summary
 * @desc Get customer summary report with purchase history
 * @access Private (Staff and above)
 */
router.get('/customer-summary', isStaffOrAbove, getCustomerSummaryReport);

/**
 * @route GET /api/v1/reports/supplier-summary
 * @desc Get supplier summary report with order history
 * @access Private (Staff and above)
 */
router.get('/supplier-summary', isStaffOrAbove, getSupplierSummaryReport);

/**
 * @route POST /api/v1/reports/export
 * @desc Export report as CSV or PDF
 * @access Private (Staff and above)
 */
router.post('/export', isStaffOrAbove, exportReport);

export default router;

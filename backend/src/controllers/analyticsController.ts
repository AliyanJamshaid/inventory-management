/**
 * Analytics Controller
 * Handles analytics and dashboard statistics
 */

import { Response } from 'express';
import { IAuthRequest } from '../types';
import { sendSuccess } from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import mongoose from 'mongoose';

/**
 * Get dashboard statistics
 * @route GET /api/v1/analytics/dashboard
 * @access Private
 */
export const getDashboardStats = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Import models dynamically to avoid circular dependencies
    const Product = mongoose.model('Product');
    const Stock = mongoose.model('Stock');
    const SalesOrder = mongoose.model('SalesOrder');
    const ActivityLog = mongoose.model('ActivityLog');

    // Get total products
    const totalProducts = await Product.countDocuments({ isActive: true });

    // Get total stock value
    const stockValue = await Stock.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $multiply: ['$quantity', '$productDetails.costPrice'] },
          },
        },
      },
    ]);

    const totalStockValue = stockValue[0]?.totalValue || 0;

    // Get low stock count
    const lowStockCount = await Stock.countDocuments({
      $expr: { $lte: ['$quantity', '$reorderPoint'] },
    });

    // Get orders count
    const ordersToday = await SalesOrder.countDocuments({
      orderDate: { $gte: todayStart },
    });
    const ordersWeek = await SalesOrder.countDocuments({
      orderDate: { $gte: weekStart },
    });
    const ordersMonth = await SalesOrder.countDocuments({
      orderDate: { $gte: monthStart },
    });

    // Get revenue
    const revenueToday = await SalesOrder.aggregate([
      { $match: { orderDate: { $gte: todayStart }, status: { $in: ['completed', 'paid'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const revenueWeek = await SalesOrder.aggregate([
      { $match: { orderDate: { $gte: weekStart }, status: { $in: ['completed', 'paid'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const revenueMonth = await SalesOrder.aggregate([
      { $match: { orderDate: { $gte: monthStart }, status: { $in: ['completed', 'paid'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // Get top 5 selling products
    const topProducts = await SalesOrder.aggregate([
      { $match: { status: { $in: ['completed', 'paid'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          productId: '$_id',
          name: '$productDetails.name',
          sku: '$productDetails.sku',
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    // Get recent activities
    const recentActivities = await ActivityLog.find()
      .populate('user', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    const stats = {
      totalProducts,
      totalStockValue: Math.round(totalStockValue * 100) / 100,
      lowStockCount,
      orders: {
        today: ordersToday,
        week: ordersWeek,
        month: ordersMonth,
      },
      revenue: {
        today: Math.round((revenueToday[0]?.total || 0) * 100) / 100,
        week: Math.round((revenueWeek[0]?.total || 0) * 100) / 100,
        month: Math.round((revenueMonth[0]?.total || 0) * 100) / 100,
      },
      topProducts,
      recentActivities,
    };

    sendSuccess(res, stats, 'Dashboard statistics retrieved successfully');
  }
);

/**
 * Get sales analytics
 * @route GET /api/v1/analytics/sales
 * @access Private
 */
export const getSalesAnalytics = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { startDate, endDate, groupBy = 'daily' } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const SalesOrder = mongoose.model('SalesOrder');

    // Group format based on groupBy parameter
    let groupFormat: any;
    if (groupBy === 'daily') {
      groupFormat = {
        year: { $year: '$orderDate' },
        month: { $month: '$orderDate' },
        day: { $dayOfMonth: '$orderDate' },
      };
    } else if (groupBy === 'weekly') {
      groupFormat = {
        year: { $year: '$orderDate' },
        week: { $week: '$orderDate' },
      };
    } else {
      groupFormat = {
        year: { $year: '$orderDate' },
        month: { $month: '$orderDate' },
      };
    }

    // Sales by date
    const salesByDate = await SalesOrder.aggregate([
      {
        $match: {
          orderDate: { $gte: start, $lte: end },
          status: { $in: ['completed', 'paid'] },
        },
      },
      {
        $group: {
          _id: groupFormat,
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Sales by category
    const salesByCategory = await SalesOrder.aggregate([
      {
        $match: {
          orderDate: { $gte: start, $lte: end },
          status: { $in: ['completed', 'paid'] },
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDetails.category',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$categoryDetails._id',
          categoryName: { $first: '$categoryDetails.name' },
          totalSales: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } },
          totalQuantity: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    // Sales by customer
    const salesByCustomer = await SalesOrder.aggregate([
      {
        $match: {
          orderDate: { $gte: start, $lte: end },
          status: { $in: ['completed', 'paid'] },
        },
      },
      {
        $group: {
          _id: '$customer',
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      { $unwind: '$customerDetails' },
      {
        $project: {
          customerId: '$_id',
          customerName: {
            $concat: ['$customerDetails.firstName', ' ', '$customerDetails.lastName'],
          },
          email: '$customerDetails.email',
          totalSales: 1,
          orderCount: 1,
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 20 },
    ]);

    const analytics = {
      salesByDate,
      salesByCategory,
      salesByCustomer,
      summary: {
        totalSales: salesByDate.reduce((sum, item) => sum + item.totalSales, 0),
        totalOrders: salesByDate.reduce((sum, item) => sum + item.orderCount, 0),
        averageOrderValue:
          salesByDate.reduce((sum, item) => sum + item.totalSales, 0) /
          salesByDate.reduce((sum, item) => sum + item.orderCount, 0) || 0,
      },
    };

    sendSuccess(res, analytics, 'Sales analytics retrieved successfully');
  }
);

/**
 * Get inventory analytics
 * @route GET /api/v1/analytics/inventory
 * @access Private
 */
export const getInventoryAnalytics = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const Stock = mongoose.model('Stock');
    const Product = mongoose.model('Product');
    const StockTransaction = mongoose.model('StockTransaction');

    // Stock levels by warehouse
    const stockByWarehouse = await Stock.aggregate([
      {
        $lookup: {
          from: 'warehouses',
          localField: 'warehouse',
          foreignField: '_id',
          as: 'warehouseDetails',
        },
      },
      { $unwind: '$warehouseDetails' },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$warehouse',
          warehouseName: { $first: '$warehouseDetails.name' },
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: {
            $sum: { $multiply: ['$quantity', '$productDetails.costPrice'] },
          },
        },
      },
      { $sort: { totalValue: -1 } },
    ]);

    // Stock turnover ratio (Last 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const turnoverData = await StockTransaction.aggregate([
      {
        $match: {
          transactionDate: { $gte: ninetyDaysAgo },
          type: 'sale',
        },
      },
      {
        $group: {
          _id: '$product',
          totalSold: { $sum: '$quantity' },
        },
      },
      {
        $lookup: {
          from: 'stocks',
          localField: '_id',
          foreignField: 'product',
          as: 'stockInfo',
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: { path: '$stockInfo', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          productName: { $first: '$productInfo.name' },
          sku: { $first: '$productInfo.sku' },
          totalSold: { $first: '$totalSold' },
          currentStock: { $sum: '$stockInfo.quantity' },
        },
      },
      {
        $project: {
          productName: 1,
          sku: 1,
          totalSold: 1,
          currentStock: 1,
          turnoverRatio: {
            $cond: [
              { $gt: ['$currentStock', 0] },
              { $divide: ['$totalSold', { $multiply: ['$currentStock', 3] }] }, // 90 days = 3 months
              0,
            ],
          },
        },
      },
      { $sort: { turnoverRatio: -1 } },
      { $limit: 50 },
    ]);

    // Dead stock identification (No sales in 90 days)
    const deadStock = await Stock.aggregate([
      {
        $lookup: {
          from: 'stocktransactions',
          let: { productId: '$product' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$product', '$$productId'] },
                transactionDate: { $gte: ninetyDaysAgo },
                type: 'sale',
              },
            },
          ],
          as: 'recentSales',
        },
      },
      { $match: { recentSales: { $size: 0 }, quantity: { $gt: 0 } } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $lookup: {
          from: 'warehouses',
          localField: 'warehouse',
          foreignField: '_id',
          as: 'warehouseDetails',
        },
      },
      { $unwind: '$warehouseDetails' },
      {
        $project: {
          productId: '$product',
          productName: '$productDetails.name',
          sku: '$productDetails.sku',
          warehouse: '$warehouseDetails.name',
          quantity: 1,
          value: { $multiply: ['$quantity', '$productDetails.costPrice'] },
        },
      },
      { $sort: { value: -1 } },
      { $limit: 20 },
    ]);

    // ABC Analysis
    const abcAnalysis = await Stock.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          productId: '$product',
          productName: '$productDetails.name',
          sku: '$productDetails.sku',
          quantity: 1,
          value: { $multiply: ['$quantity', '$productDetails.costPrice'] },
        },
      },
      { $sort: { value: -1 } },
    ]);

    // Calculate ABC categories
    const totalValue = abcAnalysis.reduce((sum, item) => sum + item.value, 0);
    let cumulativeValue = 0;
    const abcCategorized = abcAnalysis.map((item) => {
      cumulativeValue += item.value;
      const cumulativePercentage = (cumulativeValue / totalValue) * 100;
      let category = 'C';
      if (cumulativePercentage <= 80) category = 'A';
      else if (cumulativePercentage <= 95) category = 'B';

      return {
        ...item,
        category,
        cumulativePercentage: Math.round(cumulativePercentage * 100) / 100,
      };
    });

    const analytics = {
      stockByWarehouse,
      turnoverData: turnoverData.slice(0, 20),
      deadStock,
      abcAnalysis: {
        categoryA: abcCategorized.filter((item) => item.category === 'A').length,
        categoryB: abcCategorized.filter((item) => item.category === 'B').length,
        categoryC: abcCategorized.filter((item) => item.category === 'C').length,
        items: abcCategorized.slice(0, 50),
      },
    };

    sendSuccess(res, analytics, 'Inventory analytics retrieved successfully');
  }
);

/**
 * Get revenue analytics
 * @route GET /api/v1/analytics/revenue
 * @access Private
 */
export const getRevenueAnalytics = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const SalesOrder = mongoose.model('SalesOrder');
    const PurchaseOrder = mongoose.model('PurchaseOrder');

    // Revenue by day
    const revenueByDay = await SalesOrder.aggregate([
      {
        $match: {
          orderDate: { $gte: start, $lte: end },
          status: { $in: ['completed', 'paid'] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' },
            day: { $dayOfMonth: '$orderDate' },
          },
          revenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Cost by day (purchases)
    const costByDay = await PurchaseOrder.aggregate([
      {
        $match: {
          orderDate: { $gte: start, $lte: end },
          status: { $in: ['completed', 'received'] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' },
            day: { $dayOfMonth: '$orderDate' },
          },
          cost: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Profit calculation
    const profitData = revenueByDay.map((revenueItem) => {
      const costItem = costByDay.find(
        (c) =>
          c._id.year === revenueItem._id.year &&
          c._id.month === revenueItem._id.month &&
          c._id.day === revenueItem._id.day
      );

      return {
        date: revenueItem._id,
        revenue: revenueItem.revenue,
        cost: costItem?.cost || 0,
        profit: revenueItem.revenue - (costItem?.cost || 0),
        margin:
          revenueItem.revenue > 0
            ? ((revenueItem.revenue - (costItem?.cost || 0)) / revenueItem.revenue) * 100
            : 0,
      };
    });

    const totalRevenue = revenueByDay.reduce((sum, item) => sum + item.revenue, 0);
    const totalCost = costByDay.reduce((sum, item) => sum + item.cost, 0);
    const totalProfit = totalRevenue - totalCost;
    const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const analytics = {
      profitData,
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        averageMargin: Math.round(averageMargin * 100) / 100,
      },
    };

    sendSuccess(res, analytics, 'Revenue analytics retrieved successfully');
  }
);

/**
 * Get top selling products
 * @route GET /api/v1/analytics/top-products
 * @access Private
 */
export const getTopProducts = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { limit = 10, startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const SalesOrder = mongoose.model('SalesOrder');

    const topProducts = await SalesOrder.aggregate([
      {
        $match: {
          orderDate: { $gte: start, $lte: end },
          status: { $in: ['completed', 'paid'] },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } },
          orderCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDetails.category',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productId: '$_id',
          name: '$productDetails.name',
          sku: '$productDetails.sku',
          category: '$categoryDetails.name',
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          averagePrice: { $divide: ['$totalRevenue', '$totalQuantity'] },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit as string) },
    ]);

    sendSuccess(res, topProducts, 'Top products retrieved successfully');
  }
);

/**
 * Get low stock alerts
 * @route GET /api/v1/analytics/low-stock
 * @access Private
 */
export const getLowStockAlerts = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const Stock = mongoose.model('Stock');

    const lowStockItems = await Stock.aggregate([
      {
        $match: {
          $expr: { $lte: ['$quantity', '$reorderPoint'] },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $lookup: {
          from: 'warehouses',
          localField: 'warehouse',
          foreignField: '_id',
          as: 'warehouseDetails',
        },
      },
      { $unwind: '$warehouseDetails' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDetails.category',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productId: '$product',
          productName: '$productDetails.name',
          sku: '$productDetails.sku',
          category: '$categoryDetails.name',
          warehouse: '$warehouseDetails.name',
          currentQuantity: '$quantity',
          reorderPoint: '$reorderPoint',
          reorderQuantity: '$reorderQuantity',
          deficit: { $subtract: ['$reorderPoint', '$quantity'] },
          status: {
            $cond: [
              { $eq: ['$quantity', 0] },
              'OUT_OF_STOCK',
              'LOW_STOCK',
            ],
          },
        },
      },
      { $sort: { deficit: -1 } },
    ]);

    sendSuccess(res, lowStockItems, 'Low stock alerts retrieved successfully');
  }
);

/**
 * Get expiring products
 * @route GET /api/v1/analytics/expiring
 * @access Private
 */
export const getExpiringProducts = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { days = 30 } = req.query;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days as string));

    const Stock = mongoose.model('Stock');

    const expiringProducts = await Stock.aggregate([
      {
        $match: {
          expiryDate: { $lte: expiryDate, $gte: new Date() },
          quantity: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $lookup: {
          from: 'warehouses',
          localField: 'warehouse',
          foreignField: '_id',
          as: 'warehouseDetails',
        },
      },
      { $unwind: '$warehouseDetails' },
      {
        $project: {
          productId: '$product',
          productName: '$productDetails.name',
          sku: '$productDetails.sku',
          batchNumber: '$batchNumber',
          warehouse: '$warehouseDetails.name',
          quantity: 1,
          expiryDate: 1,
          daysUntilExpiry: {
            $ceil: {
              $divide: [
                { $subtract: ['$expiryDate', new Date()] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
          value: { $multiply: ['$quantity', '$productDetails.costPrice'] },
        },
      },
      { $sort: { daysUntilExpiry: 1 } },
    ]);

    sendSuccess(res, expiringProducts, 'Expiring products retrieved successfully');
  }
);

export default {
  getDashboardStats,
  getSalesAnalytics,
  getInventoryAnalytics,
  getRevenueAnalytics,
  getTopProducts,
  getLowStockAlerts,
  getExpiringProducts,
};

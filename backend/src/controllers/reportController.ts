/**
 * Report Controller
 * Handles report generation and export functionality
 */

import { Response } from 'express';
import { IAuthRequest } from '../types';
import { sendSuccess } from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import mongoose from 'mongoose';

/**
 * Get stock valuation report
 * @route GET /api/v1/reports/stock-valuation
 * @access Private
 */
export const getStockValuationReport = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { warehouseId, categoryId } = req.query;

    const Stock = mongoose.model('Stock');

    const matchStage: any = {};
    if (warehouseId) matchStage.warehouse = new mongoose.Types.ObjectId(warehouseId as string);

    const stockValuation = await Stock.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      ...(categoryId
        ? [
            {
              $match: {
                'productDetails.category': new mongoose.Types.ObjectId(categoryId as string),
              },
            },
          ]
        : []),
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
          productName: '$productDetails.name',
          sku: '$productDetails.sku',
          category: '$categoryDetails.name',
          warehouse: '$warehouseDetails.name',
          quantity: 1,
          costPrice: '$productDetails.costPrice',
          sellingPrice: '$productDetails.sellingPrice',
          totalCost: { $multiply: ['$quantity', '$productDetails.costPrice'] },
          totalSellingValue: { $multiply: ['$quantity', '$productDetails.sellingPrice'] },
          potentialProfit: {
            $multiply: [
              '$quantity',
              { $subtract: ['$productDetails.sellingPrice', '$productDetails.costPrice'] },
            ],
          },
        },
      },
      { $sort: { totalCost: -1 } },
    ]);

    const summary = stockValuation.reduce(
      (acc, item) => ({
        totalItems: acc.totalItems + 1,
        totalQuantity: acc.totalQuantity + item.quantity,
        totalCostValue: acc.totalCostValue + item.totalCost,
        totalSellingValue: acc.totalSellingValue + item.totalSellingValue,
        totalPotentialProfit: acc.totalPotentialProfit + item.potentialProfit,
      }),
      {
        totalItems: 0,
        totalQuantity: 0,
        totalCostValue: 0,
        totalSellingValue: 0,
        totalPotentialProfit: 0,
      }
    );

    const report = {
      items: stockValuation,
      summary: {
        ...summary,
        averageMargin:
          summary.totalSellingValue > 0
            ? ((summary.totalPotentialProfit / summary.totalSellingValue) * 100).toFixed(2)
            : 0,
      },
      generatedAt: new Date(),
    };

    sendSuccess(res, report, 'Stock valuation report generated successfully');
  }
);

/**
 * Get sales summary report
 * @route GET /api/v1/reports/sales-summary
 * @access Private
 */
export const getSalesSummaryReport = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { startDate, endDate, customerId } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const SalesOrder = mongoose.model('SalesOrder');

    const matchStage: any = {
      orderDate: { $gte: start, $lte: end },
    };

    if (customerId) {
      matchStage.customer = new mongoose.Types.ObjectId(customerId as string);
    }

    const salesData = await SalesOrder.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      { $unwind: { path: '$customerDetails', preserveNullAndEmptyArrays: true } },
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
        $project: {
          orderId: '$orderNumber',
          orderDate: '$orderDate',
          customerName: {
            $concat: [
              { $ifNull: ['$customerDetails.firstName', 'Walk-in'] },
              ' ',
              { $ifNull: ['$customerDetails.lastName', 'Customer'] },
            ],
          },
          customerEmail: '$customerDetails.email',
          productName: '$productDetails.name',
          sku: '$productDetails.sku',
          quantity: '$items.quantity',
          unitPrice: '$items.unitPrice',
          discount: '$items.discount',
          lineTotal: {
            $multiply: [
              '$items.quantity',
              { $subtract: ['$items.unitPrice', { $ifNull: ['$items.discount', 0] }] },
            ],
          },
          status: '$status',
          paymentStatus: '$paymentStatus',
        },
      },
      { $sort: { orderDate: -1 } },
    ]);

    const summary = salesData.reduce(
      (acc, item) => ({
        totalOrders: acc.totalOrders + (acc.seenOrders.has(item.orderId) ? 0 : 1),
        totalQuantity: acc.totalQuantity + item.quantity,
        totalRevenue: acc.totalRevenue + item.lineTotal,
        totalDiscount: acc.totalDiscount + (item.discount || 0) * item.quantity,
        seenOrders: acc.seenOrders.add(item.orderId),
      }),
      {
        totalOrders: 0,
        totalQuantity: 0,
        totalRevenue: 0,
        totalDiscount: 0,
        seenOrders: new Set(),
      }
    );

    const report = {
      items: salesData,
      summary: {
        totalOrders: summary.totalOrders,
        totalQuantity: summary.totalQuantity,
        totalRevenue: Math.round(summary.totalRevenue * 100) / 100,
        totalDiscount: Math.round(summary.totalDiscount * 100) / 100,
        averageOrderValue:
          summary.totalOrders > 0
            ? Math.round((summary.totalRevenue / summary.totalOrders) * 100) / 100
            : 0,
      },
      period: {
        startDate: start,
        endDate: end,
      },
      generatedAt: new Date(),
    };

    sendSuccess(res, report, 'Sales summary report generated successfully');
  }
);

/**
 * Get purchase summary report
 * @route GET /api/v1/reports/purchase-summary
 * @access Private
 */
export const getPurchaseSummaryReport = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { startDate, endDate, supplierId } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const PurchaseOrder = mongoose.model('PurchaseOrder');

    const matchStage: any = {
      orderDate: { $gte: start, $lte: end },
    };

    if (supplierId) {
      matchStage.supplier = new mongoose.Types.ObjectId(supplierId as string);
    }

    const purchaseData = await PurchaseOrder.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplier',
          foreignField: '_id',
          as: 'supplierDetails',
        },
      },
      { $unwind: '$supplierDetails' },
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
        $project: {
          orderId: '$orderNumber',
          orderDate: '$orderDate',
          supplierName: '$supplierDetails.companyName',
          supplierEmail: '$supplierDetails.email',
          productName: '$productDetails.name',
          sku: '$productDetails.sku',
          quantity: '$items.quantity',
          unitPrice: '$items.unitPrice',
          lineTotal: { $multiply: ['$items.quantity', '$items.unitPrice'] },
          status: '$status',
          expectedDelivery: '$expectedDeliveryDate',
        },
      },
      { $sort: { orderDate: -1 } },
    ]);

    const summary = purchaseData.reduce(
      (acc, item) => ({
        totalOrders: acc.totalOrders + (acc.seenOrders.has(item.orderId) ? 0 : 1),
        totalQuantity: acc.totalQuantity + item.quantity,
        totalCost: acc.totalCost + item.lineTotal,
        seenOrders: acc.seenOrders.add(item.orderId),
      }),
      {
        totalOrders: 0,
        totalQuantity: 0,
        totalCost: 0,
        seenOrders: new Set(),
      }
    );

    const report = {
      items: purchaseData,
      summary: {
        totalOrders: summary.totalOrders,
        totalQuantity: summary.totalQuantity,
        totalCost: Math.round(summary.totalCost * 100) / 100,
        averageOrderValue:
          summary.totalOrders > 0
            ? Math.round((summary.totalCost / summary.totalOrders) * 100) / 100
            : 0,
      },
      period: {
        startDate: start,
        endDate: end,
      },
      generatedAt: new Date(),
    };

    sendSuccess(res, report, 'Purchase summary report generated successfully');
  }
);

/**
 * Get profit and loss report
 * @route GET /api/v1/reports/profit-loss
 * @access Private
 */
export const getProfitLossReport = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const SalesOrder = mongoose.model('SalesOrder');
    const PurchaseOrder = mongoose.model('PurchaseOrder');

    // Calculate revenue
    const revenue = await SalesOrder.aggregate([
      {
        $match: {
          orderDate: { $gte: start, $lte: end },
          status: { $in: ['completed', 'paid'] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    // Calculate cost of goods sold
    const cogs = await SalesOrder.aggregate([
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
        $group: {
          _id: null,
          totalCOGS: {
            $sum: { $multiply: ['$items.quantity', '$productDetails.costPrice'] },
          },
        },
      },
    ]);

    // Calculate operating expenses (purchases)
    const expenses = await PurchaseOrder.aggregate([
      {
        $match: {
          orderDate: { $gte: start, $lte: end },
          status: { $in: ['completed', 'received'] },
        },
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenue[0]?.totalRevenue || 0;
    const totalCOGS = cogs[0]?.totalCOGS || 0;
    const totalExpenses = expenses[0]?.totalExpenses || 0;
    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = totalRevenue - totalCOGS - totalExpenses;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const report = {
      revenue: {
        totalSales: Math.round(totalRevenue * 100) / 100,
        orderCount: revenue[0]?.orderCount || 0,
      },
      costs: {
        costOfGoodsSold: Math.round(totalCOGS * 100) / 100,
        operatingExpenses: Math.round(totalExpenses * 100) / 100,
        totalCosts: Math.round((totalCOGS + totalExpenses) * 100) / 100,
      },
      profit: {
        grossProfit: Math.round(grossProfit * 100) / 100,
        grossMargin: Math.round(grossMargin * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        netMargin: Math.round(netMargin * 100) / 100,
      },
      period: {
        startDate: start,
        endDate: end,
      },
      generatedAt: new Date(),
    };

    sendSuccess(res, report, 'Profit and loss report generated successfully');
  }
);

/**
 * Get customer summary report
 * @route GET /api/v1/reports/customer-summary
 * @access Private
 */
export const getCustomerSummaryReport = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const SalesOrder = mongoose.model('SalesOrder');

    const customerData = await SalesOrder.aggregate([
      {
        $match: {
          orderDate: { $gte: start, $lte: end },
          status: { $in: ['completed', 'paid'] },
        },
      },
      {
        $group: {
          _id: '$customer',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrderDate: { $max: '$orderDate' },
          firstOrderDate: { $min: '$orderDate' },
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
          phone: '$customerDetails.phone',
          totalOrders: 1,
          totalSpent: 1,
          averageOrderValue: { $divide: ['$totalSpent', '$totalOrders'] },
          lastOrderDate: 1,
          firstOrderDate: 1,
          daysSinceLastOrder: {
            $ceil: {
              $divide: [{ $subtract: [new Date(), '$lastOrderDate'] }, 1000 * 60 * 60 * 24],
            },
          },
        },
      },
      { $sort: { totalSpent: -1 } },
    ]);

    const summary = {
      totalCustomers: customerData.length,
      totalRevenue: Math.round(
        customerData.reduce((sum, customer) => sum + customer.totalSpent, 0) * 100
      ) / 100,
      totalOrders: customerData.reduce((sum, customer) => sum + customer.totalOrders, 0),
      averageCustomerValue:
        customerData.length > 0
          ? Math.round(
              (customerData.reduce((sum, customer) => sum + customer.totalSpent, 0) /
                customerData.length) *
                100
            ) / 100
          : 0,
    };

    const report = {
      items: customerData,
      summary,
      period: {
        startDate: start,
        endDate: end,
      },
      generatedAt: new Date(),
    };

    sendSuccess(res, report, 'Customer summary report generated successfully');
  }
);

/**
 * Get supplier summary report
 * @route GET /api/v1/reports/supplier-summary
 * @access Private
 */
export const getSupplierSummaryReport = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const PurchaseOrder = mongoose.model('PurchaseOrder');

    const supplierData = await PurchaseOrder.aggregate([
      {
        $match: {
          orderDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$supplier',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrderDate: { $max: '$orderDate' },
          firstOrderDate: { $min: '$orderDate' },
        },
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: '_id',
          foreignField: '_id',
          as: 'supplierDetails',
        },
      },
      { $unwind: '$supplierDetails' },
      {
        $project: {
          supplierId: '$_id',
          supplierName: '$supplierDetails.companyName',
          contactPerson: '$supplierDetails.contactPerson',
          email: '$supplierDetails.email',
          phone: '$supplierDetails.phone',
          totalOrders: 1,
          totalSpent: 1,
          averageOrderValue: { $divide: ['$totalSpent', '$totalOrders'] },
          lastOrderDate: 1,
          firstOrderDate: 1,
          daysSinceLastOrder: {
            $ceil: {
              $divide: [{ $subtract: [new Date(), '$lastOrderDate'] }, 1000 * 60 * 60 * 24],
            },
          },
        },
      },
      { $sort: { totalSpent: -1 } },
    ]);

    const summary = {
      totalSuppliers: supplierData.length,
      totalPurchases: Math.round(
        supplierData.reduce((sum, supplier) => sum + supplier.totalSpent, 0) * 100
      ) / 100,
      totalOrders: supplierData.reduce((sum, supplier) => sum + supplier.totalOrders, 0),
      averageSupplierValue:
        supplierData.length > 0
          ? Math.round(
              (supplierData.reduce((sum, supplier) => sum + supplier.totalSpent, 0) /
                supplierData.length) *
                100
            ) / 100
          : 0,
    };

    const report = {
      items: supplierData,
      summary,
      period: {
        startDate: start,
        endDate: end,
      },
      generatedAt: new Date(),
    };

    sendSuccess(res, report, 'Supplier summary report generated successfully');
  }
);

/**
 * Export report as CSV or PDF
 * @route POST /api/v1/reports/export
 * @access Private
 */
export const exportReport = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { reportType, format = 'csv', data } = req.body;

    if (!reportType || !data) {
      res.status(400).json({
        success: false,
        message: 'Report type and data are required',
      });
      return;
    }

    if (format === 'csv') {
      // Convert data to CSV format
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data
        .map((row: any) =>
          Object.values(row)
            .map((value: any) => {
              // Escape values containing commas or quotes
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(',')
        )
        .join('\n');

      const csv = `${headers}\n${rows}`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}-${Date.now()}.csv"`);
      res.send(csv);
    } else if (format === 'pdf') {
      // For PDF export, you would typically use a library like pdfkit or puppeteer
      // For now, we'll return a message indicating PDF export is not yet implemented
      res.status(501).json({
        success: false,
        message: 'PDF export is not yet implemented. Please use CSV format.',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid format. Supported formats: csv, pdf',
      });
    }
  }
);

export default {
  getStockValuationReport,
  getSalesSummaryReport,
  getPurchaseSummaryReport,
  getProfitLossReport,
  getCustomerSummaryReport,
  getSupplierSummaryReport,
  exportReport,
};

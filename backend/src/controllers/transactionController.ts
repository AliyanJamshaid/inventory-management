/**
 * Stock Transaction Controller
 * Handles stock transaction history and reporting
 */

import { Response } from 'express';
import { IAuthRequest } from '../types';
import {
  sendSuccess,
  sendNotFound,
  sendSuccessWithPagination,
} from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import { StockTransaction } from '../models';
import logger from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Get all transactions
 * GET /api/v1/transactions
 */
export const getAllTransactions = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};

    if (req.query.type) {
      filter.type = req.query.type;
    }

    if (req.query.warehouse) {
      filter.warehouse = req.query.warehouse;
    }

    if (req.query.product) {
      filter.product = req.query.product;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.transactionDate = {};
      if (req.query.startDate) {
        filter.transactionDate.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.transactionDate.$lte = new Date(req.query.endDate as string);
      }
    }

    logger.info('Getting all transactions', {
      filter,
      userId: req.user?.userId,
    });

    const total = await StockTransaction.countDocuments(filter);

    const transactions = await StockTransaction.find(filter)
      .populate('product', 'name sku')
      .populate('variant', 'variantName sku')
      .populate('warehouse', 'name code')
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('location', 'name code')
      .populate('performedBy', 'firstName lastName email')
      .sort({ transactionDate: -1 })
      .skip(skip)
      .limit(limit);

    sendSuccessWithPagination(
      res,
      transactions,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      'Transactions retrieved successfully'
    );
  }
);

/**
 * Get transaction by ID
 * GET /api/v1/transactions/:id
 */
export const getTransactionById = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    logger.info('Getting transaction by ID', {
      transactionId: id,
      userId: req.user?.userId,
    });

    const transaction = await StockTransaction.findById(id)
      .populate('product', 'name sku unit')
      .populate('variant', 'variantName sku')
      .populate('warehouse', 'name code address city')
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('location', 'name code type')
      .populate('performedBy', 'firstName lastName email');

    if (!transaction) {
      return sendNotFound(res, 'Transaction not found');
    }

    sendSuccess(res, transaction, 'Transaction retrieved successfully');
  }
);

/**
 * Get transactions for a product
 * GET /api/v1/transactions/product/:productId
 */
export const getProductTransactions = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    logger.info('Getting product transactions', {
      productId,
      userId: req.user?.userId,
    });

    const total = await StockTransaction.countDocuments({ product: productId });

    const transactions = await StockTransaction.find({ product: productId })
      .populate('warehouse', 'name code')
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('location', 'name code')
      .populate('performedBy', 'firstName lastName email')
      .sort({ transactionDate: -1 })
      .skip(skip)
      .limit(limit);

    sendSuccessWithPagination(
      res,
      transactions,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      'Product transactions retrieved successfully'
    );
  }
);

/**
 * Get transactions for a warehouse
 * GET /api/v1/transactions/warehouse/:warehouseId
 */
export const getWarehouseTransactions = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { warehouseId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { warehouse: warehouseId };

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.transactionDate = {};
      if (req.query.startDate) {
        filter.transactionDate.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.transactionDate.$lte = new Date(req.query.endDate as string);
      }
    }

    logger.info('Getting warehouse transactions', {
      warehouseId,
      userId: req.user?.userId,
    });

    const total = await StockTransaction.countDocuments(filter);

    const transactions = await StockTransaction.find(filter)
      .populate('product', 'name sku')
      .populate('variant', 'variantName sku')
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('performedBy', 'firstName lastName email')
      .sort({ transactionDate: -1 })
      .skip(skip)
      .limit(limit);

    sendSuccessWithPagination(
      res,
      transactions,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      'Warehouse transactions retrieved successfully'
    );
  }
);

/**
 * Get transaction summary/statistics
 * GET /api/v1/transactions/summary
 */
export const getTransactionSummary = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { startDate, endDate, warehouse } = req.query;

    logger.info('Getting transaction summary', {
      startDate,
      endDate,
      warehouse,
      userId: req.user?.userId,
    });

    const start = startDate
      ? new Date(startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    const end = endDate ? new Date(endDate as string) : new Date();

    const warehouseId = warehouse
      ? new mongoose.Types.ObjectId(warehouse as string)
      : undefined;

    const summary = await (StockTransaction as any).getMovementSummary(
      start,
      end,
      warehouseId
    );

    // Get total transactions
    const matchFilter: any = {
      transactionDate: { $gte: start, $lte: end },
    };
    if (warehouseId) {
      matchFilter.warehouse = warehouseId;
    }

    const totalTransactions = await StockTransaction.countDocuments(
      matchFilter
    );

    sendSuccess(
      res,
      {
        summary,
        totalTransactions,
        period: {
          startDate: start,
          endDate: end,
        },
      },
      'Transaction summary retrieved successfully'
    );
  }
);

export default {
  getAllTransactions,
  getTransactionById,
  getProductTransactions,
  getWarehouseTransactions,
  getTransactionSummary,
};

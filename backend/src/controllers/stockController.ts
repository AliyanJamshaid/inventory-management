/**
 * Stock Controller
 * Handles stock management and inventory operations
 */

import { Response } from 'express';
import { IAuthRequest } from '../types';
import { StockTransactionType } from '../types/models';
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendBadRequest,
  sendSuccessWithPagination,
} from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import { Stock, StockTransaction, Product, Warehouse } from '../models';
import logger from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Get all stock (with filters)
 * GET /api/v1/stock
 */
export const getAllStock = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};

    if (req.query.warehouse) {
      filter.warehouse = req.query.warehouse;
    }

    if (req.query.product) {
      filter.product = req.query.product;
    }

    if (req.query.location) {
      filter.location = req.query.location;
    }

    logger.info('Getting all stock', {
      filter,
      userId: req.user?.userId,
    });

    const total = await Stock.countDocuments(filter);

    const stocks = await Stock.find(filter)
      .populate('product', 'name sku unit')
      .populate('variant', 'variantName sku')
      .populate('warehouse', 'name code')
      .populate('location', 'name code')
      .sort({ 'product.name': 1 })
      .skip(skip)
      .limit(limit);

    sendSuccessWithPagination(
      res,
      stocks,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      'Stock retrieved successfully'
    );
  }
);

/**
 * Get stock by ID
 * GET /api/v1/stock/:id
 */
export const getStockById = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    logger.info('Getting stock by ID', {
      stockId: id,
      userId: req.user?.userId,
    });

    const stock = await Stock.findById(id)
      .populate('product', 'name sku unit costPrice sellingPrice')
      .populate('variant', 'variantName sku')
      .populate('warehouse', 'name code')
      .populate('location', 'name code type');

    if (!stock) {
      return sendNotFound(res, 'Stock not found');
    }

    sendSuccess(res, stock, 'Stock retrieved successfully');
  }
);

/**
 * Adjust stock quantity
 * POST /api/v1/stock/adjust
 */
export const adjustStock = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const {
      product,
      variant,
      warehouse,
      location,
      quantity,
      reasonCode,
      reference,
      batchNumber,
      serialNumber,
      notes,
    } = req.body;

    logger.info('Adjusting stock', {
      product,
      warehouse,
      quantity,
      userId: req.user?.userId,
    });

    // Validate product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return sendNotFound(res, 'Product not found');
    }

    // Validate warehouse exists
    const warehouseExists = await Warehouse.findById(warehouse);
    if (!warehouseExists) {
      return sendNotFound(res, 'Warehouse not found');
    }

    // Find or create stock record
    let stock = await Stock.findOne({
      product,
      variant: variant || null,
      warehouse,
      location: location || null,
    });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (!stock) {
        // Create new stock record
        stock = await Stock.create(
          [
            {
              product,
              variant,
              warehouse,
              location,
              quantity: Math.max(0, quantity),
              reservedQuantity: 0,
              minStockLevel: req.body.minStockLevel || 0,
              maxStockLevel: req.body.maxStockLevel || 0,
              reorderPoint: req.body.reorderPoint || 0,
              batchNumber,
              serialNumber,
              expirationDate: req.body.expirationDate,
            },
          ],
          { session }
        );
      } else {
        // Adjust existing stock
        await (stock as any).adjustQuantity(quantity);
        await stock.save({ session });
      }

      // Create stock transaction
      await StockTransaction.create(
        [
          {
            type:
              quantity >= 0
                ? StockTransactionType.IN
                : StockTransactionType.OUT,
            product,
            variant,
            warehouse,
            location,
            quantity,
            reasonCode,
            reference,
            batchNumber,
            serialNumber,
            performedBy: req.user!.userId,
            notes,
            transactionDate: new Date(),
          },
        ],
        { session }
      );

      await session.commitTransaction();

      await stock.populate([
        { path: 'product', select: 'name sku' },
        { path: 'warehouse', select: 'name code' },
      ]);

      logger.info('Stock adjusted successfully', {
        stockId: stock._id,
        quantity,
        userId: req.user?.userId,
      });

      sendSuccess(res, stock, 'Stock adjusted successfully');
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
);

/**
 * Transfer stock between warehouses
 * POST /api/v1/stock/transfer
 */
export const transferStock = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const {
      product,
      variant,
      fromWarehouse,
      toWarehouse,
      quantity,
      reference,
      notes,
    } = req.body;

    logger.info('Transferring stock', {
      product,
      fromWarehouse,
      toWarehouse,
      quantity,
      userId: req.user?.userId,
    });

    if (quantity <= 0) {
      return sendBadRequest(res, 'Quantity must be greater than 0');
    }

    if (fromWarehouse === toWarehouse) {
      return sendBadRequest(
        res,
        'Source and destination warehouses must be different'
      );
    }

    // Validate warehouses exist
    const fromWarehouseExists = await Warehouse.findById(fromWarehouse);
    const toWarehouseExists = await Warehouse.findById(toWarehouse);

    if (!fromWarehouseExists) {
      return sendNotFound(res, 'Source warehouse not found');
    }

    if (!toWarehouseExists) {
      return sendNotFound(res, 'Destination warehouse not found');
    }

    // Find stock in source warehouse
    const sourceStock = await Stock.findOne({
      product,
      variant: variant || null,
      warehouse: fromWarehouse,
    });

    if (!sourceStock) {
      return sendNotFound(res, 'Stock not found in source warehouse');
    }

    if ((sourceStock as any).availableQuantity < quantity) {
      return sendBadRequest(
        res,
        'Insufficient available stock in source warehouse'
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Decrease stock in source warehouse
      await (sourceStock as any).adjustQuantity(-quantity);
      await sourceStock.save({ session });

      // Find or create stock in destination warehouse
      let destStock = await Stock.findOne({
        product,
        variant: variant || null,
        warehouse: toWarehouse,
      });

      if (!destStock) {
        destStock = await Stock.create(
          [
            {
              product,
              variant,
              warehouse: toWarehouse,
              quantity,
              reservedQuantity: 0,
              minStockLevel: 0,
              maxStockLevel: 0,
              reorderPoint: 0,
            },
          ],
          { session }
        );
      } else {
        await (destStock as any).adjustQuantity(quantity);
        await destStock.save({ session });
      }

      // Create transfer transaction
      await StockTransaction.create(
        [
          {
            type: StockTransactionType.TRANSFER,
            product,
            variant,
            warehouse: fromWarehouse,
            quantity: -quantity,
            fromWarehouse,
            toWarehouse,
            reference,
            performedBy: req.user!.userId,
            notes,
            transactionDate: new Date(),
          },
          {
            type: StockTransactionType.TRANSFER,
            product,
            variant,
            warehouse: toWarehouse,
            quantity,
            fromWarehouse,
            toWarehouse,
            reference,
            performedBy: req.user!.userId,
            notes,
            transactionDate: new Date(),
          },
        ],
        { session }
      );

      await session.commitTransaction();

      logger.info('Stock transferred successfully', {
        product,
        fromWarehouse,
        toWarehouse,
        quantity,
        userId: req.user?.userId,
      });

      sendSuccess(
        res,
        {
          sourceStock,
          destStock,
        },
        'Stock transferred successfully'
      );
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
);

/**
 * Get low stock items
 * GET /api/v1/stock/low
 */
export const getLowStock = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { warehouse } = req.query;

    logger.info('Getting low stock items', {
      warehouse,
      userId: req.user?.userId,
    });

    const warehouseId = warehouse
      ? new mongoose.Types.ObjectId(warehouse as string)
      : undefined;

    const lowStockItems = await (Stock as any).findLowStock(warehouseId);

    sendSuccess(res, lowStockItems, 'Low stock items retrieved successfully');
  }
);

/**
 * Get expiring items
 * GET /api/v1/stock/expiring
 */
export const getExpiringStock = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const days = parseInt(req.query.days as string) || 30;
    const { warehouse } = req.query;

    logger.info('Getting expiring stock', {
      days,
      warehouse,
      userId: req.user?.userId,
    });

    const warehouseId = warehouse
      ? new mongoose.Types.ObjectId(warehouse as string)
      : undefined;

    const expiringItems = await (Stock as any).findExpiring(days, warehouseId);

    sendSuccess(res, expiringItems, 'Expiring items retrieved successfully');
  }
);

/**
 * Get stock for specific product
 * GET /api/v1/stock/product/:productId
 */
export const getProductStock = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { productId } = req.params;

    logger.info('Getting product stock', {
      productId,
      userId: req.user?.userId,
    });

    const product = await Product.findById(productId);

    if (!product) {
      return sendNotFound(res, 'Product not found');
    }

    const stocks = await Stock.find({ product: productId })
      .populate('warehouse', 'name code')
      .populate('location', 'name code')
      .populate('variant', 'variantName sku')
      .sort({ warehouse: 1 });

    // Calculate totals
    const totals = stocks.reduce(
      (acc, stock) => ({
        totalQuantity: acc.totalQuantity + stock.quantity,
        totalReserved: acc.totalReserved + stock.reservedQuantity,
        totalAvailable:
          acc.totalAvailable + (stock as any).availableQuantity,
      }),
      { totalQuantity: 0, totalReserved: 0, totalAvailable: 0 }
    );

    sendSuccess(
      res,
      {
        product: {
          id: product._id,
          name: product.name,
          sku: product.sku,
        },
        stocks,
        totals,
      },
      'Product stock retrieved successfully'
    );
  }
);

/**
 * Reserve stock
 * POST /api/v1/stock/reserve
 */
export const reserveStock = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { product, variant, warehouse, quantity, reference, notes } = req.body;

    logger.info('Reserving stock', {
      product,
      warehouse,
      quantity,
      userId: req.user?.userId,
    });

    if (quantity <= 0) {
      return sendBadRequest(res, 'Quantity must be greater than 0');
    }

    const stock = await Stock.findOne({
      product,
      variant: variant || null,
      warehouse,
    });

    if (!stock) {
      return sendNotFound(res, 'Stock not found');
    }

    try {
      await (stock as any).reserve(quantity);

      // Create transaction record
      await StockTransaction.create({
        type: StockTransactionType.ADJUSTMENT,
        product,
        variant,
        warehouse,
        quantity: 0, // No actual stock change, just reservation
        reasonCode: 'RESERVATION',
        reference,
        performedBy: req.user!.userId,
        notes: notes || `Reserved ${quantity} units`,
        transactionDate: new Date(),
      });

      logger.info('Stock reserved successfully', {
        stockId: stock._id,
        quantity,
        userId: req.user?.userId,
      });

      sendSuccess(res, stock, 'Stock reserved successfully');
    } catch (error: any) {
      return sendBadRequest(res, error.message);
    }
  }
);

/**
 * Release reserved stock
 * POST /api/v1/stock/release
 */
export const releaseStock = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { product, variant, warehouse, quantity, reference, notes } = req.body;

    logger.info('Releasing reserved stock', {
      product,
      warehouse,
      quantity,
      userId: req.user?.userId,
    });

    if (quantity <= 0) {
      return sendBadRequest(res, 'Quantity must be greater than 0');
    }

    const stock = await Stock.findOne({
      product,
      variant: variant || null,
      warehouse,
    });

    if (!stock) {
      return sendNotFound(res, 'Stock not found');
    }

    await (stock as any).release(quantity);

    // Create transaction record
    await StockTransaction.create({
      type: StockTransactionType.ADJUSTMENT,
      product,
      variant,
      warehouse,
      quantity: 0, // No actual stock change, just release reservation
      reasonCode: 'RELEASE',
      reference,
      performedBy: req.user!.userId,
      notes: notes || `Released ${quantity} units`,
      transactionDate: new Date(),
    });

    logger.info('Stock released successfully', {
      stockId: stock._id,
      quantity,
      userId: req.user?.userId,
    });

    sendSuccess(res, stock, 'Stock released successfully');
  }
);

export default {
  getAllStock,
  getStockById,
  adjustStock,
  transferStock,
  getLowStock,
  getExpiringStock,
  getProductStock,
  reserveStock,
  releaseStock,
};

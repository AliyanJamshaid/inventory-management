/**
 * Warehouse Controller
 * Handles warehouse management operations
 */

import { Response } from 'express';
import { IAuthRequest } from '../types';
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendBadRequest,
  sendSuccessWithPagination,
} from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import { Warehouse, Stock, StockLocation } from '../models';
import logger from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Get all warehouses
 * GET /api/v1/warehouses
 */
export const getAllWarehouses = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    } else {
      filter.isActive = true; // Default to active warehouses
    }

    logger.info('Getting all warehouses', {
      userId: req.user?.userId,
    });

    const total = await Warehouse.countDocuments(filter);

    const warehouses = await Warehouse.find(filter)
      .populate('manager', 'firstName lastName email')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    sendSuccessWithPagination(
      res,
      warehouses,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      'Warehouses retrieved successfully'
    );
  }
);

/**
 * Get warehouse by ID
 * GET /api/v1/warehouses/:id
 */
export const getWarehouseById = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    logger.info('Getting warehouse by ID', {
      warehouseId: id,
      userId: req.user?.userId,
    });

    const warehouse = await Warehouse.findById(id)
      .populate('manager', 'firstName lastName email phone')
      .populate('locations');

    if (!warehouse) {
      return sendNotFound(res, 'Warehouse not found');
    }

    // Get total stock value
    const totalStockValue = await (warehouse as any).getTotalStockValue();

    // Get stock count
    const stockCount = await Stock.countDocuments({ warehouse: id });

    sendSuccess(
      res,
      {
        ...warehouse.toObject(),
        totalStockValue,
        stockCount,
      },
      'Warehouse retrieved successfully'
    );
  }
);

/**
 * Create new warehouse
 * POST /api/v1/warehouses
 */
export const createWarehouse = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const {
      name,
      code,
      address,
      city,
      state,
      country,
      zipCode,
      phone,
      email,
      manager,
    } = req.body;

    logger.info('Creating new warehouse', {
      name,
      code,
      userId: req.user?.userId,
    });

    const warehouse = await Warehouse.create({
      name,
      code,
      address,
      city,
      state,
      country,
      zipCode,
      phone,
      email,
      manager,
    });

    await warehouse.populate('manager', 'firstName lastName email');

    logger.info('Warehouse created successfully', {
      warehouseId: warehouse._id,
      code,
      userId: req.user?.userId,
    });

    sendCreated(res, warehouse, 'Warehouse created successfully');
  }
);

/**
 * Update warehouse
 * PUT /api/v1/warehouses/:id
 */
export const updateWarehouse = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;

    logger.info('Updating warehouse', {
      warehouseId: id,
      userId: req.user?.userId,
    });

    const warehouse = await Warehouse.findById(id);

    if (!warehouse) {
      return sendNotFound(res, 'Warehouse not found');
    }

    Object.assign(warehouse, updateData);
    await warehouse.save();

    await warehouse.populate('manager', 'firstName lastName email');

    logger.info('Warehouse updated successfully', {
      warehouseId: id,
      userId: req.user?.userId,
    });

    sendSuccess(res, warehouse, 'Warehouse updated successfully');
  }
);

/**
 * Delete warehouse
 * DELETE /api/v1/warehouses/:id
 */
export const deleteWarehouse = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    logger.info('Deleting warehouse', {
      warehouseId: id,
      userId: req.user?.userId,
    });

    const warehouse = await Warehouse.findById(id);

    if (!warehouse) {
      return sendNotFound(res, 'Warehouse not found');
    }

    // Check if warehouse has stock
    const stockCount = await Stock.countDocuments({ warehouse: id });
    if (stockCount > 0) {
      return sendBadRequest(
        res,
        'Cannot delete warehouse with existing stock'
      );
    }

    // Delete all stock locations
    await StockLocation.deleteMany({ warehouse: id });

    await warehouse.deleteOne();

    logger.info('Warehouse deleted successfully', {
      warehouseId: id,
      userId: req.user?.userId,
    });

    sendSuccess(res, null, 'Warehouse deleted successfully');
  }
);

/**
 * Get stock in warehouse
 * GET /api/v1/warehouses/:id/stock
 */
export const getWarehouseStock = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    logger.info('Getting warehouse stock', {
      warehouseId: id,
      userId: req.user?.userId,
    });

    const warehouse = await Warehouse.findById(id);

    if (!warehouse) {
      return sendNotFound(res, 'Warehouse not found');
    }

    const filter: any = { warehouse: id };

    // Filter by low stock
    if (req.query.lowStock === 'true') {
      // This will be filtered after query since it requires virtual field
    }

    const total = await Stock.countDocuments(filter);

    let stocks = await Stock.find(filter)
      .populate('product', 'name sku')
      .populate('variant', 'variantName sku')
      .populate('location', 'name code')
      .sort({ 'product.name': 1 })
      .skip(skip)
      .limit(limit);

    // Filter by low stock if requested (using virtual field)
    if (req.query.lowStock === 'true') {
      stocks = stocks.filter((stock: any) => stock.isLowStock);
    }

    sendSuccessWithPagination(
      res,
      stocks,
      {
        page,
        limit,
        total: req.query.lowStock === 'true' ? stocks.length : total,
        totalPages: Math.ceil(
          (req.query.lowStock === 'true' ? stocks.length : total) / limit
        ),
      },
      'Warehouse stock retrieved successfully'
    );
  }
);

export default {
  getAllWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseStock,
};

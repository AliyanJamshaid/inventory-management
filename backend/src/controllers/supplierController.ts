/**
 * Supplier Controller
 * Handles all supplier-related operations
 */

import { Response } from 'express';
import mongoose from 'mongoose';
import { IAuthRequest } from '../types';
import Supplier from '../models/Supplier';
import PurchaseOrder from '../models/PurchaseOrder';
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendBadRequest,
  sendInternalError,
  sendSuccessWithPagination,
} from '../utils/responses';
import { logError, logDatabase } from '../utils/logger';

/**
 * Get all suppliers with pagination, search, and filtering
 * @route GET /api/v1/suppliers
 * @access Private
 */
export const getAllSuppliers = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      minRating,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (minRating) {
      query.rating = { $gte: parseInt(minRating as string, 10) };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const [suppliers, total] = await Promise.all([
      Supplier.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Supplier.countDocuments(query),
    ]);

    logDatabase('READ', 'Supplier', { count: suppliers.length });

    return sendSuccessWithPagination(
      res,
      suppliers,
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      'Suppliers retrieved successfully'
    );
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Get suppliers failed'));
    return sendInternalError(res, 'Failed to retrieve suppliers');
  }
};

/**
 * Get supplier by ID
 * @route GET /api/v1/suppliers/:id
 * @access Private
 */
export const getSupplierById = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findById(id).lean();

    if (!supplier) {
      return sendNotFound(res, 'Supplier not found');
    }

    logDatabase('READ', 'Supplier', { supplierId: id });

    return sendSuccess(res, supplier, 'Supplier retrieved successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Get supplier failed'));
    return sendInternalError(res, 'Failed to retrieve supplier');
  }
};

/**
 * Create new supplier
 * @route POST /api/v1/suppliers
 * @access Private (Admin/Manager)
 */
export const createSupplier = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const {
      name,
      code,
      email,
      phone,
      website,
      contactPerson,
      address,
      city,
      state,
      country,
      zipCode,
      taxId,
      paymentTerms,
      rating,
      isActive,
      notes,
    } = req.body;

    // Check if supplier code already exists
    const existingSupplier = await Supplier.findOne({ code: code.toUpperCase() });
    if (existingSupplier) {
      return sendBadRequest(res, 'Supplier code already exists');
    }

    // Create supplier
    const supplier = await Supplier.create({
      name,
      code: code.toUpperCase(),
      email,
      phone,
      website,
      contactPerson,
      address,
      city,
      state,
      country,
      zipCode,
      taxId,
      paymentTerms,
      rating,
      isActive,
      notes,
    });

    logDatabase('CREATE', 'Supplier', { supplierId: supplier._id });

    return sendCreated(res, supplier, 'Supplier created successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Create supplier failed'));
    return sendInternalError(res, 'Failed to create supplier');
  }
};

/**
 * Update supplier
 * @route PUT /api/v1/suppliers/:id
 * @access Private (Admin/Manager)
 */
export const updateSupplier = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If code is being updated, check if it already exists
    if (updateData.code) {
      const existingSupplier = await Supplier.findOne({
        code: updateData.code.toUpperCase(),
        _id: { $ne: id },
      });
      if (existingSupplier) {
        return sendBadRequest(res, 'Supplier code already exists');
      }
      updateData.code = updateData.code.toUpperCase();
    }

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return sendNotFound(res, 'Supplier not found');
    }

    logDatabase('UPDATE', 'Supplier', { supplierId: id });

    return sendSuccess(res, supplier, 'Supplier updated successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Update supplier failed'));
    return sendInternalError(res, 'Failed to update supplier');
  }
};

/**
 * Delete supplier
 * @route DELETE /api/v1/suppliers/:id
 * @access Private (Admin)
 */
export const deleteSupplier = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    // Check if supplier has any purchase orders
    const purchaseOrderCount = await PurchaseOrder.countDocuments({ supplier: id });
    if (purchaseOrderCount > 0) {
      return sendBadRequest(
        res,
        'Cannot delete supplier with existing purchase orders. Consider deactivating instead.'
      );
    }

    const supplier = await Supplier.findByIdAndDelete(id);

    if (!supplier) {
      return sendNotFound(res, 'Supplier not found');
    }

    logDatabase('DELETE', 'Supplier', { supplierId: id });

    return sendSuccess(res, { id }, 'Supplier deleted successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Delete supplier failed'));
    return sendInternalError(res, 'Failed to delete supplier');
  }
};

/**
 * Get supplier purchase orders
 * @route GET /api/v1/suppliers/:id/purchase-orders
 * @access Private
 */
export const getSupplierPurchaseOrders = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Verify supplier exists
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return sendNotFound(res, 'Supplier not found');
    }

    // Build query
    const query: any = { supplier: id };
    if (status) {
      query.status = status;
    }

    // Get purchase orders with pagination
    const [purchaseOrders, total] = await Promise.all([
      PurchaseOrder.find(query)
        .populate('createdBy', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName email')
        .populate('receivedBy', 'firstName lastName email')
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      PurchaseOrder.countDocuments(query),
    ]);

    return sendSuccessWithPagination(
      res,
      purchaseOrders,
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      'Purchase orders retrieved successfully'
    );
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Get supplier POs failed'));
    return sendInternalError(res, 'Failed to retrieve purchase orders');
  }
};

/**
 * Get supplier performance metrics
 * @route GET /api/v1/suppliers/:id/performance
 * @access Private
 */
export const getSupplierPerformance = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    // Verify supplier exists
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return sendNotFound(res, 'Supplier not found');
    }

    // Get purchase order statistics
    const purchaseOrders = await PurchaseOrder.find({ supplier: id });

    const totalOrders = purchaseOrders.length;
    const totalValue = purchaseOrders.reduce((sum, po) => sum + po.total, 0);

    const completedOrders = purchaseOrders.filter(
      po => po.status === 'RECEIVED'
    ).length;

    const cancelledOrders = purchaseOrders.filter(
      po => po.status === 'CANCELLED'
    ).length;

    // Calculate on-time delivery
    const receivedOrders = purchaseOrders.filter(
      po => po.status === 'RECEIVED' && po.actualDeliveryDate && po.expectedDeliveryDate
    );

    const onTimeDeliveries = receivedOrders.filter(
      po => po.actualDeliveryDate! <= po.expectedDeliveryDate!
    ).length;

    const onTimeDeliveryRate = receivedOrders.length > 0
      ? ((onTimeDeliveries / receivedOrders.length) * 100).toFixed(2)
      : 0;

    // Calculate average order value
    const averageOrderValue = totalOrders > 0
      ? (totalValue / totalOrders).toFixed(2)
      : 0;

    // Find overdue orders
    const today = new Date();
    const overdueOrders = purchaseOrders.filter(
      po =>
        (po.status === 'PENDING' || po.status === 'APPROVED') &&
        po.expectedDeliveryDate &&
        po.expectedDeliveryDate < today
    ).length;

    const performance = {
      supplierInfo: {
        id: supplier._id,
        name: supplier.name,
        code: supplier.code,
        rating: supplier.rating,
      },
      orderStatistics: {
        totalOrders,
        completedOrders,
        cancelledOrders,
        overdueOrders,
        totalValue: parseFloat(totalValue.toFixed(2)),
        averageOrderValue: parseFloat(averageOrderValue as string),
      },
      deliveryMetrics: {
        onTimeDeliveries,
        totalDeliveries: receivedOrders.length,
        onTimeDeliveryRate: parseFloat(onTimeDeliveryRate as string),
      },
    };

    return sendSuccess(
      res,
      performance,
      'Supplier performance retrieved successfully'
    );
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Get supplier performance failed'));
    return sendInternalError(res, 'Failed to retrieve supplier performance');
  }
};

export default {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierPurchaseOrders,
  getSupplierPerformance,
};

/**
 * Purchase Order Controller
 * Handles all purchase order operations with stock integration
 */

import { Response } from 'express';
import mongoose from 'mongoose';
import { IAuthRequest } from '../types';
import PurchaseOrder from '../models/PurchaseOrder';
import Supplier from '../models/Supplier';
import Stock from '../models/Stock';
import StockTransaction from '../models/StockTransaction';
import { PurchaseOrderStatus, StockTransactionType } from '../types/models';
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
 * Get all purchase orders with pagination and filtering
 * @route GET /api/v1/purchase-orders
 * @access Private
 */
export const getAllPurchaseOrders = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const {
      page = 1,
      limit = 10,
      supplier,
      status,
      startDate,
      endDate,
      sortBy = 'orderDate',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};

    if (supplier) {
      query.supplier = supplier;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate as string);
      if (endDate) query.orderDate.$lte = new Date(endDate as string);
    }

    // Build sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const [purchaseOrders, total] = await Promise.all([
      PurchaseOrder.find(query)
        .populate('supplier', 'name code email phone')
        .populate('createdBy', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName email')
        .populate('receivedBy', 'firstName lastName email')
        .populate('items.product', 'name sku')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      PurchaseOrder.countDocuments(query),
    ]);

    logDatabase('READ', 'PurchaseOrder', { count: purchaseOrders.length });

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
    logError(error instanceof Error ? error : new Error('Get purchase orders failed'));
    return sendInternalError(res, 'Failed to retrieve purchase orders');
  }
};

/**
 * Get purchase order by ID
 * @route GET /api/v1/purchase-orders/:id
 * @access Private
 */
export const getPurchaseOrderById = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(id)
      .populate('supplier')
      .populate('createdBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .populate('receivedBy', 'firstName lastName email')
      .populate('items.product')
      .populate('items.variant')
      .lean();

    if (!purchaseOrder) {
      return sendNotFound(res, 'Purchase order not found');
    }

    logDatabase('READ', 'PurchaseOrder', { poId: id });

    return sendSuccess(res, purchaseOrder, 'Purchase order retrieved successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Get purchase order failed'));
    return sendInternalError(res, 'Failed to retrieve purchase order');
  }
};

/**
 * Create new purchase order
 * @route POST /api/v1/purchase-orders
 * @access Private (Admin/Manager)
 */
export const createPurchaseOrder = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const {
      supplier,
      orderDate,
      expectedDeliveryDate,
      items,
      shipping,
      notes,
    } = req.body;

    // Verify supplier exists
    const supplierDoc = await Supplier.findById(supplier);
    if (!supplierDoc) {
      return sendBadRequest(res, 'Supplier not found');
    }

    // Generate PO number
    const poNumber = await PurchaseOrder.generatePONumber();

    // Create purchase order
    const purchaseOrder = await PurchaseOrder.create({
      poNumber,
      supplier,
      orderDate: orderDate || new Date(),
      expectedDeliveryDate,
      status: PurchaseOrderStatus.DRAFT,
      items,
      shipping: shipping || 0,
      notes,
      createdBy: req.user!.userId,
    });

    // Populate for response
    await purchaseOrder.populate([
      { path: 'supplier', select: 'name code' },
      { path: 'items.product', select: 'name sku' },
      { path: 'createdBy', select: 'firstName lastName email' },
    ]);

    logDatabase('CREATE', 'PurchaseOrder', { poId: purchaseOrder._id });

    return sendCreated(res, purchaseOrder, 'Purchase order created successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Create purchase order failed'));
    return sendInternalError(res, 'Failed to create purchase order');
  }
};

/**
 * Update purchase order
 * @route PUT /api/v1/purchase-orders/:id
 * @access Private (Admin/Manager)
 */
export const updatePurchaseOrder = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const purchaseOrder = await PurchaseOrder.findById(id);
    if (!purchaseOrder) {
      return sendNotFound(res, 'Purchase order not found');
    }

    // Only DRAFT orders can be updated
    if (purchaseOrder.status !== PurchaseOrderStatus.DRAFT) {
      return sendBadRequest(res, 'Only draft purchase orders can be updated');
    }

    // Don't allow updating certain fields
    delete updateData.poNumber;
    delete updateData.status;
    delete updateData.createdBy;

    Object.assign(purchaseOrder, updateData);
    await purchaseOrder.save();

    await purchaseOrder.populate([
      { path: 'supplier', select: 'name code' },
      { path: 'items.product', select: 'name sku' },
    ]);

    logDatabase('UPDATE', 'PurchaseOrder', { poId: id });

    return sendSuccess(res, purchaseOrder, 'Purchase order updated successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Update purchase order failed'));
    return sendInternalError(res, 'Failed to update purchase order');
  }
};

/**
 * Delete purchase order
 * @route DELETE /api/v1/purchase-orders/:id
 * @access Private (Admin)
 */
export const deletePurchaseOrder = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(id);
    if (!purchaseOrder) {
      return sendNotFound(res, 'Purchase order not found');
    }

    // Only DRAFT orders can be deleted
    if (purchaseOrder.status !== PurchaseOrderStatus.DRAFT) {
      return sendBadRequest(res, 'Only draft purchase orders can be deleted');
    }

    await purchaseOrder.deleteOne();

    logDatabase('DELETE', 'PurchaseOrder', { poId: id });

    return sendSuccess(res, { id }, 'Purchase order deleted successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Delete purchase order failed'));
    return sendInternalError(res, 'Failed to delete purchase order');
  }
};

/**
 * Approve purchase order
 * @route PUT /api/v1/purchase-orders/:id/approve
 * @access Private (Admin/Manager)
 */
export const approvePurchaseOrder = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(id);
    if (!purchaseOrder) {
      return sendNotFound(res, 'Purchase order not found');
    }

    await purchaseOrder.approve(new mongoose.Types.ObjectId(req.user!.userId));

    await purchaseOrder.populate([
      { path: 'supplier', select: 'name code' },
      { path: 'approvedBy', select: 'firstName lastName email' },
    ]);

    logDatabase('UPDATE', 'PurchaseOrder', { poId: id, action: 'approve' });

    return sendSuccess(res, purchaseOrder, 'Purchase order approved successfully');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Only')) {
      return sendBadRequest(res, error.message);
    }
    logError(error instanceof Error ? error : new Error('Approve purchase order failed'));
    return sendInternalError(res, 'Failed to approve purchase order');
  }
};

/**
 * Receive purchase order (create stock IN transactions)
 * @route PUT /api/v1/purchase-orders/:id/receive
 * @access Private (Admin/Manager/Staff)
 */
export const receivePurchaseOrder = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { warehouse, location } = req.body;

    const purchaseOrder = await PurchaseOrder.findById(id).session(session);
    if (!purchaseOrder) {
      await session.abortTransaction();
      return sendNotFound(res, 'Purchase order not found');
    }

    // Mark as received
    await purchaseOrder.markAsReceived(new mongoose.Types.ObjectId(req.user!.userId));

    // Create stock transactions and update stock for each item
    for (const item of purchaseOrder.items) {
      // Create stock IN transaction
      await StockTransaction.create(
        [
          {
            type: StockTransactionType.IN,
            product: item.product,
            variant: item.variant,
            warehouse,
            location,
            quantity: item.quantity,
            reference: purchaseOrder.poNumber,
            performedBy: req.user!.userId,
            notes: `Received from PO ${purchaseOrder.poNumber}`,
          },
        ],
        { session }
      );

      // Update or create stock record
      const stockQuery: any = {
        product: item.product,
        warehouse,
      };
      if (item.variant) {
        stockQuery.variant = item.variant;
      }
      if (location) {
        stockQuery.location = location;
      }

      const existingStock = await Stock.findOne(stockQuery).session(session);

      if (existingStock) {
        existingStock.quantity += item.quantity;
        await existingStock.save({ session });
      } else {
        await Stock.create(
          [
            {
              ...stockQuery,
              quantity: item.quantity,
              reservedQuantity: 0,
              minStockLevel: 0,
              maxStockLevel: 0,
              reorderPoint: 0,
            },
          ],
          { session }
        );
      }
    }

    await session.commitTransaction();

    await purchaseOrder.populate([
      { path: 'supplier', select: 'name code' },
      { path: 'receivedBy', select: 'firstName lastName email' },
    ]);

    logDatabase('UPDATE', 'PurchaseOrder', {
      poId: id,
      action: 'receive',
      warehouse,
    });

    return sendSuccess(res, purchaseOrder, 'Purchase order received and stock updated successfully');
  } catch (error) {
    await session.abortTransaction();
    if (error instanceof Error && error.message.includes('Only')) {
      return sendBadRequest(res, error.message);
    }
    logError(error instanceof Error ? error : new Error('Receive purchase order failed'));
    return sendInternalError(res, 'Failed to receive purchase order');
  } finally {
    session.endSession();
  }
};

/**
 * Cancel purchase order
 * @route PUT /api/v1/purchase-orders/:id/cancel
 * @access Private (Admin/Manager)
 */
export const cancelPurchaseOrder = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(id);
    if (!purchaseOrder) {
      return sendNotFound(res, 'Purchase order not found');
    }

    await purchaseOrder.cancel();

    await purchaseOrder.populate('supplier', 'name code');

    logDatabase('UPDATE', 'PurchaseOrder', { poId: id, action: 'cancel' });

    return sendSuccess(res, purchaseOrder, 'Purchase order cancelled successfully');
  } catch (error) {
    if (error instanceof Error && error.message.includes('cannot be cancelled')) {
      return sendBadRequest(res, error.message);
    }
    logError(error instanceof Error ? error : new Error('Cancel purchase order failed'));
    return sendInternalError(res, 'Failed to cancel purchase order');
  }
};

/**
 * Get overdue purchase orders
 * @route GET /api/v1/purchase-orders/overdue
 * @access Private
 */
export const getOverduePurchaseOrders = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const today = new Date();
    const overdueOrders = await PurchaseOrder.find({
      status: { $in: [PurchaseOrderStatus.PENDING, PurchaseOrderStatus.APPROVED] },
      expectedDeliveryDate: { $lt: today },
    })
      .populate('supplier', 'name code email phone')
      .populate('createdBy', 'firstName lastName email')
      .sort({ expectedDeliveryDate: 1 })
      .lean();

    return sendSuccess(
      res,
      overdueOrders,
      'Overdue purchase orders retrieved successfully'
    );
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Get overdue POs failed'));
    return sendInternalError(res, 'Failed to retrieve overdue purchase orders');
  }
};

export default {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  approvePurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
  getOverduePurchaseOrders,
};

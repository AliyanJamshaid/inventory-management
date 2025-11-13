/**
 * Sales Order Controller
 * Handles all sales order operations with stock integration
 */

import { Response } from 'express';
import mongoose from 'mongoose';
import { IAuthRequest } from '../types';
import SalesOrder from '../models/SalesOrder';
import Customer from '../models/Customer';
import Stock from '../models/Stock';
import StockTransaction from '../models/StockTransaction';
import Invoice from '../models/Invoice';
import { SalesOrderStatus, StockTransactionType, PaymentStatus, InvoiceStatus } from '../types/models';
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
 * Get all sales orders with pagination and filtering
 * @route GET /api/v1/sales-orders
 * @access Private
 */
export const getAllSalesOrders = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const {
      page = 1,
      limit = 10,
      customer,
      status,
      paymentStatus,
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

    if (customer) query.customer = customer;
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate as string);
      if (endDate) query.orderDate.$lte = new Date(endDate as string);
    }

    // Build sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [salesOrders, total] = await Promise.all([
      SalesOrder.find(query)
        .populate('customer', 'name customerNumber email phone')
        .populate('createdBy', 'firstName lastName email')
        .populate('processedBy', 'firstName lastName email')
        .populate('items.product', 'name sku')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      SalesOrder.countDocuments(query),
    ]);

    logDatabase('READ', 'SalesOrder', { count: salesOrders.length });

    return sendSuccessWithPagination(
      res,
      salesOrders,
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      'Sales orders retrieved successfully'
    );
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Get sales orders failed'));
    return sendInternalError(res, 'Failed to retrieve sales orders');
  }
};

/**
 * Get sales order by ID
 * @route GET /api/v1/sales-orders/:id
 * @access Private
 */
export const getSalesOrderById = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const salesOrder = await SalesOrder.findById(id)
      .populate('customer')
      .populate('createdBy', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName email')
      .populate('items.product')
      .populate('items.variant')
      .lean();

    if (!salesOrder) {
      return sendNotFound(res, 'Sales order not found');
    }

    logDatabase('READ', 'SalesOrder', { soId: id });

    return sendSuccess(res, salesOrder, 'Sales order retrieved successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Get sales order failed'));
    return sendInternalError(res, 'Failed to retrieve sales order');
  }
};

/**
 * Create new sales order
 * @route POST /api/v1/sales-orders
 * @access Private
 */
export const createSalesOrder = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const {
      customer,
      orderDate,
      deliveryDate,
      items,
      shipping,
      notes,
    } = req.body;

    // Verify customer exists
    const customerDoc = await Customer.findById(customer);
    if (!customerDoc) {
      return sendBadRequest(res, 'Customer not found');
    }

    // Generate SO number
    const soNumber = await SalesOrder.generateSONumber();

    // Create sales order
    const salesOrder = await SalesOrder.create({
      soNumber,
      customer,
      orderDate: orderDate || new Date(),
      deliveryDate,
      status: SalesOrderStatus.DRAFT,
      items,
      shipping: shipping || 0,
      paymentStatus: PaymentStatus.PENDING,
      notes,
      createdBy: req.user!.userId,
    });

    await salesOrder.populate([
      { path: 'customer', select: 'name customerNumber' },
      { path: 'items.product', select: 'name sku' },
      { path: 'createdBy', select: 'firstName lastName email' },
    ]);

    logDatabase('CREATE', 'SalesOrder', { soId: salesOrder._id });

    return sendCreated(res, salesOrder, 'Sales order created successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Create sales order failed'));
    return sendInternalError(res, 'Failed to create sales order');
  }
};

/**
 * Update sales order
 * @route PUT /api/v1/sales-orders/:id
 * @access Private
 */
export const updateSalesOrder = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const salesOrder = await SalesOrder.findById(id);
    if (!salesOrder) {
      return sendNotFound(res, 'Sales order not found');
    }

    // Only DRAFT orders can be fully updated
    if (salesOrder.status !== SalesOrderStatus.DRAFT) {
      return sendBadRequest(res, 'Only draft sales orders can be updated');
    }

    // Don't allow updating certain fields
    delete updateData.soNumber;
    delete updateData.status;
    delete updateData.createdBy;

    Object.assign(salesOrder, updateData);
    await salesOrder.save();

    await salesOrder.populate([
      { path: 'customer', select: 'name customerNumber' },
      { path: 'items.product', select: 'name sku' },
    ]);

    logDatabase('UPDATE', 'SalesOrder', { soId: id });

    return sendSuccess(res, salesOrder, 'Sales order updated successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Update sales order failed'));
    return sendInternalError(res, 'Failed to update sales order');
  }
};

/**
 * Delete sales order
 * @route DELETE /api/v1/sales-orders/:id
 * @access Private (Admin)
 */
export const deleteSalesOrder = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const salesOrder = await SalesOrder.findById(id);
    if (!salesOrder) {
      return sendNotFound(res, 'Sales order not found');
    }

    // Only DRAFT orders can be deleted
    if (salesOrder.status !== SalesOrderStatus.DRAFT) {
      return sendBadRequest(res, 'Only draft sales orders can be deleted');
    }

    await salesOrder.deleteOne();

    logDatabase('DELETE', 'SalesOrder', { soId: id });

    return sendSuccess(res, { id }, 'Sales order deleted successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Delete sales order failed'));
    return sendInternalError(res, 'Failed to delete sales order');
  }
};

/**
 * Confirm sales order
 * @route PUT /api/v1/sales-orders/:id/confirm
 * @access Private
 */
export const confirmSalesOrder = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const salesOrder = await SalesOrder.findById(id);
    if (!salesOrder) {
      return sendNotFound(res, 'Sales order not found');
    }

    await salesOrder.confirm();

    await salesOrder.populate('customer', 'name customerNumber');

    logDatabase('UPDATE', 'SalesOrder', { soId: id, action: 'confirm' });

    return sendSuccess(res, salesOrder, 'Sales order confirmed successfully');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Only')) {
      return sendBadRequest(res, error.message);
    }
    logError(error instanceof Error ? error : new Error('Confirm sales order failed'));
    return sendInternalError(res, 'Failed to confirm sales order');
  }
};

/**
 * Mark sales order as processing
 * @route PUT /api/v1/sales-orders/:id/process
 * @access Private
 */
export const processSalesOrder = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const salesOrder = await SalesOrder.findById(id);
    if (!salesOrder) {
      return sendNotFound(res, 'Sales order not found');
    }

    await salesOrder.markAsProcessing(new mongoose.Types.ObjectId(req.user!.userId));

    await salesOrder.populate([
      { path: 'customer', select: 'name customerNumber' },
      { path: 'processedBy', select: 'firstName lastName email' },
    ]);

    logDatabase('UPDATE', 'SalesOrder', { soId: id, action: 'process' });

    return sendSuccess(res, salesOrder, 'Sales order marked as processing');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Only')) {
      return sendBadRequest(res, error.message);
    }
    logError(error instanceof Error ? error : new Error('Process sales order failed'));
    return sendInternalError(res, 'Failed to process sales order');
  }
};

/**
 * Ship sales order (create stock OUT transactions)
 * @route PUT /api/v1/sales-orders/:id/ship
 * @access Private
 */
export const shipSalesOrder = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { warehouse, location } = req.body;

    const salesOrder = await SalesOrder.findById(id).session(session);
    if (!salesOrder) {
      await session.abortTransaction();
      return sendNotFound(res, 'Sales order not found');
    }

    // Check stock availability and create stock OUT transactions
    for (const item of salesOrder.items) {
      const stockQuery: any = {
        product: item.product,
        warehouse,
      };
      if (item.variant) stockQuery.variant = item.variant;
      if (location) stockQuery.location = location;

      const stock = await Stock.findOne(stockQuery).session(session);

      if (!stock || stock.quantity < item.quantity) {
        await session.abortTransaction();
        return sendBadRequest(res, `Insufficient stock for product ${item.product}`);
      }

      // Create stock OUT transaction
      await StockTransaction.create(
        [
          {
            type: StockTransactionType.OUT,
            product: item.product,
            variant: item.variant,
            warehouse,
            location,
            quantity: -item.quantity,
            reference: salesOrder.soNumber,
            performedBy: req.user!.userId,
            notes: `Shipped from SO ${salesOrder.soNumber}`,
          },
        ],
        { session }
      );

      // Update stock
      stock.quantity -= item.quantity;
      await stock.save({ session });
    }

    // Mark as shipped
    await salesOrder.markAsShipped();

    await session.commitTransaction();

    await salesOrder.populate('customer', 'name customerNumber');

    logDatabase('UPDATE', 'SalesOrder', { soId: id, action: 'ship', warehouse });

    return sendSuccess(res, salesOrder, 'Sales order shipped and stock updated successfully');
  } catch (error) {
    await session.abortTransaction();
    if (error instanceof Error && error.message.includes('Only')) {
      return sendBadRequest(res, error.message);
    }
    logError(error instanceof Error ? error : new Error('Ship sales order failed'));
    return sendInternalError(res, 'Failed to ship sales order');
  } finally {
    session.endSession();
  }
};

/**
 * Mark sales order as delivered
 * @route PUT /api/v1/sales-orders/:id/deliver
 * @access Private
 */
export const deliverSalesOrder = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const salesOrder = await SalesOrder.findById(id);
    if (!salesOrder) {
      return sendNotFound(res, 'Sales order not found');
    }

    await salesOrder.markAsDelivered();

    await salesOrder.populate('customer', 'name customerNumber');

    logDatabase('UPDATE', 'SalesOrder', { soId: id, action: 'deliver' });

    return sendSuccess(res, salesOrder, 'Sales order marked as delivered');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Only')) {
      return sendBadRequest(res, error.message);
    }
    logError(error instanceof Error ? error : new Error('Deliver sales order failed'));
    return sendInternalError(res, 'Failed to mark as delivered');
  }
};

/**
 * Cancel sales order
 * @route PUT /api/v1/sales-orders/:id/cancel
 * @access Private
 */
export const cancelSalesOrder = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const salesOrder = await SalesOrder.findById(id);
    if (!salesOrder) {
      return sendNotFound(res, 'Sales order not found');
    }

    await salesOrder.cancel();

    await salesOrder.populate('customer', 'name customerNumber');

    logDatabase('UPDATE', 'SalesOrder', { soId: id, action: 'cancel' });

    return sendSuccess(res, salesOrder, 'Sales order cancelled successfully');
  } catch (error) {
    if (error instanceof Error && error.message.includes('cannot be cancelled')) {
      return sendBadRequest(res, error.message);
    }
    logError(error instanceof Error ? error : new Error('Cancel sales order failed'));
    return sendInternalError(res, 'Failed to cancel sales order');
  }
};

/**
 * Generate invoice from sales order
 * @route POST /api/v1/sales-orders/:id/invoice
 * @access Private
 */
export const generateInvoice = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { dueDate, notes } = req.body;

    const salesOrder = await SalesOrder.findById(id);
    if (!salesOrder) {
      return sendNotFound(res, 'Sales order not found');
    }

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ salesOrder: id });
    if (existingInvoice) {
      return sendBadRequest(res, 'Invoice already exists for this sales order');
    }

    // Generate invoice number
    const invoiceNumber = await Invoice.generateInvoiceNumber();

    // Create invoice from sales order
    const invoiceItems = salesOrder.items.map(item => ({
      product: item.product,
      variant: item.variant,
      description: `Product ${item.product}`, // You might want to populate product details
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount,
      tax: item.tax,
      total: item.total,
    }));

    const invoice = await Invoice.create({
      invoiceNumber,
      salesOrder: salesOrder._id,
      customer: salesOrder.customer,
      invoiceDate: new Date(),
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      status: InvoiceStatus.DRAFT,
      items: invoiceItems,
      subtotal: salesOrder.subtotal,
      discount: salesOrder.discount,
      tax: salesOrder.tax,
      total: salesOrder.total,
      paidAmount: 0,
      balanceAmount: salesOrder.total,
      notes,
    });

    await invoice.populate([
      { path: 'customer', select: 'name customerNumber email' },
      { path: 'salesOrder', select: 'soNumber' },
    ]);

    logDatabase('CREATE', 'Invoice', { invoiceId: invoice._id, fromSO: id });

    return sendCreated(res, invoice, 'Invoice generated successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Generate invoice failed'));
    return sendInternalError(res, 'Failed to generate invoice');
  }
};

export default {
  getAllSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
  confirmSalesOrder,
  processSalesOrder,
  shipSalesOrder,
  deliverSalesOrder,
  cancelSalesOrder,
  generateInvoice,
};

/**
 * Invoice Controller
 * Handles all invoice operations
 */

import { Response } from 'express';
import mongoose from 'mongoose';
import { IAuthRequest } from '../types';
import Invoice from '../models/Invoice';
import Payment from '../models/Payment';
import Customer from '../models/Customer';
import { InvoiceStatus, PaymentMethod, PaymentTransactionStatus } from '../types/models';
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
 * Get all invoices with pagination and filtering
 * @route GET /api/v1/invoices
 * @access Private
 */
export const getAllInvoices = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const {
      page = 1,
      limit = 10,
      customer,
      status,
      startDate,
      endDate,
      sortBy = 'invoiceDate',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};

    if (customer) query.customer = customer;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate as string);
      if (endDate) query.invoiceDate.$lte = new Date(endDate as string);
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate('customer', 'name customerNumber email')
        .populate('salesOrder', 'soNumber')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Invoice.countDocuments(query),
    ]);

    logDatabase('READ', 'Invoice', { count: invoices.length });

    return sendSuccessWithPagination(
      res,
      invoices,
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      'Invoices retrieved successfully'
    );
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Get invoices failed'));
    return sendInternalError(res, 'Failed to retrieve invoices');
  }
};

/**
 * Get invoice by ID
 * @route GET /api/v1/invoices/:id
 * @access Private
 */
export const getInvoiceById = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id)
      .populate('customer')
      .populate('salesOrder')
      .populate('items.product')
      .lean();

    if (!invoice) {
      return sendNotFound(res, 'Invoice not found');
    }

    logDatabase('READ', 'Invoice', { invoiceId: id });

    return sendSuccess(res, invoice, 'Invoice retrieved successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Get invoice failed'));
    return sendInternalError(res, 'Failed to retrieve invoice');
  }
};

/**
 * Create new invoice
 * @route POST /api/v1/invoices
 * @access Private
 */
export const createInvoice = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { customer, salesOrder, invoiceDate, dueDate, items, notes } = req.body;

    const customerDoc = await Customer.findById(customer);
    if (!customerDoc) {
      return sendBadRequest(res, 'Customer not found');
    }

    const invoiceNumber = await Invoice.generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      customer,
      salesOrder,
      invoiceDate: invoiceDate || new Date(),
      dueDate,
      status: InvoiceStatus.DRAFT,
      items,
      notes,
    });

    await invoice.populate([
      { path: 'customer', select: 'name customerNumber email' },
      { path: 'items.product', select: 'name sku' },
    ]);

    logDatabase('CREATE', 'Invoice', { invoiceId: invoice._id });

    return sendCreated(res, invoice, 'Invoice created successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Create invoice failed'));
    return sendInternalError(res, 'Failed to create invoice');
  }
};

/**
 * Update invoice
 * @route PUT /api/v1/invoices/:id
 * @access Private
 */
export const updateInvoice = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return sendNotFound(res, 'Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      return sendBadRequest(res, 'Only draft invoices can be updated');
    }

    delete updateData.invoiceNumber;
    delete updateData.paidAmount;

    Object.assign(invoice, updateData);
    await invoice.save();

    await invoice.populate('customer', 'name customerNumber email');

    logDatabase('UPDATE', 'Invoice', { invoiceId: id });

    return sendSuccess(res, invoice, 'Invoice updated successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Update invoice failed'));
    return sendInternalError(res, 'Failed to update invoice');
  }
};

/**
 * Delete invoice
 * @route DELETE /api/v1/invoices/:id
 * @access Private (Admin)
 */
export const deleteInvoice = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return sendNotFound(res, 'Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      return sendBadRequest(res, 'Only draft invoices can be deleted');
    }

    await invoice.deleteOne();

    logDatabase('DELETE', 'Invoice', { invoiceId: id });

    return sendSuccess(res, { id }, 'Invoice deleted successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Delete invoice failed'));
    return sendInternalError(res, 'Failed to delete invoice');
  }
};

/**
 * Mark invoice as sent
 * @route PUT /api/v1/invoices/:id/send
 * @access Private
 */
export const sendInvoice = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return sendNotFound(res, 'Invoice not found');
    }

    await invoice.markAsSent();
    await invoice.populate('customer', 'name customerNumber email');

    logDatabase('UPDATE', 'Invoice', { invoiceId: id, action: 'send' });

    return sendSuccess(res, invoice, 'Invoice marked as sent');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Only')) {
      return sendBadRequest(res, error.message);
    }
    logError(error instanceof Error ? error : new Error('Send invoice failed'));
    return sendInternalError(res, 'Failed to send invoice');
  }
};

/**
 * Record payment for invoice
 * @route POST /api/v1/invoices/:id/payment
 * @access Private
 */
export const recordPayment = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, transactionId, notes } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return sendNotFound(res, 'Invoice not found');
    }

    // Create payment record
    const payment = await Payment.create({
      invoice: id,
      paymentDate: new Date(),
      amount,
      paymentMethod,
      transactionId,
      status: PaymentTransactionStatus.COMPLETED,
      notes,
      createdBy: req.user!.userId,
    });

    await payment.populate([
      { path: 'invoice', select: 'invoiceNumber total' },
      { path: 'createdBy', select: 'firstName lastName email' },
    ]);

    logDatabase('CREATE', 'Payment', { paymentId: payment._id, invoiceId: id });

    return sendCreated(res, payment, 'Payment recorded successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Record payment failed'));
    return sendInternalError(res, 'Failed to record payment');
  }
};

/**
 * Get overdue invoices
 * @route GET /api/v1/invoices/overdue
 * @access Private
 */
export const getOverdueInvoices = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const today = new Date();
    const overdueInvoices = await Invoice.find({
      status: { $in: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE] },
      dueDate: { $lt: today },
      balanceAmount: { $gt: 0 },
    })
      .populate('customer', 'name customerNumber email phone')
      .sort({ dueDate: 1 })
      .lean();

    return sendSuccess(res, overdueInvoices, 'Overdue invoices retrieved successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Get overdue invoices failed'));
    return sendInternalError(res, 'Failed to retrieve overdue invoices');
  }
};

export default {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoice,
  recordPayment,
  getOverdueInvoices,
};

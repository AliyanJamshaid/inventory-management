/**
 * Payment Controller
 * Handles all payment operations
 */

import { Response } from 'express';
import mongoose from 'mongoose';
import { IAuthRequest } from '../types';
import Payment from '../models/Payment';
import Invoice from '../models/Invoice';
import { PaymentTransactionStatus } from '../types/models';
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
 * Get all payments with pagination and filtering
 * @route GET /api/v1/payments
 * @access Private
 */
export const getAllPayments = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const {
      page = 1,
      limit = 10,
      invoice,
      status,
      paymentMethod,
      startDate,
      endDate,
      sortBy = 'paymentDate',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};

    if (invoice) query.invoice = invoice;
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate as string);
      if (endDate) query.paymentDate.$lte = new Date(endDate as string);
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate({
          path: 'invoice',
          select: 'invoiceNumber customer total',
          populate: { path: 'customer', select: 'name customerNumber' },
        })
        .populate('createdBy', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Payment.countDocuments(query),
    ]);

    logDatabase('READ', 'Payment', { count: payments.length });

    return sendSuccessWithPagination(
      res,
      payments,
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      'Payments retrieved successfully'
    );
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Get payments failed'));
    return sendInternalError(res, 'Failed to retrieve payments');
  }
};

/**
 * Get payment by ID
 * @route GET /api/v1/payments/:id
 * @access Private
 */
export const getPaymentById = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate({
        path: 'invoice',
        populate: { path: 'customer', select: 'name customerNumber email' },
      })
      .populate('createdBy', 'firstName lastName email')
      .lean();

    if (!payment) {
      return sendNotFound(res, 'Payment not found');
    }

    logDatabase('READ', 'Payment', { paymentId: id });

    return sendSuccess(res, payment, 'Payment retrieved successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Get payment failed'));
    return sendInternalError(res, 'Failed to retrieve payment');
  }
};

/**
 * Create new payment
 * @route POST /api/v1/payments
 * @access Private
 */
export const createPayment = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { invoice, amount, paymentMethod, paymentDate, transactionId, notes } = req.body;

    // Verify invoice exists
    const invoiceDoc = await Invoice.findById(invoice);
    if (!invoiceDoc) {
      return sendBadRequest(res, 'Invoice not found');
    }

    // Check if payment amount exceeds balance
    if (amount > invoiceDoc.balanceAmount) {
      return sendBadRequest(
        res,
        `Payment amount (${amount}) exceeds invoice balance (${invoiceDoc.balanceAmount})`
      );
    }

    // Create payment
    const payment = await Payment.create({
      invoice,
      paymentDate: paymentDate || new Date(),
      amount,
      paymentMethod,
      transactionId,
      status: PaymentTransactionStatus.COMPLETED,
      notes,
      createdBy: req.user!.userId,
    });

    await payment.populate([
      {
        path: 'invoice',
        select: 'invoiceNumber total',
        populate: { path: 'customer', select: 'name customerNumber' },
      },
      { path: 'createdBy', select: 'firstName lastName email' },
    ]);

    logDatabase('CREATE', 'Payment', { paymentId: payment._id });

    return sendCreated(res, payment, 'Payment created successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Create payment failed'));
    return sendInternalError(res, 'Failed to create payment');
  }
};

/**
 * Get payment summary
 * @route GET /api/v1/payments/summary
 * @access Private
 */
export const getPaymentSummary = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return sendBadRequest(res, 'Start date and end date are required');
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    // Get payment summary by method
    const summaryByMethod = await Payment.getPaymentSummary(start, end);

    // Get total payments
    const totalResult = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: start, $lte: end },
          status: PaymentTransactionStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const summary = {
      period: {
        startDate: start,
        endDate: end,
      },
      overall: {
        totalAmount: totalResult.length > 0 ? totalResult[0].totalAmount : 0,
        totalCount: totalResult.length > 0 ? totalResult[0].totalCount : 0,
      },
      byPaymentMethod: summaryByMethod,
    };

    return sendSuccess(res, summary, 'Payment summary retrieved successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Get payment summary failed'));
    return sendInternalError(res, 'Failed to retrieve payment summary');
  }
};

export default {
  getAllPayments,
  getPaymentById,
  createPayment,
  getPaymentSummary,
};

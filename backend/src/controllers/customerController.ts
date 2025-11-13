/**
 * Customer Controller
 * Handles all customer-related operations
 */

import { Response } from 'express';
import mongoose from 'mongoose';
import { IAuthRequest } from '../types';
import Customer from '../models/Customer';
import SalesOrder from '../models/SalesOrder';
import Invoice from '../models/Invoice';
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
 * Get all customers with pagination, search, and filtering
 * @route GET /api/v1/customers
 * @access Private
 */
export const getAllCustomers = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      isActive,
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

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { customerNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Customer.countDocuments(query),
    ]);

    logDatabase('READ', 'Customer', { count: customers.length });

    return sendSuccessWithPagination(
      res,
      customers,
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      'Customers retrieved successfully'
    );
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Get customers failed'));
    return sendInternalError(res, 'Failed to retrieve customers');
  }
};

/**
 * Get customer by ID
 * @route GET /api/v1/customers/:id
 * @access Private
 */
export const getCustomerById = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id).lean();

    if (!customer) {
      return sendNotFound(res, 'Customer not found');
    }

    logDatabase('READ', 'Customer', { customerId: id });

    return sendSuccess(res, customer, 'Customer retrieved successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Get customer failed'));
    return sendInternalError(res, 'Failed to retrieve customer');
  }
};

/**
 * Create new customer
 * @route POST /api/v1/customers
 * @access Private (Admin/Manager/Staff)
 */
export const createCustomer = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const {
      name,
      email,
      phone,
      type,
      contactPerson,
      address,
      city,
      state,
      country,
      zipCode,
      taxId,
      creditLimit,
      paymentTerms,
      isActive,
      notes,
    } = req.body;

    // Generate customer number
    const customerNumber = await Customer.generateCustomerNumber();

    // Create customer
    const customer = await Customer.create({
      customerNumber,
      name,
      email,
      phone,
      type,
      contactPerson,
      address,
      city,
      state,
      country,
      zipCode,
      taxId,
      creditLimit: creditLimit || 0,
      currentCredit: 0,
      paymentTerms,
      loyaltyPoints: 0,
      isActive: isActive !== undefined ? isActive : true,
      notes,
    });

    logDatabase('CREATE', 'Customer', { customerId: customer._id });

    return sendCreated(res, customer, 'Customer created successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Create customer failed'));
    return sendInternalError(res, 'Failed to create customer');
  }
};

/**
 * Update customer
 * @route PUT /api/v1/customers/:id
 * @access Private (Admin/Manager/Staff)
 */
export const updateCustomer = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating certain fields
    delete updateData.customerNumber;
    delete updateData.currentCredit;
    delete updateData.loyaltyPoints;

    const customer = await Customer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return sendNotFound(res, 'Customer not found');
    }

    logDatabase('UPDATE', 'Customer', { customerId: id });

    return sendSuccess(res, customer, 'Customer updated successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Update customer failed'));
    return sendInternalError(res, 'Failed to update customer');
  }
};

/**
 * Delete customer
 * @route DELETE /api/v1/customers/:id
 * @access Private (Admin)
 */
export const deleteCustomer = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    // Check if customer has any sales orders or invoices
    const [salesOrderCount, invoiceCount] = await Promise.all([
      SalesOrder.countDocuments({ customer: id }),
      Invoice.countDocuments({ customer: id }),
    ]);

    if (salesOrderCount > 0 || invoiceCount > 0) {
      return sendBadRequest(
        res,
        'Cannot delete customer with existing orders or invoices. Consider deactivating instead.'
      );
    }

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return sendNotFound(res, 'Customer not found');
    }

    logDatabase('DELETE', 'Customer', { customerId: id });

    return sendSuccess(res, { id }, 'Customer deleted successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Delete customer failed'));
    return sendInternalError(res, 'Failed to delete customer');
  }
};

/**
 * Get customer sales orders
 * @route GET /api/v1/customers/:id/sales-orders
 * @access Private
 */
export const getCustomerSalesOrders = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Verify customer exists
    const customer = await Customer.findById(id);
    if (!customer) {
      return sendNotFound(res, 'Customer not found');
    }

    // Build query
    const query: any = { customer: id };
    if (status) {
      query.status = status;
    }

    // Get sales orders with pagination
    const [salesOrders, total] = await Promise.all([
      SalesOrder.find(query)
        .populate('createdBy', 'firstName lastName email')
        .populate('processedBy', 'firstName lastName email')
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      SalesOrder.countDocuments(query),
    ]);

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
    logError(error instanceof Error ? error : new Error('Get customer SOs failed'));
    return sendInternalError(res, 'Failed to retrieve sales orders');
  }
};

/**
 * Get customer invoices
 * @route GET /api/v1/customers/:id/invoices
 * @access Private
 */
export const getCustomerInvoices = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Verify customer exists
    const customer = await Customer.findById(id);
    if (!customer) {
      return sendNotFound(res, 'Customer not found');
    }

    // Build query
    const query: any = { customer: id };
    if (status) {
      query.status = status;
    }

    // Get invoices with pagination
    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate('salesOrder')
        .sort({ invoiceDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Invoice.countDocuments(query),
    ]);

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
    logError(error instanceof Error ? error : new Error('Get customer invoices failed'));
    return sendInternalError(res, 'Failed to retrieve invoices');
  }
};

/**
 * Update customer loyalty points
 * @route PUT /api/v1/customers/:id/loyalty
 * @access Private (Admin/Manager/Staff)
 */
export const updateLoyaltyPoints = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { points, operation } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return sendNotFound(res, 'Customer not found');
    }

    try {
      if (operation === 'add') {
        await customer.addLoyaltyPoints(points);
      } else if (operation === 'redeem') {
        await customer.redeemLoyaltyPoints(points);
      } else if (operation === 'set') {
        customer.loyaltyPoints = points;
        await customer.save();
      }

      logDatabase('UPDATE', 'Customer', {
        customerId: id,
        operation: `loyalty_${operation}`,
        points,
      });

      return sendSuccess(res, customer, 'Loyalty points updated successfully');
    } catch (err) {
      return sendBadRequest(res, (err as Error).message);
    }
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Update loyalty points failed'));
    return sendInternalError(res, 'Failed to update loyalty points');
  }
};

export default {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerSalesOrders,
  getCustomerInvoices,
  updateLoyaltyPoints,
};

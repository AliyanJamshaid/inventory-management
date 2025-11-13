/**
 * Invoice Seeder
 * Creates invoices for completed sales orders
 */

import Invoice from '../models_temp/Invoice';
import Payment from '../models_temp/Payment';
import SalesOrder from '../models_temp/SalesOrder';
import { InvoiceStatus, PaymentStatus, PaymentMethod, SalesOrderStatus } from '../types/models';
import logger from '../utils/logger';

/**
 * Helper function to generate invoice number
 */
const generateInvoiceNumber = (index: number): string => {
  const year = new Date().getFullYear();
  return `INV-${year}-${index.toString().padStart(5, '0')}`;
};

/**
 * Helper function to get random past date
 */
const getRandomPastDate = (maxDaysAgo: number): Date => {
  const days = Math.floor(Math.random() * maxDaysAgo);
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Seed invoices into the database
 */
export const seedInvoices = async (): Promise<void> => {
  try {
    // Check if invoices already exist
    const existingCount = await Invoice.countDocuments();
    if (existingCount > 0) {
      logger.info(`Invoices already exist (${existingCount} found). Skipping invoice seeding.`);
      return;
    }

    // Get sales orders that should have invoices (not draft or cancelled)
    const eligibleOrders = await SalesOrder.find({
      status: { $in: [
        SalesOrderStatus.CONFIRMED,
        SalesOrderStatus.PROCESSING,
        SalesOrderStatus.SHIPPED,
        SalesOrderStatus.DELIVERED
      ] }
    }).populate('customer');

    if (eligibleOrders.length === 0) {
      logger.info('No eligible sales orders found for invoicing.');
      return;
    }

    const invoices = [];
    const payments = [];

    for (let i = 0; i < eligibleOrders.length; i++) {
      const order = eligibleOrders[i];

      // Invoice date 1-2 days after order date
      const invoiceDate = new Date(order.orderDate);
      invoiceDate.setDate(invoiceDate.getDate() + Math.floor(Math.random() * 2) + 1);

      // Due date 30 days after invoice date
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30);

      // Determine invoice status
      let status: InvoiceStatus;
      let paymentStatus: PaymentStatus;
      const isPaid = order.paidAmount >= order.totalAmount;
      const isPartiallyPaid = order.paidAmount > 0 && order.paidAmount < order.totalAmount;
      const isOverdue = new Date() > dueDate && !isPaid;

      if (isPaid) {
        status = InvoiceStatus.PAID;
        paymentStatus = PaymentStatus.PAID;
      } else if (isOverdue) {
        status = InvoiceStatus.OVERDUE;
        paymentStatus = isPartiallyPaid ? PaymentStatus.PARTIAL : PaymentStatus.PENDING;
      } else if (isPartiallyPaid) {
        status = InvoiceStatus.SENT;
        paymentStatus = PaymentStatus.PARTIAL;
      } else if (order.status === SalesOrderStatus.CONFIRMED) {
        status = InvoiceStatus.DRAFT;
        paymentStatus = PaymentStatus.PENDING;
      } else {
        status = InvoiceStatus.SENT;
        paymentStatus = PaymentStatus.PENDING;
      }

      const invoice = {
        invoiceNumber: generateInvoiceNumber(i + 1),
        salesOrder: order._id,
        customer: order.customer._id,
        items: order.items.map((item: any) => ({
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          tax: item.tax,
          total: item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100),
        })),
        subtotal: order.subtotal,
        discount: order.discount || 0,
        tax: order.tax,
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        status,
        paymentStatus,
        invoiceDate,
        dueDate,
        notes: `Invoice for order ${order.orderNumber}`,
      };

      invoices.push(invoice);

      // Create payment records if order was paid
      if (order.paidAmount > 0) {
        const paymentMethods = [
          PaymentMethod.CARD,
          PaymentMethod.BANK_TRANSFER,
          PaymentMethod.CASH,
          PaymentMethod.CHECK
        ];

        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        const paymentDate = new Date(invoiceDate);
        paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * 20) + 1);

        payments.push({
          invoice: null, // Will be set after invoice is created
          salesOrder: order._id,
          customer: order.customer._id,
          amount: order.paidAmount,
          method: paymentMethod,
          paymentDate,
          reference: `PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          notes: `Payment via ${paymentMethod} for invoice ${generateInvoiceNumber(i + 1)}`,
          status: isPaid ? 'COMPLETED' : 'COMPLETED', // All recorded payments are completed
        });
      }
    }

    const createdInvoices = await Invoice.insertMany(invoices);
    logger.info(`✓ Created ${createdInvoices.length} invoices`);

    // Update payment records with invoice IDs
    for (let i = 0; i < payments.length; i++) {
      if (createdInvoices[i]) {
        payments[i].invoice = createdInvoices[i]._id;
      }
    }

    if (payments.length > 0) {
      const createdPayments = await Payment.insertMany(payments);
      logger.info(`✓ Created ${createdPayments.length} payment records`);
    }

    // Calculate statistics
    const statusCounts = await Invoice.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const paymentStatusCounts = await Invoice.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
    ]);

    logger.info('Invoice Status Distribution:');
    statusCounts.forEach(stat => {
      logger.info(`  - ${stat.count} ${stat._id}`);
    });

    logger.info('Payment Status Distribution:');
    paymentStatusCounts.forEach(stat => {
      logger.info(`  - ${stat.count} ${stat._id}`);
    });
  } catch (error) {
    logger.error('Error seeding invoices:', error);
    throw error;
  }
};

/**
 * Clear all invoices and payments from the database
 */
export const clearInvoices = async (): Promise<void> => {
  try {
    await Invoice.deleteMany({});
    await Payment.deleteMany({});
    logger.info('✓ Cleared all invoices and payments');
  } catch (error) {
    logger.error('Error clearing invoices:', error);
    throw error;
  }
};

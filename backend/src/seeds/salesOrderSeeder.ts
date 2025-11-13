/**
 * Sales Order Seeder
 * Creates sales orders with various statuses and dates
 */

import SalesOrder from '../models_temp/SalesOrder';
import Product from '../models_temp/Product';
import Customer from '../models_temp/Customer';
import Warehouse from '../models_temp/Warehouse';
import User from '../models_temp/User';
import { SalesOrderStatus } from '../types/models';
import logger from '../utils/logger';

/**
 * Helper function to get random past date within last N days
 */
const getRandomPastDate = (maxDaysAgo: number): Date => {
  const days = Math.floor(Math.random() * maxDaysAgo);
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Helper function to generate SO number
 */
const generateSONumber = (index: number): string => {
  const year = new Date().getFullYear();
  return `SO-${year}-${index.toString().padStart(5, '0')}`;
};

/**
 * Seed sales orders into the database
 */
export const seedSalesOrders = async (): Promise<void> => {
  try {
    // Check if sales orders already exist
    const existingCount = await SalesOrder.countDocuments();
    if (existingCount > 0) {
      logger.info(`Sales orders already exist (${existingCount} found). Skipping sales order seeding.`);
      return;
    }

    // Get necessary references
    const products = await Product.find({}).limit(60);
    const customers = await Customer.find({});
    const warehouses = await Warehouse.find({});
    const users = await User.find({ role: { $in: ['ADMIN', 'MANAGER', 'STAFF'] } });

    if (products.length === 0 || customers.length === 0 || users.length === 0) {
      throw new Error('Required data not found. Please seed products, customers, and users first.');
    }

    const salesOrders = [];
    const statuses = [
      SalesOrderStatus.DRAFT,
      SalesOrderStatus.CONFIRMED,
      SalesOrderStatus.PROCESSING,
      SalesOrderStatus.SHIPPED,
      SalesOrderStatus.DELIVERED,
      SalesOrderStatus.CANCELLED
    ];

    // Create 35 sales orders
    for (let i = 1; i <= 35; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
      const createdBy = users[Math.floor(Math.random() * users.length)];

      // Random status with weighted distribution
      let status;
      const rand = Math.random();
      if (rand < 0.05) status = SalesOrderStatus.DRAFT; // 5%
      else if (rand < 0.15) status = SalesOrderStatus.CONFIRMED; // 10%
      else if (rand < 0.25) status = SalesOrderStatus.PROCESSING; // 10%
      else if (rand < 0.40) status = SalesOrderStatus.SHIPPED; // 15%
      else if (rand < 0.85) status = SalesOrderStatus.DELIVERED; // 45%
      else status = SalesOrderStatus.CANCELLED; // 15%

      // Create order date in last 180 days
      const orderDate = getRandomPastDate(180);

      // Shipping details
      let shippingAddress, shippingDate, expectedDeliveryDate, actualDeliveryDate;

      shippingAddress = {
        street: customer.address,
        city: customer.city,
        state: customer.state,
        country: customer.country,
        zipCode: customer.zipCode,
      };

      if (status === SalesOrderStatus.SHIPPED || status === SalesOrderStatus.DELIVERED) {
        shippingDate = new Date(orderDate);
        shippingDate.setDate(shippingDate.getDate() + Math.floor(Math.random() * 3) + 1);

        expectedDeliveryDate = new Date(shippingDate);
        expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + Math.floor(Math.random() * 5) + 3);

        if (status === SalesOrderStatus.DELIVERED) {
          actualDeliveryDate = new Date(shippingDate);
          actualDeliveryDate.setDate(actualDeliveryDate.getDate() + Math.floor(Math.random() * 6) + 2);
        }
      }

      // Select 2-6 random products
      const itemCount = Math.floor(Math.random() * 5) + 2;
      const selectedProducts = [];
      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        if (!selectedProducts.find(p => p.product.toString() === product._id.toString())) {
          const quantity = Math.floor(Math.random() * 10) + 1;
          const discount = Math.random() < 0.3 ? Math.floor(Math.random() * 15) + 5 : 0; // 30% chance of discount

          selectedProducts.push({
            product: product._id,
            quantity,
            unitPrice: product.sellingPrice,
            discount,
            tax: product.tax,
          });
        }
      }

      // Calculate totals
      const subtotal = selectedProducts.reduce((sum, item) => {
        const discountedPrice = item.unitPrice * (1 - item.discount / 100);
        return sum + (item.quantity * discountedPrice);
      }, 0);

      const discount = selectedProducts.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice * item.discount / 100);
      }, 0);

      const tax = subtotal * 0.08; // 8% average tax
      const shippingCost = Math.floor(Math.random() * 50) + 20;
      const totalAmount = subtotal + tax + shippingCost;

      // Payment status
      const isPaid = status === SalesOrderStatus.DELIVERED || (status === SalesOrderStatus.SHIPPED && Math.random() > 0.3);
      const paidAmount = isPaid ? totalAmount : (Math.random() < 0.2 ? totalAmount * 0.5 : 0); // 20% partial payments

      salesOrders.push({
        orderNumber: generateSONumber(i),
        customer: customer._id,
        warehouse: warehouse._id,
        items: selectedProducts,
        subtotal,
        discount,
        tax,
        shippingCost,
        totalAmount,
        paidAmount,
        status,
        orderDate,
        shippingAddress,
        shippingDate,
        expectedDeliveryDate,
        actualDeliveryDate,
        trackingNumber: (status === SalesOrderStatus.SHIPPED || status === SalesOrderStatus.DELIVERED) ?
          `TRK${Math.random().toString(36).substring(2, 15).toUpperCase()}` : undefined,
        notes: `Sales order for ${customer.name} - ${status.toLowerCase()} status`,
        createdBy: createdBy._id,
      });
    }

    const createdOrders = await SalesOrder.insertMany(salesOrders);

    // Calculate statistics
    const statusCounts = await SalesOrder.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const totalRevenue = await SalesOrder.aggregate([
      { $match: { status: { $ne: SalesOrderStatus.CANCELLED } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    logger.info(`✓ Created ${createdOrders.length} sales orders`);
    statusCounts.forEach(stat => {
      logger.info(`  - ${stat.count} ${stat._id}`);
    });
    logger.info(`  - Total revenue: $${totalRevenue[0]?.total.toFixed(2) || '0.00'}`);
  } catch (error) {
    logger.error('Error seeding sales orders:', error);
    throw error;
  }
};

/**
 * Clear all sales orders from the database
 */
export const clearSalesOrders = async (): Promise<void> => {
  try {
    await SalesOrder.deleteMany({});
    logger.info('✓ Cleared all sales orders');
  } catch (error) {
    logger.error('Error clearing sales orders:', error);
    throw error;
  }
};

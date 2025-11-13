/**
 * Purchase Order Seeder
 * Creates purchase orders with various statuses and dates
 */

import PurchaseOrder from '../models_temp/PurchaseOrder';
import Product from '../models_temp/Product';
import Supplier from '../models_temp/Supplier';
import Warehouse from '../models_temp/Warehouse';
import User from '../models_temp/User';
import { PurchaseOrderStatus } from '../types/models';
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
 * Helper function to generate PO number
 */
const generatePONumber = (index: number): string => {
  const year = new Date().getFullYear();
  return `PO-${year}-${index.toString().padStart(5, '0')}`;
};

/**
 * Seed purchase orders into the database
 */
export const seedPurchaseOrders = async (): Promise<void> => {
  try {
    // Check if purchase orders already exist
    const existingCount = await PurchaseOrder.countDocuments();
    if (existingCount > 0) {
      logger.info(`Purchase orders already exist (${existingCount} found). Skipping purchase order seeding.`);
      return;
    }

    // Get necessary references
    const products = await Product.find({}).limit(50);
    const suppliers = await Supplier.find({});
    const warehouses = await Warehouse.find({});
    const users = await User.find({ role: { $in: ['ADMIN', 'MANAGER'] } });

    if (products.length === 0 || suppliers.length === 0 || users.length === 0) {
      throw new Error('Required data not found. Please seed products, suppliers, and users first.');
    }

    const purchaseOrders = [];
    const statuses = [
      PurchaseOrderStatus.DRAFT,
      PurchaseOrderStatus.PENDING,
      PurchaseOrderStatus.APPROVED,
      PurchaseOrderStatus.RECEIVED,
      PurchaseOrderStatus.CANCELLED
    ];

    // Create 25 purchase orders
    for (let i = 1; i <= 25; i++) {
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
      const createdBy = users[Math.floor(Math.random() * users.length)];

      // Random status with weighted distribution
      let status;
      const rand = Math.random();
      if (rand < 0.05) status = PurchaseOrderStatus.DRAFT; // 5%
      else if (rand < 0.15) status = PurchaseOrderStatus.PENDING; // 10%
      else if (rand < 0.25) status = PurchaseOrderStatus.APPROVED; // 10%
      else if (rand < 0.85) status = PurchaseOrderStatus.RECEIVED; // 60%
      else status = PurchaseOrderStatus.CANCELLED; // 15%

      // Create order date in last 180 days
      const orderDate = getRandomPastDate(180);

      // Expected delivery date 14-30 days after order
      const expectedDeliveryDate = new Date(orderDate);
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + Math.floor(Math.random() * 17) + 14);

      // Actual delivery date if received
      let actualDeliveryDate;
      if (status === PurchaseOrderStatus.RECEIVED) {
        actualDeliveryDate = new Date(orderDate);
        actualDeliveryDate.setDate(actualDeliveryDate.getDate() + Math.floor(Math.random() * 25) + 10);
      }

      // Select 3-8 random products
      const itemCount = Math.floor(Math.random() * 6) + 3;
      const selectedProducts = [];
      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        if (!selectedProducts.find(p => p.product.toString() === product._id.toString())) {
          selectedProducts.push({
            product: product._id,
            quantity: Math.floor(Math.random() * 50) + 10,
            unitPrice: product.costPrice,
            receivedQuantity: status === PurchaseOrderStatus.RECEIVED ?
              Math.floor(Math.random() * 50) + 10 : 0,
          });
        }
      }

      // Calculate totals
      const subtotal = selectedProducts.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const tax = subtotal * 0.08; // 8% tax
      const shippingCost = Math.floor(Math.random() * 100) + 50;
      const totalAmount = subtotal + tax + shippingCost;

      purchaseOrders.push({
        orderNumber: generatePONumber(i),
        supplier: supplier._id,
        warehouse: warehouse._id,
        items: selectedProducts,
        subtotal,
        tax,
        shippingCost,
        totalAmount,
        status,
        orderDate,
        expectedDeliveryDate,
        actualDeliveryDate,
        notes: `Purchase order for ${supplier.name} - ${status.toLowerCase()} status`,
        createdBy: createdBy._id,
        approvedBy: status !== PurchaseOrderStatus.DRAFT ? users[Math.floor(Math.random() * users.length)]._id : undefined,
        approvedAt: status !== PurchaseOrderStatus.DRAFT ? new Date(orderDate.getTime() + 86400000) : undefined, // Next day
      });
    }

    const createdOrders = await PurchaseOrder.insertMany(purchaseOrders);

    // Calculate statistics
    const statusCounts = await PurchaseOrder.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    logger.info(`✓ Created ${createdOrders.length} purchase orders`);
    statusCounts.forEach(stat => {
      logger.info(`  - ${stat.count} ${stat._id}`);
    });
  } catch (error) {
    logger.error('Error seeding purchase orders:', error);
    throw error;
  }
};

/**
 * Clear all purchase orders from the database
 */
export const clearPurchaseOrders = async (): Promise<void> => {
  try {
    await PurchaseOrder.deleteMany({});
    logger.info('✓ Cleared all purchase orders');
  } catch (error) {
    logger.error('Error clearing purchase orders:', error);
    throw error;
  }
};

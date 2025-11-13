/**
 * Stock Seeder
 * Creates stock records distributed across warehouses
 * Includes low stock items, expiring items, and various batch numbers
 */

import Stock from '../models_temp/Stock';
import Product from '../models_temp/Product';
import Warehouse from '../models_temp/Warehouse';
import StockLocation from '../models_temp/StockLocation';
import logger from '../utils/logger';

/**
 * Helper function to get random date in future (for expiration)
 */
const getRandomFutureDate = (minDays: number, maxDays: number): Date => {
  const days = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Helper function to generate batch number
 */
const generateBatchNumber = (productSku: string, warehouseCode: string): string => {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${productSku.substring(0, 3)}-${warehouseCode}-${random}`;
};

/**
 * Seed stock into the database
 */
export const seedStock = async (): Promise<void> => {
  try {
    // Check if stock already exists
    const existingCount = await Stock.countDocuments();
    if (existingCount > 0) {
      logger.info(`Stock already exists (${existingCount} found). Skipping stock seeding.`);
      return;
    }

    // Get all products and warehouses
    const products = await Product.find({});
    const warehouses = await Warehouse.find({});
    const locations = await StockLocation.find({});

    if (products.length === 0 || warehouses.length === 0) {
      throw new Error('Products or warehouses not found. Please seed them first.');
    }

    const stockRecords = [];

    // Create stock for each product across warehouses
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const isLowStock = i % 15 === 0; // ~7% of products with low stock
      const isExpiring = i % 20 === 0 && product.category; // ~5% with expiration dates
      const hasMultipleLocations = i % 5 === 0; // 20% in multiple locations

      for (let j = 0; j < warehouses.length; j++) {
        const warehouse = warehouses[j];
        const warehouseLocations = locations.filter(
          l => l.warehouse.toString() === warehouse._id.toString()
        );

        // Determine quantity based on stock level strategy
        let quantity;
        let minStockLevel;
        let reorderPoint;

        if (isLowStock) {
          // Low stock items - below reorder point
          quantity = Math.floor(Math.random() * 5) + 1;
          minStockLevel = 10;
          reorderPoint = 15;
        } else {
          // Normal stock items
          const baseQuantity = Math.floor(Math.random() * 200) + 50;
          quantity = baseQuantity;
          minStockLevel = Math.floor(baseQuantity * 0.2);
          reorderPoint = Math.floor(baseQuantity * 0.3);
        }

        const maxStockLevel = quantity * 2;

        // Random reserved quantity (for active orders)
        const reservedQuantity = Math.floor(Math.random() * (quantity * 0.2));

        // Get a random location for this warehouse
        const location = warehouseLocations[Math.floor(Math.random() * warehouseLocations.length)];

        const stockRecord: any = {
          product: product._id,
          warehouse: warehouse._id,
          location: location?._id,
          quantity,
          reservedQuantity,
          minStockLevel,
          maxStockLevel,
          reorderPoint,
          batchNumber: generateBatchNumber(product.sku, warehouse.code),
        };

        // Add expiration date for some items (food, medical supplies, etc.)
        if (isExpiring) {
          const daysUntilExpiry = Math.floor(Math.random() * 90) + 10; // 10-100 days
          stockRecord.expirationDate = getRandomFutureDate(daysUntilExpiry, daysUntilExpiry);
        }

        // Add last stock take date (within last 30 days)
        const daysAgo = Math.floor(Math.random() * 30);
        const lastStockTakeDate = new Date();
        lastStockTakeDate.setDate(lastStockTakeDate.getDate() - daysAgo);
        stockRecord.lastStockTakeDate = lastStockTakeDate;

        stockRecords.push(stockRecord);

        // Add to additional locations if hasMultipleLocations
        if (hasMultipleLocations && warehouseLocations.length > 1) {
          const additionalLocation = warehouseLocations[Math.floor(Math.random() * warehouseLocations.length)];
          if (additionalLocation._id.toString() !== location?._id.toString()) {
            const additionalQuantity = Math.floor(Math.random() * 50) + 10;
            stockRecords.push({
              product: product._id,
              warehouse: warehouse._id,
              location: additionalLocation._id,
              quantity: additionalQuantity,
              reservedQuantity: Math.floor(Math.random() * (additionalQuantity * 0.1)),
              minStockLevel: Math.floor(additionalQuantity * 0.2),
              maxStockLevel: additionalQuantity * 2,
              reorderPoint: Math.floor(additionalQuantity * 0.3),
              batchNumber: generateBatchNumber(product.sku, warehouse.code),
              lastStockTakeDate,
            });
          }
        }
      }
    }

    const createdStock = await Stock.insertMany(stockRecords);

    // Calculate statistics
    const lowStockCount = await Stock.countDocuments({
      $expr: { $lte: ['$quantity', '$reorderPoint'] }
    });

    const expiringCount = await Stock.countDocuments({
      expirationDate: { $exists: true, $lte: getRandomFutureDate(30, 30) }
    });

    logger.info(`✓ Created ${createdStock.length} stock records`);
    logger.info(`  - ${lowStockCount} low stock items (at or below reorder point)`);
    logger.info(`  - ${expiringCount} items expiring within 30 days`);
    logger.info(`  - Stock distributed across ${warehouses.length} warehouses`);
  } catch (error) {
    logger.error('Error seeding stock:', error);
    throw error;
  }
};

/**
 * Clear all stock from the database
 */
export const clearStock = async (): Promise<void> => {
  try {
    await Stock.deleteMany({});
    logger.info('✓ Cleared all stock');
  } catch (error) {
    logger.error('Error clearing stock:', error);
    throw error;
  }
};

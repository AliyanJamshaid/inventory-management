/**
 * Stock Transaction Seeder
 * Creates various stock transactions (IN, OUT, TRANSFER, ADJUSTMENT)
 */

import StockTransaction from '../models_temp/StockTransaction';
import Product from '../models_temp/Product';
import Warehouse from '../models_temp/Warehouse';
import StockLocation from '../models_temp/StockLocation';
import User from '../models_temp/User';
import { StockTransactionType } from '../types/models';
import logger from '../utils/logger';

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
 * Seed stock transactions into the database
 */
export const seedTransactions = async (): Promise<void> => {
  try {
    // Check if transactions already exist
    const existingCount = await StockTransaction.countDocuments();
    if (existingCount > 0) {
      logger.info(`Transactions already exist (${existingCount} found). Skipping transaction seeding.`);
      return;
    }

    // Get necessary references
    const products = await Product.find({}).limit(50);
    const warehouses = await Warehouse.find({});
    const locations = await StockLocation.find({});
    const users = await User.find({ role: { $in: ['ADMIN', 'MANAGER', 'STAFF'] } });

    if (products.length === 0 || warehouses.length === 0 || users.length === 0) {
      throw new Error('Required data not found. Please seed products, warehouses, and users first.');
    }

    const transactions = [];
    const transactionTypes = [
      { type: StockTransactionType.IN, weight: 0.35 }, // 35%
      { type: StockTransactionType.OUT, weight: 0.35 }, // 35%
      { type: StockTransactionType.TRANSFER, weight: 0.15 }, // 15%
      { type: StockTransactionType.ADJUSTMENT, weight: 0.15 }, // 15%
    ];

    // Create 60 transactions over the last 180 days
    for (let i = 0; i < 60; i++) {
      // Select transaction type based on weighted distribution
      const rand = Math.random();
      let cumulativeWeight = 0;
      let transactionType = StockTransactionType.IN;

      for (const tt of transactionTypes) {
        cumulativeWeight += tt.weight;
        if (rand <= cumulativeWeight) {
          transactionType = tt.type;
          break;
        }
      }

      const product = products[Math.floor(Math.random() * products.length)];
      const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
      const warehouseLocations = locations.filter(
        l => l.warehouse.toString() === warehouse._id.toString()
      );
      const location = warehouseLocations[Math.floor(Math.random() * warehouseLocations.length)];
      const performedBy = users[Math.floor(Math.random() * users.length)];

      const transactionDate = getRandomPastDate(180);
      const quantity = Math.floor(Math.random() * 50) + 5;

      const transaction: any = {
        type: transactionType,
        product: product._id,
        warehouse: warehouse._id,
        location: location?._id,
        quantity,
        performedBy: performedBy._id,
        transactionDate,
      };

      // Add type-specific details
      switch (transactionType) {
        case StockTransactionType.IN:
          transaction.reasonCode = 'PURCHASE';
          transaction.reference = `PO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          transaction.notes = 'Stock received from purchase order';
          transaction.batchNumber = `BATCH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          break;

        case StockTransactionType.OUT:
          transaction.reasonCode = 'SALE';
          transaction.reference = `SO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          transaction.notes = 'Stock shipped for sales order';
          break;

        case StockTransactionType.TRANSFER:
          const toWarehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
          transaction.fromWarehouse = warehouse._id;
          transaction.toWarehouse = toWarehouse._id;
          transaction.reasonCode = 'REBALANCE';
          transaction.reference = `TRF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          transaction.notes = `Transfer from ${warehouse.name} to ${toWarehouse.name}`;
          break;

        case StockTransactionType.ADJUSTMENT:
          const adjustmentReasons = [
            { code: 'DAMAGED', note: 'Damaged items removed from inventory' },
            { code: 'LOST', note: 'Items lost or missing during stock take' },
            { code: 'EXPIRED', note: 'Expired items removed from stock' },
            { code: 'STOCKTAKE', note: 'Stock adjustment after physical count' },
            { code: 'RETURN', note: 'Customer return added to inventory' },
          ];
          const reason = adjustmentReasons[Math.floor(Math.random() * adjustmentReasons.length)];
          transaction.reasonCode = reason.code;
          transaction.reference = `ADJ-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          transaction.notes = reason.note;
          // Adjustments can be positive or negative
          if (reason.code !== 'RETURN') {
            transaction.quantity = -transaction.quantity;
          }
          break;
      }

      transactions.push(transaction);
    }

    const createdTransactions = await StockTransaction.insertMany(transactions);

    // Calculate statistics
    const typeCounts = await StockTransaction.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    logger.info(`✓ Created ${createdTransactions.length} stock transactions`);
    typeCounts.forEach(stat => {
      logger.info(`  - ${stat.count} ${stat._id} transactions`);
    });
  } catch (error) {
    logger.error('Error seeding transactions:', error);
    throw error;
  }
};

/**
 * Clear all stock transactions from the database
 */
export const clearTransactions = async (): Promise<void> => {
  try {
    await StockTransaction.deleteMany({});
    logger.info('✓ Cleared all stock transactions');
  } catch (error) {
    logger.error('Error clearing transactions:', error);
    throw error;
  }
};

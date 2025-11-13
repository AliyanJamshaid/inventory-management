/**
 * Main Seed Orchestrator
 * Runs all seeders in the correct order to populate the database
 */

import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../config/database';
import logger from '../utils/logger';

// Import all seeders
import { seedUsers, getSeededCredentials } from './userSeeder';
import { seedRoles } from './roleSeeder';
import { seedCategories } from './categorySeeder';
import { seedSuppliers } from './supplierSeeder';
import { seedWarehouses } from './warehouseSeeder';
import { seedProducts } from './productSeeder';
import { seedStock } from './stockSeeder';
import { seedCustomers } from './customerSeeder';
import { seedPurchaseOrders } from './purchaseOrderSeeder';
import { seedSalesOrders } from './salesOrderSeeder';
import { seedInvoices } from './invoiceSeeder';
import { seedTransactions } from './transactionSeeder';
import { seedNotifications } from './notificationSeeder';
import { seedSettings } from './settingsSeeder';

// Load environment variables
dotenv.config();

/**
 * Run all seeders in order
 */
const runSeeders = async (): Promise<void> => {
  const startTime = Date.now();

  try {
    logger.info('=================================================');
    logger.info('  INVENTORY MANAGEMENT SYSTEM - DATABASE SEEDING');
    logger.info('=================================================\n');

    // Connect to database
    logger.info('Connecting to database...');
    await connectDatabase();
    logger.info('Database connected successfully\n');

    // Run seeders in order
    logger.info('Starting database seeding process...\n');

    // 1. Seed Users (must be first as they're referenced by other collections)
    logger.info('[1/14] Seeding users...');
    await seedUsers();

    // 2. Seed Roles and Permissions
    logger.info('[2/14] Seeding roles and permissions...');
    await seedRoles();

    // 3. Seed Categories
    logger.info('[3/14] Seeding categories...');
    await seedCategories();

    // 4. Seed Suppliers
    logger.info('[4/14] Seeding suppliers...');
    await seedSuppliers();

    // 5. Seed Warehouses and Locations
    logger.info('[5/14] Seeding warehouses and storage locations...');
    await seedWarehouses();

    // 6. Seed Products
    logger.info('[6/14] Seeding products...');
    await seedProducts();

    // 7. Seed Stock
    logger.info('[7/14] Seeding stock records...');
    await seedStock();

    // 8. Seed Customers
    logger.info('[8/14] Seeding customers...');
    await seedCustomers();

    // 9. Seed Purchase Orders
    logger.info('[9/14] Seeding purchase orders...');
    await seedPurchaseOrders();

    // 10. Seed Sales Orders
    logger.info('[10/14] Seeding sales orders...');
    await seedSalesOrders();

    // 11. Seed Invoices and Payments
    logger.info('[11/14] Seeding invoices and payments...');
    await seedInvoices();

    // 12. Seed Stock Transactions
    logger.info('[12/14] Seeding stock transactions...');
    await seedTransactions();

    // 13. Seed Notifications
    logger.info('[13/14] Seeding notifications...');
    await seedNotifications();

    // 14. Seed System Settings
    logger.info('[14/14] Seeding system settings...');
    await seedSettings();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    logger.info('\n=================================================');
    logger.info('  DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    logger.info('=================================================\n');
    logger.info(`Total time: ${duration} seconds\n`);

    // Display test credentials
    logger.info('=================================================');
    logger.info('  TEST USER CREDENTIALS');
    logger.info('=================================================\n');

    const credentials = getSeededCredentials();
    credentials.forEach(cred => {
      logger.info(`${cred.role}:`);
      logger.info(`  Email: ${cred.email}`);
      logger.info(`  Password: ${cred.password}\n`);
    });

    logger.info('=================================================');
    logger.info('  QUICK START');
    logger.info('=================================================');
    logger.info('1. Start the server: npm run dev');
    logger.info('2. Access the API: http://localhost:5000');
    logger.info('3. Login with any of the credentials above');
    logger.info('4. Check API documentation: http://localhost:5000/api-docs\n');

  } catch (error) {
    logger.error('\n=================================================');
    logger.error('  SEEDING FAILED!');
    logger.error('=================================================\n');
    logger.error('Error:', error);
    process.exit(1);
  } finally {
    // Disconnect from database
    await disconnectDatabase();
    logger.info('Database connection closed.\n');
  }
};

// Run seeders
if (require.main === module) {
  runSeeders()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Fatal error:', error);
      process.exit(1);
    });
}

export default runSeeders;

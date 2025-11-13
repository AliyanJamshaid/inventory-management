/**
 * Database Drop Script
 * Drops all collections from the database for a fresh start
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database';
import logger from '../utils/logger';

// Import all models to ensure they're registered
import '../models_temp';

// Load environment variables
dotenv.config();

/**
 * Drop all collections from the database
 */
const dropDatabase = async (): Promise<void> => {
  try {
    logger.info('=================================================');
    logger.info('  DATABASE DROP - WARNING!');
    logger.info('=================================================\n');
    logger.info('This will delete ALL data from the database!');
    logger.info('Connecting to database...\n');

    // Connect to database
    await connectDatabase();

    // Get all collection names
    const collections = await mongoose.connection.db?.collections();

    if (!collections || collections.length === 0) {
      logger.info('No collections found in database.');
      return;
    }

    logger.info(`Found ${collections.length} collections to drop:\n`);

    // Drop each collection
    for (const collection of collections) {
      const collectionName = collection.collectionName;
      logger.info(`Dropping collection: ${collectionName}...`);
      await collection.drop();
      logger.info(`✓ Dropped: ${collectionName}`);
    }

    logger.info('\n=================================================');
    logger.info('  ALL COLLECTIONS DROPPED SUCCESSFULLY!');
    logger.info('=================================================\n');
    logger.info('Database is now empty and ready for fresh seeding.');
    logger.info('Run "npm run seed" to populate the database.\n');

  } catch (error) {
    logger.error('\n=================================================');
    logger.error('  DROP DATABASE FAILED!');
    logger.error('=================================================\n');
    logger.error('Error:', error);
    process.exit(1);
  } finally {
    // Disconnect from database
    await disconnectDatabase();
    logger.info('Database connection closed.\n');
  }
};

// Run drop
if (require.main === module) {
  // Check for confirmation flag
  const confirmFlag = process.argv.includes('--confirm');

  if (!confirmFlag) {
    logger.warn('\n=================================================');
    logger.warn('  SAFETY CHECK!');
    logger.warn('=================================================\n');
    logger.warn('This operation will delete ALL data from the database!');
    logger.warn('To confirm, run this command with the --confirm flag:\n');
    logger.warn('  npm run db:drop -- --confirm\n');
    logger.warn('  OR');
    logger.warn('  ts-node src/seeds/drop.ts --confirm\n');
    process.exit(0);
  }

  dropDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Fatal error:', error);
      process.exit(1);
    });
}

export default dropDatabase;

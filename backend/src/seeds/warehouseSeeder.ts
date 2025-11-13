/**
 * Warehouse Seeder
 * Creates warehouses and their storage locations
 */

import Warehouse from '../models_temp/Warehouse';
import StockLocation from '../models_temp/StockLocation';
import User from '../models_temp/User';
import { StockLocationType } from '../types/models';
import logger from '../utils/logger';

/**
 * Seed warehouses and locations into the database
 */
export const seedWarehouses = async (): Promise<void> => {
  try {
    // Check if warehouses already exist
    const existingCount = await Warehouse.countDocuments();
    if (existingCount > 0) {
      logger.info(`Warehouses already exist (${existingCount} found). Skipping warehouse seeding.`);
      return;
    }

    // Get managers for warehouses
    const managers = await User.find({ role: 'MANAGER' }).limit(3);

    const warehouses = [
      {
        name: 'Main Warehouse',
        code: 'WH-MAIN',
        address: '1500 Distribution Drive',
        city: 'Dallas',
        state: 'TX',
        country: 'USA',
        zipCode: '75201',
        phone: '+1-800-555-1001',
        email: 'main@warehouse.com',
        manager: managers[0]?._id,
        isActive: true,
      },
      {
        name: 'East Coast Distribution Center',
        code: 'WH-EAST',
        address: '2200 Harbor Road',
        city: 'Newark',
        state: 'NJ',
        country: 'USA',
        zipCode: '07101',
        phone: '+1-800-555-1002',
        email: 'east@warehouse.com',
        manager: managers[1]?._id,
        isActive: true,
      },
      {
        name: 'West Coast Fulfillment Center',
        code: 'WH-WEST',
        address: '3300 Pacific Boulevard',
        city: 'Oakland',
        state: 'CA',
        country: 'USA',
        zipCode: '94601',
        phone: '+1-800-555-1003',
        email: 'west@warehouse.com',
        manager: managers[2]?._id,
        isActive: true,
      },
    ];

    const createdWarehouses = await Warehouse.insertMany(warehouses);
    logger.info(`✓ Created ${createdWarehouses.length} warehouses`);

    // Create storage locations for each warehouse
    const locations = [];

    for (const warehouse of createdWarehouses) {
      // Create aisles
      for (let aisle = 1; aisle <= 5; aisle++) {
        locations.push({
          warehouse: warehouse._id,
          name: `Aisle ${aisle}`,
          code: `${warehouse.code}-A${aisle.toString().padStart(2, '0')}`,
          type: StockLocationType.AISLE,
        });

        // Create shelves in each aisle
        for (let shelf = 1; shelf <= 10; shelf++) {
          locations.push({
            warehouse: warehouse._id,
            name: `Aisle ${aisle} - Shelf ${shelf}`,
            code: `${warehouse.code}-A${aisle.toString().padStart(2, '0')}-S${shelf.toString().padStart(2, '0')}`,
            type: StockLocationType.SHELF,
          });
        }
      }

      // Create bins
      for (let bin = 1; bin <= 20; bin++) {
        locations.push({
          warehouse: warehouse._id,
          name: `Bin ${bin}`,
          code: `${warehouse.code}-B${bin.toString().padStart(3, '0')}`,
          type: StockLocationType.BIN,
        });
      }

      // Create racks
      for (let rack = 1; rack <= 8; rack++) {
        locations.push({
          warehouse: warehouse._id,
          name: `Rack ${rack}`,
          code: `${warehouse.code}-R${rack.toString().padStart(2, '0')}`,
          type: StockLocationType.RACK,
        });
      }

      // Create floor locations
      for (let floor = 1; floor <= 5; floor++) {
        locations.push({
          warehouse: warehouse._id,
          name: `Floor Location ${floor}`,
          code: `${warehouse.code}-F${floor.toString().padStart(2, '0')}`,
          type: StockLocationType.FLOOR,
        });
      }

      // Create pallet locations
      for (let pallet = 1; pallet <= 10; pallet++) {
        locations.push({
          warehouse: warehouse._id,
          name: `Pallet ${pallet}`,
          code: `${warehouse.code}-P${pallet.toString().padStart(3, '0')}`,
          type: StockLocationType.PALLET,
        });
      }
    }

    const createdLocations = await StockLocation.insertMany(locations);
    logger.info(`✓ Created ${createdLocations.length} storage locations`);
  } catch (error) {
    logger.error('Error seeding warehouses:', error);
    throw error;
  }
};

/**
 * Clear all warehouses and locations from the database
 */
export const clearWarehouses = async (): Promise<void> => {
  try {
    await Warehouse.deleteMany({});
    await StockLocation.deleteMany({});
    logger.info('✓ Cleared all warehouses and locations');
  } catch (error) {
    logger.error('Error clearing warehouses:', error);
    throw error;
  }
};

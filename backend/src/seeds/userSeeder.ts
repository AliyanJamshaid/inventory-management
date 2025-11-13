/**
 * User Seeder
 * Creates initial users for the inventory management system
 */

import User from '../models_temp/User';
import { UserRole } from '../types/models';
import logger from '../utils/logger';

export interface SeededUser {
  email: string;
  password: string;
  role: UserRole;
}

/**
 * Seed users into the database
 */
export const seedUsers = async (): Promise<SeededUser[]> => {
  try {
    // Check if users already exist
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      logger.info(`Users already exist (${existingCount} found). Skipping user seeding.`);
      return getSeededCredentials();
    }

    const users = [
      {
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        phone: '+1-555-0001',
        isActive: true,
      },
      {
        email: 'manager@example.com',
        password: 'manager123',
        firstName: 'Manager',
        lastName: 'Smith',
        role: UserRole.MANAGER,
        phone: '+1-555-0002',
        isActive: true,
      },
      {
        email: 'staff1@example.com',
        password: 'staff123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.STAFF,
        phone: '+1-555-0003',
        isActive: true,
      },
      {
        email: 'staff2@example.com',
        password: 'staff123',
        firstName: 'Jane',
        lastName: 'Wilson',
        role: UserRole.STAFF,
        phone: '+1-555-0004',
        isActive: true,
      },
      {
        email: 'viewer@example.com',
        password: 'viewer123',
        firstName: 'Viewer',
        lastName: 'Guest',
        role: UserRole.VIEWER,
        phone: '+1-555-0005',
        isActive: true,
      },
    ];

    const createdUsers = await User.insertMany(users);
    logger.info(`✓ Created ${createdUsers.length} users`);

    return getSeededCredentials();
  } catch (error) {
    logger.error('Error seeding users:', error);
    throw error;
  }
};

/**
 * Get seeded user credentials for documentation
 */
export const getSeededCredentials = (): SeededUser[] => {
  return [
    { email: 'admin@example.com', password: 'admin123', role: UserRole.ADMIN },
    { email: 'manager@example.com', password: 'manager123', role: UserRole.MANAGER },
    { email: 'staff1@example.com', password: 'staff123', role: UserRole.STAFF },
    { email: 'staff2@example.com', password: 'staff123', role: UserRole.STAFF },
    { email: 'viewer@example.com', password: 'viewer123', role: UserRole.VIEWER },
  ];
};

/**
 * Clear all users from the database
 */
export const clearUsers = async (): Promise<void> => {
  try {
    await User.deleteMany({});
    logger.info('✓ Cleared all users');
  } catch (error) {
    logger.error('Error clearing users:', error);
    throw error;
  }
};

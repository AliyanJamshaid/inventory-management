/**
 * Role Seeder
 * Creates roles with appropriate permissions for the system
 */

import Role from '../models_temp/Role';
import Permission from '../models_temp/Permission';
import logger from '../utils/logger';

/**
 * Seed permissions into the database
 */
const seedPermissions = async () => {
  const permissions = [
    // User Management
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'], description: 'Manage users' },
    { resource: 'users', actions: ['read'], description: 'View users' },

    // Product Management
    { resource: 'products', actions: ['create', 'read', 'update', 'delete'], description: 'Manage products' },
    { resource: 'products', actions: ['read'], description: 'View products' },

    // Inventory Management
    { resource: 'inventory', actions: ['create', 'read', 'update', 'delete'], description: 'Manage inventory' },
    { resource: 'inventory', actions: ['read'], description: 'View inventory' },

    // Order Management
    { resource: 'orders', actions: ['create', 'read', 'update', 'delete'], description: 'Manage orders' },
    { resource: 'orders', actions: ['read'], description: 'View orders' },

    // Customer Management
    { resource: 'customers', actions: ['create', 'read', 'update', 'delete'], description: 'Manage customers' },
    { resource: 'customers', actions: ['read'], description: 'View customers' },

    // Supplier Management
    { resource: 'suppliers', actions: ['create', 'read', 'update', 'delete'], description: 'Manage suppliers' },
    { resource: 'suppliers', actions: ['read'], description: 'View suppliers' },

    // Warehouse Management
    { resource: 'warehouses', actions: ['create', 'read', 'update', 'delete'], description: 'Manage warehouses' },
    { resource: 'warehouses', actions: ['read'], description: 'View warehouses' },

    // Financial Management
    { resource: 'invoices', actions: ['create', 'read', 'update', 'delete'], description: 'Manage invoices' },
    { resource: 'invoices', actions: ['read'], description: 'View invoices' },
    { resource: 'payments', actions: ['create', 'read', 'update', 'delete'], description: 'Manage payments' },
    { resource: 'payments', actions: ['read'], description: 'View payments' },

    // Reports
    { resource: 'reports', actions: ['read', 'export'], description: 'View and export reports' },

    // Settings
    { resource: 'settings', actions: ['read', 'update'], description: 'Manage system settings' },
    { resource: 'settings', actions: ['read'], description: 'View system settings' },
  ];

  const createdPermissions = await Permission.insertMany(permissions);
  return createdPermissions;
};

/**
 * Seed roles into the database
 */
export const seedRoles = async (): Promise<void> => {
  try {
    // Check if roles already exist
    const existingCount = await Role.countDocuments();
    if (existingCount > 0) {
      logger.info(`Roles already exist (${existingCount} found). Skipping role seeding.`);
      return;
    }

    // First, clear and seed permissions
    await Permission.deleteMany({});
    const permissions = await seedPermissions();
    logger.info(`✓ Created ${permissions.length} permissions`);

    // Helper function to get permission IDs by resource and actions
    const getPermissionIds = (resources: string[], allActions: boolean = false) => {
      return permissions
        .filter(p => resources.includes(p.resource) && (allActions || p.actions.includes('read')))
        .map(p => p._id);
    };

    // Create roles with appropriate permissions
    const roles = [
      {
        name: 'ADMIN',
        description: 'Full system access with all permissions',
        permissions: permissions.map(p => p._id), // All permissions
        isDefault: false,
      },
      {
        name: 'MANAGER',
        description: 'Manage inventory, orders, and view reports',
        permissions: permissions
          .filter(p =>
            ['products', 'inventory', 'orders', 'customers', 'suppliers', 'warehouses', 'invoices', 'payments', 'reports'].includes(p.resource) &&
            !['delete'].some(action => p.actions.includes(action))
          )
          .map(p => p._id),
        isDefault: false,
      },
      {
        name: 'STAFF',
        description: 'Create and edit products, manage orders',
        permissions: permissions
          .filter(p =>
            ['products', 'inventory', 'orders', 'customers'].includes(p.resource) &&
            !['delete'].some(action => p.actions.includes(action))
          )
          .map(p => p._id),
        isDefault: true,
      },
      {
        name: 'VIEWER',
        description: 'Read-only access to view data',
        permissions: permissions
          .filter(p => p.actions.length === 1 && p.actions.includes('read'))
          .map(p => p._id),
        isDefault: false,
      },
    ];

    const createdRoles = await Role.insertMany(roles);
    logger.info(`✓ Created ${createdRoles.length} roles`);
  } catch (error) {
    logger.error('Error seeding roles:', error);
    throw error;
  }
};

/**
 * Clear all roles and permissions from the database
 */
export const clearRoles = async (): Promise<void> => {
  try {
    await Role.deleteMany({});
    await Permission.deleteMany({});
    logger.info('✓ Cleared all roles and permissions');
  } catch (error) {
    logger.error('Error clearing roles:', error);
    throw error;
  }
};

/**
 * Permission Seeder
 * Creates granular permissions for the entire system
 */

import Permission from '../models/Permission';
import Role from '../models/Role';
import logger from '../utils/logger';

interface PermissionDefinition {
  module: string;
  resource: string;
  action: string;
  displayName: string;
  description: string;
  category: string;
  isSystemPermission?: boolean;
}

/**
 * Comprehensive list of system permissions
 */
const permissionDefinitions: PermissionDefinition[] = [
  // ========== PRODUCTS MODULE ==========
  {
    module: 'products',
    resource: 'product',
    action: 'create',
    displayName: 'Create Products',
    description: 'Create new products in the inventory',
    category: 'Product Management',
  },
  {
    module: 'products',
    resource: 'product',
    action: 'read',
    displayName: 'View Products',
    description: 'View product details and listings',
    category: 'Product Management',
  },
  {
    module: 'products',
    resource: 'product',
    action: 'update',
    displayName: 'Edit Products',
    description: 'Update existing product information',
    category: 'Product Management',
  },
  {
    module: 'products',
    resource: 'product',
    action: 'delete',
    displayName: 'Delete Products',
    description: 'Remove products from the system',
    category: 'Product Management',
  },
  {
    module: 'products',
    resource: 'product',
    action: 'export',
    displayName: 'Export Products',
    description: 'Export product data to CSV/Excel',
    category: 'Product Management',
  },
  {
    module: 'products',
    resource: 'product',
    action: 'import',
    displayName: 'Import Products',
    description: 'Bulk import products from files',
    category: 'Product Management',
  },
  {
    module: 'products',
    resource: 'category',
    action: 'create',
    displayName: 'Create Categories',
    description: 'Create new product categories',
    category: 'Product Management',
  },
  {
    module: 'products',
    resource: 'category',
    action: 'read',
    displayName: 'View Categories',
    description: 'View product categories',
    category: 'Product Management',
  },
  {
    module: 'products',
    resource: 'category',
    action: 'update',
    displayName: 'Edit Categories',
    description: 'Update product categories',
    category: 'Product Management',
  },
  {
    module: 'products',
    resource: 'category',
    action: 'delete',
    displayName: 'Delete Categories',
    description: 'Remove product categories',
    category: 'Product Management',
  },
  {
    module: 'products',
    resource: 'variant',
    action: 'create',
    displayName: 'Create Product Variants',
    description: 'Create product variants',
    category: 'Product Management',
  },
  {
    module: 'products',
    resource: 'variant',
    action: 'read',
    displayName: 'View Product Variants',
    description: 'View product variants',
    category: 'Product Management',
  },
  {
    module: 'products',
    resource: 'variant',
    action: 'update',
    displayName: 'Edit Product Variants',
    description: 'Update product variants',
    category: 'Product Management',
  },
  {
    module: 'products',
    resource: 'variant',
    action: 'delete',
    displayName: 'Delete Product Variants',
    description: 'Remove product variants',
    category: 'Product Management',
  },

  // ========== INVENTORY MODULE ==========
  {
    module: 'inventory',
    resource: 'stock',
    action: 'read',
    displayName: 'View Stock Levels',
    description: 'View current stock levels',
    category: 'Inventory Management',
  },
  {
    module: 'inventory',
    resource: 'stock',
    action: 'adjust',
    displayName: 'Adjust Stock',
    description: 'Manually adjust stock quantities',
    category: 'Inventory Management',
  },
  {
    module: 'inventory',
    resource: 'stock',
    action: 'transfer',
    displayName: 'Transfer Stock',
    description: 'Transfer stock between warehouses',
    category: 'Inventory Management',
  },
  {
    module: 'inventory',
    resource: 'stock',
    action: 'reserve',
    displayName: 'Reserve Stock',
    description: 'Reserve stock for orders',
    category: 'Inventory Management',
  },
  {
    module: 'inventory',
    resource: 'warehouse',
    action: 'create',
    displayName: 'Create Warehouses',
    description: 'Add new warehouse locations',
    category: 'Inventory Management',
  },
  {
    module: 'inventory',
    resource: 'warehouse',
    action: 'read',
    displayName: 'View Warehouses',
    description: 'View warehouse information',
    category: 'Inventory Management',
  },
  {
    module: 'inventory',
    resource: 'warehouse',
    action: 'update',
    displayName: 'Edit Warehouses',
    description: 'Update warehouse details',
    category: 'Inventory Management',
  },
  {
    module: 'inventory',
    resource: 'warehouse',
    action: 'delete',
    displayName: 'Delete Warehouses',
    description: 'Remove warehouses',
    category: 'Inventory Management',
  },
  {
    module: 'inventory',
    resource: 'transaction',
    action: 'read',
    displayName: 'View Stock Transactions',
    description: 'View stock movement history',
    category: 'Inventory Management',
  },
  {
    module: 'inventory',
    resource: 'transaction',
    action: 'create',
    displayName: 'Create Stock Transactions',
    description: 'Record stock movements',
    category: 'Inventory Management',
  },
  {
    module: 'inventory',
    resource: 'location',
    action: 'create',
    displayName: 'Create Stock Locations',
    description: 'Add storage locations in warehouses',
    category: 'Inventory Management',
  },
  {
    module: 'inventory',
    resource: 'location',
    action: 'read',
    displayName: 'View Stock Locations',
    description: 'View storage locations',
    category: 'Inventory Management',
  },
  {
    module: 'inventory',
    resource: 'location',
    action: 'update',
    displayName: 'Edit Stock Locations',
    description: 'Update storage locations',
    category: 'Inventory Management',
  },
  {
    module: 'inventory',
    resource: 'location',
    action: 'delete',
    displayName: 'Delete Stock Locations',
    description: 'Remove storage locations',
    category: 'Inventory Management',
  },

  // ========== ORDERS MODULE ==========
  {
    module: 'orders',
    resource: 'sales_order',
    action: 'create',
    displayName: 'Create Sales Orders',
    description: 'Create new sales orders',
    category: 'Sales & Orders',
  },
  {
    module: 'orders',
    resource: 'sales_order',
    action: 'read',
    displayName: 'View Sales Orders',
    description: 'View sales order details',
    category: 'Sales & Orders',
  },
  {
    module: 'orders',
    resource: 'sales_order',
    action: 'update',
    displayName: 'Edit Sales Orders',
    description: 'Update sales order information',
    category: 'Sales & Orders',
  },
  {
    module: 'orders',
    resource: 'sales_order',
    action: 'delete',
    displayName: 'Delete Sales Orders',
    description: 'Remove sales orders',
    category: 'Sales & Orders',
  },
  {
    module: 'orders',
    resource: 'sales_order',
    action: 'approve',
    displayName: 'Approve Sales Orders',
    description: 'Approve pending sales orders',
    category: 'Sales & Orders',
  },
  {
    module: 'orders',
    resource: 'sales_order',
    action: 'cancel',
    displayName: 'Cancel Sales Orders',
    description: 'Cancel sales orders',
    category: 'Sales & Orders',
  },
  {
    module: 'orders',
    resource: 'sales_order',
    action: 'ship',
    displayName: 'Ship Sales Orders',
    description: 'Mark orders as shipped',
    category: 'Sales & Orders',
  },
  {
    module: 'orders',
    resource: 'sales_order',
    action: 'export',
    displayName: 'Export Sales Orders',
    description: 'Export sales order data',
    category: 'Sales & Orders',
  },
  {
    module: 'orders',
    resource: 'purchase_order',
    action: 'create',
    displayName: 'Create Purchase Orders',
    description: 'Create new purchase orders',
    category: 'Procurement',
  },
  {
    module: 'orders',
    resource: 'purchase_order',
    action: 'read',
    displayName: 'View Purchase Orders',
    description: 'View purchase order details',
    category: 'Procurement',
  },
  {
    module: 'orders',
    resource: 'purchase_order',
    action: 'update',
    displayName: 'Edit Purchase Orders',
    description: 'Update purchase order information',
    category: 'Procurement',
  },
  {
    module: 'orders',
    resource: 'purchase_order',
    action: 'delete',
    displayName: 'Delete Purchase Orders',
    description: 'Remove purchase orders',
    category: 'Procurement',
  },
  {
    module: 'orders',
    resource: 'purchase_order',
    action: 'approve',
    displayName: 'Approve Purchase Orders',
    description: 'Approve pending purchase orders',
    category: 'Procurement',
  },
  {
    module: 'orders',
    resource: 'purchase_order',
    action: 'receive',
    displayName: 'Receive Purchase Orders',
    description: 'Mark purchase orders as received',
    category: 'Procurement',
  },
  {
    module: 'orders',
    resource: 'purchase_order',
    action: 'export',
    displayName: 'Export Purchase Orders',
    description: 'Export purchase order data',
    category: 'Procurement',
  },

  // ========== CUSTOMERS MODULE ==========
  {
    module: 'customers',
    resource: 'customer',
    action: 'create',
    displayName: 'Create Customers',
    description: 'Add new customers',
    category: 'Customer Management',
  },
  {
    module: 'customers',
    resource: 'customer',
    action: 'read',
    displayName: 'View Customers',
    description: 'View customer information',
    category: 'Customer Management',
  },
  {
    module: 'customers',
    resource: 'customer',
    action: 'update',
    displayName: 'Edit Customers',
    description: 'Update customer details',
    category: 'Customer Management',
  },
  {
    module: 'customers',
    resource: 'customer',
    action: 'delete',
    displayName: 'Delete Customers',
    description: 'Remove customers',
    category: 'Customer Management',
  },
  {
    module: 'customers',
    resource: 'customer',
    action: 'export',
    displayName: 'Export Customers',
    description: 'Export customer data',
    category: 'Customer Management',
  },
  {
    module: 'customers',
    resource: 'customer',
    action: 'import',
    displayName: 'Import Customers',
    description: 'Bulk import customers',
    category: 'Customer Management',
  },

  // ========== SUPPLIERS MODULE ==========
  {
    module: 'suppliers',
    resource: 'supplier',
    action: 'create',
    displayName: 'Create Suppliers',
    description: 'Add new suppliers',
    category: 'Supplier Management',
  },
  {
    module: 'suppliers',
    resource: 'supplier',
    action: 'read',
    displayName: 'View Suppliers',
    description: 'View supplier information',
    category: 'Supplier Management',
  },
  {
    module: 'suppliers',
    resource: 'supplier',
    action: 'update',
    displayName: 'Edit Suppliers',
    description: 'Update supplier details',
    category: 'Supplier Management',
  },
  {
    module: 'suppliers',
    resource: 'supplier',
    action: 'delete',
    displayName: 'Delete Suppliers',
    description: 'Remove suppliers',
    category: 'Supplier Management',
  },
  {
    module: 'suppliers',
    resource: 'supplier',
    action: 'export',
    displayName: 'Export Suppliers',
    description: 'Export supplier data',
    category: 'Supplier Management',
  },

  // ========== FINANCE MODULE ==========
  {
    module: 'finance',
    resource: 'invoice',
    action: 'create',
    displayName: 'Create Invoices',
    description: 'Create new invoices',
    category: 'Financial Management',
  },
  {
    module: 'finance',
    resource: 'invoice',
    action: 'read',
    displayName: 'View Invoices',
    description: 'View invoice details',
    category: 'Financial Management',
  },
  {
    module: 'finance',
    resource: 'invoice',
    action: 'update',
    displayName: 'Edit Invoices',
    description: 'Update invoice information',
    category: 'Financial Management',
  },
  {
    module: 'finance',
    resource: 'invoice',
    action: 'delete',
    displayName: 'Delete Invoices',
    description: 'Remove invoices',
    category: 'Financial Management',
  },
  {
    module: 'finance',
    resource: 'invoice',
    action: 'send',
    displayName: 'Send Invoices',
    description: 'Send invoices to customers',
    category: 'Financial Management',
  },
  {
    module: 'finance',
    resource: 'invoice',
    action: 'export',
    displayName: 'Export Invoices',
    description: 'Export invoice data',
    category: 'Financial Management',
  },
  {
    module: 'finance',
    resource: 'payment',
    action: 'create',
    displayName: 'Record Payments',
    description: 'Record payment transactions',
    category: 'Financial Management',
  },
  {
    module: 'finance',
    resource: 'payment',
    action: 'read',
    displayName: 'View Payments',
    description: 'View payment information',
    category: 'Financial Management',
  },
  {
    module: 'finance',
    resource: 'payment',
    action: 'approve',
    displayName: 'Approve Payments',
    description: 'Approve pending payments',
    category: 'Financial Management',
  },
  {
    module: 'finance',
    resource: 'payment',
    action: 'export',
    displayName: 'Export Payments',
    description: 'Export payment data',
    category: 'Financial Management',
  },

  // ========== REPORTS MODULE ==========
  {
    module: 'reports',
    resource: 'inventory',
    action: 'read',
    displayName: 'View Inventory Reports',
    description: 'Access inventory analytics and reports',
    category: 'Reports & Analytics',
  },
  {
    module: 'reports',
    resource: 'sales',
    action: 'read',
    displayName: 'View Sales Reports',
    description: 'Access sales analytics and reports',
    category: 'Reports & Analytics',
  },
  {
    module: 'reports',
    resource: 'purchase',
    action: 'read',
    displayName: 'View Purchase Reports',
    description: 'Access purchase analytics and reports',
    category: 'Reports & Analytics',
  },
  {
    module: 'reports',
    resource: 'financial',
    action: 'read',
    displayName: 'View Financial Reports',
    description: 'Access financial analytics and reports',
    category: 'Reports & Analytics',
  },
  {
    module: 'reports',
    resource: 'analytics',
    action: 'read',
    displayName: 'View Analytics Dashboard',
    description: 'Access comprehensive analytics dashboard',
    category: 'Reports & Analytics',
  },
  {
    module: 'reports',
    resource: 'export',
    action: 'execute',
    displayName: 'Export Reports',
    description: 'Export reports to various formats',
    category: 'Reports & Analytics',
  },
  {
    module: 'reports',
    resource: 'custom',
    action: 'create',
    displayName: 'Create Custom Reports',
    description: 'Create custom report templates',
    category: 'Reports & Analytics',
  },
  {
    module: 'reports',
    resource: 'custom',
    action: 'read',
    displayName: 'View Custom Reports',
    description: 'View custom report templates',
    category: 'Reports & Analytics',
  },

  // ========== SETTINGS MODULE ==========
  {
    module: 'settings',
    resource: 'users',
    action: 'create',
    displayName: 'Create Users',
    description: 'Add new users to the system',
    category: 'User & Access Management',
  },
  {
    module: 'settings',
    resource: 'users',
    action: 'read',
    displayName: 'View Users',
    description: 'View user information',
    category: 'User & Access Management',
  },
  {
    module: 'settings',
    resource: 'users',
    action: 'update',
    displayName: 'Edit Users',
    description: 'Update user details',
    category: 'User & Access Management',
  },
  {
    module: 'settings',
    resource: 'users',
    action: 'delete',
    displayName: 'Delete Users',
    description: 'Remove users from the system',
    category: 'User & Access Management',
  },
  {
    module: 'settings',
    resource: 'users',
    action: 'activate',
    displayName: 'Activate/Deactivate Users',
    description: 'Enable or disable user accounts',
    category: 'User & Access Management',
  },
  {
    module: 'settings',
    resource: 'roles',
    action: 'create',
    displayName: 'Create Roles',
    description: 'Create new user roles',
    category: 'User & Access Management',
  },
  {
    module: 'settings',
    resource: 'roles',
    action: 'read',
    displayName: 'View Roles',
    description: 'View role information',
    category: 'User & Access Management',
  },
  {
    module: 'settings',
    resource: 'roles',
    action: 'update',
    displayName: 'Edit Roles',
    description: 'Update role permissions',
    category: 'User & Access Management',
  },
  {
    module: 'settings',
    resource: 'roles',
    action: 'delete',
    displayName: 'Delete Roles',
    description: 'Remove custom roles',
    category: 'User & Access Management',
  },
  {
    module: 'settings',
    resource: 'permissions',
    action: 'read',
    displayName: 'View Permissions',
    description: 'View available permissions',
    category: 'User & Access Management',
  },
  {
    module: 'settings',
    resource: 'permissions',
    action: 'assign',
    displayName: 'Assign Permissions',
    description: 'Assign permissions to roles',
    category: 'User & Access Management',
  },
  {
    module: 'settings',
    resource: 'custom_fields',
    action: 'create',
    displayName: 'Create Custom Fields',
    description: 'Add custom fields to entities',
    category: 'System Configuration',
  },
  {
    module: 'settings',
    resource: 'custom_fields',
    action: 'read',
    displayName: 'View Custom Fields',
    description: 'View custom field configurations',
    category: 'System Configuration',
  },
  {
    module: 'settings',
    resource: 'custom_fields',
    action: 'update',
    displayName: 'Edit Custom Fields',
    description: 'Update custom field settings',
    category: 'System Configuration',
  },
  {
    module: 'settings',
    resource: 'custom_fields',
    action: 'delete',
    displayName: 'Delete Custom Fields',
    description: 'Remove custom fields',
    category: 'System Configuration',
  },
  {
    module: 'settings',
    resource: 'workflows',
    action: 'create',
    displayName: 'Create Workflows',
    description: 'Set up automated workflows',
    category: 'System Configuration',
  },
  {
    module: 'settings',
    resource: 'workflows',
    action: 'read',
    displayName: 'View Workflows',
    description: 'View workflow configurations',
    category: 'System Configuration',
  },
  {
    module: 'settings',
    resource: 'workflows',
    action: 'update',
    displayName: 'Edit Workflows',
    description: 'Update workflow settings',
    category: 'System Configuration',
  },
  {
    module: 'settings',
    resource: 'workflows',
    action: 'delete',
    displayName: 'Delete Workflows',
    description: 'Remove workflows',
    category: 'System Configuration',
  },
  {
    module: 'settings',
    resource: 'system',
    action: 'read',
    displayName: 'View System Settings',
    description: 'View system configuration',
    category: 'System Configuration',
  },
  {
    module: 'settings',
    resource: 'system',
    action: 'update',
    displayName: 'Edit System Settings',
    description: 'Update system configuration',
    category: 'System Configuration',
  },
  {
    module: 'settings',
    resource: 'notifications',
    action: 'read',
    displayName: 'View Notifications',
    description: 'View system notifications',
    category: 'System Configuration',
  },
  {
    module: 'settings',
    resource: 'notifications',
    action: 'update',
    displayName: 'Manage Notifications',
    description: 'Configure notification settings',
    category: 'System Configuration',
  },
  {
    module: 'settings',
    resource: 'activity_log',
    action: 'read',
    displayName: 'View Activity Logs',
    description: 'Access system activity logs',
    category: 'System Configuration',
  },
  {
    module: 'settings',
    resource: 'activity_log',
    action: 'export',
    displayName: 'Export Activity Logs',
    description: 'Export activity log data',
    category: 'System Configuration',
  },
];

/**
 * Seed permissions into the database
 */
export const seedPermissions = async (): Promise<void> => {
  try {
    // Check if permissions already exist
    const existingCount = await Permission.countDocuments();
    if (existingCount > 0) {
      logger.info(`Permissions already exist (${existingCount} found). Skipping permission seeding.`);
      return;
    }

    // Insert all permissions
    const createdPermissions = await Permission.insertMany(
      permissionDefinitions.map((p) => ({
        ...p,
        isSystemPermission: p.isSystemPermission !== false, // Default to true
      }))
    );

    logger.info(`✓ Created ${createdPermissions.length} permissions across ${
      new Set(permissionDefinitions.map((p) => p.category)).size
    } categories`);

    // Log permissions by category
    const categories = new Set(permissionDefinitions.map((p) => p.category));
    categories.forEach((category) => {
      const count = permissionDefinitions.filter((p) => p.category === category).length;
      logger.info(`  - ${category}: ${count} permissions`);
    });
  } catch (error) {
    logger.error('Error seeding permissions:', error);
    throw error;
  }
};

/**
 * Seed default roles with appropriate permissions
 */
export const seedRoles = async (): Promise<void> => {
  try {
    // Check if roles already exist
    const existingCount = await Role.countDocuments();
    if (existingCount > 0) {
      logger.info(`Roles already exist (${existingCount} found). Skipping role seeding.`);
      return;
    }

    // Get all permissions
    const allPermissions = await Permission.find();
    const permissionMap = new Map(
      allPermissions.map((p) => [`${p.module}.${p.resource}.${p.action}`, p._id])
    );

    // Helper function to get permission IDs by keys
    const getPermissionIds = (keys: string[]) => {
      return keys.map((key) => permissionMap.get(key)).filter((id) => id !== undefined);
    };

    // Define role templates
    const roles = [
      {
        name: 'super_admin',
        displayName: 'Super Administrator',
        description: 'Full system access with all permissions',
        permissions: allPermissions.map((p) => p._id),
        isSystemRole: true,
        isDefault: false,
        hierarchy: 1,
      },
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Administrative access with most permissions',
        permissions: allPermissions
          .filter((p) => !p.action.includes('delete') || p.module !== 'settings')
          .map((p) => p._id),
        isSystemRole: true,
        isDefault: false,
        hierarchy: 10,
      },
      {
        name: 'warehouse_manager',
        displayName: 'Warehouse Manager',
        description: 'Manage inventory, warehouses, and stock operations',
        permissions: getPermissionIds([
          // Products - Read/Update
          'products.product.read',
          'products.product.update',
          'products.category.read',
          'products.variant.read',
          // Inventory - Full access
          'inventory.stock.read',
          'inventory.stock.adjust',
          'inventory.stock.transfer',
          'inventory.stock.reserve',
          'inventory.warehouse.read',
          'inventory.warehouse.update',
          'inventory.transaction.read',
          'inventory.transaction.create',
          'inventory.location.create',
          'inventory.location.read',
          'inventory.location.update',
          // Purchase Orders
          'orders.purchase_order.create',
          'orders.purchase_order.read',
          'orders.purchase_order.update',
          'orders.purchase_order.receive',
          // Suppliers
          'suppliers.supplier.read',
          // Reports
          'reports.inventory.read',
          'reports.purchase.read',
          'reports.export.execute',
        ]),
        isSystemRole: true,
        isDefault: false,
        hierarchy: 20,
      },
      {
        name: 'sales_manager',
        displayName: 'Sales Manager',
        description: 'Manage sales orders, customers, and sales operations',
        permissions: getPermissionIds([
          // Products - Read only
          'products.product.read',
          'products.category.read',
          'products.variant.read',
          // Inventory - Read only
          'inventory.stock.read',
          'inventory.warehouse.read',
          // Sales Orders - Full access
          'orders.sales_order.create',
          'orders.sales_order.read',
          'orders.sales_order.update',
          'orders.sales_order.approve',
          'orders.sales_order.cancel',
          'orders.sales_order.ship',
          'orders.sales_order.export',
          // Customers - Full access
          'customers.customer.create',
          'customers.customer.read',
          'customers.customer.update',
          'customers.customer.export',
          // Invoices
          'finance.invoice.create',
          'finance.invoice.read',
          'finance.invoice.send',
          'finance.payment.read',
          // Reports
          'reports.sales.read',
          'reports.analytics.read',
          'reports.export.execute',
        ]),
        isSystemRole: true,
        isDefault: false,
        hierarchy: 20,
      },
      {
        name: 'accountant',
        displayName: 'Accountant',
        description: 'Manage finances, invoices, and payments',
        permissions: getPermissionIds([
          // Finance - Full access
          'finance.invoice.create',
          'finance.invoice.read',
          'finance.invoice.update',
          'finance.invoice.send',
          'finance.invoice.export',
          'finance.payment.create',
          'finance.payment.read',
          'finance.payment.approve',
          'finance.payment.export',
          // Sales Orders - Read only
          'orders.sales_order.read',
          'orders.purchase_order.read',
          // Customers & Suppliers - Read only
          'customers.customer.read',
          'suppliers.supplier.read',
          // Reports
          'reports.financial.read',
          'reports.sales.read',
          'reports.purchase.read',
          'reports.export.execute',
        ]),
        isSystemRole: true,
        isDefault: false,
        hierarchy: 30,
      },
      {
        name: 'warehouse_staff',
        displayName: 'Warehouse Staff',
        description: 'Handle stock operations and inventory tasks',
        permissions: getPermissionIds([
          // Products - Read only
          'products.product.read',
          'products.category.read',
          'products.variant.read',
          // Inventory - Limited
          'inventory.stock.read',
          'inventory.stock.adjust',
          'inventory.warehouse.read',
          'inventory.transaction.read',
          'inventory.transaction.create',
          'inventory.location.read',
          // Purchase Orders - Receive only
          'orders.purchase_order.read',
          'orders.purchase_order.receive',
          // Reports
          'reports.inventory.read',
        ]),
        isSystemRole: true,
        isDefault: true,
        hierarchy: 50,
      },
      {
        name: 'sales_staff',
        displayName: 'Sales Staff',
        description: 'Create and manage sales orders',
        permissions: getPermissionIds([
          // Products - Read only
          'products.product.read',
          'products.category.read',
          'products.variant.read',
          // Inventory - Read only
          'inventory.stock.read',
          // Sales Orders
          'orders.sales_order.create',
          'orders.sales_order.read',
          'orders.sales_order.update',
          // Customers
          'customers.customer.create',
          'customers.customer.read',
          'customers.customer.update',
          // Invoices - Read only
          'finance.invoice.read',
          // Reports
          'reports.sales.read',
        ]),
        isSystemRole: true,
        isDefault: false,
        hierarchy: 50,
      },
      {
        name: 'viewer',
        displayName: 'Viewer',
        description: 'Read-only access to view data',
        permissions: allPermissions.filter((p) => p.action === 'read').map((p) => p._id),
        isSystemRole: true,
        isDefault: false,
        hierarchy: 90,
      },
    ];

    const createdRoles = await Role.insertMany(roles);
    logger.info(`✓ Created ${createdRoles.length} default roles`);

    createdRoles.forEach((role) => {
      logger.info(`  - ${role.displayName} (${role.name}): ${role.permissions.length} permissions`);
    });
  } catch (error) {
    logger.error('Error seeding roles:', error);
    throw error;
  }
};

/**
 * Clear all roles and permissions from the database
 */
export const clearRolesAndPermissions = async (): Promise<void> => {
  try {
    await Role.deleteMany({});
    await Permission.deleteMany({});
    logger.info('✓ Cleared all roles and permissions');
  } catch (error) {
    logger.error('Error clearing roles and permissions:', error);
    throw error;
  }
};

/**
 * Get permission statistics
 */
export const getPermissionStats = async (): Promise<any> => {
  const permissions = await Permission.find();
  const categories = new Set(permissions.map((p) => p.category));
  const modules = new Set(permissions.map((p) => p.module));

  const stats = {
    total: permissions.length,
    categories: categories.size,
    modules: modules.size,
    byCategory: {} as Record<string, number>,
    byModule: {} as Record<string, number>,
  };

  categories.forEach((category) => {
    stats.byCategory[category] = permissions.filter((p) => p.category === category).length;
  });

  modules.forEach((module) => {
    stats.byModule[module] = permissions.filter((p) => p.module === module).length;
  });

  return stats;
};

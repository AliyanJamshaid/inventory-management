/**
 * Permission and Role Type Definitions
 */

export interface Permission {
  _id: string;
  module: string;
  resource: string;
  action: string;
  displayName: string;
  description?: string;
  category: string;
  conditions?: any;
  isSystemPermission: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: Permission[];
  isSystemRole: boolean;
  isDefault: boolean;
  hierarchy: number;
  customSettings?: Record<string, any>;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GroupedPermissions {
  category: string;
  permissions: Permission[];
  count: number;
}

export interface PermissionStats {
  total: number;
  categories: number;
  modules: number;
  resources: number;
  actions: number;
  systemPermissions: number;
  customPermissions: number;
  byCategory: Record<string, number>;
  byModule: Record<string, number>;
  byAction: Record<string, number>;
}

export interface CreateRoleInput {
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  hierarchy?: number;
  isDefault?: boolean;
  customSettings?: Record<string, any>;
}

export interface UpdateRoleInput {
  name?: string;
  displayName?: string;
  description?: string;
  permissions?: string[];
  hierarchy?: number;
  isDefault?: boolean;
  customSettings?: Record<string, any>;
}

export interface CreatePermissionInput {
  module: string;
  resource: string;
  action: string;
  displayName: string;
  description?: string;
  category: string;
  conditions?: any;
}

export interface UpdatePermissionInput {
  displayName?: string;
  description?: string;
  category?: string;
  conditions?: any;
}

/**
 * Permission key type (module.resource.action)
 */
export type PermissionKey = string;

/**
 * Permission matrix structure for UI
 */
export interface PermissionMatrix {
  [resource: string]: {
    [action: string]: boolean;
  };
}

/**
 * Role template for quick role creation
 */
export interface RoleTemplate {
  name: string;
  displayName: string;
  description: string;
  permissionKeys: PermissionKey[];
  hierarchy: number;
  icon?: string;
  industry?: string[];
}

export const COMMON_ROLE_TEMPLATES: RoleTemplate[] = [
  {
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Full system access with all permissions',
    permissionKeys: [], // All permissions
    hierarchy: 1,
    icon: 'Shield',
    industry: ['all'],
  },
  {
    name: 'warehouse_manager',
    displayName: 'Warehouse Manager',
    description: 'Manage inventory, warehouses, and stock operations',
    permissionKeys: [
      'products.product.read',
      'inventory.stock.read',
      'inventory.stock.adjust',
      'inventory.warehouse.read',
      'inventory.warehouse.update',
      'orders.purchase_order.create',
      'orders.purchase_order.read',
      'reports.inventory.read',
    ],
    hierarchy: 20,
    icon: 'Warehouse',
    industry: ['retail', 'manufacturing', 'distribution'],
  },
  {
    name: 'sales_manager',
    displayName: 'Sales Manager',
    description: 'Manage sales orders, customers, and sales operations',
    permissionKeys: [
      'products.product.read',
      'customers.customer.create',
      'customers.customer.read',
      'customers.customer.update',
      'orders.sales_order.create',
      'orders.sales_order.read',
      'orders.sales_order.update',
      'finance.invoice.read',
      'reports.sales.read',
    ],
    hierarchy: 20,
    icon: 'TrendingUp',
    industry: ['retail', 'ecommerce', 'b2b'],
  },
  {
    name: 'accountant',
    displayName: 'Accountant',
    description: 'Manage finances, invoices, and payments',
    permissionKeys: [
      'finance.invoice.create',
      'finance.invoice.read',
      'finance.invoice.update',
      'finance.payment.create',
      'finance.payment.read',
      'reports.financial.read',
    ],
    hierarchy: 30,
    icon: 'DollarSign',
    industry: ['all'],
  },
  {
    name: 'customer_support',
    displayName: 'Customer Support',
    description: 'Handle customer inquiries and order management',
    permissionKeys: [
      'customers.customer.read',
      'orders.sales_order.read',
      'orders.sales_order.update',
      'products.product.read',
      'inventory.stock.read',
    ],
    hierarchy: 40,
    icon: 'Headphones',
    industry: ['retail', 'ecommerce', 'services'],
  },
];

export default {
  COMMON_ROLE_TEMPLATES,
};

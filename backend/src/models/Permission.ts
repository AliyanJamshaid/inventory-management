import mongoose, { Schema } from 'mongoose';
import { IPermission } from '../types/models';

/**
 * Permission Schema
 * Defines granular permissions for resources and actions
 */
const permissionSchema = new Schema<IPermission>(
  {
    /**
     * Module name (e.g., 'products', 'inventory', 'orders')
     */
    module: {
      type: String,
      required: [true, 'Module is required'],
      trim: true,
      lowercase: true,
    },

    /**
     * Resource name (e.g., 'product', 'warehouse', 'order')
     */
    resource: {
      type: String,
      required: [true, 'Resource is required'],
      trim: true,
      lowercase: true,
    },

    /**
     * Action on the resource (e.g., 'create', 'read', 'update', 'delete', 'approve')
     */
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
      lowercase: true,
    },

    /**
     * Display name for UI (e.g., 'Create Products')
     */
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
    },

    /**
     * Description of the permission
     */
    description: {
      type: String,
      trim: true,
    },

    /**
     * Category for grouping permissions (e.g., 'Inventory Management', 'Sales & Orders')
     */
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },

    /**
     * Field-level or row-level permission conditions
     */
    conditions: {
      type: Schema.Types.Mixed,
    },

    /**
     * Whether this is a system permission (cannot be deleted)
     */
    isSystemPermission: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Composite index for unique permission identifier
permissionSchema.index({ module: 1, resource: 1, action: 1 }, { unique: true });

// Index for category-based queries
permissionSchema.index({ category: 1 });

// Index for system permissions
permissionSchema.index({ isSystemPermission: 1 });

/**
 * Virtual field: permission key (module.resource.action)
 */
permissionSchema.virtual('key').get(function () {
  return `${this.module}.${this.resource}.${this.action}`;
});

/**
 * Static method to find permission by key
 * @param key - Permission key (module.resource.action)
 * @returns Permission document
 */
permissionSchema.statics.findByKey = function (key: string) {
  const [module, resource, action] = key.split('.');
  return this.findOne({
    module: module?.toLowerCase(),
    resource: resource?.toLowerCase(),
    action: action?.toLowerCase(),
  });
};

/**
 * Static method to find all permissions for a module
 * @param module - Module name
 * @returns Array of permission documents
 */
permissionSchema.statics.findByModule = function (module: string) {
  return this.find({ module: module.toLowerCase() });
};

/**
 * Static method to find all permissions for a category
 * @param category - Category name
 * @returns Array of permission documents
 */
permissionSchema.statics.findByCategory = function (category: string) {
  return this.find({ category });
};

/**
 * Static method to get permissions grouped by category
 * @returns Object with categories as keys and permissions as values
 */
permissionSchema.statics.findGroupedByCategory = async function () {
  const permissions = await this.find().sort({ category: 1, module: 1, resource: 1, action: 1 });

  const grouped: Record<string, any[]> = {};
  permissions.forEach((permission) => {
    if (!grouped[permission.category]) {
      grouped[permission.category] = [];
    }
    grouped[permission.category].push(permission);
  });

  return grouped;
};

/**
 * Static method to check if a specific permission key exists
 * @param key - Permission key (module.resource.action)
 * @returns True if permission exists
 */
permissionSchema.statics.hasPermissionKey = async function (key: string): Promise<boolean> {
  const permission = await this.findByKey(key);
  return !!permission;
};

const Permission = mongoose.model<IPermission>('Permission', permissionSchema);

export default Permission;

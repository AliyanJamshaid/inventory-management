import mongoose, { Schema } from 'mongoose';
import { IRole } from '../types/models';

/**
 * Role Schema
 * Defines user roles and their associated permissions
 */
const roleSchema = new Schema<IRole>(
  {
    /**
     * Role name (e.g., 'admin', 'warehouse_manager')
     */
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [50, 'Role name cannot exceed 50 characters'],
    },

    /**
     * Display name for UI (e.g., 'Administrator', 'Warehouse Manager')
     */
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      maxlength: [100, 'Display name cannot exceed 100 characters'],
    },

    /**
     * Description of the role
     */
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },

    /**
     * Array of permission IDs associated with this role
     */
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],

    /**
     * Whether this is a system role (cannot be deleted)
     */
    isSystemRole: {
      type: Boolean,
      default: false,
    },

    /**
     * Whether this is a default role (assigned to new users)
     */
    isDefault: {
      type: Boolean,
      default: false,
    },

    /**
     * Hierarchy level (1 = highest/admin, 100 = lowest)
     */
    hierarchy: {
      type: Number,
      required: [true, 'Hierarchy level is required'],
      min: [1, 'Hierarchy must be at least 1'],
      max: [100, 'Hierarchy cannot exceed 100'],
      default: 50,
    },

    /**
     * Custom settings for this role
     */
    customSettings: {
      type: Map,
      of: Schema.Types.Mixed,
    },

    /**
     * User who created this role
     */
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
roleSchema.index({ name: 1 }, { unique: true });
roleSchema.index({ isDefault: 1 });
roleSchema.index({ isSystemRole: 1 });
roleSchema.index({ hierarchy: 1 });

/**
 * Pre-save hook: Ensure only one default role exists
 */
roleSchema.pre('save', async function (next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Remove default flag from other roles
    await mongoose.model('Role').updateMany(
      { _id: { $ne: this._id }, isDefault: true },
      { $set: { isDefault: false } }
    );
  }
  next();
});

/**
 * Static method to find role with populated permissions
 * @param roleId - Role ID
 * @returns Role document with populated permissions
 */
roleSchema.statics.findWithPermissions = function (roleId: string) {
  return this.findById(roleId).populate('permissions');
};

/**
 * Static method to find all default roles
 * @returns Array of default role documents
 */
roleSchema.statics.findDefaultRoles = function () {
  return this.find({ isDefault: true });
};

/**
 * Static method to find role by name
 * @param name - Role name
 * @returns Role document
 */
roleSchema.statics.findByName = function (name: string) {
  return this.findOne({ name: name.toLowerCase() });
};

/**
 * Static method to find all system roles
 * @returns Array of system role documents
 */
roleSchema.statics.findSystemRoles = function () {
  return this.find({ isSystemRole: true });
};

/**
 * Static method to find all custom (non-system) roles
 * @returns Array of custom role documents
 */
roleSchema.statics.findCustomRoles = function () {
  return this.find({ isSystemRole: false });
};

/**
 * Static method to get roles sorted by hierarchy
 * @returns Array of role documents sorted by hierarchy
 */
roleSchema.statics.findByHierarchy = function () {
  return this.find().sort({ hierarchy: 1 });
};

/**
 * Instance method to add permission to role
 * @param permissionId - Permission ID to add
 */
roleSchema.methods.addPermission = async function (permissionId: mongoose.Types.ObjectId) {
  if (!this.permissions.some((id) => id.toString() === permissionId.toString())) {
    this.permissions.push(permissionId);
    await this.save();
  }
};

/**
 * Instance method to remove permission from role
 * @param permissionId - Permission ID to remove
 */
roleSchema.methods.removePermission = async function (permissionId: mongoose.Types.ObjectId) {
  this.permissions = this.permissions.filter(
    (id) => id.toString() !== permissionId.toString()
  );
  await this.save();
};

/**
 * Instance method to check if role has a specific permission
 * @param permissionId - Permission ID to check
 * @returns True if role has the permission
 */
roleSchema.methods.hasPermission = function (permissionId: mongoose.Types.ObjectId): boolean {
  return this.permissions.some((id) => id.toString() === permissionId.toString());
};

/**
 * Instance method to set multiple permissions
 * @param permissionIds - Array of permission IDs
 */
roleSchema.methods.setPermissions = async function (permissionIds: mongoose.Types.ObjectId[]) {
  this.permissions = permissionIds;
  await this.save();
};

const Role = mongoose.model<IRole>('Role', roleSchema);

export default Role;

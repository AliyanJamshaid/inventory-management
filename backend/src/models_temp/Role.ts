import mongoose, { Schema } from 'mongoose';
import { IRole } from '../types/models';

/**
 * Role Schema
 * Defines user roles and their associated permissions
 */
const roleSchema = new Schema<IRole>(
  {
    /**
     * Role name (e.g., 'Administrator', 'Warehouse Manager')
     */
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Role name cannot exceed 50 characters'],
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
     * Whether this is a default system role
     */
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
roleSchema.index({ name: 1 }, { unique: true });
roleSchema.index({ isDefault: 1 });

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
 * Instance method to add permission to role
 * @param permissionId - Permission ID to add
 */
roleSchema.methods.addPermission = async function (permissionId: mongoose.Types.ObjectId) {
  if (!this.permissions.includes(permissionId)) {
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

const Role = mongoose.model<IRole>('Role', roleSchema);

export default Role;

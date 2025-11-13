import mongoose, { Schema } from 'mongoose';
import { IPermission } from '../types/models';

/**
 * Permission Schema
 * Defines granular permissions for resources and actions
 */
const permissionSchema = new Schema<IPermission>(
  {
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
     * Array of allowed actions on the resource
     * (e.g., ['create', 'read', 'update', 'delete'])
     */
    actions: {
      type: [String],
      required: [true, 'At least one action is required'],
      validate: {
        validator: function (actions: string[]) {
          return actions.length > 0;
        },
        message: 'At least one action must be specified',
      },
    },

    /**
     * Description of the permission
     */
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
permissionSchema.index({ resource: 1 }, { unique: true });

/**
 * Static method to find permission by resource
 * @param resource - Resource name
 * @returns Permission document
 */
permissionSchema.statics.findByResource = function (resource: string) {
  return this.findOne({ resource: resource.toLowerCase() });
};

/**
 * Static method to check if a specific action is allowed for a resource
 * @param resource - Resource name
 * @param action - Action to check
 * @returns True if action is allowed
 */
permissionSchema.statics.hasPermission = async function (
  resource: string,
  action: string
): Promise<boolean> {
  const permission = await this.findOne({
    resource: resource.toLowerCase(),
    actions: action,
  });
  return !!permission;
};

const Permission = mongoose.model<IPermission>('Permission', permissionSchema);

export default Permission;

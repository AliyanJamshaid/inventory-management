import mongoose, { Schema } from 'mongoose';
import {
  ICustomField,
  CustomFieldType,
  CustomFieldEntityType,
} from '../types/models';

/**
 * Custom Field Schema
 * Manages custom fields for any entity in the system
 */
const customFieldSchema = new Schema<ICustomField>(
  {
    /**
     * Entity type this custom field belongs to
     */
    entityType: {
      type: String,
      enum: Object.values(CustomFieldEntityType),
      required: [true, 'Entity type is required'],
      index: true,
    },

    /**
     * Field name (slug format, e.g., "warranty_period")
     */
    fieldName: {
      type: String,
      required: [true, 'Field name is required'],
      trim: true,
      lowercase: true,
      match: [/^[a-z][a-z0-9_]*$/, 'Field name must be lowercase with underscores only'],
      maxlength: [50, 'Field name cannot exceed 50 characters'],
    },

    /**
     * Field label (display name, e.g., "Warranty Period")
     */
    fieldLabel: {
      type: String,
      required: [true, 'Field label is required'],
      trim: true,
      maxlength: [100, 'Field label cannot exceed 100 characters'],
    },

    /**
     * Field type (text, number, date, etc.)
     */
    fieldType: {
      type: String,
      enum: Object.values(CustomFieldType),
      required: [true, 'Field type is required'],
    },

    /**
     * Whether the field is required
     */
    required: {
      type: Boolean,
      default: false,
    },

    /**
     * Default value for the field
     */
    defaultValue: {
      type: Schema.Types.Mixed,
    },

    /**
     * Validation rules
     */
    validation: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
      pattern: {
        type: String,
      },
      options: {
        type: [String],
      },
    },

    /**
     * Help text to guide users
     */
    helpText: {
      type: String,
      trim: true,
      maxlength: [500, 'Help text cannot exceed 500 characters'],
    },

    /**
     * Placeholder text
     */
    placeholder: {
      type: String,
      trim: true,
      maxlength: [200, 'Placeholder cannot exceed 200 characters'],
    },

    /**
     * Display order (for sorting fields)
     */
    order: {
      type: Number,
      default: 0,
      index: true,
    },

    /**
     * Section/group name (for organizing fields)
     */
    section: {
      type: String,
      trim: true,
      maxlength: [100, 'Section name cannot exceed 100 characters'],
    },

    /**
     * Whether the field is active
     */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    /**
     * User who created the custom field
     */
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
customFieldSchema.index({ entityType: 1, fieldName: 1 }, { unique: true });
customFieldSchema.index({ entityType: 1, order: 1 });
customFieldSchema.index({ entityType: 1, isActive: 1 });
customFieldSchema.index({ createdAt: -1 });

/**
 * Reserved field names that cannot be used for custom fields
 */
const RESERVED_FIELD_NAMES = [
  '_id',
  'id',
  'createdAt',
  'updatedAt',
  '__v',
  'customFields',
  'attributes',
];

/**
 * Pre-save hook to validate field name is not reserved
 */
customFieldSchema.pre('save', function (next) {
  if (RESERVED_FIELD_NAMES.includes(this.fieldName)) {
    next(new Error(`Field name "${this.fieldName}" is reserved and cannot be used`));
  } else {
    next();
  }
});

/**
 * Pre-save hook to validate options for select/multiselect fields
 */
customFieldSchema.pre('save', function (next) {
  if (
    (this.fieldType === CustomFieldType.SELECT ||
      this.fieldType === CustomFieldType.MULTISELECT) &&
    (!this.validation?.options || this.validation.options.length === 0)
  ) {
    next(new Error('Select and multiselect fields must have at least one option'));
  } else {
    next();
  }
});

/**
 * Static method to find custom fields by entity type
 * @param entityType - Entity type
 * @param activeOnly - Whether to return only active fields
 * @returns Array of custom field documents
 */
customFieldSchema.statics.findByEntityType = function (
  entityType: CustomFieldEntityType,
  activeOnly: boolean = true
) {
  const filter: any = { entityType };
  if (activeOnly) {
    filter.isActive = true;
  }
  return this.find(filter).sort({ order: 1, createdAt: 1 });
};

/**
 * Static method to find custom field by entity type and field name
 * @param entityType - Entity type
 * @param fieldName - Field name
 * @returns Custom field document
 */
customFieldSchema.statics.findByEntityAndFieldName = function (
  entityType: CustomFieldEntityType,
  fieldName: string
) {
  return this.findOne({
    entityType,
    fieldName: fieldName.toLowerCase(),
  });
};

/**
 * Static method to get fields grouped by section
 * @param entityType - Entity type
 * @returns Fields grouped by section
 */
customFieldSchema.statics.getFieldsBySection = async function (
  entityType: CustomFieldEntityType
) {
  const fields = await this.find({ entityType, isActive: true }).sort({ order: 1 });

  const grouped: Record<string, ICustomField[]> = {
    default: [],
  };

  fields.forEach((field: ICustomField) => {
    const section = field.section || 'default';
    if (!grouped[section]) {
      grouped[section] = [];
    }
    grouped[section].push(field);
  });

  return grouped;
};

/**
 * Static method to validate field name is unique for entity type
 * @param entityType - Entity type
 * @param fieldName - Field name
 * @param excludeId - Field ID to exclude from check (for updates)
 * @returns Boolean indicating if field name is available
 */
customFieldSchema.statics.isFieldNameAvailable = async function (
  entityType: CustomFieldEntityType,
  fieldName: string,
  excludeId?: mongoose.Types.ObjectId
): Promise<boolean> {
  const filter: any = {
    entityType,
    fieldName: fieldName.toLowerCase(),
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const existing = await this.findOne(filter);
  return !existing;
};

/**
 * Static method to reorder custom fields
 * @param fieldOrders - Array of { id, order } objects
 */
customFieldSchema.statics.reorderFields = async function (
  fieldOrders: Array<{ id: string; order: number }>
) {
  const bulkOps = fieldOrders.map(({ id, order }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order } },
    },
  }));

  return this.bulkWrite(bulkOps);
};

/**
 * Instance method to archive the custom field
 * (soft delete - sets isActive to false)
 */
customFieldSchema.methods.archive = async function () {
  this.isActive = false;
  return await this.save();
};

/**
 * Instance method to restore archived custom field
 */
customFieldSchema.methods.restore = async function () {
  this.isActive = true;
  return await this.save();
};

const CustomField = mongoose.model<ICustomField>('CustomField', customFieldSchema);

export default CustomField;

import mongoose, { Schema } from 'mongoose';
import { ILabelTemplate, LabelTemplateType } from '../types/models';

/**
 * Label Template Schema
 * For printing product labels, price tags, and asset labels
 */
const labelTemplateSchema = new Schema<ILabelTemplate>(
  {
    /**
     * Template name
     */
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      maxlength: [100, 'Template name cannot exceed 100 characters'],
    },

    /**
     * Template type
     */
    type: {
      type: String,
      required: [true, 'Template type is required'],
      enum: Object.values(LabelTemplateType),
    },

    /**
     * Label width in millimeters
     */
    width: {
      type: Number,
      required: [true, 'Width is required'],
      min: [10, 'Width must be at least 10mm'],
      max: [500, 'Width cannot exceed 500mm'],
    },

    /**
     * Label height in millimeters
     */
    height: {
      type: Number,
      required: [true, 'Height is required'],
      min: [10, 'Height must be at least 10mm'],
      max: [500, 'Height cannot exceed 500mm'],
    },

    /**
     * Label layout configuration
     */
    layout: {
      showBarcode: {
        type: Boolean,
        default: true,
      },
      showQRCode: {
        type: Boolean,
        default: false,
      },
      showProductName: {
        type: Boolean,
        default: true,
      },
      showPrice: {
        type: Boolean,
        default: true,
      },
      showSKU: {
        type: Boolean,
        default: true,
      },
      showDescription: {
        type: Boolean,
        default: false,
      },
      showCategory: {
        type: Boolean,
        default: false,
      },
      fontSize: {
        type: Number,
        default: 12,
        min: 8,
        max: 48,
      },
      barcodeHeight: {
        type: Number,
        default: 40,
        min: 20,
        max: 200,
      },
    },

    /**
     * Whether this is the default template for its type
     */
    isDefault: {
      type: Boolean,
      default: false,
    },

    /**
     * User who created the template
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
labelTemplateSchema.index({ type: 1 });
labelTemplateSchema.index({ isDefault: 1 });
labelTemplateSchema.index({ createdBy: 1 });

/**
 * Static method to find default template by type
 * @param type - Template type
 * @returns Label template document
 */
labelTemplateSchema.statics.findDefaultByType = function (type: LabelTemplateType) {
  return this.findOne({ type, isDefault: true });
};

/**
 * Static method to find templates by type
 * @param type - Template type
 * @returns Array of label template documents
 */
labelTemplateSchema.statics.findByType = function (type: LabelTemplateType) {
  return this.find({ type }).sort({ isDefault: -1, name: 1 });
};

/**
 * Pre-save middleware to ensure only one default template per type
 */
labelTemplateSchema.pre('save', async function (next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Remove default flag from other templates of the same type
    await this.model('LabelTemplate').updateMany(
      { type: this.type, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

const LabelTemplate = mongoose.model<ILabelTemplate>('LabelTemplate', labelTemplateSchema);

export default LabelTemplate;

import mongoose, { Schema } from 'mongoose';
import { IProductVariant } from '../types/models';

/**
 * Product Variant Schema
 * Manages product variations (e.g., different sizes, colors)
 */
const productVariantSchema = new Schema<IProductVariant>(
  {
    /**
     * Reference to parent product
     */
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },

    /**
     * Variant name (e.g., "Large - Red", "Small - Blue")
     */
    variantName: {
      type: String,
      required: [true, 'Variant name is required'],
      trim: true,
      maxlength: [200, 'Variant name cannot exceed 200 characters'],
    },

    /**
     * Stock Keeping Unit - unique identifier for the variant
     */
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },

    /**
     * Barcode for the variant
     */
    barcode: {
      type: String,
      trim: true,
      sparse: true,
    },

    /**
     * Variant-specific attributes (e.g., size, color, material)
     */
    attributes: {
      type: Map,
      of: Schema.Types.Mixed,
      default: new Map(),
    },

    /**
     * Cost price of the variant
     */
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative'],
    },

    /**
     * Selling price of the variant
     */
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },

    /**
     * Array of image URLs for this variant
     */
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
productVariantSchema.index({ sku: 1 }, { unique: true });
productVariantSchema.index({ barcode: 1 }, { sparse: true });
productVariantSchema.index({ product: 1 });

/**
 * Virtual for profit margin
 */
productVariantSchema.virtual('profitMargin').get(function () {
  if (this.sellingPrice === 0) return 0;
  return ((this.sellingPrice - this.costPrice) / this.sellingPrice) * 100;
});

/**
 * Static method to find variants by product
 * @param productId - Product ID
 * @returns Array of variant documents
 */
productVariantSchema.statics.findByProduct = function (productId: mongoose.Types.ObjectId) {
  return this.find({ product: productId }).sort({ variantName: 1 });
};

/**
 * Static method to find variant by SKU
 * @param sku - Variant SKU
 * @returns Variant document
 */
productVariantSchema.statics.findBySKU = function (sku: string) {
  return this.findOne({ sku: sku.toUpperCase() });
};

const ProductVariant = mongoose.model<IProductVariant>(
  'ProductVariant',
  productVariantSchema
);

export default ProductVariant;

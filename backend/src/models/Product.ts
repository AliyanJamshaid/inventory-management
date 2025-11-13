import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../types/models';

/**
 * Product Schema
 * Core product information and management
 */
const productSchema = new Schema<IProduct>(
  {
    /**
     * Product name
     */
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },

    /**
     * Product description
     */
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },

    /**
     * Stock Keeping Unit - unique identifier
     */
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },

    /**
     * Barcode (EAN, UPC, etc.)
     */
    barcode: {
      type: String,
      trim: true,
      sparse: true,
    },

    /**
     * Reference to product category
     */
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },

    /**
     * Reference to primary supplier
     */
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
    },

    /**
     * Unit of measurement (e.g., 'piece', 'kg', 'liter')
     */
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
      lowercase: true,
    },

    /**
     * Cost price (purchase price)
     */
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative'],
    },

    /**
     * Selling price (retail price)
     */
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },

    /**
     * Tax percentage applied to the product
     */
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative'],
      max: [100, 'Tax cannot exceed 100%'],
    },

    /**
     * Array of image URLs
     */
    images: {
      type: [String],
      default: [],
    },

    /**
     * Array of product variant IDs
     */
    variants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ProductVariant',
      },
    ],

    /**
     * Custom attributes/fields for the product
     */
    attributes: {
      type: Map,
      of: Schema.Types.Mixed,
      default: new Map(),
    },

    /**
     * Custom fields (user-defined dynamic fields)
     */
    customFields: {
      type: Map,
      of: Schema.Types.Mixed,
      default: new Map(),
    },

    /**
     * Whether the product is active
     */
    isActive: {
      type: Boolean,
      default: true,
    },

    /**
     * User who created the product
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
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ barcode: 1 }, { sparse: true });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ supplier: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ createdAt: -1 });

/**
 * Virtual for profit margin percentage
 */
productSchema.virtual('profitMargin').get(function () {
  if (this.sellingPrice === 0) return 0;
  return ((this.sellingPrice - this.costPrice) / this.sellingPrice) * 100;
});

/**
 * Virtual for profit amount
 */
productSchema.virtual('profitAmount').get(function () {
  return this.sellingPrice - this.costPrice;
});

/**
 * Virtual for final price including tax
 */
productSchema.virtual('finalPrice').get(function () {
  return this.sellingPrice * (1 + this.tax / 100);
});

/**
 * Static method to find products by category
 * @param categoryId - Category ID
 * @returns Array of product documents
 */
productSchema.statics.findByCategory = function (categoryId: mongoose.Types.ObjectId) {
  return this.find({ category: categoryId, isActive: true })
    .populate('category')
    .populate('supplier')
    .sort({ name: 1 });
};

/**
 * Static method to find products by supplier
 * @param supplierId - Supplier ID
 * @returns Array of product documents
 */
productSchema.statics.findBySupplier = function (supplierId: mongoose.Types.ObjectId) {
  return this.find({ supplier: supplierId, isActive: true })
    .populate('category')
    .populate('supplier')
    .sort({ name: 1 });
};

/**
 * Static method to find product by SKU
 * @param sku - Product SKU
 * @returns Product document
 */
productSchema.statics.findBySKU = function (sku: string) {
  return this.findOne({ sku: sku.toUpperCase() })
    .populate('category')
    .populate('supplier')
    .populate('variants');
};

/**
 * Static method to search products by name or description
 * @param query - Search query
 * @returns Array of product documents
 */
productSchema.statics.search = function (query: string) {
  return this.find(
    { $text: { $search: query }, isActive: true },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .populate('category')
    .populate('supplier');
};

/**
 * Static method to find low-profit products
 * @param threshold - Profit margin threshold percentage
 * @returns Array of product documents with low profit margin
 */
productSchema.statics.findLowProfitProducts = function (threshold: number = 10) {
  return this.find({ isActive: true }).then((products) => {
    return products.filter((product) => {
      const margin =
        ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100;
      return margin < threshold;
    });
  });
};

/**
 * Instance method to add variant to product
 * @param variantId - Variant ID to add
 */
productSchema.methods.addVariant = async function (variantId: mongoose.Types.ObjectId) {
  if (!this.variants.includes(variantId)) {
    this.variants.push(variantId);
    await this.save();
  }
};

/**
 * Instance method to remove variant from product
 * @param variantId - Variant ID to remove
 */
productSchema.methods.removeVariant = async function (variantId: mongoose.Types.ObjectId) {
  this.variants = this.variants.filter((id) => id.toString() !== variantId.toString());
  await this.save();
};

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;

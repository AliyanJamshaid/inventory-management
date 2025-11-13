import mongoose, { Schema } from 'mongoose';
import { ISupplier } from '../types/models';

/**
 * Supplier Schema
 * Manages supplier information and relationships
 */
const supplierSchema = new Schema<ISupplier>(
  {
    /**
     * Supplier name
     */
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
      maxlength: [200, 'Supplier name cannot exceed 200 characters'],
    },

    /**
     * Unique supplier code
     */
    code: {
      type: String,
      required: [true, 'Supplier code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Supplier code cannot exceed 20 characters'],
    },

    /**
     * Contact email
     */
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    /**
     * Contact phone number
     */
    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[\d\s()-]+$/, 'Please provide a valid phone number'],
    },

    /**
     * Supplier website
     */
    website: {
      type: String,
      trim: true,
    },

    /**
     * Primary contact person name
     */
    contactPerson: {
      type: String,
      trim: true,
    },

    /**
     * Street address
     */
    address: {
      type: String,
      trim: true,
    },

    /**
     * City
     */
    city: {
      type: String,
      trim: true,
    },

    /**
     * State/Province
     */
    state: {
      type: String,
      trim: true,
    },

    /**
     * Country
     */
    country: {
      type: String,
      trim: true,
    },

    /**
     * ZIP/Postal code
     */
    zipCode: {
      type: String,
      trim: true,
    },

    /**
     * Tax identification number
     */
    taxId: {
      type: String,
      trim: true,
    },

    /**
     * Payment terms (e.g., "Net 30", "Net 60")
     */
    paymentTerms: {
      type: String,
      trim: true,
      default: 'Net 30',
    },

    /**
     * Supplier rating (1-5 stars)
     */
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
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
     * Whether the supplier is active
     */
    isActive: {
      type: Boolean,
      default: true,
    },

    /**
     * Additional notes about the supplier
     */
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
supplierSchema.index({ code: 1 }, { unique: true });
supplierSchema.index({ name: 'text', contactPerson: 'text' });
supplierSchema.index({ isActive: 1 });
supplierSchema.index({ rating: -1 });

/**
 * Virtual for full address
 */
supplierSchema.virtual('fullAddress').get(function () {
  const parts = [this.address, this.city, this.state, this.zipCode, this.country].filter(
    Boolean
  );
  return parts.join(', ');
});

/**
 * Virtual to get products from this supplier
 */
supplierSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'supplier',
});

/**
 * Static method to find active suppliers
 * @returns Array of active supplier documents
 */
supplierSchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ name: 1 });
};

/**
 * Static method to find supplier by code
 * @param code - Supplier code
 * @returns Supplier document
 */
supplierSchema.statics.findByCode = function (code: string) {
  return this.findOne({ code: code.toUpperCase() });
};

/**
 * Static method to find top-rated suppliers
 * @param minRating - Minimum rating threshold
 * @returns Array of supplier documents
 */
supplierSchema.statics.findTopRated = function (minRating: number = 4) {
  return this.find({ isActive: true, rating: { $gte: minRating } }).sort({ rating: -1 });
};

/**
 * Static method to search suppliers by name or contact person
 * @param query - Search query
 * @returns Array of supplier documents
 */
supplierSchema.statics.search = function (query: string) {
  return this.find(
    { $text: { $search: query }, isActive: true },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

/**
 * Instance method to get total purchase orders
 * @returns Total count of purchase orders
 */
supplierSchema.methods.getTotalPurchaseOrders = async function (): Promise<number> {
  const PurchaseOrder = mongoose.model('PurchaseOrder');
  return await PurchaseOrder.countDocuments({ supplier: this._id });
};

/**
 * Instance method to get total purchase value
 * @returns Total value of all purchase orders
 */
supplierSchema.methods.getTotalPurchaseValue = async function (): Promise<number> {
  const PurchaseOrder = mongoose.model('PurchaseOrder');
  const result = await PurchaseOrder.aggregate([
    { $match: { supplier: this._id } },
    { $group: { _id: null, totalValue: { $sum: '$total' } } },
  ]);

  return result.length > 0 ? result[0].totalValue : 0;
};

/**
 * Instance method to update rating
 * @param newRating - New rating value (1-5)
 */
supplierSchema.methods.updateRating = async function (newRating: number) {
  if (newRating < 1 || newRating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  this.rating = newRating;
  return await this.save();
};

const Supplier = mongoose.model<ISupplier>('Supplier', supplierSchema);

export default Supplier;

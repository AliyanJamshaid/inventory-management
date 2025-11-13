import mongoose, { Schema } from 'mongoose';
import { IWarehouse } from '../types/models';

/**
 * Warehouse Schema
 * Manages warehouse locations and facilities
 */
const warehouseSchema = new Schema<IWarehouse>(
  {
    /**
     * Warehouse name
     */
    name: {
      type: String,
      required: [true, 'Warehouse name is required'],
      trim: true,
      maxlength: [100, 'Warehouse name cannot exceed 100 characters'],
    },

    /**
     * Unique warehouse code
     */
    code: {
      type: String,
      required: [true, 'Warehouse code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Warehouse code cannot exceed 20 characters'],
    },

    /**
     * Street address
     */
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },

    /**
     * City
     */
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },

    /**
     * State/Province
     */
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },

    /**
     * Country
     */
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },

    /**
     * ZIP/Postal code
     */
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true,
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
     * Contact email
     */
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
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
     * Whether the warehouse is active
     */
    isActive: {
      type: Boolean,
      default: true,
    },

    /**
     * Reference to warehouse manager (User)
     */
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
warehouseSchema.index({ code: 1 }, { unique: true });
warehouseSchema.index({ name: 'text' });
warehouseSchema.index({ isActive: 1 });
warehouseSchema.index({ manager: 1 });

/**
 * Virtual for full address
 */
warehouseSchema.virtual('fullAddress').get(function () {
  return `${this.address}, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`;
});

/**
 * Virtual for stock locations in this warehouse
 */
warehouseSchema.virtual('locations', {
  ref: 'StockLocation',
  localField: '_id',
  foreignField: 'warehouse',
});

/**
 * Static method to find active warehouses
 * @returns Array of active warehouse documents
 */
warehouseSchema.statics.findActive = function () {
  return this.find({ isActive: true }).populate('manager').sort({ name: 1 });
};

/**
 * Static method to find warehouse by code
 * @param code - Warehouse code
 * @returns Warehouse document
 */
warehouseSchema.statics.findByCode = function (code: string) {
  return this.findOne({ code: code.toUpperCase() }).populate('manager');
};

/**
 * Static method to find warehouses by manager
 * @param managerId - User ID of the manager
 * @returns Array of warehouse documents
 */
warehouseSchema.statics.findByManager = function (managerId: mongoose.Types.ObjectId) {
  return this.find({ manager: managerId, isActive: true }).sort({ name: 1 });
};

/**
 * Instance method to get total stock value in this warehouse
 * @returns Total stock value
 */
warehouseSchema.methods.getTotalStockValue = async function (): Promise<number> {
  const Stock = mongoose.model('Stock');
  const stocks = await Stock.find({ warehouse: this._id }).populate('product');

  return stocks.reduce((total: number, stock: any) => {
    return total + stock.quantity * stock.product.costPrice;
  }, 0);
};

const Warehouse = mongoose.model<IWarehouse>('Warehouse', warehouseSchema);

export default Warehouse;

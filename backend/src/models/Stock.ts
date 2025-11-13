import mongoose, { Schema } from 'mongoose';
import { IStock } from '../types/models';

/**
 * Stock Schema
 * Manages inventory levels and stock tracking
 */
const stockSchema = new Schema<IStock>(
  {
    /**
     * Reference to product
     */
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },

    /**
     * Reference to product variant (if applicable)
     */
    variant: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
    },

    /**
     * Reference to warehouse
     */
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Warehouse is required'],
    },

    /**
     * Reference to specific storage location
     */
    location: {
      type: Schema.Types.ObjectId,
      ref: 'StockLocation',
    },

    /**
     * Total quantity in stock
     */
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },

    /**
     * Quantity reserved for orders (not available for new orders)
     */
    reservedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Reserved quantity cannot be negative'],
    },

    /**
     * Minimum stock level (alerts when stock falls below this)
     */
    minStockLevel: {
      type: Number,
      default: 0,
      min: [0, 'Minimum stock level cannot be negative'],
    },

    /**
     * Maximum stock level
     */
    maxStockLevel: {
      type: Number,
      default: 0,
      min: [0, 'Maximum stock level cannot be negative'],
    },

    /**
     * Reorder point (trigger for purchase orders)
     */
    reorderPoint: {
      type: Number,
      default: 0,
      min: [0, 'Reorder point cannot be negative'],
    },

    /**
     * Batch number for tracking
     */
    batchNumber: {
      type: String,
      trim: true,
    },

    /**
     * Serial number for tracking individual items
     */
    serialNumber: {
      type: String,
      trim: true,
      sparse: true,
    },

    /**
     * Expiration date for perishable items
     */
    expirationDate: {
      type: Date,
    },

    /**
     * Last physical stock count date
     */
    lastStockTakeDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
// Compound index for unique product + warehouse + location combination
stockSchema.index({ product: 1, warehouse: 1, location: 1 }, { unique: true });
stockSchema.index({ product: 1 });
stockSchema.index({ warehouse: 1 });
stockSchema.index({ variant: 1 });
stockSchema.index({ expirationDate: 1 });
stockSchema.index({ batchNumber: 1 });
stockSchema.index({ serialNumber: 1 }, { sparse: true });

/**
 * Virtual for available quantity (total - reserved)
 */
stockSchema.virtual('availableQuantity').get(function () {
  return Math.max(0, this.quantity - this.reservedQuantity);
});

/**
 * Virtual to check if stock is low
 */
stockSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.minStockLevel;
});

/**
 * Virtual to check if reorder is needed
 */
stockSchema.virtual('needsReorder').get(function () {
  return this.quantity <= this.reorderPoint;
});

/**
 * Virtual to check if stock is expiring soon (within 30 days)
 */
stockSchema.virtual('isExpiringSoon').get(function () {
  if (!this.expirationDate) return false;
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return this.expirationDate <= thirtyDaysFromNow;
});

/**
 * Validation: Reserved quantity cannot exceed total quantity
 */
stockSchema.pre('save', function (next) {
  if (this.reservedQuantity > this.quantity) {
    next(new Error('Reserved quantity cannot exceed total quantity'));
  } else {
    next();
  }
});

/**
 * Static method to find stock by product and warehouse
 * @param productId - Product ID
 * @param warehouseId - Warehouse ID
 * @returns Stock document
 */
stockSchema.statics.findByProductAndWarehouse = function (
  productId: mongoose.Types.ObjectId,
  warehouseId: mongoose.Types.ObjectId
) {
  return this.findOne({ product: productId, warehouse: warehouseId })
    .populate('product')
    .populate('variant')
    .populate('warehouse')
    .populate('location');
};

/**
 * Static method to find all stock for a product across all warehouses
 * @param productId - Product ID
 * @returns Array of stock documents
 */
stockSchema.statics.findByProduct = function (productId: mongoose.Types.ObjectId) {
  return this.find({ product: productId })
    .populate('warehouse')
    .populate('location')
    .sort({ warehouse: 1 });
};

/**
 * Static method to find all stock in a warehouse
 * @param warehouseId - Warehouse ID
 * @returns Array of stock documents
 */
stockSchema.statics.findByWarehouse = function (warehouseId: mongoose.Types.ObjectId) {
  return this.find({ warehouse: warehouseId })
    .populate('product')
    .populate('variant')
    .populate('location')
    .sort({ 'product.name': 1 });
};

/**
 * Static method to find low stock items
 * @param warehouseId - Optional warehouse ID to filter
 * @returns Array of stock documents with low stock
 */
stockSchema.statics.findLowStock = function (warehouseId?: mongoose.Types.ObjectId) {
  const query = warehouseId ? { warehouse: warehouseId } : {};

  return this.find(query)
    .populate('product')
    .populate('warehouse')
    .then((stocks: IStock[]) => {
      return stocks.filter((stock) => stock.quantity <= stock.minStockLevel);
    });
};

/**
 * Static method to find items needing reorder
 * @param warehouseId - Optional warehouse ID to filter
 * @returns Array of stock documents needing reorder
 */
stockSchema.statics.findNeedingReorder = function (warehouseId?: mongoose.Types.ObjectId) {
  const query = warehouseId ? { warehouse: warehouseId } : {};

  return this.find(query)
    .populate('product')
    .populate('warehouse')
    .then((stocks: IStock[]) => {
      return stocks.filter((stock) => stock.quantity <= stock.reorderPoint);
    });
};

/**
 * Static method to find expiring items
 * @param days - Number of days to look ahead (default: 30)
 * @param warehouseId - Optional warehouse ID to filter
 * @returns Array of stock documents with expiring items
 */
stockSchema.statics.findExpiring = function (
  days: number = 30,
  warehouseId?: mongoose.Types.ObjectId
) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const query: any = {
    expirationDate: { $lte: futureDate, $gte: new Date() },
  };

  if (warehouseId) {
    query.warehouse = warehouseId;
  }

  return this.find(query)
    .populate('product')
    .populate('warehouse')
    .populate('location')
    .sort({ expirationDate: 1 });
};

/**
 * Instance method to adjust stock quantity
 * @param adjustment - Quantity to add (positive) or remove (negative)
 * @returns Updated stock document
 */
stockSchema.methods.adjustQuantity = async function (adjustment: number) {
  this.quantity = Math.max(0, this.quantity + adjustment);
  return await this.save();
};

/**
 * Instance method to reserve stock
 * @param quantity - Quantity to reserve
 * @returns Updated stock document
 */
stockSchema.methods.reserve = async function (quantity: number) {
  if (this.availableQuantity < quantity) {
    throw new Error('Insufficient available stock to reserve');
  }
  this.reservedQuantity += quantity;
  return await this.save();
};

/**
 * Instance method to release reserved stock
 * @param quantity - Quantity to release
 * @returns Updated stock document
 */
stockSchema.methods.release = async function (quantity: number) {
  this.reservedQuantity = Math.max(0, this.reservedQuantity - quantity);
  return await this.save();
};

const Stock = mongoose.model<IStock>('Stock', stockSchema);

export default Stock;

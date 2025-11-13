import mongoose, { Schema } from 'mongoose';
import { IStockTransaction, StockTransactionType } from '../types/models';

/**
 * Stock Transaction Schema
 * Records all stock movements (in, out, transfers, adjustments)
 */
const stockTransactionSchema = new Schema<IStockTransaction>(
  {
    /**
     * Type of transaction
     */
    type: {
      type: String,
      enum: Object.values(StockTransactionType),
      required: [true, 'Transaction type is required'],
    },

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
     * Reference to warehouse (primary warehouse for the transaction)
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
     * Quantity moved (positive for IN/ADJUSTMENT up, negative for OUT/ADJUSTMENT down)
     */
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
    },

    /**
     * Source warehouse (for transfers)
     */
    fromWarehouse: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
    },

    /**
     * Destination warehouse (for transfers)
     */
    toWarehouse: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
    },

    /**
     * Reason code for the transaction
     */
    reasonCode: {
      type: String,
      trim: true,
    },

    /**
     * Reference number (e.g., PO number, SO number)
     */
    reference: {
      type: String,
      trim: true,
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
    },

    /**
     * User who performed the transaction
     */
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    /**
     * Additional notes about the transaction
     */
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },

    /**
     * Date when the transaction occurred
     */
    transactionDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
stockTransactionSchema.index({ product: 1, transactionDate: -1 });
stockTransactionSchema.index({ warehouse: 1, transactionDate: -1 });
stockTransactionSchema.index({ type: 1, transactionDate: -1 });
stockTransactionSchema.index({ reference: 1 });
stockTransactionSchema.index({ performedBy: 1 });
stockTransactionSchema.index({ batchNumber: 1 });
stockTransactionSchema.index({ transactionDate: -1 });

/**
 * Validation: Transfer transactions must have both fromWarehouse and toWarehouse
 */
stockTransactionSchema.pre('save', function (next) {
  if (this.type === StockTransactionType.TRANSFER) {
    if (!this.fromWarehouse || !this.toWarehouse) {
      return next(
        new Error('Transfer transactions require both fromWarehouse and toWarehouse')
      );
    }
    if (this.fromWarehouse.toString() === this.toWarehouse.toString()) {
      return next(new Error('Source and destination warehouses must be different'));
    }
  }
  next();
});

/**
 * Static method to find transactions by product
 * @param productId - Product ID
 * @param limit - Maximum number of results
 * @returns Array of transaction documents
 */
stockTransactionSchema.statics.findByProduct = function (
  productId: mongoose.Types.ObjectId,
  limit: number = 100
) {
  return this.find({ product: productId })
    .populate('warehouse')
    .populate('location')
    .populate('performedBy', 'firstName lastName email')
    .sort({ transactionDate: -1 })
    .limit(limit);
};

/**
 * Static method to find transactions by warehouse
 * @param warehouseId - Warehouse ID
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 * @returns Array of transaction documents
 */
stockTransactionSchema.statics.findByWarehouse = function (
  warehouseId: mongoose.Types.ObjectId,
  startDate?: Date,
  endDate?: Date
) {
  const query: any = { warehouse: warehouseId };

  if (startDate || endDate) {
    query.transactionDate = {};
    if (startDate) query.transactionDate.$gte = startDate;
    if (endDate) query.transactionDate.$lte = endDate;
  }

  return this.find(query)
    .populate('product')
    .populate('variant')
    .populate('performedBy', 'firstName lastName email')
    .sort({ transactionDate: -1 });
};

/**
 * Static method to find transactions by type
 * @param type - Transaction type
 * @param warehouseId - Optional warehouse ID filter
 * @param limit - Maximum number of results
 * @returns Array of transaction documents
 */
stockTransactionSchema.statics.findByType = function (
  type: StockTransactionType,
  warehouseId?: mongoose.Types.ObjectId,
  limit: number = 100
) {
  const query: any = { type };
  if (warehouseId) query.warehouse = warehouseId;

  return this.find(query)
    .populate('product')
    .populate('warehouse')
    .populate('performedBy', 'firstName lastName email')
    .sort({ transactionDate: -1 })
    .limit(limit);
};

/**
 * Static method to find transactions by reference number
 * @param reference - Reference number (e.g., PO number)
 * @returns Array of transaction documents
 */
stockTransactionSchema.statics.findByReference = function (reference: string) {
  return this.find({ reference })
    .populate('product')
    .populate('variant')
    .populate('warehouse')
    .populate('performedBy', 'firstName lastName email')
    .sort({ transactionDate: -1 });
};

/**
 * Static method to get stock movement summary for a date range
 * @param startDate - Start date
 * @param endDate - End date
 * @param warehouseId - Optional warehouse ID filter
 * @returns Aggregated summary
 */
stockTransactionSchema.statics.getMovementSummary = function (
  startDate: Date,
  endDate: Date,
  warehouseId?: mongoose.Types.ObjectId
) {
  const matchStage: any = {
    transactionDate: { $gte: startDate, $lte: endDate },
  };

  if (warehouseId) {
    matchStage.warehouse = warehouseId;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        totalQuantity: { $sum: '$quantity' },
        transactionCount: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
};

/**
 * Static method to create stock-in transaction
 * @param data - Transaction data
 * @returns Created transaction document
 */
stockTransactionSchema.statics.createStockIn = function (data: {
  product: mongoose.Types.ObjectId;
  variant?: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  location?: mongoose.Types.ObjectId;
  quantity: number;
  reference?: string;
  batchNumber?: string;
  performedBy: mongoose.Types.ObjectId;
  notes?: string;
}) {
  return this.create({
    type: StockTransactionType.IN,
    ...data,
    quantity: Math.abs(data.quantity), // Ensure positive
  });
};

/**
 * Static method to create stock-out transaction
 * @param data - Transaction data
 * @returns Created transaction document
 */
stockTransactionSchema.statics.createStockOut = function (data: {
  product: mongoose.Types.ObjectId;
  variant?: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  location?: mongoose.Types.ObjectId;
  quantity: number;
  reference?: string;
  performedBy: mongoose.Types.ObjectId;
  notes?: string;
}) {
  return this.create({
    type: StockTransactionType.OUT,
    ...data,
    quantity: -Math.abs(data.quantity), // Ensure negative
  });
};

const StockTransaction = mongoose.model<IStockTransaction>(
  'StockTransaction',
  stockTransactionSchema
);

export default StockTransaction;

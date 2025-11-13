import mongoose, { Schema } from 'mongoose';
import { IStockLocation, StockLocationType } from '../types/models';

/**
 * Stock Location Schema
 * Manages specific storage locations within warehouses
 */
const stockLocationSchema = new Schema<IStockLocation>(
  {
    /**
     * Reference to warehouse
     */
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Warehouse is required'],
    },

    /**
     * Location name (e.g., "Aisle A1", "Shelf B2")
     */
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
      maxlength: [100, 'Location name cannot exceed 100 characters'],
    },

    /**
     * Unique location code within the warehouse
     */
    code: {
      type: String,
      required: [true, 'Location code is required'],
      uppercase: true,
      trim: true,
      maxlength: [50, 'Location code cannot exceed 50 characters'],
    },

    /**
     * Type of storage location
     */
    type: {
      type: String,
      enum: Object.values(StockLocationType),
      required: [true, 'Location type is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Compound index to ensure unique location codes within each warehouse
stockLocationSchema.index({ warehouse: 1, code: 1 }, { unique: true });
stockLocationSchema.index({ warehouse: 1, type: 1 });
stockLocationSchema.index({ name: 'text' });

/**
 * Static method to find locations by warehouse
 * @param warehouseId - Warehouse ID
 * @returns Array of location documents
 */
stockLocationSchema.statics.findByWarehouse = function (
  warehouseId: mongoose.Types.ObjectId
) {
  return this.find({ warehouse: warehouseId }).sort({ code: 1 });
};

/**
 * Static method to find locations by warehouse and type
 * @param warehouseId - Warehouse ID
 * @param type - Location type
 * @returns Array of location documents
 */
stockLocationSchema.statics.findByWarehouseAndType = function (
  warehouseId: mongoose.Types.ObjectId,
  type: StockLocationType
) {
  return this.find({ warehouse: warehouseId, type }).sort({ code: 1 });
};

/**
 * Static method to find location by warehouse and code
 * @param warehouseId - Warehouse ID
 * @param code - Location code
 * @returns Location document
 */
stockLocationSchema.statics.findByCode = function (
  warehouseId: mongoose.Types.ObjectId,
  code: string
) {
  return this.findOne({ warehouse: warehouseId, code: code.toUpperCase() });
};

/**
 * Instance method to get total items stored in this location
 * @returns Total quantity of items
 */
stockLocationSchema.methods.getTotalItems = async function (): Promise<number> {
  const Stock = mongoose.model('Stock');
  const stocks = await Stock.find({ location: this._id });

  return stocks.reduce((total: number, stock: any) => total + stock.quantity, 0);
};

const StockLocation = mongoose.model<IStockLocation>('StockLocation', stockLocationSchema);

export default StockLocation;

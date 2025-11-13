import mongoose, { Schema } from 'mongoose';
import { IPurchaseOrder, PurchaseOrderStatus } from '../types/models';

/**
 * Purchase Order Schema
 * Manages purchase orders to suppliers
 */
const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    /**
     * Unique purchase order number
     */
    poNumber: {
      type: String,
      required: [true, 'PO number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },

    /**
     * Reference to supplier
     */
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required'],
    },

    /**
     * Date the order was placed
     */
    orderDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    /**
     * Expected delivery date
     */
    expectedDeliveryDate: {
      type: Date,
    },

    /**
     * Actual delivery date
     */
    actualDeliveryDate: {
      type: Date,
    },

    /**
     * Purchase order status
     */
    status: {
      type: String,
      enum: Object.values(PurchaseOrderStatus),
      default: PurchaseOrderStatus.DRAFT,
      required: true,
    },

    /**
     * Array of ordered items
     */
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        variant: {
          type: Schema.Types.ObjectId,
          ref: 'ProductVariant',
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        unitPrice: {
          type: Number,
          required: true,
          min: [0, 'Unit price cannot be negative'],
        },
        tax: {
          type: Number,
          default: 0,
          min: [0, 'Tax cannot be negative'],
        },
        total: {
          type: Number,
          required: true,
          min: [0, 'Total cannot be negative'],
        },
      },
    ],

    /**
     * Subtotal (sum of all items before tax and shipping)
     */
    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Subtotal cannot be negative'],
    },

    /**
     * Total tax amount
     */
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative'],
    },

    /**
     * Shipping cost
     */
    shipping: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cannot be negative'],
    },

    /**
     * Total amount (subtotal + tax + shipping)
     */
    total: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Total cannot be negative'],
    },

    /**
     * Currency code (ISO 4217)
     */
    currency: {
      type: String,
      uppercase: true,
      trim: true,
      minlength: [3, 'Currency code must be 3 characters'],
      maxlength: [3, 'Currency code must be 3 characters'],
      default: 'USD',
    },

    /**
     * Exchange rate at time of transaction
     */
    exchangeRate: {
      type: Number,
      default: 1.0,
      min: [0, 'Exchange rate must be positive'],
    },

    /**
     * Total amount in base currency
     */
    amountInBaseCurrency: {
      type: Number,
      default: 0,
      min: [0, 'Amount in base currency cannot be negative'],
    },

    /**
     * User who approved the order
     */
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    /**
     * User who received the order
     */
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    /**
     * Additional notes
     */
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
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
     * User who created the order
     */
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
purchaseOrderSchema.index({ poNumber: 1 }, { unique: true });
purchaseOrderSchema.index({ supplier: 1, orderDate: -1 });
purchaseOrderSchema.index({ status: 1, orderDate: -1 });
purchaseOrderSchema.index({ expectedDeliveryDate: 1 });
purchaseOrderSchema.index({ createdBy: 1 });
purchaseOrderSchema.index({ orderDate: -1 });

/**
 * Pre-save middleware to calculate totals and base currency amount
 */
purchaseOrderSchema.pre('save', async function (next) {
  // Calculate item totals
  this.items.forEach((item) => {
    item.total = item.quantity * item.unitPrice + item.tax;
  });

  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice;
  }, 0);

  // Calculate total tax
  this.tax = this.items.reduce((sum, item) => sum + item.tax, 0);

  // Calculate grand total
  this.total = this.subtotal + this.tax + this.shipping;

  // Calculate amount in base currency
  try {
    const Currency = mongoose.model('Currency');
    const baseCurrency = await Currency.getBaseCurrency();

    if (baseCurrency && this.currency && this.exchangeRate) {
      if (this.currency === baseCurrency.code) {
        this.amountInBaseCurrency = this.total;
      } else {
        this.amountInBaseCurrency = this.total / this.exchangeRate;
      }
    } else {
      this.amountInBaseCurrency = this.total;
    }
  } catch (error) {
    console.error('Error calculating base currency amount:', error);
    this.amountInBaseCurrency = this.total;
  }

  next();
});

/**
 * Static method to generate next PO number
 * @returns Next PO number
 */
purchaseOrderSchema.statics.generatePONumber = async function (): Promise<string> {
  const lastPO = await this.findOne().sort({ createdAt: -1 }).select('poNumber');

  if (!lastPO) {
    return 'PO-00001';
  }

  const lastNumber = parseInt(lastPO.poNumber.split('-')[1]);
  const nextNumber = (lastNumber + 1).toString().padStart(5, '0');
  return `PO-${nextNumber}`;
};

/**
 * Static method to find purchase orders by supplier
 * @param supplierId - Supplier ID
 * @returns Array of purchase order documents
 */
purchaseOrderSchema.statics.findBySupplier = function (supplierId: mongoose.Types.ObjectId) {
  return this.find({ supplier: supplierId })
    .populate('supplier')
    .populate('items.product')
    .populate('createdBy', 'firstName lastName email')
    .sort({ orderDate: -1 });
};

/**
 * Static method to find purchase orders by status
 * @param status - Order status
 * @returns Array of purchase order documents
 */
purchaseOrderSchema.statics.findByStatus = function (status: PurchaseOrderStatus) {
  return this.find({ status })
    .populate('supplier')
    .populate('createdBy', 'firstName lastName email')
    .sort({ orderDate: -1 });
};

/**
 * Static method to find overdue purchase orders
 * @returns Array of overdue purchase order documents
 */
purchaseOrderSchema.statics.findOverdue = function () {
  const today = new Date();
  return this.find({
    status: { $in: [PurchaseOrderStatus.PENDING, PurchaseOrderStatus.APPROVED] },
    expectedDeliveryDate: { $lt: today },
  })
    .populate('supplier')
    .populate('createdBy', 'firstName lastName email')
    .sort({ expectedDeliveryDate: 1 });
};

/**
 * Instance method to approve purchase order
 * @param userId - User ID who is approving
 * @returns Updated purchase order
 */
purchaseOrderSchema.methods.approve = async function (userId: mongoose.Types.ObjectId) {
  if (this.status !== PurchaseOrderStatus.DRAFT && this.status !== PurchaseOrderStatus.PENDING) {
    throw new Error('Only draft or pending orders can be approved');
  }

  this.status = PurchaseOrderStatus.APPROVED;
  this.approvedBy = userId;
  return await this.save();
};

/**
 * Instance method to mark purchase order as received
 * @param userId - User ID who is receiving
 * @returns Updated purchase order
 */
purchaseOrderSchema.methods.markAsReceived = async function (
  userId: mongoose.Types.ObjectId
) {
  if (this.status !== PurchaseOrderStatus.APPROVED) {
    throw new Error('Only approved orders can be marked as received');
  }

  this.status = PurchaseOrderStatus.RECEIVED;
  this.receivedBy = userId;
  this.actualDeliveryDate = new Date();
  return await this.save();
};

/**
 * Instance method to cancel purchase order
 * @returns Updated purchase order
 */
purchaseOrderSchema.methods.cancel = async function () {
  if (this.status === PurchaseOrderStatus.RECEIVED) {
    throw new Error('Received orders cannot be cancelled');
  }

  this.status = PurchaseOrderStatus.CANCELLED;
  return await this.save();
};

/**
 * Instance method to add item to purchase order
 * @param item - Item to add
 * @returns Updated purchase order
 */
purchaseOrderSchema.methods.addItem = async function (item: any) {
  this.items.push(item);
  return await this.save();
};

const PurchaseOrder = mongoose.model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);

export default PurchaseOrder;

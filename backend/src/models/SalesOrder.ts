import mongoose, { Schema } from 'mongoose';
import { ISalesOrder, SalesOrderStatus, PaymentStatus } from '../types/models';

/**
 * Sales Order Schema
 * Manages customer sales orders
 */
const salesOrderSchema = new Schema<ISalesOrder>(
  {
    /**
     * Unique sales order number
     */
    soNumber: {
      type: String,
      required: [true, 'SO number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },

    /**
     * Reference to customer
     */
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
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
    deliveryDate: {
      type: Date,
    },

    /**
     * Sales order status
     */
    status: {
      type: String,
      enum: Object.values(SalesOrderStatus),
      default: SalesOrderStatus.DRAFT,
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
        discount: {
          type: Number,
          default: 0,
          min: [0, 'Discount cannot be negative'],
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
     * Subtotal (sum of all items before discount, tax, and shipping)
     */
    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Subtotal cannot be negative'],
    },

    /**
     * Total discount amount
     */
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
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
     * Total amount (subtotal - discount + tax + shipping)
     */
    total: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Total cannot be negative'],
    },

    /**
     * Payment status
     */
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      required: true,
    },

    /**
     * User who processed the order
     */
    processedBy: {
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
salesOrderSchema.index({ soNumber: 1 }, { unique: true });
salesOrderSchema.index({ customer: 1, orderDate: -1 });
salesOrderSchema.index({ status: 1, orderDate: -1 });
salesOrderSchema.index({ paymentStatus: 1 });
salesOrderSchema.index({ deliveryDate: 1 });
salesOrderSchema.index({ createdBy: 1 });
salesOrderSchema.index({ orderDate: -1 });

/**
 * Pre-save middleware to calculate totals
 */
salesOrderSchema.pre('save', function (next) {
  // Calculate item totals
  this.items.forEach((item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    item.total = itemSubtotal - item.discount + item.tax;
  });

  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice;
  }, 0);

  // Calculate total discount
  this.discount = this.items.reduce((sum, item) => sum + item.discount, 0);

  // Calculate total tax
  this.tax = this.items.reduce((sum, item) => sum + item.tax, 0);

  // Calculate grand total
  this.total = this.subtotal - this.discount + this.tax + this.shipping;

  next();
});

/**
 * Static method to generate next SO number
 * @returns Next SO number
 */
salesOrderSchema.statics.generateSONumber = async function (): Promise<string> {
  const lastSO = await this.findOne().sort({ createdAt: -1 }).select('soNumber');

  if (!lastSO) {
    return 'SO-00001';
  }

  const lastNumber = parseInt(lastSO.soNumber.split('-')[1]);
  const nextNumber = (lastNumber + 1).toString().padStart(5, '0');
  return `SO-${nextNumber}`;
};

/**
 * Static method to find sales orders by customer
 * @param customerId - Customer ID
 * @returns Array of sales order documents
 */
salesOrderSchema.statics.findByCustomer = function (customerId: mongoose.Types.ObjectId) {
  return this.find({ customer: customerId })
    .populate('customer')
    .populate('items.product')
    .populate('createdBy', 'firstName lastName email')
    .sort({ orderDate: -1 });
};

/**
 * Static method to find sales orders by status
 * @param status - Order status
 * @returns Array of sales order documents
 */
salesOrderSchema.statics.findByStatus = function (status: SalesOrderStatus) {
  return this.find({ status })
    .populate('customer')
    .populate('createdBy', 'firstName lastName email')
    .sort({ orderDate: -1 });
};

/**
 * Static method to find sales orders by payment status
 * @param paymentStatus - Payment status
 * @returns Array of sales order documents
 */
salesOrderSchema.statics.findByPaymentStatus = function (paymentStatus: PaymentStatus) {
  return this.find({ paymentStatus })
    .populate('customer')
    .populate('createdBy', 'firstName lastName email')
    .sort({ orderDate: -1 });
};

/**
 * Static method to find overdue sales orders
 * @returns Array of overdue sales order documents
 */
salesOrderSchema.statics.findOverdue = function () {
  const today = new Date();
  return this.find({
    status: { $in: [SalesOrderStatus.CONFIRMED, SalesOrderStatus.PROCESSING] },
    deliveryDate: { $lt: today },
  })
    .populate('customer')
    .populate('createdBy', 'firstName lastName email')
    .sort({ deliveryDate: 1 });
};

/**
 * Instance method to confirm sales order
 * @returns Updated sales order
 */
salesOrderSchema.methods.confirm = async function () {
  if (this.status !== SalesOrderStatus.DRAFT) {
    throw new Error('Only draft orders can be confirmed');
  }

  this.status = SalesOrderStatus.CONFIRMED;
  return await this.save();
};

/**
 * Instance method to mark sales order as processing
 * @param userId - User ID who is processing
 * @returns Updated sales order
 */
salesOrderSchema.methods.markAsProcessing = async function (userId: mongoose.Types.ObjectId) {
  if (this.status !== SalesOrderStatus.CONFIRMED) {
    throw new Error('Only confirmed orders can be marked as processing');
  }

  this.status = SalesOrderStatus.PROCESSING;
  this.processedBy = userId;
  return await this.save();
};

/**
 * Instance method to mark sales order as shipped
 * @returns Updated sales order
 */
salesOrderSchema.methods.markAsShipped = async function () {
  if (this.status !== SalesOrderStatus.PROCESSING) {
    throw new Error('Only processing orders can be marked as shipped');
  }

  this.status = SalesOrderStatus.SHIPPED;
  return await this.save();
};

/**
 * Instance method to mark sales order as delivered
 * @returns Updated sales order
 */
salesOrderSchema.methods.markAsDelivered = async function () {
  if (this.status !== SalesOrderStatus.SHIPPED) {
    throw new Error('Only shipped orders can be marked as delivered');
  }

  this.status = SalesOrderStatus.DELIVERED;
  return await this.save();
};

/**
 * Instance method to cancel sales order
 * @returns Updated sales order
 */
salesOrderSchema.methods.cancel = async function () {
  if (
    this.status === SalesOrderStatus.DELIVERED ||
    this.status === SalesOrderStatus.CANCELLED
  ) {
    throw new Error('Delivered or already cancelled orders cannot be cancelled');
  }

  this.status = SalesOrderStatus.CANCELLED;
  return await this.save();
};

/**
 * Instance method to update payment status
 * @param status - New payment status
 * @returns Updated sales order
 */
salesOrderSchema.methods.updatePaymentStatus = async function (status: PaymentStatus) {
  this.paymentStatus = status;
  return await this.save();
};

/**
 * Instance method to add item to sales order
 * @param item - Item to add
 * @returns Updated sales order
 */
salesOrderSchema.methods.addItem = async function (item: any) {
  if (this.status !== SalesOrderStatus.DRAFT) {
    throw new Error('Items can only be added to draft orders');
  }

  this.items.push(item);
  return await this.save();
};

const SalesOrder = mongoose.model<ISalesOrder>('SalesOrder', salesOrderSchema);

export default SalesOrder;

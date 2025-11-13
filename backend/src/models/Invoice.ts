import mongoose, { Schema } from 'mongoose';
import { IInvoice, InvoiceStatus, PaymentMethod } from '../types/models';

/**
 * Invoice Schema
 * Manages customer invoices and billing
 */
const invoiceSchema = new Schema<IInvoice>(
  {
    /**
     * Unique invoice number
     */
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },

    /**
     * Reference to sales order (optional)
     */
    salesOrder: {
      type: Schema.Types.ObjectId,
      ref: 'SalesOrder',
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
     * Invoice date
     */
    invoiceDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    /**
     * Payment due date
     */
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },

    /**
     * Invoice status
     */
    status: {
      type: String,
      enum: Object.values(InvoiceStatus),
      default: InvoiceStatus.DRAFT,
      required: true,
    },

    /**
     * Array of invoice items
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
        description: {
          type: String,
          required: true,
          trim: true,
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
     * Subtotal (sum of all items before discount and tax)
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
     * Total amount (subtotal - discount + tax)
     */
    total: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Total cannot be negative'],
    },

    /**
     * Amount already paid
     */
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
    },

    /**
     * Balance amount remaining
     */
    balanceAmount: {
      type: Number,
      default: 0,
      min: [0, 'Balance amount cannot be negative'],
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
     * Payment method used
     */
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ customer: 1, invoiceDate: -1 });
invoiceSchema.index({ salesOrder: 1 });
invoiceSchema.index({ status: 1, dueDate: 1 });
invoiceSchema.index({ invoiceDate: -1 });
invoiceSchema.index({ dueDate: 1 });

/**
 * Virtual to check if invoice is fully paid
 */
invoiceSchema.virtual('isFullyPaid').get(function () {
  return this.paidAmount >= this.total;
});

/**
 * Virtual to check if invoice is overdue
 */
invoiceSchema.virtual('isOverdue').get(function () {
  return (
    this.status !== InvoiceStatus.PAID &&
    this.status !== InvoiceStatus.CANCELLED &&
    new Date() > this.dueDate
  );
});

/**
 * Virtual for days overdue
 */
invoiceSchema.virtual('daysOverdue').get(function () {
  if (!this.isOverdue) return 0;
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - this.dueDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

/**
 * Pre-save middleware to calculate totals, base currency amount, and update status
 */
invoiceSchema.pre('save', async function (next) {
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
  this.total = this.subtotal - this.discount + this.tax;

  // Calculate balance
  this.balanceAmount = Math.max(0, this.total - this.paidAmount);

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

  // Auto-update status based on payment
  if (this.paidAmount >= this.total && this.status !== InvoiceStatus.CANCELLED) {
    this.status = InvoiceStatus.PAID;
  } else if (
    this.status !== InvoiceStatus.CANCELLED &&
    this.status !== InvoiceStatus.DRAFT &&
    new Date() > this.dueDate &&
    this.paidAmount < this.total
  ) {
    this.status = InvoiceStatus.OVERDUE;
  }

  next();
});

/**
 * Static method to generate next invoice number
 * @returns Next invoice number
 */
invoiceSchema.statics.generateInvoiceNumber = async function (): Promise<string> {
  const lastInvoice = await this.findOne().sort({ createdAt: -1 }).select('invoiceNumber');

  if (!lastInvoice) {
    return 'INV-00001';
  }

  const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
  const nextNumber = (lastNumber + 1).toString().padStart(5, '0');
  return `INV-${nextNumber}`;
};

/**
 * Static method to find invoices by customer
 * @param customerId - Customer ID
 * @returns Array of invoice documents
 */
invoiceSchema.statics.findByCustomer = function (customerId: mongoose.Types.ObjectId) {
  return this.find({ customer: customerId })
    .populate('customer')
    .populate('salesOrder')
    .populate('items.product')
    .sort({ invoiceDate: -1 });
};

/**
 * Static method to find invoices by status
 * @param status - Invoice status
 * @returns Array of invoice documents
 */
invoiceSchema.statics.findByStatus = function (status: InvoiceStatus) {
  return this.find({ status })
    .populate('customer')
    .populate('salesOrder')
    .sort({ invoiceDate: -1 });
};

/**
 * Static method to find overdue invoices
 * @returns Array of overdue invoice documents
 */
invoiceSchema.statics.findOverdue = function () {
  const today = new Date();
  return this.find({
    status: { $in: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE] },
    dueDate: { $lt: today },
    balanceAmount: { $gt: 0 },
  })
    .populate('customer')
    .sort({ dueDate: 1 });
};

/**
 * Static method to find invoices due within specified days
 * @param days - Number of days to look ahead
 * @returns Array of invoice documents
 */
invoiceSchema.statics.findDueSoon = function (days: number = 7) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  return this.find({
    status: { $in: [InvoiceStatus.SENT, InvoiceStatus.DRAFT] },
    dueDate: { $gte: today, $lte: futureDate },
    balanceAmount: { $gt: 0 },
  })
    .populate('customer')
    .sort({ dueDate: 1 });
};

/**
 * Instance method to mark invoice as sent
 * @returns Updated invoice
 */
invoiceSchema.methods.markAsSent = async function () {
  if (this.status !== InvoiceStatus.DRAFT) {
    throw new Error('Only draft invoices can be marked as sent');
  }

  this.status = InvoiceStatus.SENT;
  return await this.save();
};

/**
 * Instance method to record payment
 * @param amount - Payment amount
 * @param method - Payment method
 * @returns Updated invoice
 */
invoiceSchema.methods.recordPayment = async function (
  amount: number,
  method: PaymentMethod
) {
  if (amount <= 0) {
    throw new Error('Payment amount must be positive');
  }

  if (this.status === InvoiceStatus.CANCELLED) {
    throw new Error('Cannot record payment for cancelled invoice');
  }

  this.paidAmount += amount;
  this.paymentMethod = method;

  return await this.save();
};

/**
 * Instance method to cancel invoice
 * @returns Updated invoice
 */
invoiceSchema.methods.cancel = async function () {
  if (this.status === InvoiceStatus.PAID) {
    throw new Error('Paid invoices cannot be cancelled');
  }

  this.status = InvoiceStatus.CANCELLED;
  return await this.save();
};

/**
 * Instance method to add item to invoice
 * @param item - Item to add
 * @returns Updated invoice
 */
invoiceSchema.methods.addItem = async function (item: any) {
  if (this.status !== InvoiceStatus.DRAFT) {
    throw new Error('Items can only be added to draft invoices');
  }

  this.items.push(item);
  return await this.save();
};

const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);

export default Invoice;

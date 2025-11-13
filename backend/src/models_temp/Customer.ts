import mongoose, { Schema } from 'mongoose';
import { ICustomer, CustomerType } from '../types/models';

/**
 * Customer Schema
 * Manages customer information and relationships
 */
const customerSchema = new Schema<ICustomer>(
  {
    /**
     * Unique customer number
     */
    customerNumber: {
      type: String,
      required: [true, 'Customer number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },

    /**
     * Customer name
     */
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [200, 'Customer name cannot exceed 200 characters'],
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
     * Customer type (Business or Consumer)
     */
    type: {
      type: String,
      enum: Object.values(CustomerType),
      required: [true, 'Customer type is required'],
      default: CustomerType.B2C,
    },

    /**
     * Primary contact person name (for B2B)
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
     * Credit limit for the customer
     */
    creditLimit: {
      type: Number,
      default: 0,
      min: [0, 'Credit limit cannot be negative'],
    },

    /**
     * Current credit used
     */
    currentCredit: {
      type: Number,
      default: 0,
      min: [0, 'Current credit cannot be negative'],
    },

    /**
     * Payment terms (e.g., "Net 30", "COD")
     */
    paymentTerms: {
      type: String,
      trim: true,
      default: 'COD',
    },

    /**
     * Loyalty points balance
     */
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: [0, 'Loyalty points cannot be negative'],
    },

    /**
     * Whether the customer account is active
     */
    isActive: {
      type: Boolean,
      default: true,
    },

    /**
     * Additional notes about the customer
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
customerSchema.index({ customerNumber: 1 }, { unique: true });
customerSchema.index({ name: 'text', contactPerson: 'text', email: 'text' });
customerSchema.index({ type: 1 });
customerSchema.index({ isActive: 1 });
customerSchema.index({ email: 1 });

/**
 * Virtual for available credit
 */
customerSchema.virtual('availableCredit').get(function () {
  return Math.max(0, this.creditLimit - this.currentCredit);
});

/**
 * Virtual for full address
 */
customerSchema.virtual('fullAddress').get(function () {
  const parts = [this.address, this.city, this.state, this.zipCode, this.country].filter(
    Boolean
  );
  return parts.join(', ');
});

/**
 * Virtual to get sales orders for this customer
 */
customerSchema.virtual('salesOrders', {
  ref: 'SalesOrder',
  localField: '_id',
  foreignField: 'customer',
});

/**
 * Validation: Current credit cannot exceed credit limit
 */
customerSchema.pre('save', function (next) {
  if (this.currentCredit > this.creditLimit) {
    next(new Error('Current credit cannot exceed credit limit'));
  } else {
    next();
  }
});

/**
 * Static method to generate next customer number
 * @returns Next customer number
 */
customerSchema.statics.generateCustomerNumber = async function (): Promise<string> {
  const lastCustomer = await this.findOne().sort({ createdAt: -1 }).select('customerNumber');

  if (!lastCustomer) {
    return 'CUST-00001';
  }

  const lastNumber = parseInt(lastCustomer.customerNumber.split('-')[1]);
  const nextNumber = (lastNumber + 1).toString().padStart(5, '0');
  return `CUST-${nextNumber}`;
};

/**
 * Static method to find active customers
 * @returns Array of active customer documents
 */
customerSchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ name: 1 });
};

/**
 * Static method to find customers by type
 * @param type - Customer type
 * @returns Array of customer documents
 */
customerSchema.statics.findByType = function (type: CustomerType) {
  return this.find({ type, isActive: true }).sort({ name: 1 });
};

/**
 * Static method to search customers
 * @param query - Search query
 * @returns Array of customer documents
 */
customerSchema.statics.search = function (query: string) {
  return this.find(
    { $text: { $search: query }, isActive: true },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

/**
 * Static method to find customers with exceeded credit limit
 * @returns Array of customer documents
 */
customerSchema.statics.findCreditExceeded = function () {
  return this.find({ isActive: true }).then((customers) => {
    return customers.filter((customer) => customer.currentCredit > customer.creditLimit);
  });
};

/**
 * Instance method to add loyalty points
 * @param points - Points to add
 * @returns Updated customer
 */
customerSchema.methods.addLoyaltyPoints = async function (points: number) {
  this.loyaltyPoints += points;
  return await this.save();
};

/**
 * Instance method to redeem loyalty points
 * @param points - Points to redeem
 * @returns Updated customer
 */
customerSchema.methods.redeemLoyaltyPoints = async function (points: number) {
  if (points > this.loyaltyPoints) {
    throw new Error('Insufficient loyalty points');
  }
  this.loyaltyPoints -= points;
  return await this.save();
};

/**
 * Instance method to update credit usage
 * @param amount - Amount to add (positive) or remove (negative)
 * @returns Updated customer
 */
customerSchema.methods.updateCredit = async function (amount: number) {
  this.currentCredit = Math.max(0, this.currentCredit + amount);

  if (this.currentCredit > this.creditLimit) {
    throw new Error('Credit limit would be exceeded');
  }

  return await this.save();
};

/**
 * Instance method to get total purchase value
 * @returns Total value of all sales orders
 */
customerSchema.methods.getTotalPurchaseValue = async function (): Promise<number> {
  const SalesOrder = mongoose.model('SalesOrder');
  const result = await SalesOrder.aggregate([
    { $match: { customer: this._id } },
    { $group: { _id: null, totalValue: { $sum: '$total' } } },
  ]);

  return result.length > 0 ? result[0].totalValue : 0;
};

const Customer = mongoose.model<ICustomer>('Customer', customerSchema);

export default Customer;

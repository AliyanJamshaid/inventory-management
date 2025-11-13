import mongoose, { Schema } from 'mongoose';
import { ICurrency } from '../types/models';

/**
 * Currency Schema
 * Manages multiple currencies with exchange rates
 */
const currencySchema = new Schema<ICurrency>(
  {
    /**
     * ISO 4217 currency code (USD, EUR, GBP, etc.)
     */
    code: {
      type: String,
      required: [true, 'Currency code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, 'Currency code must be 3 characters'],
      maxlength: [3, 'Currency code must be 3 characters'],
    },

    /**
     * Currency name (e.g., US Dollar, Euro, British Pound)
     */
    name: {
      type: String,
      required: [true, 'Currency name is required'],
      trim: true,
      maxlength: [100, 'Currency name cannot exceed 100 characters'],
    },

    /**
     * Currency symbol (e.g., $, €, £)
     */
    symbol: {
      type: String,
      required: [true, 'Currency symbol is required'],
      trim: true,
      maxlength: [10, 'Currency symbol cannot exceed 10 characters'],
    },

    /**
     * Number of decimal places (2 for most currencies, 0 for JPY, 3 for some)
     */
    decimalPlaces: {
      type: Number,
      required: [true, 'Decimal places is required'],
      min: [0, 'Decimal places cannot be negative'],
      max: [4, 'Decimal places cannot exceed 4'],
      default: 2,
    },

    /**
     * Exchange rate to base currency
     * If this is the base currency, rate should be 1.0
     */
    exchangeRate: {
      type: Number,
      required: [true, 'Exchange rate is required'],
      min: [0, 'Exchange rate must be positive'],
      default: 1.0,
    },

    /**
     * Whether this is the base currency (only one can be true)
     */
    isBaseCurrency: {
      type: Boolean,
      default: false,
    },

    /**
     * Whether the currency is active
     */
    isActive: {
      type: Boolean,
      default: true,
    },

    /**
     * Last time exchange rate was updated
     */
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
currencySchema.index({ code: 1 }, { unique: true });
currencySchema.index({ isBaseCurrency: 1 });
currencySchema.index({ isActive: 1 });
currencySchema.index({ lastUpdated: -1 });

/**
 * Pre-save middleware to ensure only one base currency
 */
currencySchema.pre('save', async function (next) {
  if (this.isBaseCurrency) {
    // If setting as base currency, unset all others
    await Currency.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isBaseCurrency: false } }
    );
    // Base currency must have rate of 1.0
    this.exchangeRate = 1.0;
  }
  next();
});

/**
 * Instance method to format amount in this currency
 * @param amount - Amount to format
 * @returns Formatted string
 */
currencySchema.methods.formatAmount = function (amount: number): string {
  const formatted = amount.toFixed(this.decimalPlaces);
  return `${this.symbol}${formatted}`;
};

/**
 * Static method to get base currency
 * @returns Base currency document
 */
currencySchema.statics.getBaseCurrency = function () {
  return this.findOne({ isBaseCurrency: true, isActive: true });
};

/**
 * Static method to get all active currencies
 * @returns Array of active currency documents
 */
currencySchema.statics.getActiveCurrencies = function () {
  return this.find({ isActive: true }).sort({ code: 1 });
};

/**
 * Static method to get currency by code
 * @param code - Currency code
 * @returns Currency document
 */
currencySchema.statics.getByCurrencyCode = function (code: string) {
  return this.findOne({ code: code.toUpperCase(), isActive: true });
};

/**
 * Static method to update exchange rate
 * @param code - Currency code
 * @param rate - New exchange rate
 * @returns Updated currency document
 */
currencySchema.statics.updateExchangeRate = async function (code: string, rate: number) {
  return this.findOneAndUpdate(
    { code: code.toUpperCase() },
    {
      $set: {
        exchangeRate: rate,
        lastUpdated: new Date()
      }
    },
    { new: true }
  );
};

/**
 * Static method to set base currency
 * @param code - Currency code to set as base
 * @returns Updated currency document
 */
currencySchema.statics.setBaseCurrency = async function (code: string) {
  // First, unset all base currencies
  await this.updateMany({}, { $set: { isBaseCurrency: false } });

  // Then set the new base currency
  return this.findOneAndUpdate(
    { code: code.toUpperCase() },
    {
      $set: {
        isBaseCurrency: true,
        exchangeRate: 1.0,
        lastUpdated: new Date()
      }
    },
    { new: true }
  );
};

const Currency = mongoose.model<ICurrency>('Currency', currencySchema);

export default Currency;

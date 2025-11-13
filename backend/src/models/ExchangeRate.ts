import mongoose, { Schema } from 'mongoose';
import { IExchangeRate } from '../types/models';

/**
 * Exchange Rate Schema
 * Historical tracking of exchange rates
 */
const exchangeRateSchema = new Schema<IExchangeRate>(
  {
    /**
     * From currency code (ISO 4217)
     */
    fromCurrency: {
      type: String,
      required: [true, 'From currency is required'],
      uppercase: true,
      trim: true,
      minlength: [3, 'Currency code must be 3 characters'],
      maxlength: [3, 'Currency code must be 3 characters'],
    },

    /**
     * To currency code (ISO 4217)
     */
    toCurrency: {
      type: String,
      required: [true, 'To currency is required'],
      uppercase: true,
      trim: true,
      minlength: [3, 'Currency code must be 3 characters'],
      maxlength: [3, 'Currency code must be 3 characters'],
    },

    /**
     * Exchange rate
     */
    rate: {
      type: Number,
      required: [true, 'Exchange rate is required'],
      min: [0, 'Exchange rate must be positive'],
    },

    /**
     * Date for this exchange rate
     */
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },

    /**
     * Source of the exchange rate (API name, manual, etc.)
     */
    source: {
      type: String,
      trim: true,
      maxlength: [100, 'Source cannot exceed 100 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
exchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1, date: -1 });
exchangeRateSchema.index({ date: -1 });

/**
 * Static method to get latest rate between two currencies
 * @param fromCurrency - From currency code
 * @param toCurrency - To currency code
 * @returns Latest exchange rate document
 */
exchangeRateSchema.statics.getLatestRate = function (fromCurrency: string, toCurrency: string) {
  return this.findOne({
    fromCurrency: fromCurrency.toUpperCase(),
    toCurrency: toCurrency.toUpperCase(),
  })
    .sort({ date: -1 })
    .limit(1);
};

/**
 * Static method to get historical rate for a specific date
 * @param fromCurrency - From currency code
 * @param toCurrency - To currency code
 * @param date - Date to get rate for
 * @returns Exchange rate document for the date (or closest before)
 */
exchangeRateSchema.statics.getHistoricalRate = function (
  fromCurrency: string,
  toCurrency: string,
  date: Date
) {
  return this.findOne({
    fromCurrency: fromCurrency.toUpperCase(),
    toCurrency: toCurrency.toUpperCase(),
    date: { $lte: date },
  })
    .sort({ date: -1 })
    .limit(1);
};

/**
 * Static method to save exchange rate
 * @param fromCurrency - From currency code
 * @param toCurrency - To currency code
 * @param rate - Exchange rate
 * @param source - Source of the rate
 * @returns Created exchange rate document
 */
exchangeRateSchema.statics.saveRate = function (
  fromCurrency: string,
  toCurrency: string,
  rate: number,
  source?: string
) {
  return this.create({
    fromCurrency: fromCurrency.toUpperCase(),
    toCurrency: toCurrency.toUpperCase(),
    rate,
    date: new Date(),
    source,
  });
};

/**
 * Static method to get rate history between two currencies
 * @param fromCurrency - From currency code
 * @param toCurrency - To currency code
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Array of exchange rate documents
 */
exchangeRateSchema.statics.getRateHistory = function (
  fromCurrency: string,
  toCurrency: string,
  startDate: Date,
  endDate: Date
) {
  return this.find({
    fromCurrency: fromCurrency.toUpperCase(),
    toCurrency: toCurrency.toUpperCase(),
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: 1 });
};

/**
 * Static method to clean up old historical data
 * Keep only one rate per day per currency pair for dates older than retentionDays
 * @param retentionDays - Number of days to keep detailed history (default 90)
 */
exchangeRateSchema.statics.cleanupOldRates = async function (retentionDays: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  // Get all unique currency pairs with old data
  const pairs = await this.distinct('fromCurrency', { date: { $lt: cutoffDate } });

  for (const fromCurrency of pairs) {
    const toCurrencies = await this.distinct('toCurrency', {
      fromCurrency,
      date: { $lt: cutoffDate },
    });

    for (const toCurrency of toCurrencies) {
      // Keep only the latest rate per day
      const oldRates = await this.find({
        fromCurrency,
        toCurrency,
        date: { $lt: cutoffDate },
      }).sort({ date: 1 });

      // Group by day and keep only one per day
      const ratesByDay = new Map();

      for (const rate of oldRates) {
        const dayKey = rate.date.toISOString().split('T')[0];
        if (!ratesByDay.has(dayKey)) {
          ratesByDay.set(dayKey, rate);
        } else {
          // Delete the older rate
          await this.findByIdAndDelete(rate._id);
        }
      }
    }
  }
};

const ExchangeRate = mongoose.model<IExchangeRate>('ExchangeRate', exchangeRateSchema);

export default ExchangeRate;

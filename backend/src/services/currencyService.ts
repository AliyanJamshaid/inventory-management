import axios from 'axios';
import Currency from '../models/Currency';
import ExchangeRate from '../models/ExchangeRate';

/**
 * Currency Service
 * Handles currency operations, exchange rate updates, and conversions
 */
class CurrencyService {
  // Exchange rate API URL (using exchangerate-api.com free tier)
  private readonly API_URL = 'https://api.exchangerate-api.com/v4/latest';
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Fetch latest exchange rates from external API
   * @param baseCurrencyCode - Base currency code (defaults to USD)
   * @returns Exchange rates object
   */
  async fetchRatesFromAPI(baseCurrencyCode: string = 'USD'): Promise<any> {
    try {
      const response = await axios.get(`${this.API_URL}/${baseCurrencyCode.toUpperCase()}`, {
        timeout: 10000, // 10 second timeout
      });

      if (response.data && response.data.rates) {
        return response.data.rates;
      }

      throw new Error('Invalid response from exchange rate API');
    } catch (error: any) {
      console.error('Error fetching exchange rates from API:', error.message);
      throw new Error(`Failed to fetch exchange rates: ${error.message}`);
    }
  }

  /**
   * Update exchange rates for all active currencies
   * Fetches from API and updates database
   * @returns Update results
   */
  async updateExchangeRates(): Promise<{
    success: boolean;
    updated: number;
    failed: string[];
    baseCurrency: string;
  }> {
    try {
      // Get base currency
      const baseCurrency = await Currency.getBaseCurrency();
      if (!baseCurrency) {
        throw new Error('No base currency set');
      }

      // Fetch latest rates from API
      const rates = await this.fetchRatesFromAPI(baseCurrency.code);

      const updated: string[] = [];
      const failed: string[] = [];

      // Get all active currencies
      const currencies = await Currency.getActiveCurrencies();

      // Update each currency's exchange rate
      for (const currency of currencies) {
        if (currency.code === baseCurrency.code) {
          // Base currency always has rate of 1.0
          continue;
        }

        const rate = rates[currency.code];

        if (rate && typeof rate === 'number') {
          try {
            // Update currency exchange rate
            await Currency.updateExchangeRate(currency.code, rate);

            // Save historical rate
            await ExchangeRate.saveRate(
              baseCurrency.code,
              currency.code,
              rate,
              'exchangerate-api.com'
            );

            updated.push(currency.code);
          } catch (error: any) {
            console.error(`Error updating rate for ${currency.code}:`, error.message);
            failed.push(currency.code);
          }
        } else {
          console.warn(`No rate found for ${currency.code}`);
          failed.push(currency.code);
        }
      }

      return {
        success: failed.length === 0,
        updated: updated.length,
        failed,
        baseCurrency: baseCurrency.code,
      };
    } catch (error: any) {
      console.error('Error updating exchange rates:', error.message);
      throw error;
    }
  }

  /**
   * Convert amount between two currencies
   * Uses current exchange rates
   * @param amount - Amount to convert
   * @param fromCurrency - From currency code
   * @param toCurrency - To currency code
   * @returns Converted amount
   */
  async convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const fromCurr = await Currency.getByCurrencyCode(fromCurrency);
    const toCurr = await Currency.getByCurrencyCode(toCurrency);

    if (!fromCurr) {
      throw new Error(`Currency not found: ${fromCurrency}`);
    }

    if (!toCurr) {
      throw new Error(`Currency not found: ${toCurrency}`);
    }

    // Convert to base currency first, then to target currency
    // fromCurrency → baseCurrency → toCurrency
    const amountInBase = amount / fromCurr.exchangeRate;
    const convertedAmount = amountInBase * toCurr.exchangeRate;

    // Round to appropriate decimal places
    return Number(convertedAmount.toFixed(toCurr.decimalPlaces));
  }

  /**
   * Convert amount between currencies using historical rate
   * @param amount - Amount to convert
   * @param fromCurrency - From currency code
   * @param toCurrency - To currency code
   * @param date - Date for historical rate
   * @returns Converted amount
   */
  async convertAmountHistorical(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    date: Date
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // Get base currency
    const baseCurrency = await Currency.getBaseCurrency();
    if (!baseCurrency) {
      throw new Error('No base currency set');
    }

    // Get historical rates
    const fromRate = await this.getHistoricalRate(
      baseCurrency.code,
      fromCurrency,
      date
    );
    const toRate = await this.getHistoricalRate(
      baseCurrency.code,
      toCurrency,
      date
    );

    // Convert: amount → base → target
    const amountInBase = amount / fromRate;
    const convertedAmount = amountInBase * toRate;

    // Get target currency for decimal places
    const toCurr = await Currency.getByCurrencyCode(toCurrency);
    const decimalPlaces = toCurr?.decimalPlaces || 2;

    return Number(convertedAmount.toFixed(decimalPlaces));
  }

  /**
   * Get exchange rate for a specific date
   * @param fromCurrency - From currency code
   * @param toCurrency - To currency code
   * @param date - Date to get rate for
   * @returns Exchange rate
   */
  async getHistoricalRate(
    fromCurrency: string,
    toCurrency: string,
    date: Date
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return 1.0;
    }

    const historicalRate = await ExchangeRate.getHistoricalRate(
      fromCurrency,
      toCurrency,
      date
    );

    if (historicalRate) {
      return historicalRate.rate;
    }

    // Fallback to current rate if no historical rate found
    console.warn(
      `No historical rate found for ${fromCurrency}/${toCurrency} on ${date}. Using current rate.`
    );
    return await this.getCurrentRate(fromCurrency, toCurrency);
  }

  /**
   * Get current exchange rate between two currencies
   * @param fromCurrency - From currency code
   * @param toCurrency - To currency code
   * @returns Exchange rate
   */
  async getCurrentRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return 1.0;
    }

    const fromCurr = await Currency.getByCurrencyCode(fromCurrency);
    const toCurr = await Currency.getByCurrencyCode(toCurrency);

    if (!fromCurr) {
      throw new Error(`Currency not found: ${fromCurrency}`);
    }

    if (!toCurr) {
      throw new Error(`Currency not found: ${toCurrency}`);
    }

    // Calculate rate: (1 / fromRate) * toRate
    const rate = (1 / fromCurr.exchangeRate) * toCurr.exchangeRate;

    return rate;
  }

  /**
   * Get all active currencies
   * @returns Array of active currencies
   */
  async getActiveCurrencies() {
    return await Currency.getActiveCurrencies();
  }

  /**
   * Set a currency as the base currency
   * @param currencyCode - Currency code to set as base
   * @returns Updated currency
   */
  async setBaseCurrency(currencyCode: string) {
    const currency = await Currency.setBaseCurrency(currencyCode);
    if (!currency) {
      throw new Error(`Currency not found: ${currencyCode}`);
    }

    // After setting a new base currency, update all other rates
    // This will recalculate all rates relative to the new base
    await this.updateExchangeRates();

    return currency;
  }

  /**
   * Create a new currency
   * @param currencyData - Currency data
   * @returns Created currency
   */
  async createCurrency(currencyData: {
    code: string;
    name: string;
    symbol: string;
    decimalPlaces?: number;
    exchangeRate?: number;
    isBaseCurrency?: boolean;
  }) {
    const currency = await Currency.create(currencyData);
    return currency;
  }

  /**
   * Update currency details
   * @param code - Currency code
   * @param updateData - Data to update
   * @returns Updated currency
   */
  async updateCurrency(
    code: string,
    updateData: {
      name?: string;
      symbol?: string;
      decimalPlaces?: number;
      exchangeRate?: number;
      isActive?: boolean;
    }
  ) {
    const currency = await Currency.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $set: updateData },
      { new: true }
    );

    if (!currency) {
      throw new Error(`Currency not found: ${code}`);
    }

    return currency;
  }

  /**
   * Deactivate a currency
   * @param code - Currency code
   * @returns Updated currency
   */
  async deactivateCurrency(code: string) {
    const baseCurrency = await Currency.getBaseCurrency();

    if (baseCurrency && baseCurrency.code === code.toUpperCase()) {
      throw new Error('Cannot deactivate base currency');
    }

    return await this.updateCurrency(code, { isActive: false });
  }

  /**
   * Get currency by code
   * @param code - Currency code
   * @returns Currency document
   */
  async getCurrencyByCode(code: string) {
    return await Currency.getByCurrencyCode(code);
  }

  /**
   * Check if exchange rates need updating
   * Returns true if last update was more than CACHE_TTL ago
   * @returns Boolean indicating if update is needed
   */
  async needsUpdate(): Promise<boolean> {
    const baseCurrency = await Currency.getBaseCurrency();
    if (!baseCurrency) {
      return true;
    }

    const timeSinceUpdate = Date.now() - baseCurrency.lastUpdated.getTime();
    return timeSinceUpdate > this.CACHE_TTL;
  }

  /**
   * Format amount in specific currency
   * @param amount - Amount to format
   * @param currencyCode - Currency code
   * @returns Formatted string
   */
  async formatAmount(amount: number, currencyCode: string): Promise<string> {
    const currency = await Currency.getByCurrencyCode(currencyCode);

    if (!currency) {
      return amount.toFixed(2);
    }

    return currency.formatAmount(amount);
  }
}

export default new CurrencyService();

import Currency from '../models/Currency';
import currencyService from '../services/currencyService';

/**
 * Currency Seeder
 * Seeds common currencies with initial exchange rates
 */

const commonCurrencies = [
  {
    code: 'USD',
    name: 'United States Dollar',
    symbol: '$',
    decimalPlaces: 2,
    exchangeRate: 1.0,
    isBaseCurrency: true,
    isActive: true,
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    decimalPlaces: 2,
    exchangeRate: 0.92, // Initial rate (will be updated)
    isBaseCurrency: false,
    isActive: true,
  },
  {
    code: 'GBP',
    name: 'British Pound Sterling',
    symbol: '£',
    decimalPlaces: 2,
    exchangeRate: 0.79,
    isBaseCurrency: false,
    isActive: true,
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    decimalPlaces: 0,
    exchangeRate: 149.5,
    isBaseCurrency: false,
    isActive: true,
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    decimalPlaces: 2,
    exchangeRate: 1.52,
    isBaseCurrency: false,
    isActive: true,
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    decimalPlaces: 2,
    exchangeRate: 1.36,
    isBaseCurrency: false,
    isActive: true,
  },
  {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    decimalPlaces: 2,
    exchangeRate: 0.88,
    isBaseCurrency: false,
    isActive: true,
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    decimalPlaces: 2,
    exchangeRate: 7.24,
    isBaseCurrency: false,
    isActive: true,
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    decimalPlaces: 2,
    exchangeRate: 83.2,
    isBaseCurrency: false,
    isActive: true,
  },
  {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'د.إ',
    decimalPlaces: 2,
    exchangeRate: 3.67,
    isBaseCurrency: false,
    isActive: true,
  },
  {
    code: 'MXN',
    name: 'Mexican Peso',
    symbol: 'MX$',
    decimalPlaces: 2,
    exchangeRate: 17.1,
    isBaseCurrency: false,
    isActive: true,
  },
  {
    code: 'BRL',
    name: 'Brazilian Real',
    symbol: 'R$',
    decimalPlaces: 2,
    exchangeRate: 4.98,
    isBaseCurrency: false,
    isActive: true,
  },
  {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    decimalPlaces: 2,
    exchangeRate: 18.65,
    isBaseCurrency: false,
    isActive: true,
  },
  {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    decimalPlaces: 2,
    exchangeRate: 1.34,
    isBaseCurrency: false,
    isActive: true,
  },
  {
    code: 'HKD',
    name: 'Hong Kong Dollar',
    symbol: 'HK$',
    decimalPlaces: 2,
    exchangeRate: 7.83,
    isBaseCurrency: false,
    isActive: true,
  },
];

/**
 * Seed currencies
 */
export const seedCurrencies = async () => {
  try {
    console.log('Starting currency seeding...');

    // Check if currencies already exist
    const existingCount = await Currency.countDocuments();

    if (existingCount > 0) {
      console.log(`${existingCount} currencies already exist. Skipping seeding.`);
      return;
    }

    // Insert all currencies
    const created = await Currency.insertMany(commonCurrencies);

    console.log(`✓ Successfully seeded ${created.length} currencies`);

    // Try to fetch latest rates from API
    try {
      console.log('Fetching latest exchange rates from API...');
      const result = await currencyService.updateExchangeRates();
      console.log(`✓ Updated ${result.updated} exchange rates from API`);

      if (result.failed.length > 0) {
        console.warn(`⚠ Failed to update rates for: ${result.failed.join(', ')}`);
      }
    } catch (error: any) {
      console.warn('⚠ Could not fetch latest rates from API, using default rates');
      console.warn('Error:', error.message);
    }

    console.log('Currency seeding completed!');
  } catch (error: any) {
    console.error('Error seeding currencies:', error);
    throw error;
  }
};

/**
 * Clear all currencies (use with caution)
 */
export const clearCurrencies = async () => {
  try {
    await Currency.deleteMany({});
    console.log('✓ All currencies cleared');
  } catch (error: any) {
    console.error('Error clearing currencies:', error);
    throw error;
  }
};

export default seedCurrencies;

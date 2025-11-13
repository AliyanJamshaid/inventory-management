import { Currency } from '@/types/currency';

/**
 * Currency Utility Functions
 * Helper functions for currency formatting and manipulation
 */

/**
 * Format currency amount with symbol and proper decimal places
 * @param amount - Amount to format
 * @param currency - Currency object
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: Currency | string): string {
  if (typeof currency === 'string') {
    // If just a code is provided, use basic formatting
    return `${currency} ${amount.toFixed(2)}`;
  }

  const formatted = amount.toFixed(currency.decimalPlaces);
  const withSeparators = formatNumber(parseFloat(formatted), currency.decimalPlaces);

  return `${currency.symbol}${withSeparators}`;
}

/**
 * Format currency amount without symbol
 * @param amount - Amount to format
 * @param decimalPlaces - Number of decimal places
 * @returns Formatted number string
 */
export function formatCurrencyAmount(amount: number, decimalPlaces: number = 2): string {
  return formatNumber(amount, decimalPlaces);
}

/**
 * Get currency symbol by code
 * @param currencyCode - Currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    AED: 'د.إ',
    MXN: 'MX$',
    BRL: 'R$',
    ZAR: 'R',
    SGD: 'S$',
    HKD: 'HK$',
  };

  return symbols[currencyCode] || currencyCode;
}

/**
 * Parse currency string to number
 * Removes currency symbols and thousand separators
 * @param value - Currency string
 * @returns Parsed number
 */
export function parseCurrencyAmount(value: string): number {
  if (!value) return 0;

  // Remove currency symbols, spaces, and thousand separators
  const cleaned = value
    .replace(/[^0-9.-]/g, '') // Keep only numbers, decimal point, and minus
    .replace(/,/g, ''); // Remove commas

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format number with thousand separators and decimal places
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (isNaN(value)) return '0.00';

  const parts = value.toFixed(decimals).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimalPart = parts[1];

  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
}

/**
 * Get decimal places for a currency code
 * @param currencyCode - Currency code
 * @returns Number of decimal places
 */
export function getDecimalPlaces(currencyCode: string): number {
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP', 'ISK'];
  const threeDecimalCurrencies = ['BHD', 'JOD', 'KWD', 'OMR', 'TND'];

  if (zeroDecimalCurrencies.includes(currencyCode)) {
    return 0;
  } else if (threeDecimalCurrencies.includes(currencyCode)) {
    return 3;
  } else {
    return 2;
  }
}

/**
 * Convert amount between currencies using exchange rates
 * @param amount - Amount to convert
 * @param fromRate - From currency exchange rate
 * @param toRate - To currency exchange rate
 * @param decimalPlaces - Decimal places for result
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  fromRate: number,
  toRate: number,
  decimalPlaces: number = 2
): number {
  // Convert to base currency first, then to target currency
  const amountInBase = amount / fromRate;
  const convertedAmount = amountInBase * toRate;

  return Number(convertedAmount.toFixed(decimalPlaces));
}

/**
 * Format currency with optional conversion display
 * @param amount - Amount in source currency
 * @param sourceCurrency - Source currency
 * @param targetCurrency - Target currency (optional)
 * @param showBoth - Show both currencies
 * @returns Formatted string
 */
export function formatCurrencyWithConversion(
  amount: number,
  sourceCurrency: Currency,
  targetCurrency?: Currency,
  showBoth: boolean = false
): string {
  const sourceFormatted = formatCurrency(amount, sourceCurrency);

  if (!targetCurrency || sourceCurrency.code === targetCurrency.code) {
    return sourceFormatted;
  }

  const convertedAmount = convertCurrency(
    amount,
    sourceCurrency.exchangeRate,
    targetCurrency.exchangeRate,
    targetCurrency.decimalPlaces
  );

  const targetFormatted = formatCurrency(convertedAmount, targetCurrency);

  if (showBoth) {
    return `${sourceFormatted} (${targetFormatted})`;
  } else {
    return targetFormatted;
  }
}

/**
 * Validate currency code (ISO 4217)
 * @param code - Currency code
 * @returns Boolean indicating if valid
 */
export function isValidCurrencyCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}

/**
 * Get country flag emoji from currency code
 * @param currencyCode - Currency code
 * @returns Flag emoji or empty string
 */
export function getCurrencyFlag(currencyCode: string): string {
  const flagMap: Record<string, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    AUD: '🇦🇺',
    CAD: '🇨🇦',
    CHF: '🇨🇭',
    CNY: '🇨🇳',
    INR: '🇮🇳',
    AED: '🇦🇪',
    MXN: '🇲🇽',
    BRL: '🇧🇷',
    ZAR: '🇿🇦',
    SGD: '🇸🇬',
    HKD: '🇭🇰',
  };

  return flagMap[currencyCode] || '';
}

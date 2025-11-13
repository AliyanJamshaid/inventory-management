/**
 * Currency Types
 * Type definitions for currency-related data
 */

export interface Currency {
  _id: string;
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  exchangeRate: number;
  isBaseCurrency: boolean;
  isActive: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrencyConversion {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  convertedAmount: number;
  rate: number;
}

export interface ExchangeRateHistory {
  _id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: Date;
  source?: string;
  createdAt: Date;
}

export interface UpdateRatesResult {
  success: boolean;
  updated: number;
  failed: string[];
  baseCurrency: string;
}

export interface CurrencyFormData {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces?: number;
  exchangeRate?: number;
  isBaseCurrency?: boolean;
  isActive?: boolean;
}

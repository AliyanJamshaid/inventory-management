import { Request, Response } from 'express';
import Currency from '../models/Currency';
import currencyService from '../services/currencyService';

/**
 * Currency Controller
 * Handles HTTP requests for currency operations
 */
class CurrencyController {
  /**
   * Get all currencies
   * @route GET /api/v1/currencies
   */
  async getAllCurrencies(req: Request, res: Response) {
    try {
      const { active } = req.query;

      let currencies;
      if (active === 'true') {
        currencies = await currencyService.getActiveCurrencies();
      } else {
        currencies = await Currency.find().sort({ code: 1 });
      }

      res.status(200).json({
        success: true,
        count: currencies.length,
        data: currencies,
      });
    } catch (error: any) {
      console.error('Error fetching currencies:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch currencies',
        error: error.message,
      });
    }
  }

  /**
   * Get active currencies only
   * @route GET /api/v1/currencies/active
   */
  async getActiveCurrencies(req: Request, res: Response) {
    try {
      const currencies = await currencyService.getActiveCurrencies();

      res.status(200).json({
        success: true,
        count: currencies.length,
        data: currencies,
      });
    } catch (error: any) {
      console.error('Error fetching active currencies:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active currencies',
        error: error.message,
      });
    }
  }

  /**
   * Get base currency
   * @route GET /api/v1/currencies/base
   */
  async getBaseCurrency(req: Request, res: Response) {
    try {
      const baseCurrency = await Currency.getBaseCurrency();

      if (!baseCurrency) {
        return res.status(404).json({
          success: false,
          message: 'No base currency set',
        });
      }

      res.status(200).json({
        success: true,
        data: baseCurrency,
      });
    } catch (error: any) {
      console.error('Error fetching base currency:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch base currency',
        error: error.message,
      });
    }
  }

  /**
   * Get currency by code
   * @route GET /api/v1/currencies/:code
   */
  async getCurrencyByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;

      const currency = await currencyService.getCurrencyByCode(code);

      if (!currency) {
        return res.status(404).json({
          success: false,
          message: `Currency not found: ${code}`,
        });
      }

      res.status(200).json({
        success: true,
        data: currency,
      });
    } catch (error: any) {
      console.error(`Error fetching currency ${req.params.code}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch currency',
        error: error.message,
      });
    }
  }

  /**
   * Create a new currency
   * @route POST /api/v1/currencies
   */
  async createCurrency(req: Request, res: Response) {
    try {
      const { code, name, symbol, decimalPlaces, exchangeRate, isBaseCurrency } = req.body;

      // Validate required fields
      if (!code || !name || !symbol) {
        return res.status(400).json({
          success: false,
          message: 'Code, name, and symbol are required',
        });
      }

      const currency = await currencyService.createCurrency({
        code,
        name,
        symbol,
        decimalPlaces,
        exchangeRate,
        isBaseCurrency,
      });

      res.status(201).json({
        success: true,
        message: 'Currency created successfully',
        data: currency,
      });
    } catch (error: any) {
      console.error('Error creating currency:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create currency',
        error: error.message,
      });
    }
  }

  /**
   * Update currency
   * @route PUT /api/v1/currencies/:code
   */
  async updateCurrency(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const updateData = req.body;

      const currency = await currencyService.updateCurrency(code, updateData);

      res.status(200).json({
        success: true,
        message: 'Currency updated successfully',
        data: currency,
      });
    } catch (error: any) {
      console.error(`Error updating currency ${req.params.code}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to update currency',
        error: error.message,
      });
    }
  }

  /**
   * Deactivate currency
   * @route DELETE /api/v1/currencies/:code
   */
  async deactivateCurrency(req: Request, res: Response) {
    try {
      const { code } = req.params;

      const currency = await currencyService.deactivateCurrency(code);

      res.status(200).json({
        success: true,
        message: 'Currency deactivated successfully',
        data: currency,
      });
    } catch (error: any) {
      console.error(`Error deactivating currency ${req.params.code}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate currency',
        error: error.message,
      });
    }
  }

  /**
   * Set currency as base currency
   * @route POST /api/v1/currencies/:code/set-base
   */
  async setBaseCurrency(req: Request, res: Response) {
    try {
      const { code } = req.params;

      const currency = await currencyService.setBaseCurrency(code);

      res.status(200).json({
        success: true,
        message: `${code} set as base currency successfully`,
        data: currency,
      });
    } catch (error: any) {
      console.error(`Error setting base currency ${req.params.code}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to set base currency',
        error: error.message,
      });
    }
  }

  /**
   * Update exchange rates from API
   * @route POST /api/v1/currencies/update-rates
   */
  async updateExchangeRates(req: Request, res: Response) {
    try {
      const result = await currencyService.updateExchangeRates();

      res.status(200).json({
        success: true,
        message: 'Exchange rates updated successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('Error updating exchange rates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update exchange rates',
        error: error.message,
      });
    }
  }

  /**
   * Convert amount between currencies
   * @route POST /api/v1/currencies/convert
   */
  async convertAmount(req: Request, res: Response) {
    try {
      const { amount, fromCurrency, toCurrency } = req.body;

      if (!amount || !fromCurrency || !toCurrency) {
        return res.status(400).json({
          success: false,
          message: 'Amount, fromCurrency, and toCurrency are required',
        });
      }

      const convertedAmount = await currencyService.convertAmount(
        parseFloat(amount),
        fromCurrency,
        toCurrency
      );

      const rate = await currencyService.getCurrentRate(fromCurrency, toCurrency);

      res.status(200).json({
        success: true,
        data: {
          amount: parseFloat(amount),
          fromCurrency,
          toCurrency,
          convertedAmount,
          rate,
        },
      });
    } catch (error: any) {
      console.error('Error converting amount:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to convert amount',
        error: error.message,
      });
    }
  }

  /**
   * Get exchange rate history
   * @route GET /api/v1/currencies/history/:fromCurrency/:toCurrency
   */
  async getExchangeRateHistory(req: Request, res: Response) {
    try {
      const { fromCurrency, toCurrency } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
      }

      const ExchangeRate = (await import('../models/ExchangeRate')).default;

      const history = await ExchangeRate.getRateHistory(
        fromCurrency,
        toCurrency,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.status(200).json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (error: any) {
      console.error('Error fetching exchange rate history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch exchange rate history',
        error: error.message,
      });
    }
  }
}

export default new CurrencyController();

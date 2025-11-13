import express from 'express';
import currencyController from '../controllers/currencyController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

/**
 * Currency Routes
 * All routes require authentication
 * Admin-only routes are marked
 */

// Public routes (authenticated users)
router.get('/', authenticate, currencyController.getAllCurrencies);
router.get('/active', authenticate, currencyController.getActiveCurrencies);
router.get('/base', authenticate, currencyController.getBaseCurrency);
router.get('/history/:fromCurrency/:toCurrency', authenticate, currencyController.getExchangeRateHistory);
router.get('/:code', authenticate, currencyController.getCurrencyByCode);

// Conversion
router.post('/convert', authenticate, currencyController.convertAmount);

// Admin-only routes
router.post('/', authenticate, authorize('ADMIN'), currencyController.createCurrency);
router.put('/:code', authenticate, authorize('ADMIN'), currencyController.updateCurrency);
router.delete('/:code', authenticate, authorize('ADMIN'), currencyController.deactivateCurrency);
router.post('/:code/set-base', authenticate, authorize('ADMIN'), currencyController.setBaseCurrency);
router.post('/update-rates', authenticate, authorize('ADMIN'), currencyController.updateExchangeRates);

export default router;

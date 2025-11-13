import cron from 'node-cron';
import currencyService from '../services/currencyService';

/**
 * Currency Rate Updater Job
 * Scheduled task to update exchange rates automatically
 */

/**
 * Update exchange rates
 * Runs daily at midnight (00:00)
 */
export const scheduleRateUpdates = () => {
  // Schedule: Every day at midnight (00:00)
  // Cron format: minute hour day month dayOfWeek
  const schedule = '0 0 * * *'; // Daily at midnight

  cron.schedule(schedule, async () => {
    try {
      console.log('Starting scheduled exchange rate update...');
      const startTime = Date.now();

      const result = await currencyService.updateExchangeRates();

      const duration = Date.now() - startTime;

      console.log('='.repeat(60));
      console.log('Exchange Rate Update Complete');
      console.log('='.repeat(60));
      console.log(`Base Currency: ${result.baseCurrency}`);
      console.log(`Successfully Updated: ${result.updated} currencies`);
      console.log(`Failed: ${result.failed.length} currencies`);

      if (result.failed.length > 0) {
        console.log(`Failed Currencies: ${result.failed.join(', ')}`);
      }

      console.log(`Duration: ${duration}ms`);
      console.log('='.repeat(60));
    } catch (error: any) {
      console.error('Error in scheduled currency rate update:', error.message);
      console.error('Stack:', error.stack);
    }
  });

  console.log('✓ Currency rate updater job scheduled (Daily at midnight)');
};

/**
 * Update rates immediately (for manual trigger)
 */
export const updateRatesNow = async () => {
  try {
    console.log('Manually triggering exchange rate update...');
    const result = await currencyService.updateExchangeRates();

    console.log('Exchange rate update completed:');
    console.log(`- Updated: ${result.updated} currencies`);
    console.log(`- Failed: ${result.failed.length} currencies`);

    return result;
  } catch (error: any) {
    console.error('Error manually updating exchange rates:', error);
    throw error;
  }
};

/**
 * Check if rates need updating and update if necessary
 */
export const updateRatesIfNeeded = async () => {
  try {
    const needsUpdate = await currencyService.needsUpdate();

    if (needsUpdate) {
      console.log('Exchange rates are stale. Updating...');
      return await updateRatesNow();
    } else {
      console.log('Exchange rates are up to date.');
      return null;
    }
  } catch (error: any) {
    console.error('Error checking/updating exchange rates:', error);
    throw error;
  }
};

export default {
  scheduleRateUpdates,
  updateRatesNow,
  updateRatesIfNeeded,
};

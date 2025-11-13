/**
 * Settings Seeder
 * Creates default system settings
 */

import Settings from '../models_temp/Settings';
import logger from '../utils/logger';

/**
 * Seed system settings into the database
 */
export const seedSettings = async (): Promise<void> => {
  try {
    // Check if settings already exist
    const existingCount = await Settings.countDocuments();
    if (existingCount > 0) {
      logger.info(`Settings already exist (${existingCount} found). Skipping settings seeding.`);
      return;
    }

    const settings = {
      // Company Information
      companyName: 'InventoryPro Inc.',
      companyAddress: '1234 Business Avenue, Suite 100',
      companyCity: 'San Francisco',
      companyState: 'CA',
      companyCountry: 'USA',
      companyZipCode: '94102',
      companyPhone: '+1-800-555-INVENTORY',
      companyEmail: 'contact@inventorypro.com',
      companyWebsite: 'www.inventorypro.com',
      companyTaxId: 'TAX-123456789',
      companyLogo: 'https://via.placeholder.com/200x80?text=InventoryPro',

      // Regional Settings
      currency: 'USD',
      currencySymbol: '$',
      currencyPosition: 'before', // before or after amount
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h', // 12h or 24h
      timezone: 'America/Los_Angeles',
      language: 'en',

      // Tax Settings
      defaultTaxRate: 8.5,
      enableTax: true,
      taxLabel: 'Sales Tax',
      taxNumber: 'TAX-987654321',

      // Inventory Settings
      enableStockTracking: true,
      enableBatchTracking: true,
      enableSerialTracking: false,
      enableExpirationTracking: true,
      lowStockThreshold: 10,
      enableLowStockAlerts: true,
      enableExpirationAlerts: true,
      expirationAlertDays: 30, // Alert when items expire within 30 days
      enableNegativeStock: false, // Prevent negative stock

      // Order Settings
      orderPrefix: 'ORD',
      invoicePrefix: 'INV',
      purchaseOrderPrefix: 'PO',
      salesOrderPrefix: 'SO',
      enableOrderApproval: true,
      autoGenerateInvoice: true,
      defaultPaymentTerms: 'Net 30',

      // Notification Settings
      enableEmailNotifications: true,
      enablePushNotifications: true,
      notifyLowStock: true,
      notifyExpiringSoon: true,
      notifyOrderStatus: true,
      notifyPaymentReceived: true,

      // Email Settings
      emailFromName: 'InventoryPro System',
      emailFromAddress: 'noreply@inventorypro.com',
      emailReplyTo: 'support@inventorypro.com',

      // Security Settings
      sessionTimeout: 60, // minutes
      enableTwoFactor: false,
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSpecialChars: true,
      maxLoginAttempts: 5,
      lockoutDuration: 30, // minutes

      // Display Settings
      itemsPerPage: 20,
      enableDarkMode: false,
      defaultView: 'grid', // grid or list

      // Barcode Settings
      barcodeFormat: 'CODE128',
      enableBarcodeGeneration: true,

      // Backup Settings
      enableAutoBackup: true,
      backupFrequency: 'daily', // daily, weekly, monthly
      backupRetentionDays: 30,

      // Integration Settings
      enableAPIAccess: true,
      apiRateLimit: 1000, // requests per hour

      // Additional Settings
      maintenanceMode: false,
      allowRegistration: false, // Only admins can create accounts
      termsAndConditions: 'By using this system, you agree to our terms and conditions.',
      privacyPolicy: 'We respect your privacy and protect your data.',
    };

    const createdSettings = await Settings.create(settings);
    logger.info('✓ Created system settings');
    logger.info(`  - Company: ${settings.companyName}`);
    logger.info(`  - Currency: ${settings.currency}`);
    logger.info(`  - Tax Rate: ${settings.defaultTaxRate}%`);
    logger.info(`  - Low Stock Threshold: ${settings.lowStockThreshold}`);
  } catch (error) {
    logger.error('Error seeding settings:', error);
    throw error;
  }
};

/**
 * Clear all settings from the database
 */
export const clearSettings = async (): Promise<void> => {
  try {
    await Settings.deleteMany({});
    logger.info('✓ Cleared all settings');
  } catch (error) {
    logger.error('Error clearing settings:', error);
    throw error;
  }
};

/**
 * Notification Seeder
 * Creates sample notifications for users
 */

import Notification from '../models_temp/Notification';
import User from '../models_temp/User';
import Product from '../models_temp/Product';
import Stock from '../models_temp/Stock';
import { NotificationType } from '../types/models';
import logger from '../utils/logger';

/**
 * Helper function to get random past date
 */
const getRandomPastDate = (maxDaysAgo: number): Date => {
  const days = Math.floor(Math.random() * maxDaysAgo);
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Seed notifications into the database
 */
export const seedNotifications = async (): Promise<void> => {
  try {
    // Check if notifications already exist
    const existingCount = await Notification.countDocuments();
    if (existingCount > 0) {
      logger.info(`Notifications already exist (${existingCount} found). Skipping notification seeding.`);
      return;
    }

    // Get necessary references
    const users = await User.find({});
    const products = await Product.find({}).limit(20);
    const lowStockItems = await Stock.find({
      $expr: { $lte: ['$quantity', '$reorderPoint'] }
    }).populate('product warehouse').limit(10);

    const expiringItems = await Stock.find({
      expirationDate: { $exists: true }
    }).populate('product warehouse').limit(5);

    if (users.length === 0) {
      throw new Error('Users not found. Please seed users first.');
    }

    const notifications = [];

    // Create low stock notifications
    for (const stock of lowStockItems) {
      for (const user of users.filter(u => ['ADMIN', 'MANAGER'].includes(u.role))) {
        notifications.push({
          user: user._id,
          type: NotificationType.LOW_STOCK,
          title: 'Low Stock Alert',
          message: `${(stock as any).product?.name || 'Product'} is running low in ${(stock as any).warehouse?.name || 'warehouse'}. Current stock: ${stock.quantity}, Reorder point: ${stock.reorderPoint}`,
          isRead: Math.random() > 0.5, // 50% read
          createdAt: getRandomPastDate(7),
        });
      }
    }

    // Create expiring soon notifications
    for (const stock of expiringItems) {
      for (const user of users.filter(u => ['ADMIN', 'MANAGER'].includes(u.role))) {
        const daysToExpiry = stock.expirationDate ?
          Math.ceil((stock.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

        if (daysToExpiry > 0 && daysToExpiry <= 60) {
          notifications.push({
            user: user._id,
            type: NotificationType.EXPIRING_SOON,
            title: 'Items Expiring Soon',
            message: `${(stock as any).product?.name || 'Product'} (Batch: ${stock.batchNumber}) will expire in ${daysToExpiry} days`,
            isRead: Math.random() > 0.6, // 40% read
            createdAt: getRandomPastDate(5),
          });
        }
      }
    }

    // Create order status notifications
    const orderStatuses = [
      { title: 'Order Confirmed', message: 'Sales Order SO-2025-00123 has been confirmed' },
      { title: 'Order Shipped', message: 'Sales Order SO-2025-00115 has been shipped' },
      { title: 'Order Delivered', message: 'Sales Order SO-2025-00098 has been delivered' },
      { title: 'Purchase Order Received', message: 'Purchase Order PO-2025-00045 has been received' },
    ];

    for (const status of orderStatuses) {
      const user = users[Math.floor(Math.random() * users.length)];
      notifications.push({
        user: user._id,
        type: NotificationType.ORDER_STATUS,
        title: status.title,
        message: status.message,
        isRead: Math.random() > 0.3, // 70% read
        createdAt: getRandomPastDate(14),
      });
    }

    // Create payment received notifications
    for (let i = 0; i < 5; i++) {
      const user = users.filter(u => ['ADMIN', 'MANAGER'].includes(u.role))[0];
      if (user) {
        const amount = (Math.random() * 5000 + 500).toFixed(2);
        notifications.push({
          user: user._id,
          type: NotificationType.PAYMENT_RECEIVED,
          title: 'Payment Received',
          message: `Payment of $${amount} received for Invoice INV-2025-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
          isRead: Math.random() > 0.4, // 60% read
          createdAt: getRandomPastDate(20),
        });
      }
    }

    // Create stock adjustment notifications
    for (let i = 0; i < 3; i++) {
      for (const user of users.filter(u => ['ADMIN', 'MANAGER'].includes(u.role))) {
        const product = products[Math.floor(Math.random() * products.length)];
        const adjustment = Math.floor(Math.random() * 50) - 25; // -25 to +25
        notifications.push({
          user: user._id,
          type: NotificationType.STOCK_ADJUSTMENT,
          title: 'Stock Adjustment',
          message: `Stock adjusted for ${product.name}: ${adjustment > 0 ? '+' : ''}${adjustment} units`,
          isRead: Math.random() > 0.5, // 50% read
          createdAt: getRandomPastDate(30),
        });
      }
    }

    // Create system alert notifications
    const systemAlerts = [
      { title: 'System Maintenance', message: 'Scheduled maintenance on Sunday 2:00 AM - 4:00 AM' },
      { title: 'New Feature Available', message: 'Check out the new inventory analytics dashboard!' },
      { title: 'Security Update', message: 'System security patches applied successfully' },
    ];

    for (const alert of systemAlerts) {
      for (const user of users) {
        notifications.push({
          user: user._id,
          type: NotificationType.SYSTEM_ALERT,
          title: alert.title,
          message: alert.message,
          isRead: Math.random() > 0.2, // 80% read
          createdAt: getRandomPastDate(45),
        });
      }
    }

    const createdNotifications = await Notification.insertMany(notifications);

    // Calculate statistics
    const typeCounts = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const readCount = await Notification.countDocuments({ isRead: true });
    const unreadCount = await Notification.countDocuments({ isRead: false });

    logger.info(`✓ Created ${createdNotifications.length} notifications`);
    logger.info(`  - ${readCount} read, ${unreadCount} unread`);
    typeCounts.forEach(stat => {
      logger.info(`  - ${stat.count} ${stat._id}`);
    });
  } catch (error) {
    logger.error('Error seeding notifications:', error);
    throw error;
  }
};

/**
 * Clear all notifications from the database
 */
export const clearNotifications = async (): Promise<void> => {
  try {
    await Notification.deleteMany({});
    logger.info('✓ Cleared all notifications');
  } catch (error) {
    logger.error('Error clearing notifications:', error);
    throw error;
  }
};

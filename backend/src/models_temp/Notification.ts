import mongoose, { Schema } from 'mongoose';
import { INotification, NotificationType } from '../types/models';

/**
 * Notification Schema
 * Manages system notifications for users
 */
const notificationSchema = new Schema<INotification>(
  {
    /**
     * User who will receive the notification
     */
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    /**
     * Type of notification
     */
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: [true, 'Notification type is required'],
    },

    /**
     * Notification title
     */
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    /**
     * Notification message
     */
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },

    /**
     * Whether the notification has been read
     */
    isRead: {
      type: Boolean,
      default: false,
    },

    /**
     * Optional link/URL related to the notification
     */
    link: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

/**
 * Static method to find notifications by user
 * @param userId - User ID
 * @param unreadOnly - Whether to return only unread notifications
 * @returns Array of notification documents
 */
notificationSchema.statics.findByUser = function (
  userId: mongoose.Types.ObjectId,
  unreadOnly: boolean = false
) {
  const query: any = { user: userId };
  if (unreadOnly) {
    query.isRead = false;
  }

  return this.find(query).sort({ createdAt: -1 });
};

/**
 * Static method to find unread notifications count for a user
 * @param userId - User ID
 * @returns Count of unread notifications
 */
notificationSchema.statics.getUnreadCount = function (userId: mongoose.Types.ObjectId) {
  return this.countDocuments({ user: userId, isRead: false });
};

/**
 * Static method to create notification for a user
 * @param userId - User ID
 * @param type - Notification type
 * @param title - Notification title
 * @param message - Notification message
 * @param link - Optional link
 * @returns Created notification document
 */
notificationSchema.statics.createNotification = function (
  userId: mongoose.Types.ObjectId,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  return this.create({
    user: userId,
    type,
    title,
    message,
    link,
  });
};

/**
 * Static method to create low stock notifications
 * @param productName - Product name
 * @param quantity - Current quantity
 * @param warehouse - Warehouse name
 * @param userIds - Array of user IDs to notify
 * @returns Array of created notifications
 */
notificationSchema.statics.createLowStockNotification = async function (
  productName: string,
  quantity: number,
  warehouse: string,
  userIds: mongoose.Types.ObjectId[]
) {
  const notifications = userIds.map((userId) => ({
    user: userId,
    type: NotificationType.LOW_STOCK,
    title: 'Low Stock Alert',
    message: `${productName} is running low in ${warehouse}. Current quantity: ${quantity}`,
    link: `/inventory/stock`,
  }));

  return await this.insertMany(notifications);
};

/**
 * Static method to mark notification as read
 * @param notificationId - Notification ID
 * @returns Updated notification
 */
notificationSchema.statics.markAsRead = function (notificationId: mongoose.Types.ObjectId) {
  return this.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
};

/**
 * Static method to mark all notifications as read for a user
 * @param userId - User ID
 * @returns Update result
 */
notificationSchema.statics.markAllAsRead = function (userId: mongoose.Types.ObjectId) {
  return this.updateMany({ user: userId, isRead: false }, { isRead: true });
};

/**
 * Static method to delete old read notifications
 * @param daysOld - Delete notifications older than this many days
 * @returns Delete result
 */
notificationSchema.statics.deleteOldNotifications = function (daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.deleteMany({
    isRead: true,
    createdAt: { $lt: cutoffDate },
  });
};

/**
 * Instance method to mark as read
 * @returns Updated notification
 */
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  return await this.save();
};

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;

/**
 * Notification Controller
 * Handles user notifications
 */

import { Response } from 'express';
import { IAuthRequest } from '../types';
import { sendSuccess, sendBadRequest } from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import mongoose from 'mongoose';

/**
 * Get user notifications
 * @route GET /api/v1/notifications
 * @access Private
 */
export const getNotifications = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { unreadOnly = false, limit = 50, page = 1 } = req.query;

    if (!userId) {
      sendBadRequest(res, 'User not found');
      return;
    }

    const Notification = mongoose.model('Notification');

    const query: any = { user: new mongoose.Types.ObjectId(userId) };

    if (unreadOnly === 'true' || unreadOnly === true) {
      query.isRead = false;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .lean();

    const total = await Notification.countDocuments(query);

    sendSuccess(
      res,
      {
        notifications,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      },
      'Notifications retrieved successfully'
    );
  }
);

/**
 * Get unread notification count
 * @route GET /api/v1/notifications/unread-count
 * @access Private
 */
export const getUnreadCount = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
      sendBadRequest(res, 'User not found');
      return;
    }

    const Notification = mongoose.model('Notification');

    const count = await Notification.countDocuments({
      user: new mongoose.Types.ObjectId(userId),
      isRead: false,
    });

    sendSuccess(res, { count }, 'Unread count retrieved successfully');
  }
);

/**
 * Mark notification as read
 * @route PUT /api/v1/notifications/:id/read
 * @access Private
 */
export const markAsRead = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      sendBadRequest(res, 'User not found');
      return;
    }

    const Notification = mongoose.model('Notification');

    const notification = await Notification.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        user: new mongoose.Types.ObjectId(userId),
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      sendBadRequest(res, 'Notification not found');
      return;
    }

    sendSuccess(res, notification, 'Notification marked as read');
  }
);

/**
 * Mark all notifications as read
 * @route PUT /api/v1/notifications/mark-all-read
 * @access Private
 */
export const markAllAsRead = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
      sendBadRequest(res, 'User not found');
      return;
    }

    const Notification = mongoose.model('Notification');

    const result = await Notification.updateMany(
      {
        user: new mongoose.Types.ObjectId(userId),
        isRead: false,
      },
      { isRead: true }
    );

    sendSuccess(
      res,
      { modifiedCount: result.modifiedCount },
      'All notifications marked as read'
    );
  }
);

/**
 * Delete notification
 * @route DELETE /api/v1/notifications/:id
 * @access Private
 */
export const deleteNotification = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      sendBadRequest(res, 'User not found');
      return;
    }

    const Notification = mongoose.model('Notification');

    const notification = await Notification.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      user: new mongoose.Types.ObjectId(userId),
    });

    if (!notification) {
      sendBadRequest(res, 'Notification not found');
      return;
    }

    sendSuccess(res, null, 'Notification deleted successfully');
  }
);

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

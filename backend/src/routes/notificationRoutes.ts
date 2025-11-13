/**
 * Notification Routes
 * API routes for user notifications
 */

import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * All notification routes require authentication
 */
router.use(authenticate);

/**
 * @route GET /api/v1/notifications
 * @desc Get user notifications with pagination
 * @access Private
 */
router.get('/', getNotifications);

/**
 * @route GET /api/v1/notifications/unread-count
 * @desc Get count of unread notifications
 * @access Private
 */
router.get('/unread-count', getUnreadCount);

/**
 * @route PUT /api/v1/notifications/mark-all-read
 * @desc Mark all notifications as read
 * @access Private
 */
router.put('/mark-all-read', markAllAsRead);

/**
 * @route PUT /api/v1/notifications/:id/read
 * @desc Mark specific notification as read
 * @access Private
 */
router.put('/:id/read', markAsRead);

/**
 * @route DELETE /api/v1/notifications/:id
 * @desc Delete a notification
 * @access Private
 */
router.delete('/:id', deleteNotification);

export default router;

import mongoose, { Schema } from 'mongoose';
import { IActivityLog } from '../types/models';

/**
 * Activity Log Schema
 * Tracks all user actions and system events for audit purposes
 */
const activityLogSchema = new Schema<IActivityLog>(
  {
    /**
     * User who performed the action (null for system actions)
     */
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    /**
     * Action performed (e.g., 'create', 'update', 'delete', 'login')
     */
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
      lowercase: true,
    },

    /**
     * Resource type (e.g., 'product', 'order', 'user')
     */
    resource: {
      type: String,
      required: [true, 'Resource is required'],
      trim: true,
      lowercase: true,
    },

    /**
     * Resource ID (if applicable)
     */
    resourceId: {
      type: String,
      trim: true,
    },

    /**
     * Additional details about the action (JSON object)
     */
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },

    /**
     * IP address from which action was performed
     */
    ipAddress: {
      type: String,
      trim: true,
    },

    /**
     * User agent string (browser/device info)
     */
    userAgent: {
      type: String,
      trim: true,
    },

    /**
     * Timestamp when the action occurred
     */
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: false, // We use custom timestamp field
  }
);

// Indexes
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ resource: 1, action: 1, timestamp: -1 });
activityLogSchema.index({ resourceId: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });

/**
 * Static method to log an activity
 * @param data - Activity data
 * @returns Created activity log document
 */
activityLogSchema.statics.logActivity = function (data: {
  user?: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  return this.create(data);
};

/**
 * Static method to find activities by user
 * @param userId - User ID
 * @param limit - Maximum number of results
 * @returns Array of activity log documents
 */
activityLogSchema.statics.findByUser = function (
  userId: mongoose.Types.ObjectId,
  limit: number = 100
) {
  return this.find({ user: userId })
    .populate('user', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

/**
 * Static method to find activities by resource
 * @param resource - Resource type
 * @param resourceId - Optional resource ID
 * @param limit - Maximum number of results
 * @returns Array of activity log documents
 */
activityLogSchema.statics.findByResource = function (
  resource: string,
  resourceId?: string,
  limit: number = 100
) {
  const query: any = { resource: resource.toLowerCase() };
  if (resourceId) {
    query.resourceId = resourceId;
  }

  return this.find(query)
    .populate('user', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

/**
 * Static method to find activities by action
 * @param action - Action type
 * @param limit - Maximum number of results
 * @returns Array of activity log documents
 */
activityLogSchema.statics.findByAction = function (action: string, limit: number = 100) {
  return this.find({ action: action.toLowerCase() })
    .populate('user', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

/**
 * Static method to find activities by date range
 * @param startDate - Start date
 * @param endDate - End date
 * @param limit - Maximum number of results
 * @returns Array of activity log documents
 */
activityLogSchema.statics.findByDateRange = function (
  startDate: Date,
  endDate: Date,
  limit: number = 1000
) {
  return this.find({
    timestamp: { $gte: startDate, $lte: endDate },
  })
    .populate('user', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

/**
 * Static method to get activity summary by action type
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Aggregated activity summary
 */
activityLogSchema.statics.getActivitySummary = function (startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          action: '$action',
          resource: '$resource',
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

/**
 * Static method to get user activity summary
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Aggregated user activity summary
 */
activityLogSchema.statics.getUserActivitySummary = function (
  startDate: Date,
  endDate: Date
) {
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
        user: { $exists: true },
      },
    },
    {
      $group: {
        _id: '$user',
        activityCount: { $sum: 1 },
        actions: { $push: '$action' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $unwind: '$userDetails',
    },
    {
      $project: {
        _id: 1,
        activityCount: 1,
        user: {
          firstName: '$userDetails.firstName',
          lastName: '$userDetails.lastName',
          email: '$userDetails.email',
        },
      },
    },
    {
      $sort: { activityCount: -1 },
    },
  ]);
};

/**
 * Static method to delete old logs
 * @param daysOld - Delete logs older than this many days
 * @returns Delete result
 */
activityLogSchema.statics.deleteOldLogs = function (daysOld: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.deleteMany({
    timestamp: { $lt: cutoffDate },
  });
};

/**
 * Static method to find failed login attempts
 * @param limit - Maximum number of results
 * @returns Array of failed login activity logs
 */
activityLogSchema.statics.findFailedLogins = function (limit: number = 100) {
  return this.find({
    action: 'login',
    'details.success': false,
  })
    .sort({ timestamp: -1 })
    .limit(limit);
};

const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

export default ActivityLog;

import mongoose, { Schema } from 'mongoose';
import { IStatusHistory, WorkflowEntityType } from '../types/models';

/**
 * Status History Schema
 * Tracks all status changes for entities using workflows
 */
const statusHistorySchema = new Schema<IStatusHistory>(
  {
    /**
     * Entity type (sales_order, purchase_order, etc.)
     */
    entityType: {
      type: String,
      enum: Object.values(WorkflowEntityType),
      required: [true, 'Entity type is required'],
      index: true,
    },

    /**
     * Reference to the entity document
     */
    entityId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Entity ID is required'],
      index: true,
    },

    /**
     * Previous status key
     */
    fromStatus: {
      type: String,
      trim: true,
    },

    /**
     * New status key
     */
    toStatus: {
      type: String,
      required: [true, 'New status is required'],
      trim: true,
    },

    /**
     * User who performed the status change
     */
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    /**
     * Date and time of the status change
     */
    changedAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },

    /**
     * Optional notes or comments about the change
     */
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },

    /**
     * Additional metadata (e.g., IP address, reason code, etc.)
     */
    metadata: {
      type: Schema.Types.Mixed,
    },

    /**
     * Duration in this status (in milliseconds)
     * Calculated when transitioning to next status
     */
    duration: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
statusHistorySchema.index({ entityType: 1, entityId: 1, changedAt: -1 });
statusHistorySchema.index({ entityType: 1, toStatus: 1, changedAt: -1 });
statusHistorySchema.index({ changedBy: 1, changedAt: -1 });

/**
 * Static method to get status history for an entity
 * @param entityType - Entity type
 * @param entityId - Entity ID
 * @returns Array of status history documents
 */
statusHistorySchema.statics.getEntityHistory = function (
  entityType: WorkflowEntityType,
  entityId: mongoose.Types.ObjectId
) {
  return this.find({ entityType, entityId })
    .populate('changedBy', 'firstName lastName email avatar')
    .sort({ changedAt: -1 });
};

/**
 * Static method to get latest status for an entity
 * @param entityType - Entity type
 * @param entityId - Entity ID
 * @returns Latest status history document
 */
statusHistorySchema.statics.getLatestStatus = function (
  entityType: WorkflowEntityType,
  entityId: mongoose.Types.ObjectId
) {
  return this.findOne({ entityType, entityId })
    .sort({ changedAt: -1 })
    .populate('changedBy', 'firstName lastName email avatar');
};

/**
 * Static method to create status change record
 * @param data - Status history data
 * @returns Created status history document
 */
statusHistorySchema.statics.recordStatusChange = async function (data: {
  entityType: WorkflowEntityType;
  entityId: mongoose.Types.ObjectId;
  fromStatus?: string;
  toStatus: string;
  changedBy: mongoose.Types.ObjectId;
  notes?: string;
  metadata?: any;
}) {
  // Get previous status history to calculate duration
  if (data.fromStatus) {
    const previousHistory = await this.findOne({
      entityType: data.entityType,
      entityId: data.entityId,
      toStatus: data.fromStatus,
    }).sort({ changedAt: -1 });

    if (previousHistory) {
      const duration = Date.now() - previousHistory.changedAt.getTime();
      previousHistory.duration = duration;
      await previousHistory.save();
    }
  }

  // Create new status history record
  return await this.create(data);
};

/**
 * Static method to get average duration in each status
 * @param entityType - Entity type
 * @param statusKey - Status key
 * @returns Average duration in milliseconds
 */
statusHistorySchema.statics.getAverageDuration = async function (
  entityType: WorkflowEntityType,
  statusKey: string
) {
  const result = await this.aggregate([
    {
      $match: {
        entityType,
        toStatus: statusKey,
        duration: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: null,
        avgDuration: { $avg: '$duration' },
        minDuration: { $min: '$duration' },
        maxDuration: { $max: '$duration' },
        count: { $sum: 1 },
      },
    },
  ]);

  return result.length > 0 ? result[0] : null;
};

/**
 * Static method to get status distribution
 * @param entityType - Entity type
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Status distribution stats
 */
statusHistorySchema.statics.getStatusDistribution = async function (
  entityType: WorkflowEntityType,
  startDate?: Date,
  endDate?: Date
) {
  const matchStage: any = { entityType };

  if (startDate || endDate) {
    matchStage.changedAt = {};
    if (startDate) matchStage.changedAt.$gte = startDate;
    if (endDate) matchStage.changedAt.$lte = endDate;
  }

  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$toStatus',
        count: { $sum: 1 },
        lastChanged: { $max: '$changedAt' },
      },
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        lastChanged: 1,
        _id: 0,
      },
    },
    { $sort: { count: -1 } },
  ]);
};

/**
 * Static method to get transition analytics
 * @param entityType - Entity type
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Transition analytics
 */
statusHistorySchema.statics.getTransitionAnalytics = async function (
  entityType: WorkflowEntityType,
  startDate?: Date,
  endDate?: Date
) {
  const matchStage: any = { entityType, fromStatus: { $exists: true, $ne: null } };

  if (startDate || endDate) {
    matchStage.changedAt = {};
    if (startDate) matchStage.changedAt.$gte = startDate;
    if (endDate) matchStage.changedAt.$lte = endDate;
  }

  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          from: '$fromStatus',
          to: '$toStatus',
        },
        count: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
      },
    },
    {
      $project: {
        from: '$_id.from',
        to: '$_id.to',
        count: 1,
        avgDuration: 1,
        _id: 0,
      },
    },
    { $sort: { count: -1 } },
  ]);
};

/**
 * Static method to get entities currently in a status
 * @param entityType - Entity type
 * @param statusKey - Status key
 * @returns Array of entity IDs
 */
statusHistorySchema.statics.getEntitiesInStatus = async function (
  entityType: WorkflowEntityType,
  statusKey: string
) {
  // Get the latest status for each entity
  const latestStatuses = await this.aggregate([
    { $match: { entityType } },
    { $sort: { changedAt: -1 } },
    {
      $group: {
        _id: '$entityId',
        latestStatus: { $first: '$toStatus' },
        changedAt: { $first: '$changedAt' },
      },
    },
    { $match: { latestStatus: statusKey } },
    {
      $project: {
        entityId: '$_id',
        changedAt: 1,
        _id: 0,
      },
    },
  ]);

  return latestStatuses;
};

/**
 * Instance method to format duration for display
 * @returns Formatted duration string
 */
statusHistorySchema.methods.getFormattedDuration = function () {
  if (!this.duration) return 'N/A';

  const seconds = Math.floor(this.duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

const StatusHistory = mongoose.model<IStatusHistory>('StatusHistory', statusHistorySchema);

export default StatusHistory;

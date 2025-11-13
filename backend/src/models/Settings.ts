import mongoose, { Schema } from 'mongoose';
import { ISettings } from '../types/models';

/**
 * Settings Schema
 * Manages application settings and configurations
 */
const settingsSchema = new Schema<ISettings>(
  {
    /**
     * Unique setting key
     */
    key: {
      type: String,
      required: [true, 'Key is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },

    /**
     * Setting value (stored as mixed type to support various data types)
     */
    value: {
      type: Schema.Types.Mixed,
      required: [true, 'Value is required'],
    },

    /**
     * Category for grouping settings (e.g., 'general', 'email', 'inventory')
     */
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
    },

    /**
     * Description of what this setting controls
     */
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },

    /**
     * Data type of the value (string, number, boolean, array, object)
     */
    dataType: {
      type: String,
      required: [true, 'Data type is required'],
      enum: ['string', 'number', 'boolean', 'array', 'object', 'json'],
      default: 'string',
    },

    /**
     * User who last updated the setting
     */
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    /**
     * Last update timestamp
     */
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // Using custom updatedAt
  }
);

// Indexes
settingsSchema.index({ key: 1 }, { unique: true });
settingsSchema.index({ category: 1 });

/**
 * Pre-save middleware to update the updatedAt timestamp
 */
settingsSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Static method to get setting by key
 * @param key - Setting key
 * @returns Setting document
 */
settingsSchema.statics.getSetting = function (key: string) {
  return this.findOne({ key: key.toLowerCase() });
};

/**
 * Static method to get setting value by key
 * @param key - Setting key
 * @param defaultValue - Default value if setting not found
 * @returns Setting value
 */
settingsSchema.statics.getValue = async function (key: string, defaultValue: any = null) {
  const setting = await this.findOne({ key: key.toLowerCase() });
  return setting ? setting.value : defaultValue;
};

/**
 * Static method to set setting value
 * @param key - Setting key
 * @param value - Setting value
 * @param userId - User ID who is updating
 * @returns Updated setting document
 */
settingsSchema.statics.setValue = async function (
  key: string,
  value: any,
  userId?: mongoose.Types.ObjectId
) {
  const updateData: any = { value, updatedAt: new Date() };
  if (userId) {
    updateData.updatedBy = userId;
  }

  return await this.findOneAndUpdate(
    { key: key.toLowerCase() },
    updateData,
    { new: true, upsert: false }
  );
};

/**
 * Static method to get all settings by category
 * @param category - Category name
 * @returns Array of setting documents
 */
settingsSchema.statics.getByCategory = function (category: string) {
  return this.find({ category: category.toLowerCase() }).sort({ key: 1 });
};

/**
 * Static method to get all categories
 * @returns Array of distinct categories
 */
settingsSchema.statics.getCategories = function () {
  return this.distinct('category');
};

/**
 * Static method to create or update setting
 * @param data - Setting data
 * @returns Created or updated setting document
 */
settingsSchema.statics.createOrUpdate = function (data: {
  key: string;
  value: any;
  category: string;
  description?: string;
  dataType: string;
  updatedBy?: mongoose.Types.ObjectId;
}) {
  return this.findOneAndUpdate(
    { key: data.key.toLowerCase() },
    {
      ...data,
      key: data.key.toLowerCase(),
      category: data.category.toLowerCase(),
      updatedAt: new Date(),
    },
    { new: true, upsert: true }
  );
};

/**
 * Static method to delete setting
 * @param key - Setting key
 * @returns Delete result
 */
settingsSchema.statics.deleteSetting = function (key: string) {
  return this.deleteOne({ key: key.toLowerCase() });
};

/**
 * Static method to get all settings as key-value object
 * @param category - Optional category filter
 * @returns Object with key-value pairs
 */
settingsSchema.statics.getAllAsObject = async function (category?: string) {
  const query = category ? { category: category.toLowerCase() } : {};
  const settings = await this.find(query);

  return settings.reduce((obj: any, setting: ISettings) => {
    obj[setting.key] = setting.value;
    return obj;
  }, {});
};

/**
 * Static method to bulk update settings
 * @param updates - Array of { key, value } objects
 * @param userId - User ID who is updating
 * @returns Array of updated settings
 */
settingsSchema.statics.bulkUpdate = async function (
  updates: Array<{ key: string; value: any }>,
  userId?: mongoose.Types.ObjectId
) {
  const promises = updates.map((update) =>
    this.setValue(update.key, update.value, userId)
  );

  return await Promise.all(promises);
};

/**
 * Static method to initialize default settings
 * @returns Array of created settings
 */
settingsSchema.statics.initializeDefaults = async function () {
  const defaults = [
    {
      key: 'app_name',
      value: 'Inventory Management System',
      category: 'general',
      description: 'Application name',
      dataType: 'string',
    },
    {
      key: 'currency',
      value: 'USD',
      category: 'general',
      description: 'Default currency',
      dataType: 'string',
    },
    {
      key: 'tax_rate',
      value: 10,
      category: 'general',
      description: 'Default tax rate percentage',
      dataType: 'number',
    },
    {
      key: 'low_stock_threshold',
      value: 10,
      category: 'inventory',
      description: 'Default low stock threshold',
      dataType: 'number',
    },
    {
      key: 'enable_notifications',
      value: true,
      category: 'notifications',
      description: 'Enable system notifications',
      dataType: 'boolean',
    },
    {
      key: 'email_notifications',
      value: false,
      category: 'notifications',
      description: 'Enable email notifications',
      dataType: 'boolean',
    },
  ];

  const settingsToCreate = [];
  for (const setting of defaults) {
    const exists = await this.findOne({ key: setting.key });
    if (!exists) {
      settingsToCreate.push(setting);
    }
  }

  if (settingsToCreate.length > 0) {
    return await this.insertMany(settingsToCreate);
  }

  return [];
};

/**
 * Instance method to update value
 * @param newValue - New value
 * @param userId - User ID who is updating
 * @returns Updated setting
 */
settingsSchema.methods.updateValue = async function (
  newValue: any,
  userId?: mongoose.Types.ObjectId
) {
  this.value = newValue;
  this.updatedAt = new Date();
  if (userId) {
    this.updatedBy = userId;
  }
  return await this.save();
};

const Settings = mongoose.model<ISettings>('Settings', settingsSchema);

export default Settings;

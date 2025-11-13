import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { IUser, UserRole } from '../types/models';

/**
 * User Schema
 * Manages user accounts, authentication, and authorization
 */
const userSchema = new Schema<IUser>(
  {
    /**
     * User's email address - used for login and communication
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    /**
     * Hashed password for authentication
     */
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Don't include password in queries by default
    },

    /**
     * User's first name
     */
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },

    /**
     * User's last name
     */
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },

    /**
     * User's role in the system
     */
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STAFF,
      required: true,
    },

    /**
     * URL to user's avatar image
     */
    avatar: {
      type: String,
      default: null,
    },

    /**
     * User's phone number
     */
    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[\d\s()-]+$/, 'Please provide a valid phone number'],
    },

    /**
     * Whether the user account is active
     */
    isActive: {
      type: Boolean,
      default: true,
    },

    /**
     * Whether two-factor authentication is enabled
     */
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    /**
     * Secret key for two-factor authentication
     */
    twoFactorSecret: {
      type: String,
      select: false,
    },

    /**
     * Timestamp of user's last login
     */
    lastLogin: {
      type: Date,
      default: null,
    },

    /**
     * Array of active refresh tokens
     */
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },

    /**
     * Password reset token
     */
    passwordResetToken: {
      type: String,
      select: false,
    },

    /**
     * Password reset token expiry
     */
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete ret['password'];
        delete ret['twoFactorSecret'];
        delete ret['refreshTokens'];
        delete ret['passwordResetToken'];
        delete ret['passwordResetExpires'];
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

/**
 * Virtual for user's full name
 */
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Pre-save middleware to hash password before saving
 */
userSchema.pre('save', async function (next) {
  // Only hash password if it has been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

/**
 * Instance method to compare password for authentication
 * @param candidatePassword - Password to compare
 * @returns True if password matches
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

/**
 * Instance method to generate JWT authentication token
 * @returns JWT token
 */
userSchema.methods.generateAuthToken = function (): string {
  const payload = {
    userId: this._id.toString(),
    email: this.email,
    role: this.role,
  };

  return jwt.sign(payload, process.env['JWT_SECRET'] || 'your-secret-key', {
    expiresIn: '15m',
  });
};

/**
 * Instance method to generate JWT refresh token
 * @returns JWT refresh token
 */
userSchema.methods.generateRefreshToken = function (): string {
  const payload = {
    userId: this._id.toString(),
    email: this.email,
    role: this.role,
  };

  return jwt.sign(payload, process.env['JWT_REFRESH_SECRET'] || 'your-refresh-secret', {
    expiresIn: '7d',
  });
};

/**
 * Instance method to add refresh token to user's token list
 * @param token - Refresh token to add
 */
userSchema.methods.addRefreshToken = async function (token: string): Promise<void> {
  if (!this.refreshTokens) {
    this.refreshTokens = [];
  }
  this.refreshTokens.push(token);
  await this.save();
};

/**
 * Instance method to remove refresh token from user's token list
 * @param token - Refresh token to remove
 */
userSchema.methods.removeRefreshToken = async function (token: string): Promise<void> {
  if (!this.refreshTokens) {
    this.refreshTokens = [];
  }
  this.refreshTokens = this.refreshTokens.filter((t: string) => t !== token);
  await this.save();
};

/**
 * Instance method to clear all refresh tokens
 */
userSchema.methods.clearRefreshTokens = async function (): Promise<void> {
  this.refreshTokens = [];
  await this.save();
};

/**
 * Instance method to generate password reset token
 * @returns Password reset token
 */
userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return resetToken;
};

/**
 * Static method to find user by email
 * @param email - User's email
 * @returns User document
 */
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Static method to find active users by role
 * @param role - User role
 * @returns Array of user documents
 */
userSchema.statics.findActiveByRole = function (role: UserRole) {
  return this.find({ role, isActive: true });
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;

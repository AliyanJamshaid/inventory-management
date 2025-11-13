/**
 * Authentication Controller
 * Handles user authentication, registration, and password management
 */

import { Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { IAuthRequest } from '../types';
import User from '../models/User';
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendUnauthorized,
  sendNotFound,
  sendBadRequest,
  sendConflict,
} from '../utils/responses';
import { logAuth, logError } from '../utils/logger';
import config from '../config/config';

/**
 * Register a new user
 * @route POST /api/v1/auth/register
 * @access Public
 */
export const register = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      logAuth('Registration failed: Email already exists', undefined, { email });
      return sendConflict(res, 'User with this email already exists');
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      phone,
      role: role || 'STAFF',
    });

    await user.save();

    const userId = user._id?.toString() || '';

    // Generate tokens
    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token
    await user.addRefreshToken(refreshToken);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    logAuth('User registered successfully', userId, {
      email: user.email,
      role: user.role,
    });

    // Remove sensitive data from response
    const userResponse = user.toJSON();

    return sendCreated(
      res,
      {
        user: userResponse,
        accessToken,
        refreshToken,
      },
      'User registered successfully'
    );
  } catch (error) {
    logError(error as Error, { action: 'register' });
    return sendError(res, 'Failed to register user. Please try again.', 500);
  }
};

/**
 * Login user with email and password
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const login = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      logAuth('Login failed: User not found', undefined, { email });
      return sendUnauthorized(res, 'Invalid email or password');
    }

    const userId = user._id?.toString() || '';

    // Check if user is active
    if (!user.isActive) {
      logAuth('Login failed: Account inactive', userId, { email });
      return sendUnauthorized(res, 'Your account has been deactivated. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logAuth('Login failed: Invalid password', userId, { email });
      return sendUnauthorized(res, 'Invalid email or password');
    }

    // Generate tokens
    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token
    await user.addRefreshToken(refreshToken);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    logAuth('User logged in successfully', userId, {
      email: user.email,
      role: user.role,
    });

    // Remove sensitive data from response
    const userResponse = user.toJSON();

    return sendSuccess(
      res,
      {
        user: userResponse,
        accessToken,
        refreshToken,
      },
      'Login successful'
    );
  } catch (error) {
    logError(error as Error, { action: 'login' });
    return sendError(res, 'Login failed. Please try again.', 500);
  }
};

/**
 * Refresh access token using refresh token
 * @route POST /api/v1/auth/refresh
 * @access Public
 */
export const refreshToken = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { refreshToken: token } = req.body;

    // Get token from body or Authorization header
    const refreshTokenValue = token || req.headers.authorization?.split(' ')[1];

    if (!refreshTokenValue) {
      return sendBadRequest(res, 'Refresh token is required');
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshTokenValue,
        config.jwtRefreshSecret
      ) as { userId: string; email: string; role: string };

      // Find user and check if refresh token exists
      const user = await User.findById(decoded.userId).select('+refreshTokens');

      if (!user) {
        return sendUnauthorized(res, 'Invalid refresh token');
      }

      // Check if user is active
      if (!user.isActive) {
        return sendUnauthorized(res, 'Your account has been deactivated');
      }

      // Check if refresh token exists in user's token list
      if (!user.refreshTokens || !user.refreshTokens.includes(refreshTokenValue)) {
        logAuth('Refresh token not found in user tokens', user._id?.toString() || '');
        return sendUnauthorized(res, 'Invalid refresh token');
      }

      // Generate new tokens
      const newAccessToken = user.generateAuthToken();
      const newRefreshToken = user.generateRefreshToken();

      // Remove old refresh token and add new one
      await user.removeRefreshToken(refreshTokenValue);
      await user.addRefreshToken(newRefreshToken);

      logAuth('Token refreshed successfully', user._id?.toString() || '');

      return sendSuccess(
        res,
        {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        'Token refreshed successfully'
      );
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return sendUnauthorized(res, 'Refresh token expired. Please log in again.');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return sendUnauthorized(res, 'Invalid refresh token');
      }
      throw error;
    }
  } catch (error) {
    logError(error as Error, { action: 'refreshToken' });
    return sendError(res, 'Failed to refresh token. Please log in again.', 500);
  }
};

/**
 * Logout user by removing refresh token
 * @route POST /api/v1/auth/logout
 * @access Private
 */
export const logout = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required');
    }

    const { refreshToken: token } = req.body;
    const refreshTokenValue = token || req.headers.authorization?.split(' ')[1];

    const user = await User.findById(req.user.userId).select('+refreshTokens');

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Remove refresh token if provided
    if (refreshTokenValue) {
      await user.removeRefreshToken(refreshTokenValue);
    } else {
      // If no token provided, clear all tokens (logout from all devices)
      await user.clearRefreshTokens();
    }

    logAuth('User logged out successfully', user._id?.toString() || '');

    return sendSuccess(res, null, 'Logout successful');
  } catch (error) {
    logError(error as Error, { action: 'logout' });
    return sendError(res, 'Logout failed. Please try again.', 500);
  }
};

/**
 * Get current user profile
 * @route GET /api/v1/auth/me
 * @access Private
 */
export const getProfile = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required');
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    if (!user.isActive) {
      return sendUnauthorized(res, 'Your account has been deactivated');
    }

    return sendSuccess(res, user, 'Profile retrieved successfully');
  } catch (error) {
    logError(error as Error, { action: 'getProfile' });
    return sendError(res, 'Failed to retrieve profile. Please try again.', 500);
  }
};

/**
 * Update user profile
 * @route PUT /api/v1/auth/profile
 * @access Private
 */
export const updateProfile = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required');
    }

    const { firstName, lastName, phone, avatar, email } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Check if email is being changed and if it's already taken
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return sendConflict(res, 'Email is already in use');
      }
      user.email = email.toLowerCase();
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    logAuth('Profile updated successfully', user._id?.toString() || '');

    return sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    logError(error as Error, { action: 'updateProfile' });
    return sendError(res, 'Failed to update profile. Please try again.', 500);
  }
};

/**
 * Change user password
 * @route POST /api/v1/auth/change-password
 * @access Private
 */
export const changePassword = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required');
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId).select('+password');

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      logAuth('Password change failed: Invalid current password', user._id?.toString() || '');
      return sendBadRequest(res, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;

    // Clear all refresh tokens (logout from all devices)
    await user.clearRefreshTokens();

    await user.save();

    // Generate new tokens
    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    await user.addRefreshToken(refreshToken);

    logAuth('Password changed successfully', user._id?.toString() || '');

    return sendSuccess(
      res,
      {
        accessToken,
        refreshToken,
      },
      'Password changed successfully. You have been logged out from all other devices.'
    );
  } catch (error) {
    logError(error as Error, { action: 'changePassword' });
    return sendError(res, 'Failed to change password. Please try again.', 500);
  }
};

/**
 * Request password reset
 * @route POST /api/v1/auth/forgot-password
 * @access Public
 */
export const forgotPassword = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not
      return sendSuccess(
        res,
        null,
        'If an account exists with this email, a password reset link will be sent.'
      );
    }

    if (!user.isActive) {
      return sendBadRequest(res, 'Your account has been deactivated');
    }

    // Generate password reset token
    const resetToken = user.createPasswordResetToken();
    await user.save();

    // In production, send email with reset link
    // For now, we'll return the token in the response (remove in production)
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password`;

    logAuth('Password reset requested', user._id?.toString() || '', { email });

    // TODO: Send email with reset link
    // For development, return the token
    if (config.nodeEnv === 'development') {
      return sendSuccess(
        res,
        {
          message: 'Password reset token generated',
          resetToken,
          resetUrl,
          expiresIn: '10 minutes',
        },
        'Password reset token generated successfully'
      );
    }

    return sendSuccess(
      res,
      null,
      'If an account exists with this email, a password reset link will be sent.'
    );
  } catch (error) {
    logError(error as Error, { action: 'forgotPassword' });
    return sendError(res, 'Failed to process request. Please try again.', 500);
  }
};

/**
 * Reset password with token
 * @route POST /api/v1/auth/reset-password
 * @access Public
 */
export const resetPassword = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { token, password } = req.body;

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+password +passwordResetToken +passwordResetExpires');

    if (!user) {
      return sendBadRequest(res, 'Invalid or expired password reset token');
    }

    if (!user.isActive) {
      return sendBadRequest(res, 'Your account has been deactivated');
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Clear all refresh tokens
    await user.clearRefreshTokens();

    await user.save();

    // Generate new tokens
    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    await user.addRefreshToken(refreshToken);

    logAuth('Password reset successfully', user._id?.toString() || '');

    return sendSuccess(
      res,
      {
        accessToken,
        refreshToken,
      },
      'Password reset successfully'
    );
  } catch (error) {
    logError(error as Error, { action: 'resetPassword' });
    return sendError(res, 'Failed to reset password. Please try again.', 500);
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};

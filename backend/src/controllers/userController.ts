/**
 * User Management Controller
 * Handles CRUD operations for user management (admin functions)
 */

import { Response } from 'express';
import { IAuthRequest } from '../types';
import User from '../models/User';
import {
  sendSuccess,
  sendSuccessWithPagination,
  sendError,
  sendNotFound,
  sendBadRequest,
  sendConflict,
  sendForbidden,
} from '../utils/responses';
import { logError } from '../utils/logger';

/**
 * Get all users with pagination and filtering
 * @route GET /api/v1/users
 * @access Private (Admin only)
 */
export const getAllUsers = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const {
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      role,
      isActive,
      search,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = {};

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const users = await User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    return sendSuccessWithPagination(
      res,
      users,
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
      'Users retrieved successfully'
    );
  } catch (error) {
    logError(error as Error, { action: 'getAllUsers' });
    return sendError(res, 'Failed to retrieve users. Please try again.', 500);
  }
};

/**
 * Get user by ID
 * @route GET /api/v1/users/:id
 * @access Private (Admin/Manager or Self)
 */
export const getUserById = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    // Check if user is accessing their own profile or has admin/manager role
    if (
      req.user?.userId !== id &&
      !['ADMIN', 'MANAGER'].includes(req.user?.role || '')
    ) {
      return sendForbidden(res, 'You do not have permission to view this user');
    }

    const user = await User.findById(id).select('-__v');

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    return sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    logError(error as Error, { action: 'getUserById', userId: req.params.id });
    return sendError(res, 'Failed to retrieve user. Please try again.', 500);
  }
};

/**
 * Update user (admin function)
 * @route PUT /api/v1/users/:id
 * @access Private (Admin only)
 */
export const updateUser = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, phone, avatar, role, isActive } = req.body;

    const user = await User.findById(id);

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
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    return sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    logError(error as Error, { action: 'updateUser', userId: req.params.id });
    return sendError(res, 'Failed to update user. Please try again.', 500);
  }
};

/**
 * Delete user
 * @route DELETE /api/v1/users/:id
 * @access Private (Admin only)
 */
export const deleteUser = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (req.user?.userId === id) {
      return sendBadRequest(res, 'You cannot delete your own account');
    }

    const user = await User.findById(id);

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Prevent deleting the last admin
    if (user.role === 'ADMIN') {
      const adminCount = await User.countDocuments({ role: 'ADMIN' });
      if (adminCount <= 1) {
        return sendBadRequest(
          res,
          'Cannot delete the last admin user. Please create another admin first.'
        );
      }
    }

    await User.findByIdAndDelete(id);

    return sendSuccess(res, null, 'User deleted successfully');
  } catch (error) {
    logError(error as Error, { action: 'deleteUser', userId: req.params.id });
    return sendError(res, 'Failed to delete user. Please try again.', 500);
  }
};

/**
 * Activate user account
 * @route PUT /api/v1/users/:id/activate
 * @access Private (Admin only)
 */
export const activateUser = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    if (user.isActive) {
      return sendBadRequest(res, 'User is already active');
    }

    user.isActive = true;
    await user.save();

    return sendSuccess(res, user, 'User activated successfully');
  } catch (error) {
    logError(error as Error, { action: 'activateUser', userId: req.params.id });
    return sendError(res, 'Failed to activate user. Please try again.', 500);
  }
};

/**
 * Deactivate user account
 * @route PUT /api/v1/users/:id/deactivate
 * @access Private (Admin only)
 */
export const deactivateUser = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    // Prevent deactivating self
    if (req.user?.userId === id) {
      return sendBadRequest(res, 'You cannot deactivate your own account');
    }

    const user = await User.findById(id).select('+refreshTokens');

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    if (!user.isActive) {
      return sendBadRequest(res, 'User is already inactive');
    }

    // Prevent deactivating the last admin
    if (user.role === 'ADMIN') {
      const activeAdminCount = await User.countDocuments({
        role: 'ADMIN',
        isActive: true,
      });
      if (activeAdminCount <= 1) {
        return sendBadRequest(
          res,
          'Cannot deactivate the last active admin. Please activate another admin first.'
        );
      }
    }

    user.isActive = false;

    // Clear all refresh tokens (logout user from all devices)
    await user.clearRefreshTokens();

    await user.save();

    return sendSuccess(res, user, 'User deactivated successfully');
  } catch (error) {
    logError(error as Error, {
      action: 'deactivateUser',
      userId: req.params.id,
    });
    return sendError(res, 'Failed to deactivate user. Please try again.', 500);
  }
};

/**
 * Get user statistics
 * @route GET /api/v1/users/stats
 * @access Private (Admin only)
 */
export const getUserStats = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email role createdAt');

    return sendSuccess(
      res,
      {
        totalUsers,
        activeUsers,
        inactiveUsers,
        usersByRole,
        recentUsers,
      },
      'User statistics retrieved successfully'
    );
  } catch (error) {
    logError(error as Error, { action: 'getUserStats' });
    return sendError(
      res,
      'Failed to retrieve user statistics. Please try again.',
      500
    );
  }
};

export default {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  getUserStats,
};

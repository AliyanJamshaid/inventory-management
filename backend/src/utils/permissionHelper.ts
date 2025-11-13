/**
 * Permission Helper Utilities
 * Helper functions for checking user permissions
 */

import Role from '../models/Role';
import Permission from '../models/Permission';
import User from '../models/User';
import { Types } from 'mongoose';

/**
 * Cache for user permissions (in production, use Redis)
 */
const permissionCache = new Map<string, { permissions: string[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get all permission keys for a user
 * @param userId - User ID
 * @returns Array of permission keys (module.resource.action)
 */
export const getUserPermissions = async (userId: string | Types.ObjectId): Promise<string[]> => {
  const userIdStr = userId.toString();

  // Check cache
  const cached = permissionCache.get(userIdStr);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.permissions;
  }

  try {
    // Get user with role populated
    const user = await User.findById(userId);
    if (!user) {
      return [];
    }

    // For now, we need to map the old enum roles to the new role system
    // In a real migration, you'd update the User model to reference Role._id
    const role = await Role.findByName(user.role.toLowerCase());
    if (!role) {
      return [];
    }

    // Get role with populated permissions
    const roleWithPermissions = await Role.findById(role._id).populate('permissions');
    if (!roleWithPermissions) {
      return [];
    }

    // Extract permission keys
    const permissions = (roleWithPermissions.permissions as any[]).map(
      (p: any) => `${p.module}.${p.resource}.${p.action}`
    );

    // Cache the result
    permissionCache.set(userIdStr, {
      permissions,
      timestamp: Date.now(),
    });

    return permissions;
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
};

/**
 * Check if user has a specific permission
 * @param userId - User ID
 * @param permissionKey - Permission key (module.resource.action)
 * @returns True if user has the permission
 */
export const checkUserPermission = async (
  userId: string | Types.ObjectId,
  permissionKey: string
): Promise<boolean> => {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permissionKey);
};

/**
 * Check if user has all of the specified permissions (AND logic)
 * @param userId - User ID
 * @param permissionKeys - Array of permission keys
 * @returns True if user has all permissions
 */
export const checkUserPermissions = async (
  userId: string | Types.ObjectId,
  permissionKeys: string[]
): Promise<boolean> => {
  const permissions = await getUserPermissions(userId);
  return permissionKeys.every((key) => permissions.includes(key));
};

/**
 * Check if user has any of the specified permissions (OR logic)
 * @param userId - User ID
 * @param permissionKeys - Array of permission keys
 * @returns True if user has at least one permission
 */
export const checkUserAnyPermission = async (
  userId: string | Types.ObjectId,
  permissionKeys: string[]
): Promise<boolean> => {
  const permissions = await getUserPermissions(userId);
  return permissionKeys.some((key) => permissions.includes(key));
};

/**
 * Invalidate permission cache for a user
 * @param userId - User ID
 */
export const invalidateUserPermissionCache = (userId: string | Types.ObjectId): void => {
  permissionCache.delete(userId.toString());
};

/**
 * Clear all permission caches
 */
export const clearPermissionCache = (): void => {
  permissionCache.clear();
};

/**
 * Get permissions for a role
 * @param roleId - Role ID
 * @returns Array of permission keys
 */
export const getRolePermissions = async (roleId: string | Types.ObjectId): Promise<string[]> => {
  try {
    const role = await Role.findById(roleId).populate('permissions');
    if (!role) {
      return [];
    }

    return (role.permissions as any[]).map((p: any) => `${p.module}.${p.resource}.${p.action}`);
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return [];
  }
};

/**
 * Get permission object by key
 * @param key - Permission key (module.resource.action)
 * @returns Permission document or null
 */
export const getPermissionByKey = async (key: string) => {
  const [module, resource, action] = key.split('.');
  return Permission.findOne({ module, resource, action });
};

/**
 * Check if a permission key exists
 * @param key - Permission key
 * @returns True if permission exists
 */
export const permissionExists = async (key: string): Promise<boolean> => {
  const permission = await getPermissionByKey(key);
  return !!permission;
};

export default {
  getUserPermissions,
  checkUserPermission,
  checkUserPermissions,
  checkUserAnyPermission,
  invalidateUserPermissionCache,
  clearPermissionCache,
  getRolePermissions,
  getPermissionByKey,
  permissionExists,
};

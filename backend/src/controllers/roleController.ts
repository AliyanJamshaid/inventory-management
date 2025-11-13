/**
 * Role Controller
 * Handles role management operations
 */

import { Response } from 'express';
import { IAuthRequest } from '../types';
import Role from '../models/Role';
import Permission from '../models/Permission';
import User from '../models/User';
import { sendSuccess, sendError, sendNotFound } from '../utils/responses';
import { logInfo, logError } from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Get all roles
 * GET /api/v1/roles
 */
export const getAllRoles = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const roles = await Role.find()
      .populate('permissions')
      .populate('createdBy', 'firstName lastName email')
      .sort({ hierarchy: 1 });

    logInfo('Fetched all roles', { count: roles.length, userId: req.user?.userId });

    return sendSuccess(res, roles, 'Roles fetched successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Error fetching roles'));
    return sendError(res, 'Failed to fetch roles');
  }
};

/**
 * Get role by ID with populated permissions
 * GET /api/v1/roles/:id
 */
export const getRoleById = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id)
      .populate('permissions')
      .populate('createdBy', 'firstName lastName email');

    if (!role) {
      return sendNotFound(res, 'Role not found');
    }

    logInfo('Fetched role by ID', { roleId: id, userId: req.user?.userId });

    return sendSuccess(res, role, 'Role fetched successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Error fetching role'));
    return sendError(res, 'Failed to fetch role');
  }
};

/**
 * Create a new role
 * POST /api/v1/roles
 */
export const createRole = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { name, displayName, description, permissions, hierarchy, isDefault, customSettings } = req.body;

    // Validate required fields
    if (!name || !displayName) {
      return sendError(res, 'Name and display name are required', 400);
    }

    // Check if role with same name already exists
    const existingRole = await Role.findOne({ name: name.toLowerCase() });
    if (existingRole) {
      return sendError(res, 'Role with this name already exists', 409);
    }

    // Validate permission IDs
    if (permissions && permissions.length > 0) {
      const validPermissions = await Permission.find({ _id: { $in: permissions } });
      if (validPermissions.length !== permissions.length) {
        return sendError(res, 'One or more invalid permission IDs', 400);
      }
    }

    // Create new role
    const newRole = new Role({
      name: name.toLowerCase(),
      displayName,
      description,
      permissions: permissions || [],
      hierarchy: hierarchy || 50,
      isDefault: isDefault || false,
      isSystemRole: false, // Custom roles are never system roles
      customSettings: customSettings || {},
      createdBy: req.user?.userId,
    });

    await newRole.save();

    const populatedRole = await Role.findById(newRole._id)
      .populate('permissions')
      .populate('createdBy', 'firstName lastName email');

    logInfo('Created new role', { roleId: newRole._id, name: newRole.name, userId: req.user?.userId });

    return sendSuccess(res, populatedRole, 'Role created successfully', 201);
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Error creating role'));
    return sendError(res, 'Failed to create role');
  }
};

/**
 * Update role
 * PUT /api/v1/roles/:id
 */
export const updateRole = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, displayName, description, permissions, hierarchy, isDefault, customSettings } = req.body;

    const role = await Role.findById(id);
    if (!role) {
      return sendNotFound(res, 'Role not found');
    }

    // Prevent updating system roles
    if (role.isSystemRole) {
      return sendError(res, 'Cannot modify system roles', 403);
    }

    // Check if name is being changed and if it conflicts
    if (name && name.toLowerCase() !== role.name) {
      const existingRole = await Role.findOne({ name: name.toLowerCase(), _id: { $ne: id } });
      if (existingRole) {
        return sendError(res, 'Role with this name already exists', 409);
      }
      role.name = name.toLowerCase();
    }

    // Update fields
    if (displayName) role.displayName = displayName;
    if (description !== undefined) role.description = description;
    if (hierarchy !== undefined) role.hierarchy = hierarchy;
    if (isDefault !== undefined) role.isDefault = isDefault;
    if (customSettings) role.customSettings = customSettings;

    // Update permissions if provided
    if (permissions) {
      const validPermissions = await Permission.find({ _id: { $in: permissions } });
      if (validPermissions.length !== permissions.length) {
        return sendError(res, 'One or more invalid permission IDs', 400);
      }
      role.permissions = permissions;
    }

    await role.save();

    const updatedRole = await Role.findById(id)
      .populate('permissions')
      .populate('createdBy', 'firstName lastName email');

    logInfo('Updated role', { roleId: id, userId: req.user?.userId });

    return sendSuccess(res, updatedRole, 'Role updated successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Error updating role'));
    return sendError(res, 'Failed to update role');
  }
};

/**
 * Delete role
 * DELETE /api/v1/roles/:id
 */
export const deleteRole = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role) {
      return sendNotFound(res, 'Role not found');
    }

    // Prevent deleting system roles
    if (role.isSystemRole) {
      return sendError(res, 'Cannot delete system roles', 403);
    }

    // Check if role is assigned to any users
    const usersWithRole = await User.countDocuments({ role: role.name.toUpperCase() });
    if (usersWithRole > 0) {
      return sendError(res, `Cannot delete role. ${usersWithRole} user(s) are assigned to this role.`, 409);
    }

    await role.deleteOne();

    logInfo('Deleted role', { roleId: id, roleName: role.name, userId: req.user?.userId });

    return sendSuccess(res, null, 'Role deleted successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Error deleting role'));
    return sendError(res, 'Failed to delete role');
  }
};

/**
 * Add permissions to role
 * POST /api/v1/roles/:id/permissions
 */
export const addPermissionsToRole = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;

    if (!permissionIds || !Array.isArray(permissionIds) || permissionIds.length === 0) {
      return sendError(res, 'Permission IDs are required', 400);
    }

    const role = await Role.findById(id);
    if (!role) {
      return sendNotFound(res, 'Role not found');
    }

    if (role.isSystemRole) {
      return sendError(res, 'Cannot modify system role permissions', 403);
    }

    // Validate permission IDs
    const permissions = await Permission.find({ _id: { $in: permissionIds } });
    if (permissions.length !== permissionIds.length) {
      return sendError(res, 'One or more invalid permission IDs', 400);
    }

    // Add permissions (avoid duplicates)
    for (const permissionId of permissionIds) {
      await role.addPermission(permissionId);
    }

    const updatedRole = await Role.findById(id).populate('permissions');

    logInfo('Added permissions to role', { roleId: id, count: permissionIds.length, userId: req.user?.userId });

    return sendSuccess(res, updatedRole, 'Permissions added successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Error adding permissions'));
    return sendError(res, 'Failed to add permissions');
  }
};

/**
 * Remove permission from role
 * DELETE /api/v1/roles/:id/permissions/:permissionId
 */
export const removePermissionFromRole = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { id, permissionId } = req.params;

    const role = await Role.findById(id);
    if (!role) {
      return sendNotFound(res, 'Role not found');
    }

    if (role.isSystemRole) {
      return sendError(res, 'Cannot modify system role permissions', 403);
    }

    await role.removePermission(new mongoose.Types.ObjectId(permissionId));

    const updatedRole = await Role.findById(id).populate('permissions');

    logInfo('Removed permission from role', { roleId: id, permissionId, userId: req.user?.userId });

    return sendSuccess(res, updatedRole, 'Permission removed successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Error removing permission'));
    return sendError(res, 'Failed to remove permission');
  }
};

/**
 * Duplicate role
 * POST /api/v1/roles/:id/duplicate
 */
export const duplicateRole = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, displayName } = req.body;

    const sourceRole = await Role.findById(id);
    if (!sourceRole) {
      return sendNotFound(res, 'Source role not found');
    }

    if (!name) {
      return sendError(res, 'New role name is required', 400);
    }

    // Check if name already exists
    const existingRole = await Role.findOne({ name: name.toLowerCase() });
    if (existingRole) {
      return sendError(res, 'Role with this name already exists', 409);
    }

    // Create duplicate
    const duplicateRole = new Role({
      name: name.toLowerCase(),
      displayName: displayName || `${sourceRole.displayName} (Copy)`,
      description: sourceRole.description,
      permissions: sourceRole.permissions,
      hierarchy: sourceRole.hierarchy,
      isDefault: false,
      isSystemRole: false,
      customSettings: sourceRole.customSettings,
      createdBy: req.user?.userId,
    });

    await duplicateRole.save();

    const populatedRole = await Role.findById(duplicateRole._id)
      .populate('permissions')
      .populate('createdBy', 'firstName lastName email');

    logInfo('Duplicated role', { sourceId: id, newId: duplicateRole._id, userId: req.user?.userId });

    return sendSuccess(res, populatedRole, 'Role duplicated successfully', 201);
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Error duplicating role'));
    return sendError(res, 'Failed to duplicate role');
  }
};

/**
 * Get users with a specific role
 * GET /api/v1/roles/:id/users
 */
export const getRoleUsers = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role) {
      return sendNotFound(res, 'Role not found');
    }

    // Find users with this role
    const users = await User.find({ role: role.name.toUpperCase() })
      .select('-password -refreshTokens -twoFactorSecret')
      .sort({ lastName: 1, firstName: 1 });

    logInfo('Fetched role users', { roleId: id, count: users.length, userId: req.user?.userId });

    return sendSuccess(res, users, 'Users fetched successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Error fetching role users'));
    return sendError(res, 'Failed to fetch users');
  }
};

export default {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  addPermissionsToRole,
  removePermissionFromRole,
  duplicateRole,
  getRoleUsers,
};

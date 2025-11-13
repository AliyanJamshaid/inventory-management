/**
 * Permission Controller
 * Handles permission management operations
 */

import { Response } from 'express';
import { IAuthRequest } from '../types';
import Permission from '../models/Permission';
import { sendSuccess, sendError, sendNotFound } from '../utils/responses';
import { logInfo, logError } from '../utils/logger';

/**
 * Get all permissions
 * GET /api/v1/permissions
 */
export const getAllPermissions = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { module, category, action } = req.query;

    // Build filter
    const filter: any = {};
    if (module) filter.module = module;
    if (category) filter.category = category;
    if (action) filter.action = action;

    const permissions = await Permission.find(filter).sort({ category: 1, module: 1, resource: 1, action: 1 });

    logInfo('Fetched all permissions', { count: permissions.length, userId: req.user?.userId });

    return sendSuccess(res, permissions, 'Permissions fetched successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Error fetching permissions'));
    return sendError(res, 'Failed to fetch permissions');
  }
};

/**
 * Get permissions grouped by category
 * GET /api/v1/permissions/grouped
 */
export const getPermissionsGrouped = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const permissions = await Permission.find().sort({ category: 1, module: 1, resource: 1, action: 1 });

    // Group by category
    const grouped: Record<string, any[]> = {};
    permissions.forEach((permission) => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });

    // Convert to array format with category info
    const result = Object.entries(grouped).map(([category, perms]) => ({
      category,
      permissions: perms,
      count: perms.length,
    }));

    logInfo('Fetched grouped permissions', { categories: result.length, userId: req.user?.userId });

    return sendSuccess(res, result, 'Grouped permissions fetched successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Error fetching grouped permissions'));
    return sendError(res, 'Failed to fetch grouped permissions');
  }
};

/**
 * Get permission by ID
 * GET /api/v1/permissions/:id
 */
export const getPermissionById = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const permission = await Permission.findById(id);

    if (!permission) {
      return sendNotFound(res, 'Permission not found');
    }

    logInfo('Fetched permission by ID', { permissionId: id, userId: req.user?.userId });

    return sendSuccess(res, permission, 'Permission fetched successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Error fetching permission'));
    return sendError(res, 'Failed to fetch permission');
  }
};

/**
 * Create custom permission (for advanced users)
 * POST /api/v1/permissions
 */
export const createPermission = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { module, resource, action, displayName, description, category, conditions } = req.body;

    // Validate required fields
    if (!module || !resource || !action || !displayName || !category) {
      return sendError(res, 'Module, resource, action, displayName, and category are required', 400);
    }

    // Check if permission already exists
    const existingPermission = await Permission.findOne({
      module: module.toLowerCase(),
      resource: resource.toLowerCase(),
      action: action.toLowerCase(),
    });

    if (existingPermission) {
      return sendError(res, 'Permission with this combination already exists', 409);
    }

    // Create new permission
    const newPermission = new Permission({
      module: module.toLowerCase(),
      resource: resource.toLowerCase(),
      action: action.toLowerCase(),
      displayName,
      description,
      category,
      conditions,
      isSystemPermission: false, // Custom permissions are not system permissions
    });

    await newPermission.save();

    logInfo('Created custom permission', { permissionId: newPermission._id, userId: req.user?.userId });

    return sendSuccess(res, newPermission, 'Permission created successfully', 201);
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Error creating permission'));
    return sendError(res, 'Failed to create permission');
  }
};

/**
 * Update permission
 * PUT /api/v1/permissions/:id
 */
export const updatePermission = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { displayName, description, category, conditions } = req.body;

    const permission = await Permission.findById(id);
    if (!permission) {
      return sendNotFound(res, 'Permission not found');
    }

    // Prevent updating system permissions' core fields
    if (permission.isSystemPermission) {
      return sendError(res, 'Cannot modify system permissions', 403);
    }

    // Update fields
    if (displayName) permission.displayName = displayName;
    if (description !== undefined) permission.description = description;
    if (category) permission.category = category;
    if (conditions !== undefined) permission.conditions = conditions;

    await permission.save();

    logInfo('Updated permission', { permissionId: id, userId: req.user?.userId });

    return sendSuccess(res, permission, 'Permission updated successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Error updating permission'));
    return sendError(res, 'Failed to update permission');
  }
};

/**
 * Delete permission
 * DELETE /api/v1/permissions/:id
 */
export const deletePermission = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const permission = await Permission.findById(id);
    if (!permission) {
      return sendNotFound(res, 'Permission not found');
    }

    // Prevent deleting system permissions
    if (permission.isSystemPermission) {
      return sendError(res, 'Cannot delete system permissions', 403);
    }

    await permission.deleteOne();

    logInfo('Deleted permission', { permissionId: id, userId: req.user?.userId });

    return sendSuccess(res, null, 'Permission deleted successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Error deleting permission'));
    return sendError(res, 'Failed to delete permission');
  }
};

/**
 * Get permission statistics
 * GET /api/v1/permissions/stats
 */
export const getPermissionStats = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const permissions = await Permission.find();

    const categories = new Set(permissions.map((p) => p.category));
    const modules = new Set(permissions.map((p) => p.module));
    const resources = new Set(permissions.map((p) => p.resource));
    const actions = new Set(permissions.map((p) => p.action));

    const stats = {
      total: permissions.length,
      categories: categories.size,
      modules: modules.size,
      resources: resources.size,
      actions: actions.size,
      systemPermissions: permissions.filter((p) => p.isSystemPermission).length,
      customPermissions: permissions.filter((p) => !p.isSystemPermission).length,
      byCategory: {} as Record<string, number>,
      byModule: {} as Record<string, number>,
      byAction: {} as Record<string, number>,
    };

    categories.forEach((category) => {
      stats.byCategory[category] = permissions.filter((p) => p.category === category).length;
    });

    modules.forEach((module) => {
      stats.byModule[module] = permissions.filter((p) => p.module === module).length;
    });

    actions.forEach((action) => {
      stats.byAction[action] = permissions.filter((p) => p.action === action).length;
    });

    logInfo('Fetched permission statistics', { userId: req.user?.userId });

    return sendSuccess(res, stats, 'Permission statistics fetched successfully');
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Error fetching permission stats'));
    return sendError(res, 'Failed to fetch permission statistics');
  }
};

export default {
  getAllPermissions,
  getPermissionsGrouped,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionStats,
};

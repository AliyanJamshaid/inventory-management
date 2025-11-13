/**
 * Permission Routes
 * API endpoints for permission management
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import {
  getAllPermissions,
  getPermissionsGrouped,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionStats,
} from '../controllers/permissionController';

const router = Router();

/**
 * @route   GET /api/v1/permissions/stats
 * @desc    Get permission statistics
 * @access  Private (requires settings.permissions.read permission)
 */
router.get('/stats', authenticate, requirePermission('settings.permissions.read'), getPermissionStats);

/**
 * @route   GET /api/v1/permissions/grouped
 * @desc    Get permissions grouped by category
 * @access  Private (requires settings.permissions.read permission)
 */
router.get('/grouped', authenticate, requirePermission('settings.permissions.read'), getPermissionsGrouped);

/**
 * @route   GET /api/v1/permissions
 * @desc    Get all permissions
 * @access  Private (requires settings.permissions.read permission)
 */
router.get('/', authenticate, requirePermission('settings.permissions.read'), getAllPermissions);

/**
 * @route   GET /api/v1/permissions/:id
 * @desc    Get permission by ID
 * @access  Private (requires settings.permissions.read permission)
 */
router.get('/:id', authenticate, requirePermission('settings.permissions.read'), getPermissionById);

/**
 * @route   POST /api/v1/permissions
 * @desc    Create custom permission (advanced feature)
 * @access  Private (requires settings.permissions.assign permission)
 */
router.post('/', authenticate, requirePermission('settings.permissions.assign'), createPermission);

/**
 * @route   PUT /api/v1/permissions/:id
 * @desc    Update permission
 * @access  Private (requires settings.permissions.assign permission)
 */
router.put('/:id', authenticate, requirePermission('settings.permissions.assign'), updatePermission);

/**
 * @route   DELETE /api/v1/permissions/:id
 * @desc    Delete permission
 * @access  Private (requires settings.permissions.assign permission)
 */
router.delete('/:id', authenticate, requirePermission('settings.permissions.assign'), deletePermission);

export default router;

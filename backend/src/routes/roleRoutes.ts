/**
 * Role Routes
 * API endpoints for role management
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  addPermissionsToRole,
  removePermissionFromRole,
  duplicateRole,
  getRoleUsers,
} from '../controllers/roleController';

const router = Router();

/**
 * @route   GET /api/v1/roles
 * @desc    Get all roles
 * @access  Private (requires settings.roles.read permission)
 */
router.get('/', authenticate, requirePermission('settings.roles.read'), getAllRoles);

/**
 * @route   GET /api/v1/roles/:id
 * @desc    Get role by ID
 * @access  Private (requires settings.roles.read permission)
 */
router.get('/:id', authenticate, requirePermission('settings.roles.read'), getRoleById);

/**
 * @route   POST /api/v1/roles
 * @desc    Create new role
 * @access  Private (requires settings.roles.create permission)
 */
router.post('/', authenticate, requirePermission('settings.roles.create'), createRole);

/**
 * @route   PUT /api/v1/roles/:id
 * @desc    Update role
 * @access  Private (requires settings.roles.update permission)
 */
router.put('/:id', authenticate, requirePermission('settings.roles.update'), updateRole);

/**
 * @route   DELETE /api/v1/roles/:id
 * @desc    Delete role
 * @access  Private (requires settings.roles.delete permission)
 */
router.delete('/:id', authenticate, requirePermission('settings.roles.delete'), deleteRole);

/**
 * @route   POST /api/v1/roles/:id/permissions
 * @desc    Add permissions to role
 * @access  Private (requires settings.roles.update permission)
 */
router.post('/:id/permissions', authenticate, requirePermission('settings.roles.update'), addPermissionsToRole);

/**
 * @route   DELETE /api/v1/roles/:id/permissions/:permissionId
 * @desc    Remove permission from role
 * @access  Private (requires settings.roles.update permission)
 */
router.delete(
  '/:id/permissions/:permissionId',
  authenticate,
  requirePermission('settings.roles.update'),
  removePermissionFromRole
);

/**
 * @route   POST /api/v1/roles/:id/duplicate
 * @desc    Duplicate role
 * @access  Private (requires settings.roles.create permission)
 */
router.post('/:id/duplicate', authenticate, requirePermission('settings.roles.create'), duplicateRole);

/**
 * @route   GET /api/v1/roles/:id/users
 * @desc    Get users with this role
 * @access  Private (requires settings.roles.read and settings.users.read permissions)
 */
router.get('/:id/users', authenticate, requirePermission('settings.roles.read'), getRoleUsers);

export default router;

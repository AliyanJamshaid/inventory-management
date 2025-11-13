/**
 * Workflow Routes
 * Defines all workflow-related API endpoints
 */

import { Router } from 'express';
import {
  getAllWorkflows,
  getWorkflowById,
  getWorkflowForEntity,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  activateWorkflow,
  validateWorkflow,
  getAllowedTransitions,
  getStatusHistory,
  getWorkflowAnalytics,
  exportWorkflow,
  importWorkflow,
} from '../controllers/workflowController';
import { authenticate, isAdmin } from '../middleware/auth';
import { validateObjectId } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/workflows
 * @desc    Get all workflows with optional filtering
 * @access  Private
 */
router.get('/', getAllWorkflows);

/**
 * @route   GET /api/v1/workflows/entity/:entityType
 * @desc    Get active workflow for entity type
 * @access  Private
 */
router.get('/entity/:entityType', getWorkflowForEntity);

/**
 * @route   GET /api/v1/workflows/history/:entityType/:entityId
 * @desc    Get status history for an entity
 * @access  Private
 */
router.get('/history/:entityType/:entityId', getStatusHistory);

/**
 * @route   GET /api/v1/workflows/analytics/:entityType
 * @desc    Get workflow analytics for entity type
 * @access  Private
 */
router.get('/analytics/:entityType', getWorkflowAnalytics);

/**
 * @route   GET /api/v1/workflows/:entityType/:currentStatus/transitions
 * @desc    Get allowed transitions from current status
 * @access  Private
 */
router.get('/:entityType/:currentStatus/transitions', getAllowedTransitions);

/**
 * @route   GET /api/v1/workflows/:id
 * @desc    Get workflow by ID
 * @access  Private
 */
router.get('/:id', validateObjectId('id'), getWorkflowById);

/**
 * @route   GET /api/v1/workflows/:id/validate
 * @desc    Validate workflow logic
 * @access  Private
 */
router.get('/:id/validate', validateObjectId('id'), validateWorkflow);

/**
 * @route   GET /api/v1/workflows/:id/export
 * @desc    Export workflow as JSON
 * @access  Private
 */
router.get('/:id/export', validateObjectId('id'), exportWorkflow);

/**
 * @route   POST /api/v1/workflows
 * @desc    Create new workflow
 * @access  Private (Admin only)
 */
router.post('/', isAdmin, createWorkflow);

/**
 * @route   POST /api/v1/workflows/import
 * @desc    Import workflow from JSON
 * @access  Private (Admin only)
 */
router.post('/import', isAdmin, importWorkflow);

/**
 * @route   POST /api/v1/workflows/:id/activate
 * @desc    Activate workflow
 * @access  Private (Admin only)
 */
router.post('/:id/activate', validateObjectId('id'), isAdmin, activateWorkflow);

/**
 * @route   PUT /api/v1/workflows/:id
 * @desc    Update workflow
 * @access  Private (Admin only)
 */
router.put('/:id', validateObjectId('id'), isAdmin, updateWorkflow);

/**
 * @route   DELETE /api/v1/workflows/:id
 * @desc    Delete workflow
 * @access  Private (Admin only)
 */
router.delete('/:id', validateObjectId('id'), isAdmin, deleteWorkflow);

export default router;

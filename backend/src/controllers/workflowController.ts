/**
 * Workflow Controller
 * Handles all workflow definition and status history operations
 */

import { Response } from 'express';
import mongoose from 'mongoose';
import { IAuthRequest } from '../types';
import WorkflowDefinition from '../models/WorkflowDefinition';
import StatusHistory from '../models/StatusHistory';
import workflowEngine from '../services/workflowEngine';
import { WorkflowEntityType } from '../types/models';
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendBadRequest,
  sendInternalError,
  sendSuccessWithPagination,
} from '../utils/responses';
import { logError } from '../utils/logger';

/**
 * Get all workflows with optional filtering
 * @route GET /api/v1/workflows
 * @access Private
 */
export const getAllWorkflows = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { entityType, isActive, isDefault } = req.query;

    const filter: any = {};
    if (entityType) filter.entityType = entityType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isDefault !== undefined) filter.isDefault = isDefault === 'true';

    const workflows = await WorkflowDefinition.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, workflows, 'Workflows retrieved successfully');
  } catch (error: any) {
    logError('Error fetching workflows', { error: error.message });
    return sendInternalError(res, 'Failed to fetch workflows');
  }
};

/**
 * Get workflow by ID
 * @route GET /api/v1/workflows/:id
 * @access Private
 */
export const getWorkflowById = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendBadRequest(res, 'Invalid workflow ID');
    }

    const workflow = await WorkflowDefinition.findById(id).populate(
      'createdBy',
      'firstName lastName email'
    );

    if (!workflow) {
      return sendNotFound(res, 'Workflow not found');
    }

    return sendSuccess(res, workflow, 'Workflow retrieved successfully');
  } catch (error: any) {
    logError('Error fetching workflow', { error: error.message });
    return sendInternalError(res, 'Failed to fetch workflow');
  }
};

/**
 * Get active workflow for entity type
 * @route GET /api/v1/workflows/entity/:entityType
 * @access Private
 */
export const getWorkflowForEntity = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { entityType } = req.params;

    if (!Object.values(WorkflowEntityType).includes(entityType as WorkflowEntityType)) {
      return sendBadRequest(res, 'Invalid entity type');
    }

    const workflow = await WorkflowDefinition.getActiveWorkflow(
      entityType as WorkflowEntityType
    );

    if (!workflow) {
      return sendNotFound(res, `No active workflow found for ${entityType}`);
    }

    return sendSuccess(res, workflow, 'Workflow retrieved successfully');
  } catch (error: any) {
    logError('Error fetching workflow for entity', { error: error.message });
    return sendInternalError(res, 'Failed to fetch workflow');
  }
};

/**
 * Create new workflow
 * @route POST /api/v1/workflows
 * @access Private (Admin only)
 */
export const createWorkflow = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { name, entityType, statuses, transitions, isDefault } = req.body;

    if (!name || !entityType || !statuses) {
      return sendBadRequest(res, 'Name, entity type, and statuses are required');
    }

    // Check if there's already an active workflow for this entity type
    const existingActiveWorkflow = await WorkflowDefinition.findOne({
      entityType,
      isActive: true,
    });

    const workflow = await WorkflowDefinition.create({
      name,
      entityType,
      statuses,
      transitions: transitions || [],
      isActive: !existingActiveWorkflow, // Activate if no active workflow exists
      isDefault: isDefault || false,
      createdBy: req.user!._id,
    });

    return sendCreated(res, workflow, 'Workflow created successfully');
  } catch (error: any) {
    logError('Error creating workflow', { error: error.message });

    if (error.message.includes('must have at least one')) {
      return sendBadRequest(res, error.message);
    }

    if (error.message.includes('Status keys must be unique')) {
      return sendBadRequest(res, error.message);
    }

    if (error.message.includes('Invalid transition')) {
      return sendBadRequest(res, error.message);
    }

    return sendInternalError(res, 'Failed to create workflow');
  }
};

/**
 * Update workflow
 * @route PUT /api/v1/workflows/:id
 * @access Private (Admin only)
 */
export const updateWorkflow = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, statuses, transitions, isDefault } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendBadRequest(res, 'Invalid workflow ID');
    }

    const workflow = await WorkflowDefinition.findById(id);

    if (!workflow) {
      return sendNotFound(res, 'Workflow not found');
    }

    // Update fields
    if (name) workflow.name = name;
    if (statuses) workflow.statuses = statuses;
    if (transitions) workflow.transitions = transitions;
    if (isDefault !== undefined) workflow.isDefault = isDefault;

    await workflow.save();

    return sendSuccess(res, workflow, 'Workflow updated successfully');
  } catch (error: any) {
    logError('Error updating workflow', { error: error.message });

    if (error.message.includes('must have at least one')) {
      return sendBadRequest(res, error.message);
    }

    if (error.message.includes('Status keys must be unique')) {
      return sendBadRequest(res, error.message);
    }

    if (error.message.includes('Invalid transition')) {
      return sendBadRequest(res, error.message);
    }

    return sendInternalError(res, 'Failed to update workflow');
  }
};

/**
 * Delete workflow
 * @route DELETE /api/v1/workflows/:id
 * @access Private (Admin only)
 */
export const deleteWorkflow = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendBadRequest(res, 'Invalid workflow ID');
    }

    const workflow = await WorkflowDefinition.findById(id);

    if (!workflow) {
      return sendNotFound(res, 'Workflow not found');
    }

    // Prevent deletion of active workflow
    if (workflow.isActive) {
      return sendBadRequest(
        res,
        'Cannot delete active workflow. Please deactivate it first.'
      );
    }

    await workflow.deleteOne();

    return sendSuccess(res, null, 'Workflow deleted successfully');
  } catch (error: any) {
    logError('Error deleting workflow', { error: error.message });
    return sendInternalError(res, 'Failed to delete workflow');
  }
};

/**
 * Activate workflow
 * @route POST /api/v1/workflows/:id/activate
 * @access Private (Admin only)
 */
export const activateWorkflow = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendBadRequest(res, 'Invalid workflow ID');
    }

    // Validate workflow before activation
    const validation = await workflowEngine.validateWorkflowForActivation(
      new mongoose.Types.ObjectId(id)
    );

    if (!validation.canActivate) {
      return sendBadRequest(res, 'Workflow validation failed', {
        errors: validation.errors,
        warnings: validation.warnings,
      });
    }

    const workflow = await WorkflowDefinition.activateWorkflow(
      new mongoose.Types.ObjectId(id)
    );

    return sendSuccess(
      res,
      {
        workflow,
        warnings: validation.warnings,
      },
      'Workflow activated successfully'
    );
  } catch (error: any) {
    logError('Error activating workflow', { error: error.message });
    return sendInternalError(res, error.message || 'Failed to activate workflow');
  }
};

/**
 * Validate workflow
 * @route GET /api/v1/workflows/:id/validate
 * @access Private
 */
export const validateWorkflow = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendBadRequest(res, 'Invalid workflow ID');
    }

    const workflow = await WorkflowDefinition.findById(id);

    if (!workflow) {
      return sendNotFound(res, 'Workflow not found');
    }

    const validation = workflow.validateWorkflow();

    return sendSuccess(res, validation, 'Workflow validated successfully');
  } catch (error: any) {
    logError('Error validating workflow', { error: error.message });
    return sendInternalError(res, 'Failed to validate workflow');
  }
};

/**
 * Get allowed transitions for entity
 * @route GET /api/v1/workflows/:entityType/:currentStatus/transitions
 * @access Private
 */
export const getAllowedTransitions = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { entityType, currentStatus } = req.params;

    if (!Object.values(WorkflowEntityType).includes(entityType as WorkflowEntityType)) {
      return sendBadRequest(res, 'Invalid entity type');
    }

    const transitions = await workflowEngine.getAllowedTransitions(
      entityType as WorkflowEntityType,
      currentStatus,
      req.user?.role
    );

    return sendSuccess(res, transitions, 'Allowed transitions retrieved successfully');
  } catch (error: any) {
    logError('Error fetching allowed transitions', { error: error.message });
    return sendInternalError(res, 'Failed to fetch allowed transitions');
  }
};

/**
 * Get status history for entity
 * @route GET /api/v1/workflows/history/:entityType/:entityId
 * @access Private
 */
export const getStatusHistory = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { entityType, entityId } = req.params;

    if (!Object.values(WorkflowEntityType).includes(entityType as WorkflowEntityType)) {
      return sendBadRequest(res, 'Invalid entity type');
    }

    if (!mongoose.Types.ObjectId.isValid(entityId)) {
      return sendBadRequest(res, 'Invalid entity ID');
    }

    const history = await StatusHistory.getEntityHistory(
      entityType as WorkflowEntityType,
      new mongoose.Types.ObjectId(entityId)
    );

    return sendSuccess(res, history, 'Status history retrieved successfully');
  } catch (error: any) {
    logError('Error fetching status history', { error: error.message });
    return sendInternalError(res, 'Failed to fetch status history');
  }
};

/**
 * Get workflow analytics
 * @route GET /api/v1/workflows/analytics/:entityType
 * @access Private
 */
export const getWorkflowAnalytics = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { entityType } = req.params;
    const { startDate, endDate } = req.query;

    if (!Object.values(WorkflowEntityType).includes(entityType as WorkflowEntityType)) {
      return sendBadRequest(res, 'Invalid entity type');
    }

    const analytics = await workflowEngine.getWorkflowAnalytics(
      entityType as WorkflowEntityType,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    return sendSuccess(res, analytics, 'Workflow analytics retrieved successfully');
  } catch (error: any) {
    logError('Error fetching workflow analytics', { error: error.message });
    return sendInternalError(res, 'Failed to fetch workflow analytics');
  }
};

/**
 * Export workflow as JSON
 * @route GET /api/v1/workflows/:id/export
 * @access Private
 */
export const exportWorkflow = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendBadRequest(res, 'Invalid workflow ID');
    }

    const workflow = await WorkflowDefinition.findById(id);

    if (!workflow) {
      return sendNotFound(res, 'Workflow not found');
    }

    // Remove MongoDB-specific fields
    const exportData = {
      name: workflow.name,
      entityType: workflow.entityType,
      statuses: workflow.statuses,
      transitions: workflow.transitions,
      version: '1.0',
      exportedAt: new Date().toISOString(),
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="workflow-${workflow.name.replace(/\s+/g, '-').toLowerCase()}.json"`
    );

    return res.status(200).json(exportData);
  } catch (error: any) {
    logError('Error exporting workflow', { error: error.message });
    return sendInternalError(res, 'Failed to export workflow');
  }
};

/**
 * Import workflow from JSON
 * @route POST /api/v1/workflows/import
 * @access Private (Admin only)
 */
export const importWorkflow = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { name, entityType, statuses, transitions } = req.body;

    if (!name || !entityType || !statuses) {
      return sendBadRequest(res, 'Invalid workflow data');
    }

    // Check if there's already an active workflow for this entity type
    const existingActiveWorkflow = await WorkflowDefinition.findOne({
      entityType,
      isActive: true,
    });

    const workflow = await WorkflowDefinition.create({
      name,
      entityType,
      statuses,
      transitions: transitions || [],
      isActive: !existingActiveWorkflow,
      isDefault: false,
      createdBy: req.user!._id,
    });

    return sendCreated(res, workflow, 'Workflow imported successfully');
  } catch (error: any) {
    logError('Error importing workflow', { error: error.message });
    return sendInternalError(res, 'Failed to import workflow');
  }
};

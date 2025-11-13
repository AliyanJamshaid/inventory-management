import mongoose from 'mongoose';
import WorkflowDefinition from '../models/WorkflowDefinition';
import StatusHistory from '../models/StatusHistory';
import { WorkflowEntityType, IWorkflowTransition, UserRole } from '../types/models';
import axios from 'axios';

/**
 * Workflow Engine Service
 * Handles workflow execution, transitions, and validations
 */
class WorkflowEngine {
  /**
   * Get active workflow for entity type
   * @param entityType - Entity type
   * @returns Active workflow definition
   */
  async getActiveWorkflow(entityType: WorkflowEntityType) {
    const workflow = await WorkflowDefinition.getActiveWorkflow(entityType);
    if (!workflow) {
      throw new Error(`No active workflow found for entity type: ${entityType}`);
    }
    return workflow;
  }

  /**
   * Get allowed transitions from current status
   * @param entityType - Entity type
   * @param currentStatus - Current status key
   * @param userRole - User role
   * @returns Array of allowed transitions
   */
  async getAllowedTransitions(
    entityType: WorkflowEntityType,
    currentStatus: string,
    userRole?: UserRole
  ): Promise<IWorkflowTransition[]> {
    const workflow = await this.getActiveWorkflow(entityType);
    const transitions = workflow.getAllowedTransitions(currentStatus);

    // Filter transitions based on user permissions
    if (userRole) {
      return transitions.filter((transition) => {
        if (!transition.requiresPermission || transition.requiresPermission.length === 0) {
          return true;
        }
        return transition.requiresPermission.includes(userRole);
      });
    }

    return transitions;
  }

  /**
   * Get next possible statuses from current status
   * @param entityType - Entity type
   * @param currentStatus - Current status key
   * @param userRole - User role
   * @returns Array of status keys
   */
  async getNextStatuses(
    entityType: WorkflowEntityType,
    currentStatus: string,
    userRole?: UserRole
  ): Promise<string[]> {
    const transitions = await this.getAllowedTransitions(entityType, currentStatus, userRole);
    return transitions.map((t) => t.to);
  }

  /**
   * Validate if a transition is allowed
   * @param entityType - Entity type
   * @param fromStatus - Current status
   * @param toStatus - Desired status
   * @param userRole - User role
   * @param entity - Entity object (for condition evaluation)
   * @returns Boolean indicating if transition is allowed
   */
  async canTransition(
    entityType: WorkflowEntityType,
    fromStatus: string,
    toStatus: string,
    userRole?: UserRole,
    entity?: any
  ): Promise<{
    allowed: boolean;
    reason?: string;
    transition?: IWorkflowTransition;
  }> {
    const workflow = await this.getActiveWorkflow(entityType);
    const transition = workflow.transitions.find(
      (t) => t.from === fromStatus && t.to === toStatus
    );

    if (!transition) {
      return {
        allowed: false,
        reason: `No transition exists from "${fromStatus}" to "${toStatus}"`,
      };
    }

    // Check permissions
    if (
      userRole &&
      transition.requiresPermission &&
      transition.requiresPermission.length > 0 &&
      !transition.requiresPermission.includes(userRole)
    ) {
      return {
        allowed: false,
        reason: 'Insufficient permissions for this transition',
        transition,
      };
    }

    // Check conditions
    if (transition.conditions && entity) {
      const conditionsMet = await this.evaluateConditions(transition.conditions, entity);
      if (!conditionsMet) {
        return {
          allowed: false,
          reason: 'Transition conditions not met',
          transition,
        };
      }
    }

    return {
      allowed: true,
      transition,
    };
  }

  /**
   * Execute a status transition
   * @param entityType - Entity type
   * @param entityId - Entity ID
   * @param fromStatus - Current status
   * @param toStatus - New status
   * @param userId - User performing the transition
   * @param notes - Optional notes
   * @param metadata - Optional metadata
   * @returns Status history record
   */
  async executeTransition(
    entityType: WorkflowEntityType,
    entityId: mongoose.Types.ObjectId,
    fromStatus: string,
    toStatus: string,
    userId: mongoose.Types.ObjectId,
    notes?: string,
    metadata?: any
  ) {
    const workflow = await this.getActiveWorkflow(entityType);

    // Validate transition exists
    const transition = workflow.transitions.find(
      (t) => t.from === fromStatus && t.to === toStatus
    );

    if (!transition) {
      throw new Error(`Invalid transition from "${fromStatus}" to "${toStatus}"`);
    }

    // Record status change
    const statusHistory = await StatusHistory.recordStatusChange({
      entityType,
      entityId,
      fromStatus,
      toStatus,
      changedBy: userId,
      notes,
      metadata,
    });

    // Trigger webhook if configured
    if (transition.webhookUrl) {
      await this.triggerWebhook(transition.webhookUrl, {
        entityType,
        entityId,
        fromStatus,
        toStatus,
        userId,
        notes,
        timestamp: new Date(),
      }).catch((error) => {
        console.error('Webhook trigger failed:', error);
        // Don't fail the transition if webhook fails
      });
    }

    // Send email notification if configured
    if (transition.emailNotification) {
      await this.sendNotification({
        entityType,
        entityId,
        fromStatus,
        toStatus,
        userId,
        transition,
      }).catch((error) => {
        console.error('Email notification failed:', error);
        // Don't fail the transition if notification fails
      });
    }

    return statusHistory;
  }

  /**
   * Trigger webhook for a transition
   * @param webhookUrl - Webhook URL
   * @param data - Transition data
   */
  private async triggerWebhook(webhookUrl: string, data: any) {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await axios.post(
          webhookUrl,
          {
            event: 'status_transition',
            data,
          },
          {
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'InventoryPro-Workflow-Engine/1.0',
            },
          }
        );

        console.log(`Webhook triggered successfully: ${webhookUrl}`, response.status);
        return response.data;
      } catch (error: any) {
        attempt++;
        console.error(
          `Webhook trigger attempt ${attempt} failed:`,
          error.message
        );

        if (attempt >= maxRetries) {
          throw error;
        }

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  /**
   * Send notification for a transition
   * @param data - Notification data
   */
  private async sendNotification(data: {
    entityType: WorkflowEntityType;
    entityId: mongoose.Types.ObjectId;
    fromStatus: string;
    toStatus: string;
    userId: mongoose.Types.ObjectId;
    transition: IWorkflowTransition;
  }) {
    // This is a placeholder - implement actual notification logic
    // Could integrate with email service, push notifications, etc.
    console.log('Sending notification for transition:', data);

    // Example: Create a notification in the database
    const Notification = mongoose.model('Notification');
    await Notification.create({
      user: data.userId,
      type: 'ORDER_STATUS',
      title: `Status Changed: ${data.transition.label}`,
      message: `Status changed from "${data.fromStatus}" to "${data.toStatus}"`,
      link: `/${data.entityType}/${data.entityId}`,
    });
  }

  /**
   * Evaluate transition conditions
   * @param conditions - Conditions object
   * @param entity - Entity object
   * @returns Boolean indicating if conditions are met
   */
  private async evaluateConditions(conditions: any, entity: any): Promise<boolean> {
    if (!conditions) return true;

    try {
      // Simple condition evaluation
      // Format: { field: 'total', operator: 'gt', value: 1000 }
      // Or: { field: 'items.length', operator: 'gte', value: 1 }

      if (conditions.field && conditions.operator && conditions.value !== undefined) {
        const fieldValue = this.getNestedValue(entity, conditions.field);

        switch (conditions.operator) {
          case 'eq':
            return fieldValue === conditions.value;
          case 'ne':
            return fieldValue !== conditions.value;
          case 'gt':
            return fieldValue > conditions.value;
          case 'gte':
            return fieldValue >= conditions.value;
          case 'lt':
            return fieldValue < conditions.value;
          case 'lte':
            return fieldValue <= conditions.value;
          case 'in':
            return Array.isArray(conditions.value) && conditions.value.includes(fieldValue);
          case 'nin':
            return Array.isArray(conditions.value) && !conditions.value.includes(fieldValue);
          default:
            return true;
        }
      }

      // Support multiple conditions with AND/OR logic
      if (conditions.and && Array.isArray(conditions.and)) {
        for (const cond of conditions.and) {
          if (!(await this.evaluateConditions(cond, entity))) {
            return false;
          }
        }
        return true;
      }

      if (conditions.or && Array.isArray(conditions.or)) {
        for (const cond of conditions.or) {
          if (await this.evaluateConditions(cond, entity)) {
            return true;
          }
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error evaluating conditions:', error);
      return false;
    }
  }

  /**
   * Get nested value from object using dot notation
   * @param obj - Object
   * @param path - Path string (e.g., 'items.length')
   * @returns Value at path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  /**
   * Get workflow analytics
   * @param entityType - Entity type
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Workflow analytics
   */
  async getWorkflowAnalytics(
    entityType: WorkflowEntityType,
    startDate?: Date,
    endDate?: Date
  ) {
    const workflow = await this.getActiveWorkflow(entityType);

    // Get status distribution
    const statusDistribution = await StatusHistory.getStatusDistribution(
      entityType,
      startDate,
      endDate
    );

    // Get transition analytics
    const transitionAnalytics = await StatusHistory.getTransitionAnalytics(
      entityType,
      startDate,
      endDate
    );

    // Get average duration for each status
    const statusDurations = await Promise.all(
      workflow.statuses.map(async (status) => {
        const avgData = await StatusHistory.getAverageDuration(entityType, status.key);
        return {
          status: status.key,
          label: status.label,
          ...avgData,
        };
      })
    );

    return {
      workflow: {
        id: workflow._id,
        name: workflow.name,
        entityType: workflow.entityType,
      },
      statusDistribution,
      transitionAnalytics,
      statusDurations: statusDurations.filter((d) => d.avgDuration !== null),
    };
  }

  /**
   * Get entities currently in a specific status
   * @param entityType - Entity type
   * @param statusKey - Status key
   * @returns Array of entity IDs with timestamps
   */
  async getEntitiesInStatus(entityType: WorkflowEntityType, statusKey: string) {
    return await StatusHistory.getEntitiesInStatus(entityType, statusKey);
  }

  /**
   * Validate workflow before activation
   * @param workflowId - Workflow ID
   * @returns Validation result
   */
  async validateWorkflowForActivation(workflowId: mongoose.Types.ObjectId) {
    const workflow = await WorkflowDefinition.findById(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const validation = workflow.validateWorkflow();

    if (!validation.isValid) {
      return {
        canActivate: false,
        errors: validation.errors,
        warnings: validation.warnings,
      };
    }

    return {
      canActivate: true,
      errors: [],
      warnings: validation.warnings,
    };
  }

  /**
   * Get initial status for a workflow
   * @param entityType - Entity type
   * @returns Initial status key
   */
  async getInitialStatus(entityType: WorkflowEntityType): Promise<string> {
    const workflow = await this.getActiveWorkflow(entityType);
    const initialStatus = workflow.getInitialStatus();

    if (!initialStatus) {
      throw new Error('No initial status found in workflow');
    }

    return initialStatus.key;
  }

  /**
   * Check if status is a final status
   * @param entityType - Entity type
   * @param statusKey - Status key
   * @returns Boolean indicating if status is final
   */
  async isFinalStatus(entityType: WorkflowEntityType, statusKey: string): Promise<boolean> {
    const workflow = await this.getActiveWorkflow(entityType);
    const status = workflow.getStatusByKey(statusKey);
    return status?.isFinal || false;
  }
}

// Export singleton instance
export default new WorkflowEngine();

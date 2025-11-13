import mongoose, { Schema } from 'mongoose';
import { IWorkflowDefinition, WorkflowEntityType } from '../types/models';

/**
 * Workflow Status Schema
 */
const workflowStatusSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      default: '#6B7280',
    },
    icon: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isInitial: {
      type: Boolean,
      default: false,
    },
    isFinal: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    actions: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

/**
 * Workflow Transition Schema
 */
const workflowTransitionSchema = new Schema(
  {
    from: {
      type: String,
      required: true,
      trim: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    requiresPermission: {
      type: [String],
      default: [],
    },
    requiresConfirmation: {
      type: Boolean,
      default: false,
    },
    confirmationMessage: {
      type: String,
      trim: true,
    },
    webhookUrl: {
      type: String,
      trim: true,
    },
    emailNotification: {
      type: Boolean,
      default: false,
    },
    conditions: {
      type: Schema.Types.Mixed,
    },
  },
  { _id: false }
);

/**
 * Workflow Definition Schema
 * Manages custom status workflows for different entity types
 */
const workflowDefinitionSchema = new Schema<IWorkflowDefinition>(
  {
    /**
     * Workflow name
     */
    name: {
      type: String,
      required: [true, 'Workflow name is required'],
      trim: true,
      maxlength: [100, 'Workflow name cannot exceed 100 characters'],
    },

    /**
     * Entity type this workflow applies to
     */
    entityType: {
      type: String,
      enum: Object.values(WorkflowEntityType),
      required: [true, 'Entity type is required'],
    },

    /**
     * Workflow statuses
     */
    statuses: {
      type: [workflowStatusSchema],
      required: true,
      validate: {
        validator: function (statuses: any[]) {
          return statuses && statuses.length > 0;
        },
        message: 'At least one status is required',
      },
    },

    /**
     * Workflow transitions
     */
    transitions: {
      type: [workflowTransitionSchema],
      default: [],
    },

    /**
     * Whether workflow is active
     */
    isActive: {
      type: Boolean,
      default: false,
    },

    /**
     * Whether workflow is default for entity type
     */
    isDefault: {
      type: Boolean,
      default: false,
    },

    /**
     * User who created the workflow
     */
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
workflowDefinitionSchema.index({ entityType: 1, isActive: 1 });
workflowDefinitionSchema.index({ entityType: 1, isDefault: 1 });
workflowDefinitionSchema.index({ createdBy: 1 });

/**
 * Pre-save middleware to validate workflow integrity
 */
workflowDefinitionSchema.pre('save', function (next) {
  try {
    // Validate at least one initial status
    const initialStatuses = this.statuses.filter((s) => s.isInitial);
    if (initialStatuses.length === 0) {
      throw new Error('Workflow must have at least one initial status');
    }

    // Validate at least one final status
    const finalStatuses = this.statuses.filter((s) => s.isFinal);
    if (finalStatuses.length === 0) {
      throw new Error('Workflow must have at least one final status');
    }

    // Validate status keys are unique
    const statusKeys = this.statuses.map((s) => s.key);
    const uniqueKeys = new Set(statusKeys);
    if (statusKeys.length !== uniqueKeys.size) {
      throw new Error('Status keys must be unique');
    }

    // Validate all transitions reference valid statuses
    const validKeys = new Set(statusKeys);
    for (const transition of this.transitions) {
      if (!validKeys.has(transition.from)) {
        throw new Error(`Invalid transition: status "${transition.from}" does not exist`);
      }
      if (!validKeys.has(transition.to)) {
        throw new Error(`Invalid transition: status "${transition.to}" does not exist`);
      }
    }

    // Validate no orphaned statuses (except initial and final)
    const statusesInTransitions = new Set<string>();
    this.transitions.forEach((t) => {
      statusesInTransitions.add(t.from);
      statusesInTransitions.add(t.to);
    });

    const orphanedStatuses = this.statuses.filter(
      (s) =>
        !s.isInitial &&
        !s.isFinal &&
        !statusesInTransitions.has(s.key)
    );

    if (orphanedStatuses.length > 0 && this.transitions.length > 0) {
      const orphanedKeys = orphanedStatuses.map((s) => s.key).join(', ');
      console.warn(
        `Warning: Orphaned statuses found (not connected to any transition): ${orphanedKeys}`
      );
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

/**
 * Static method to get active workflow for entity type
 * @param entityType - Entity type
 * @returns Active workflow definition
 */
workflowDefinitionSchema.statics.getActiveWorkflow = function (
  entityType: WorkflowEntityType
) {
  return this.findOne({ entityType, isActive: true });
};

/**
 * Static method to get default workflow for entity type
 * @param entityType - Entity type
 * @returns Default workflow definition
 */
workflowDefinitionSchema.statics.getDefaultWorkflow = function (
  entityType: WorkflowEntityType
) {
  return this.findOne({ entityType, isDefault: true });
};

/**
 * Static method to activate workflow
 * Deactivates all other workflows for the same entity type
 * @param workflowId - Workflow ID to activate
 * @returns Activated workflow
 */
workflowDefinitionSchema.statics.activateWorkflow = async function (
  workflowId: mongoose.Types.ObjectId
) {
  const workflow = await this.findById(workflowId);
  if (!workflow) {
    throw new Error('Workflow not found');
  }

  // Deactivate all other workflows for this entity type
  await this.updateMany(
    { entityType: workflow.entityType, _id: { $ne: workflowId } },
    { isActive: false }
  );

  // Activate this workflow
  workflow.isActive = true;
  return await workflow.save();
};

/**
 * Instance method to validate workflow logic
 * @returns Validation result with errors if any
 */
workflowDefinitionSchema.methods.validateWorkflow = function () {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for circular transitions
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const hasCycle = (status: string): boolean => {
    if (!visited.has(status)) {
      visited.add(status);
      recursionStack.add(status);

      const outgoingTransitions = this.transitions.filter((t: any) => t.from === status);

      for (const transition of outgoingTransitions) {
        if (!visited.has(transition.to) && hasCycle(transition.to)) {
          return true;
        } else if (recursionStack.has(transition.to)) {
          return true;
        }
      }
    }
    recursionStack.delete(status);
    return false;
  };

  // Check for cycles from each initial status
  const initialStatuses = this.statuses.filter((s: any) => s.isInitial);
  for (const status of initialStatuses) {
    if (hasCycle(status.key)) {
      warnings.push(`Circular transition path detected from status "${status.key}"`);
      break;
    }
  }

  // Check for unreachable final statuses
  const reachableStatuses = new Set<string>();
  const queue: string[] = initialStatuses.map((s: any) => s.key);

  while (queue.length > 0) {
    const current = queue.shift()!;
    reachableStatuses.add(current);

    const nextTransitions = this.transitions.filter((t: any) => t.from === current);
    for (const transition of nextTransitions) {
      if (!reachableStatuses.has(transition.to)) {
        queue.push(transition.to);
      }
    }
  }

  const unreachableFinalStatuses = this.statuses.filter(
    (s: any) => s.isFinal && !reachableStatuses.has(s.key)
  );

  if (unreachableFinalStatuses.length > 0) {
    const unreachableKeys = unreachableFinalStatuses.map((s: any) => s.key).join(', ');
    warnings.push(`Unreachable final statuses: ${unreachableKeys}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Instance method to get initial status
 * @returns Initial status object
 */
workflowDefinitionSchema.methods.getInitialStatus = function () {
  return this.statuses.find((s: any) => s.isInitial);
};

/**
 * Instance method to get status by key
 * @param key - Status key
 * @returns Status object
 */
workflowDefinitionSchema.methods.getStatusByKey = function (key: string) {
  return this.statuses.find((s: any) => s.key === key);
};

/**
 * Instance method to get allowed transitions from a status
 * @param statusKey - Current status key
 * @returns Array of allowed transitions
 */
workflowDefinitionSchema.methods.getAllowedTransitions = function (statusKey: string) {
  return this.transitions.filter((t: any) => t.from === statusKey);
};

const WorkflowDefinition = mongoose.model<IWorkflowDefinition>(
  'WorkflowDefinition',
  workflowDefinitionSchema
);

export default WorkflowDefinition;

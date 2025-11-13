/**
 * Workflow Type Definitions
 * Types for custom workflow system
 */

/**
 * Workflow Entity Type
 */
export enum WorkflowEntityType {
  SALES_ORDER = 'sales_order',
  PURCHASE_ORDER = 'purchase_order',
  INVOICE = 'invoice',
  RETURN = 'return',
  CUSTOM = 'custom',
}

/**
 * Workflow Status
 */
export interface WorkflowStatus {
  key: string;
  label: string;
  color: string;
  icon?: string;
  description?: string;
  isInitial: boolean;
  isFinal: boolean;
  order: number;
  actions?: string[];
}

/**
 * Workflow Transition
 */
export interface WorkflowTransition {
  from: string;
  to: string;
  label: string;
  requiresPermission?: string[];
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  webhookUrl?: string;
  emailNotification?: boolean;
  conditions?: any;
}

/**
 * Workflow Definition
 */
export interface WorkflowDefinition {
  _id: string;
  name: string;
  entityType: WorkflowEntityType;
  statuses: WorkflowStatus[];
  transitions: WorkflowTransition[];
  isActive: boolean;
  isDefault: boolean;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Status History Entry
 */
export interface StatusHistory {
  _id: string;
  entityType: WorkflowEntityType;
  entityId: string;
  fromStatus?: string;
  toStatus: string;
  changedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  changedAt: string;
  notes?: string;
  metadata?: any;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Workflow Validation Result
 */
export interface WorkflowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Workflow Analytics
 */
export interface WorkflowAnalytics {
  workflow: {
    id: string;
    name: string;
    entityType: WorkflowEntityType;
  };
  statusDistribution: {
    status: string;
    count: number;
    lastChanged: string;
  }[];
  transitionAnalytics: {
    from: string;
    to: string;
    count: number;
    avgDuration: number;
  }[];
  statusDurations: {
    status: string;
    label: string;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    count: number;
  }[];
}

/**
 * Create Workflow DTO
 */
export interface CreateWorkflowDTO {
  name: string;
  entityType: WorkflowEntityType;
  statuses: Omit<WorkflowStatus, 'order'>[];
  transitions?: WorkflowTransition[];
  isDefault?: boolean;
}

/**
 * Update Workflow DTO
 */
export interface UpdateWorkflowDTO {
  name?: string;
  statuses?: WorkflowStatus[];
  transitions?: WorkflowTransition[];
  isDefault?: boolean;
}

/**
 * Execute Transition DTO
 */
export interface ExecuteTransitionDTO {
  entityType: WorkflowEntityType;
  entityId: string;
  fromStatus: string;
  toStatus: string;
  notes?: string;
  metadata?: any;
}

/**
 * Can Transition Result
 */
export interface CanTransitionResult {
  allowed: boolean;
  reason?: string;
  transition?: WorkflowTransition;
}

/**
 * Workflow Template
 */
export interface WorkflowTemplate {
  name: string;
  description: string;
  entityType: WorkflowEntityType;
  industry: string;
  statuses: WorkflowStatus[];
  transitions: WorkflowTransition[];
  tags: string[];
}

/**
 * Node Position for Visual Designer
 */
export interface NodePosition {
  x: number;
  y: number;
}

/**
 * Workflow Node (for React Flow)
 */
export interface WorkflowNode {
  id: string;
  type: 'status';
  position: NodePosition;
  data: {
    status: WorkflowStatus;
    isInitial: boolean;
    isFinal: boolean;
  };
}

/**
 * Workflow Edge (for React Flow)
 */
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type: 'smoothstep';
  animated?: boolean;
  label?: string;
  data: {
    transition: WorkflowTransition;
  };
}

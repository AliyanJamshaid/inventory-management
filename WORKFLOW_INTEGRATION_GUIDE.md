# Workflow System Integration Guide

This guide shows how to integrate the custom workflow system into your existing order pages.

## Example: Integrating Workflows into Sales Order Detail Page

### Before (Hardcoded Status)

```tsx
// Old approach with hardcoded status badges
import { Badge } from '@/components/ui/badge';

export default function SalesOrderDetailPage({ params }: { params: { id: string } }) {
  const { data: order } = useSalesOrder(params.id);

  return (
    <div>
      <Badge>{order.status}</Badge>

      {/* Hardcoded action buttons */}
      <Button onClick={handleConfirm}>Confirm</Button>
      <Button onClick={handleShip}>Ship</Button>
      <Button onClick={handleCancel}>Cancel</Button>
    </div>
  );
}
```

### After (Dynamic Workflow)

```tsx
// New approach with dynamic workflows
import { DynamicStatusBadge } from '@/components/features/workflows/DynamicStatusBadge';
import { WorkflowActionButtons } from '@/components/features/workflows/WorkflowActionButtons';
import { StatusHistoryTimeline } from '@/components/features/workflows/StatusHistoryTimeline';
import { WorkflowEntityType } from '@/types/workflow';

export default function SalesOrderDetailPage({ params }: { params: { id: string } }) {
  const { data: order } = useSalesOrder(params.id);
  const updateSO = useUpdateSO();

  const handleStatusTransition = async (toStatus: string, notes?: string) => {
    await updateSO.mutateAsync({
      id: params.id,
      data: { status: toStatus, notes },
    });
  };

  return (
    <div>
      {/* Dynamic status badge based on workflow configuration */}
      <DynamicStatusBadge
        entityType={WorkflowEntityType.SALES_ORDER}
        status={order.status}
        showIcon={true}
      />

      {/* Dynamic action buttons based on allowed transitions */}
      <WorkflowActionButtons
        entityType={WorkflowEntityType.SALES_ORDER}
        currentStatus={order.status}
        entity={order}
        onTransition={handleStatusTransition}
      />

      {/* Status history timeline */}
      <StatusHistoryTimeline
        entityType={WorkflowEntityType.SALES_ORDER}
        entityId={order._id}
      />
    </div>
  );
}
```

## Backend Integration Example

### Updating Sales Order Model to Use Workflows

```typescript
// backend/src/models/SalesOrder.ts

import WorkflowDefinition from './WorkflowDefinition';
import StatusHistory from './StatusHistory';
import workflowEngine from '../services/workflowEngine';
import { WorkflowEntityType } from '../types/models';

// Add workflow field to schema
const salesOrderSchema = new Schema<ISalesOrder>(
  {
    // ... existing fields ...

    /**
     * Reference to workflow definition
     */
    workflowId: {
      type: Schema.Types.ObjectId,
      ref: 'WorkflowDefinition',
    },

    // status field remains the same
    status: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add pre-save hook to validate status transitions
salesOrderSchema.pre('save', async function (next) {
  try {
    // Only validate on status change
    if (this.isModified('status') && !this.isNew) {
      const previousStatus = this.get('status', null, { getters: false });

      if (previousStatus && previousStatus !== this.status) {
        // Get active workflow
        const workflow = await WorkflowDefinition.getActiveWorkflow(
          WorkflowEntityType.SALES_ORDER
        );

        if (workflow) {
          // Validate transition is allowed
          const isValid = workflow.transitions.some(
            (t) => t.from === previousStatus && t.to === this.status
          );

          if (!isValid) {
            throw new Error(
              `Invalid status transition from "${previousStatus}" to "${this.status}"`
            );
          }
        }
      }
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

// Add post-save hook to record status history
salesOrderSchema.post('save', async function (doc) {
  try {
    const previousStatus = doc.get('status', null, { getters: false });

    if (doc.isModified('status')) {
      await StatusHistory.recordStatusChange({
        entityType: WorkflowEntityType.SALES_ORDER,
        entityId: doc._id,
        fromStatus: previousStatus,
        toStatus: doc.status,
        changedBy: doc.processedBy || doc.createdBy,
        metadata: {
          orderId: doc._id,
          soNumber: doc.soNumber,
        },
      });
    }
  } catch (error) {
    console.error('Failed to record status history:', error);
    // Don't fail the save if history recording fails
  }
});

// Add instance method for transitioning status with workflow validation
salesOrderSchema.methods.transition = async function (
  toStatus: string,
  userId: mongoose.Types.ObjectId,
  notes?: string
) {
  const fromStatus = this.status;

  // Execute transition through workflow engine
  await workflowEngine.executeTransition(
    WorkflowEntityType.SALES_ORDER,
    this._id,
    fromStatus,
    toStatus,
    userId,
    notes
  );

  // Update status
  this.status = toStatus;
  this.processedBy = userId;

  return await this.save();
};

export default SalesOrder;
```

### Updating Sales Order Controller

```typescript
// backend/src/controllers/salesOrderController.ts

import workflowEngine from '../services/workflowEngine';
import { WorkflowEntityType } from '../types/models';

/**
 * Transition sales order status
 * @route POST /api/v1/sales-orders/:id/transition
 * @access Private
 */
export const transitionSalesOrder = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { toStatus, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendBadRequest(res, 'Invalid sales order ID');
    }

    const salesOrder = await SalesOrder.findById(id);

    if (!salesOrder) {
      return sendNotFound(res, 'Sales order not found');
    }

    // Validate transition is allowed
    const canTransition = await workflowEngine.canTransition(
      WorkflowEntityType.SALES_ORDER,
      salesOrder.status,
      toStatus,
      req.user!.role,
      salesOrder
    );

    if (!canTransition.allowed) {
      return sendBadRequest(res, canTransition.reason || 'Transition not allowed');
    }

    // Execute transition
    await salesOrder.transition(toStatus, req.user!._id, notes);

    return sendSuccess(res, salesOrder, 'Sales order status updated successfully');
  } catch (error: any) {
    logError('Error transitioning sales order', { error: error.message });
    return sendInternalError(res, error.message || 'Failed to update status');
  }
};
```

### Add Route

```typescript
// backend/src/routes/salesOrderRoutes.ts

/**
 * @route   POST /api/v1/sales-orders/:id/transition
 * @desc    Transition sales order status
 * @access  Private
 */
router.post(
  '/:id/transition',
  validateObjectId('id'),
  isStaffOrAbove,
  transitionSalesOrder
);
```

## Creating Default Workflows

### Seed Script for Default Workflows

```typescript
// backend/src/seeds/workflows.ts

import WorkflowDefinition from '../models/WorkflowDefinition';
import { WorkflowEntityType } from '../types/models';

export async function seedWorkflows() {
  console.log('Seeding default workflows...');

  // Sales Order Workflow
  await WorkflowDefinition.create({
    name: 'Default Sales Order Workflow',
    entityType: WorkflowEntityType.SALES_ORDER,
    isActive: true,
    isDefault: true,
    statuses: [
      {
        key: 'draft',
        label: 'Draft',
        color: '#6B7280',
        icon: 'FileEdit',
        isInitial: true,
        isFinal: false,
        order: 0,
      },
      {
        key: 'confirmed',
        label: 'Confirmed',
        color: '#3B82F6',
        icon: 'CheckCircle',
        isInitial: false,
        isFinal: false,
        order: 1,
      },
      {
        key: 'processing',
        label: 'Processing',
        color: '#F59E0B',
        icon: 'Package',
        isInitial: false,
        isFinal: false,
        order: 2,
      },
      {
        key: 'shipped',
        label: 'Shipped',
        color: '#8B5CF6',
        icon: 'Truck',
        isInitial: false,
        isFinal: false,
        order: 3,
      },
      {
        key: 'delivered',
        label: 'Delivered',
        color: '#10B981',
        icon: 'CheckCheck',
        isInitial: false,
        isFinal: true,
        order: 4,
      },
      {
        key: 'cancelled',
        label: 'Cancelled',
        color: '#EF4444',
        icon: 'XCircle',
        isInitial: false,
        isFinal: true,
        order: 5,
      },
    ],
    transitions: [
      {
        from: 'draft',
        to: 'confirmed',
        label: 'Confirm Order',
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to confirm this order?',
        emailNotification: true,
      },
      {
        from: 'draft',
        to: 'cancelled',
        label: 'Cancel',
        requiresPermission: ['ADMIN', 'MANAGER'],
        requiresConfirmation: true,
      },
      {
        from: 'confirmed',
        to: 'processing',
        label: 'Start Processing',
        requiresPermission: ['ADMIN', 'MANAGER', 'STAFF'],
        emailNotification: true,
      },
      {
        from: 'confirmed',
        to: 'cancelled',
        label: 'Cancel',
        requiresPermission: ['ADMIN', 'MANAGER'],
        requiresConfirmation: true,
        confirmationMessage: 'Cancelling a confirmed order may have consequences. Continue?',
      },
      {
        from: 'processing',
        to: 'shipped',
        label: 'Mark as Shipped',
        requiresPermission: ['ADMIN', 'MANAGER', 'STAFF'],
        emailNotification: true,
      },
      {
        from: 'shipped',
        to: 'delivered',
        label: 'Mark as Delivered',
        requiresPermission: ['ADMIN', 'MANAGER', 'STAFF'],
        emailNotification: true,
      },
    ],
    createdBy: adminUser._id, // Replace with actual admin user ID
  });

  // Purchase Order Workflow
  await WorkflowDefinition.create({
    name: 'Default Purchase Order Workflow',
    entityType: WorkflowEntityType.PURCHASE_ORDER,
    isActive: true,
    isDefault: true,
    statuses: [
      {
        key: 'draft',
        label: 'Draft',
        color: '#6B7280',
        icon: 'FileEdit',
        isInitial: true,
        isFinal: false,
        order: 0,
      },
      {
        key: 'pending',
        label: 'Pending Approval',
        color: '#F59E0B',
        icon: 'Clock',
        isInitial: false,
        isFinal: false,
        order: 1,
      },
      {
        key: 'approved',
        label: 'Approved',
        color: '#3B82F6',
        icon: 'CheckCircle',
        isInitial: false,
        isFinal: false,
        order: 2,
      },
      {
        key: 'received',
        label: 'Received',
        color: '#10B981',
        icon: 'PackageCheck',
        isInitial: false,
        isFinal: true,
        order: 3,
      },
      {
        key: 'cancelled',
        label: 'Cancelled',
        color: '#EF4444',
        icon: 'XCircle',
        isInitial: false,
        isFinal: true,
        order: 4,
      },
    ],
    transitions: [
      {
        from: 'draft',
        to: 'pending',
        label: 'Submit for Approval',
        requiresConfirmation: true,
      },
      {
        from: 'pending',
        to: 'approved',
        label: 'Approve',
        requiresPermission: ['ADMIN', 'MANAGER'],
        requiresConfirmation: true,
        emailNotification: true,
        conditions: {
          // Only managers can approve orders > $10,000
          or: [
            { field: 'total', operator: 'lte', value: 10000 },
            { requiresPermission: ['ADMIN'] },
          ],
        },
      },
      {
        from: 'pending',
        to: 'cancelled',
        label: 'Reject',
        requiresPermission: ['ADMIN', 'MANAGER'],
        requiresConfirmation: true,
      },
      {
        from: 'approved',
        to: 'received',
        label: 'Mark as Received',
        requiresPermission: ['ADMIN', 'MANAGER', 'STAFF'],
        emailNotification: true,
      },
    ],
    createdBy: adminUser._id,
  });

  console.log('Default workflows seeded successfully');
}
```

## Industry-Specific Workflow Examples

### Manufacturing Industry - Production Order Workflow

```typescript
{
  name: 'Manufacturing Production Workflow',
  entityType: WorkflowEntityType.CUSTOM,
  statuses: [
    { key: 'new', label: 'New Order', color: '#6B7280', isInitial: true, isFinal: false },
    { key: 'materials_ordered', label: 'Materials Ordered', color: '#F59E0B', isInitial: false, isFinal: false },
    { key: 'in_production', label: 'In Production', color: '#3B82F6', isInitial: false, isFinal: false },
    { key: 'quality_check', label: 'Quality Check', color: '#8B5CF6', isInitial: false, isFinal: false },
    { key: 'packaging', label: 'Packaging', color: '#06B6D4', isInitial: false, isFinal: false },
    { key: 'ready_to_ship', label: 'Ready to Ship', color: '#10B981', isInitial: false, isFinal: false },
    { key: 'shipped', label: 'Shipped', color: '#059669', isInitial: false, isFinal: true },
    { key: 'quality_failed', label: 'Quality Failed', color: '#EF4444', isInitial: false, isFinal: true },
  ],
  transitions: [
    { from: 'new', to: 'materials_ordered', label: 'Order Materials' },
    { from: 'materials_ordered', to: 'in_production', label: 'Start Production' },
    { from: 'in_production', to: 'quality_check', label: 'Send to QC' },
    { from: 'quality_check', to: 'packaging', label: 'Approve Quality' },
    { from: 'quality_check', to: 'quality_failed', label: 'Reject Quality' },
    { from: 'packaging', to: 'ready_to_ship', label: 'Complete Packaging' },
    { from: 'ready_to_ship', to: 'shipped', label: 'Ship Order' },
  ],
}
```

### Healthcare Industry - Patient Appointment Workflow

```typescript
{
  name: 'Patient Appointment Workflow',
  entityType: WorkflowEntityType.CUSTOM,
  statuses: [
    { key: 'scheduled', label: 'Scheduled', color: '#3B82F6', isInitial: true, isFinal: false },
    { key: 'confirmed', label: 'Confirmed', color: '#10B981', isInitial: false, isFinal: false },
    { key: 'checked_in', label: 'Checked In', color: '#F59E0B', isInitial: false, isFinal: false },
    { key: 'in_progress', label: 'In Progress', color: '#8B5CF6', isInitial: false, isFinal: false },
    { key: 'completed', label: 'Completed', color: '#059669', isInitial: false, isFinal: true },
    { key: 'no_show', label: 'No Show', color: '#EF4444', isInitial: false, isFinal: true },
    { key: 'cancelled', label: 'Cancelled', color: '#6B7280', isInitial: false, isFinal: true },
  ],
  transitions: [
    { from: 'scheduled', to: 'confirmed', label: 'Confirm Appointment' },
    { from: 'scheduled', to: 'cancelled', label: 'Cancel' },
    { from: 'confirmed', to: 'checked_in', label: 'Check In' },
    { from: 'confirmed', to: 'no_show', label: 'Mark No Show' },
    { from: 'checked_in', to: 'in_progress', label: 'Start Consultation' },
    { from: 'in_progress', to: 'completed', label: 'Complete Visit' },
  ],
}
```

### E-commerce - Return/Refund Workflow

```typescript
{
  name: 'Return and Refund Workflow',
  entityType: WorkflowEntityType.RETURN,
  statuses: [
    { key: 'requested', label: 'Return Requested', color: '#F59E0B', isInitial: true, isFinal: false },
    { key: 'approved', label: 'Approved', color: '#3B82F6', isInitial: false, isFinal: false },
    { key: 'item_received', label: 'Item Received', color: '#8B5CF6', isInitial: false, isFinal: false },
    { key: 'inspecting', label: 'Inspecting', color: '#06B6D4', isInitial: false, isFinal: false },
    { key: 'refunded', label: 'Refunded', color: '#10B981', isInitial: false, isFinal: true },
    { key: 'rejected', label: 'Rejected', color: '#EF4444', isInitial: false, isFinal: true },
    { key: 'replaced', label: 'Replaced', color: '#059669', isInitial: false, isFinal: true },
  ],
  transitions: [
    { from: 'requested', to: 'approved', label: 'Approve Return', requiresPermission: ['ADMIN', 'MANAGER'] },
    { from: 'requested', to: 'rejected', label: 'Reject Return', requiresPermission: ['ADMIN', 'MANAGER'] },
    { from: 'approved', to: 'item_received', label: 'Mark as Received' },
    { from: 'item_received', to: 'inspecting', label: 'Start Inspection' },
    { from: 'inspecting', to: 'refunded', label: 'Issue Refund' },
    { from: 'inspecting', to: 'replaced', label: 'Send Replacement' },
    { from: 'inspecting', to: 'rejected', label: 'Reject (Damaged/Misuse)' },
  ],
}
```

## Benefits of Custom Workflows

1. **Industry Flexibility**: Different industries can define their own processes
2. **No Code Changes**: Modify workflows without touching code
3. **Audit Trail**: Complete history of all status changes
4. **Role-Based Permissions**: Control who can perform which transitions
5. **Conditional Logic**: Advanced rules based on entity properties
6. **Webhooks**: Integrate with external systems
7. **Notifications**: Automated email notifications
8. **Analytics**: Track time spent in each status

## Best Practices

1. **Always have at least one initial and one final status**
2. **Use meaningful status keys** (lowercase with underscores)
3. **Add descriptions** to help users understand each status
4. **Test workflows** before activating them
5. **Use colors consistently** across your application
6. **Document your workflows** for team reference
7. **Back up workflows** before making major changes
8. **Monitor analytics** to optimize your processes

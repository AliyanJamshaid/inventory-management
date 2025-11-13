/**
 * Workflow Action Buttons Component
 * Renders action buttons based on allowed transitions
 */

'use client';

import React, { useState } from 'react';
import { useAllowedTransitions } from '@/hooks/useWorkflows';
import { WorkflowEntityType } from '@/types/workflow';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowActionButtonsProps {
  entityType: WorkflowEntityType;
  currentStatus: string;
  entity?: any;
  onTransition: (toStatus: string, notes?: string) => Promise<void>;
  className?: string;
  disabled?: boolean;
}

export function WorkflowActionButtons({
  entityType,
  currentStatus,
  entity,
  onTransition,
  className,
  disabled = false,
}: WorkflowActionButtonsProps) {
  const { data: transitions, isLoading } = useAllowedTransitions(
    entityType,
    currentStatus
  );
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    transition?: any;
    notes: string;
  }>({
    isOpen: false,
    notes: '',
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTransitionClick = (transition: any) => {
    if (transition.requiresConfirmation) {
      setConfirmDialog({
        isOpen: true,
        transition,
        notes: '',
      });
    } else {
      executeTransition(transition.to, '');
    }
  };

  const executeTransition = async (toStatus: string, notes: string) => {
    setIsTransitioning(true);
    try {
      await onTransition(toStatus, notes);
      setConfirmDialog({ isOpen: false, notes: '' });
    } catch (error) {
      console.error('Transition failed:', error);
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleConfirm = () => {
    if (confirmDialog.transition) {
      executeTransition(confirmDialog.transition.to, confirmDialog.notes);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex gap-2', className)}>
        <Button disabled variant="outline">
          Loading...
        </Button>
      </div>
    );
  }

  if (!transitions || transitions.length === 0) {
    return null;
  }

  return (
    <>
      <div className={cn('flex flex-wrap gap-2', className)}>
        {transitions.map((transition) => (
          <Button
            key={`${transition.from}-${transition.to}`}
            onClick={() => handleTransitionClick(transition)}
            disabled={disabled || isTransitioning}
            variant={getButtonVariant(transition.to)}
            size="sm"
          >
            {transition.label}
          </Button>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => {
          if (!isTransitioning) {
            setConfirmDialog({ isOpen: open, notes: '' });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Confirm Action
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.transition?.confirmationMessage ||
                'Are you sure you want to proceed with this action?'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes or comments about this transition..."
                value={confirmDialog.notes}
                onChange={(e) =>
                  setConfirmDialog((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ isOpen: false, notes: '' })}
              disabled={isTransitioning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isTransitioning}
              variant={getButtonVariant(confirmDialog.transition?.to)}
            >
              {isTransitioning ? 'Processing...' : confirmDialog.transition?.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Get button variant based on transition target status
 */
function getButtonVariant(toStatus: string): 'default' | 'destructive' | 'outline' {
  const statusLower = toStatus.toLowerCase();

  if (
    statusLower.includes('cancel') ||
    statusLower.includes('reject') ||
    statusLower.includes('delete')
  ) {
    return 'destructive';
  }

  if (
    statusLower.includes('approve') ||
    statusLower.includes('confirm') ||
    statusLower.includes('complete')
  ) {
    return 'default';
  }

  return 'outline';
}

export default WorkflowActionButtons;

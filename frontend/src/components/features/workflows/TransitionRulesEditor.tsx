/**
 * Transition Rules Editor Component
 * Edit workflow transitions
 */

'use client';

import React, { useState } from 'react';
import { WorkflowTransition, WorkflowStatus } from '@/types/workflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, ArrowRight } from 'lucide-react';

interface TransitionRulesEditorProps {
  statuses: WorkflowStatus[];
  transitions: WorkflowTransition[];
  onTransitionsChange: (transitions: WorkflowTransition[]) => void;
}

export function TransitionRulesEditor({
  statuses,
  transitions,
  onTransitionsChange,
}: TransitionRulesEditorProps) {
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    transition?: WorkflowTransition;
    index?: number;
  }>({ isOpen: false });

  const [formData, setFormData] = useState<Partial<WorkflowTransition>>({
    from: '',
    to: '',
    label: '',
    requiresPermission: [],
    requiresConfirmation: false,
    confirmationMessage: '',
    webhookUrl: '',
    emailNotification: false,
  });

  const openCreateDialog = () => {
    setFormData({
      from: '',
      to: '',
      label: '',
      requiresPermission: [],
      requiresConfirmation: false,
      confirmationMessage: '',
      webhookUrl: '',
      emailNotification: false,
    });
    setEditDialog({ isOpen: true });
  };

  const openEditDialog = (transition: WorkflowTransition, index: number) => {
    setFormData(transition);
    setEditDialog({ isOpen: true, transition, index });
  };

  const handleSave = () => {
    if (!formData.from || !formData.to || !formData.label) return;

    const newTransition: WorkflowTransition = {
      from: formData.from,
      to: formData.to,
      label: formData.label,
      requiresPermission: formData.requiresPermission,
      requiresConfirmation: formData.requiresConfirmation,
      confirmationMessage: formData.confirmationMessage,
      webhookUrl: formData.webhookUrl,
      emailNotification: formData.emailNotification,
      conditions: formData.conditions,
    };

    if (editDialog.index !== undefined) {
      const updated = [...transitions];
      updated[editDialog.index] = newTransition;
      onTransitionsChange(updated);
    } else {
      onTransitionsChange([...transitions, newTransition]);
    }

    setEditDialog({ isOpen: false });
  };

  const handleDelete = (index: number) => {
    const updated = transitions.filter((_, i) => i !== index);
    onTransitionsChange(updated);
  };

  const getStatusLabel = (key: string) => {
    return statuses.find((s) => s.key === key)?.label || key;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transitions</CardTitle>
              <CardDescription>Define allowed status transitions</CardDescription>
            </div>
            <Button onClick={openCreateDialog} size="sm" disabled={statuses.length < 2}>
              <Plus className="mr-2 h-4 w-4" />
              Add Transition
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transitions.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No transitions defined. Add transitions to allow status changes.
              </p>
            ) : (
              transitions.map((transition, index) => (
                <div
                  key={`${transition.from}-${transition.to}-${index}`}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50"
                >
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-medium">{getStatusLabel(transition.from)}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{getStatusLabel(transition.to)}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{transition.label}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(transition, index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => setEditDialog({ isOpen: open })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editDialog.transition ? 'Edit Transition' : 'Add Transition'}
            </DialogTitle>
            <DialogDescription>
              Configure the transition properties
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="from">From Status *</Label>
                <Select
                  value={formData.from}
                  onValueChange={(value) => setFormData({ ...formData, from: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.key} value={status.key}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="to">To Status *</Label>
                <Select
                  value={formData.to}
                  onValueChange={(value) => setFormData({ ...formData, to: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.key} value={status.key}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="label">Button Label *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., Approve, Reject, Complete"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="requiresConfirmation"
                  checked={formData.requiresConfirmation}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, requiresConfirmation: checked })
                  }
                />
                <Label htmlFor="requiresConfirmation">Require Confirmation</Label>
              </div>
            </div>

            {formData.requiresConfirmation && (
              <div className="grid gap-2">
                <Label htmlFor="confirmationMessage">Confirmation Message</Label>
                <Textarea
                  id="confirmationMessage"
                  value={formData.confirmationMessage}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmationMessage: e.target.value })
                  }
                  placeholder="Are you sure you want to proceed?"
                  rows={2}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
              <Input
                id="webhookUrl"
                value={formData.webhookUrl}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                placeholder="https://example.com/webhook"
                type="url"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="emailNotification"
                  checked={formData.emailNotification}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, emailNotification: checked })
                  }
                />
                <Label htmlFor="emailNotification">Send Email Notification</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ isOpen: false })}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.from || !formData.to || !formData.label}
            >
              Save Transition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TransitionRulesEditor;

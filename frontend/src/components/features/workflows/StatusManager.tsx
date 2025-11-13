/**
 * Status Manager Component
 * Manage workflow statuses
 */

'use client';

import React, { useState } from 'react';
import { WorkflowStatus } from '@/types/workflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusManagerProps {
  statuses: WorkflowStatus[];
  onStatusesChange: (statuses: WorkflowStatus[]) => void;
}

export function StatusManager({ statuses, onStatusesChange }: StatusManagerProps) {
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    status?: WorkflowStatus;
    index?: number;
  }>({ isOpen: false });

  const [formData, setFormData] = useState<Partial<WorkflowStatus>>({
    key: '',
    label: '',
    color: '#6B7280',
    icon: '',
    description: '',
    isInitial: false,
    isFinal: false,
    order: 0,
    actions: [],
  });

  const openCreateDialog = () => {
    setFormData({
      key: '',
      label: '',
      color: '#6B7280',
      icon: '',
      description: '',
      isInitial: false,
      isFinal: false,
      order: statuses.length,
      actions: [],
    });
    setEditDialog({ isOpen: true });
  };

  const openEditDialog = (status: WorkflowStatus, index: number) => {
    setFormData(status);
    setEditDialog({ isOpen: true, status, index });
  };

  const handleSave = () => {
    if (!formData.key || !formData.label) return;

    const newStatus: WorkflowStatus = {
      key: formData.key,
      label: formData.label,
      color: formData.color || '#6B7280',
      icon: formData.icon,
      description: formData.description,
      isInitial: formData.isInitial || false,
      isFinal: formData.isFinal || false,
      order: formData.order || 0,
      actions: formData.actions || [],
    };

    if (editDialog.index !== undefined) {
      // Edit existing
      const updated = [...statuses];
      updated[editDialog.index] = newStatus;
      onStatusesChange(updated);
    } else {
      // Add new
      onStatusesChange([...statuses, newStatus]);
    }

    setEditDialog({ isOpen: false });
  };

  const handleDelete = (index: number) => {
    const updated = statuses.filter((_, i) => i !== index);
    onStatusesChange(updated);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Statuses</CardTitle>
              <CardDescription>Manage workflow statuses</CardDescription>
            </div>
            <Button onClick={openCreateDialog} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Status
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {statuses.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No statuses yet. Add your first status to get started.
              </p>
            ) : (
              statuses.map((status, index) => (
                <div
                  key={status.key}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <div
                    className="h-4 w-4 rounded-full border-2"
                    style={{ backgroundColor: status.color, borderColor: status.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{status.label}</span>
                      {status.isInitial && (
                        <span className="text-xs text-muted-foreground">(Initial)</span>
                      )}
                      {status.isFinal && (
                        <span className="text-xs text-muted-foreground">(Final)</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{status.key}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(status, index)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editDialog.status ? 'Edit Status' : 'Add Status'}
            </DialogTitle>
            <DialogDescription>
              Configure the status properties
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="key">Status Key *</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="e.g., pending_approval"
                disabled={!!editDialog.status}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="label">Display Label *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., Pending Approval"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#6B7280"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="icon">Icon (Lucide icon name)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="e.g., Clock, CheckCircle"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isInitial"
                  checked={formData.isInitial}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isInitial: checked })
                  }
                />
                <Label htmlFor="isInitial">Initial Status</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isFinal"
                  checked={formData.isFinal}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFinal: checked })
                  }
                />
                <Label htmlFor="isFinal">Final Status</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ isOpen: false })}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.key || !formData.label}>
              Save Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default StatusManager;

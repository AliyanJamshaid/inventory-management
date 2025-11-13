/**
 * Workflow Builder Settings Page
 * Manage and create workflows
 */

'use client';

import React, { useState } from 'react';
import {
  useWorkflows,
  useCreateWorkflow,
  useUpdateWorkflow,
  useDeleteWorkflow,
  useActivateWorkflow,
  useValidateWorkflow,
} from '@/hooks/useWorkflows';
import { WorkflowEntityType, WorkflowDefinition, WorkflowStatus, WorkflowTransition } from '@/types/workflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StatusManager } from '@/components/features/workflows/StatusManager';
import { TransitionRulesEditor } from '@/components/features/workflows/TransitionRulesEditor';
import { WorkflowDesigner } from '@/components/features/workflows/WorkflowDesigner';
import {
  Plus,
  Edit,
  Trash2,
  Play,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Workflow as WorkflowIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function WorkflowsPage() {
  const { toast } = useToast();
  const { data: workflows, isLoading } = useWorkflows();
  const createWorkflow = useCreateWorkflow();
  const updateWorkflow = useUpdateWorkflow();
  const deleteWorkflow = useDeleteWorkflow();
  const activateWorkflow = useActivateWorkflow();
  const validateWorkflow = useValidateWorkflow();

  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    workflow?: WorkflowDefinition;
  }>({ isOpen: false });

  const [formData, setFormData] = useState<{
    name: string;
    entityType: WorkflowEntityType;
    statuses: WorkflowStatus[];
    transitions: WorkflowTransition[];
  }>({
    name: '',
    entityType: WorkflowEntityType.SALES_ORDER,
    statuses: [],
    transitions: [],
  });

  const openCreateDialog = () => {
    setFormData({
      name: '',
      entityType: WorkflowEntityType.SALES_ORDER,
      statuses: [],
      transitions: [],
    });
    setEditDialog({ isOpen: true });
  };

  const openEditDialog = (workflow: WorkflowDefinition) => {
    setFormData({
      name: workflow.name,
      entityType: workflow.entityType,
      statuses: workflow.statuses,
      transitions: workflow.transitions,
    });
    setEditDialog({ isOpen: true, workflow });
  };

  const handleSave = async () => {
    try {
      if (editDialog.workflow) {
        await updateWorkflow.mutateAsync({
          id: editDialog.workflow._id,
          data: formData,
        });
        toast({
          title: 'Success',
          description: 'Workflow updated successfully',
        });
      } else {
        await createWorkflow.mutateAsync(formData);
        toast({
          title: 'Success',
          description: 'Workflow created successfully',
        });
      }
      setEditDialog({ isOpen: false });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save workflow',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await deleteWorkflow.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Workflow deleted successfully',
      });
      setSelectedWorkflow(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete workflow',
        variant: 'destructive',
      });
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const result = await activateWorkflow.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Workflow activated successfully',
      });

      if (result.warnings && result.warnings.length > 0) {
        toast({
          title: 'Warnings',
          description: result.warnings.join(', '),
          variant: 'default',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to activate workflow',
        variant: 'destructive',
      });
    }
  };

  const handleValidate = async (id: string) => {
    try {
      const result = await validateWorkflow.mutateAsync(id);

      if (result.isValid) {
        toast({
          title: 'Valid Workflow',
          description: 'Workflow validation passed',
        });
      } else {
        toast({
          title: 'Validation Failed',
          description: result.errors.join(', '),
          variant: 'destructive',
        });
      }

      if (result.warnings && result.warnings.length > 0) {
        toast({
          title: 'Warnings',
          description: result.warnings.join(', '),
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to validate workflow',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Builder</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage custom workflows for your business processes
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Workflows</CardTitle>
            <CardDescription>Select a workflow to manage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {!workflows || workflows.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No workflows yet. Create your first workflow.
                </p>
              ) : (
                workflows.map((workflow) => (
                  <div
                    key={workflow._id}
                    className={`rounded-lg border p-3 cursor-pointer hover:bg-accent transition-colors ${
                      selectedWorkflow?._id === workflow._id ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <WorkflowIcon className="h-4 w-4" />
                          <span className="font-medium">{workflow.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {workflow.entityType}
                          </Badge>
                          {workflow.isActive && (
                            <Badge variant="default" className="text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workflow Details */}
        <div className="lg:col-span-2">
          {selectedWorkflow ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedWorkflow.name}</CardTitle>
                    <CardDescription>
                      {selectedWorkflow.entityType} • {selectedWorkflow.statuses.length} statuses • {selectedWorkflow.transitions.length} transitions
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!selectedWorkflow.isActive && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleActivate(selectedWorkflow._id)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Activate
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleValidate(selectedWorkflow._id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Validate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(selectedWorkflow)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(selectedWorkflow._id)}
                      disabled={selectedWorkflow.isActive}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="diagram">
                  <TabsList>
                    <TabsTrigger value="diagram">Diagram</TabsTrigger>
                    <TabsTrigger value="statuses">
                      Statuses ({selectedWorkflow.statuses.length})
                    </TabsTrigger>
                    <TabsTrigger value="transitions">
                      Transitions ({selectedWorkflow.transitions.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="diagram" className="mt-4">
                    <WorkflowDesigner workflow={selectedWorkflow} />
                  </TabsContent>

                  <TabsContent value="statuses" className="mt-4">
                    <div className="space-y-2">
                      {selectedWorkflow.statuses.map((status) => (
                        <div
                          key={status.key}
                          className="flex items-center gap-3 rounded-lg border p-3"
                        >
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: status.color }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{status.label}</span>
                              {status.isInitial && (
                                <Badge variant="outline" className="text-xs">
                                  Initial
                                </Badge>
                              )}
                              {status.isFinal && (
                                <Badge variant="outline" className="text-xs">
                                  Final
                                </Badge>
                              )}
                            </div>
                            {status.description && (
                              <p className="text-sm text-muted-foreground">
                                {status.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="transitions" className="mt-4">
                    <div className="space-y-2">
                      {selectedWorkflow.transitions.map((transition, index) => (
                        <div
                          key={`${transition.from}-${transition.to}-${index}`}
                          className="rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {selectedWorkflow.statuses.find(s => s.key === transition.from)?.label}
                            </Badge>
                            <span>→</span>
                            <Badge variant="outline">
                              {selectedWorkflow.statuses.find(s => s.key === transition.to)?.label}
                            </Badge>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-medium">{transition.label}</span>
                          </div>
                          {transition.requiresConfirmation && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <AlertCircle className="h-4 w-4" />
                              Requires confirmation
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center">
                  <WorkflowIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Select a workflow to view details
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => setEditDialog({ isOpen: open })}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editDialog.workflow ? 'Edit Workflow' : 'Create Workflow'}
            </DialogTitle>
            <DialogDescription>
              Configure your workflow settings, statuses, and transitions
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic">
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="statuses">Statuses</TabsTrigger>
              <TabsTrigger value="transitions">Transitions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Workflow Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sales Order Workflow"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="entityType">Entity Type *</Label>
                <Select
                  value={formData.entityType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, entityType: value as WorkflowEntityType })
                  }
                  disabled={!!editDialog.workflow}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(WorkflowEntityType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="statuses" className="mt-4">
              <StatusManager
                statuses={formData.statuses}
                onStatusesChange={(statuses) => setFormData({ ...formData, statuses })}
              />
            </TabsContent>

            <TabsContent value="transitions" className="mt-4">
              <TransitionRulesEditor
                statuses={formData.statuses}
                transitions={formData.transitions}
                onTransitionsChange={(transitions) =>
                  setFormData({ ...formData, transitions })
                }
              />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ isOpen: false })}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !formData.name ||
                formData.statuses.length === 0 ||
                createWorkflow.isPending ||
                updateWorkflow.isPending
              }
            >
              {createWorkflow.isPending || updateWorkflow.isPending ? 'Saving...' : 'Save Workflow'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

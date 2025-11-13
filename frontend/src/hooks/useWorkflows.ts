/**
 * Workflow Hooks
 * React Query hooks for workflow operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, handleApiError } from '@/lib/api';
import {
  WorkflowDefinition,
  WorkflowEntityType,
  CreateWorkflowDTO,
  UpdateWorkflowDTO,
  WorkflowValidationResult,
  WorkflowAnalytics,
  StatusHistory,
  WorkflowTransition,
  CanTransitionResult,
  ExecuteTransitionDTO,
} from '@/types/workflow';

/**
 * Fetch all workflows with optional filtering
 */
export function useWorkflows(filters?: {
  entityType?: WorkflowEntityType;
  isActive?: boolean;
  isDefault?: boolean;
}) {
  return useQuery({
    queryKey: ['workflows', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      const response = await api.get<{ data: WorkflowDefinition[] }>(
        `/workflows?${params.toString()}`
      );
      return response.data.data;
    },
  });
}

/**
 * Fetch single workflow by ID
 */
export function useWorkflow(id: string, enabled = true) {
  return useQuery({
    queryKey: ['workflows', id],
    queryFn: async () => {
      const response = await api.get<{ data: WorkflowDefinition }>(`/workflows/${id}`);
      return response.data.data;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Fetch active workflow for entity type
 */
export function useActiveWorkflow(entityType: WorkflowEntityType, enabled = true) {
  return useQuery({
    queryKey: ['workflows', 'active', entityType],
    queryFn: async () => {
      const response = await api.get<{ data: WorkflowDefinition }>(
        `/workflows/entity/${entityType}`
      );
      return response.data.data;
    },
    enabled: enabled && !!entityType,
  });
}

/**
 * Create new workflow
 */
export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWorkflowDTO) => {
      const response = await api.post<{ data: WorkflowDefinition }>('/workflows', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

/**
 * Update workflow
 */
export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateWorkflowDTO }) => {
      const response = await api.put<{ data: WorkflowDefinition }>(
        `/workflows/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflows', variables.id] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

/**
 * Delete workflow
 */
export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/workflows/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

/**
 * Activate workflow
 */
export function useActivateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<{
        data: { workflow: WorkflowDefinition; warnings: string[] };
      }>(`/workflows/${id}/activate`);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({
        queryKey: ['workflows', 'active', data.workflow.entityType],
      });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

/**
 * Validate workflow
 */
export function useValidateWorkflow() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.get<{ data: WorkflowValidationResult }>(
        `/workflows/${id}/validate`
      );
      return response.data.data;
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

/**
 * Export workflow
 */
export function useExportWorkflow() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.get(`/workflows/${id}/export`, {
        responseType: 'blob',
      });
      return response.data;
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

/**
 * Import workflow
 */
export function useImportWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflowData: any) => {
      const response = await api.post<{ data: WorkflowDefinition }>(
        '/workflows/import',
        workflowData
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

/**
 * Get allowed transitions for current status
 */
export function useAllowedTransitions(
  entityType: WorkflowEntityType,
  currentStatus: string,
  enabled = true
) {
  return useQuery({
    queryKey: ['workflows', 'transitions', entityType, currentStatus],
    queryFn: async () => {
      const response = await api.get<{ data: WorkflowTransition[] }>(
        `/workflows/${entityType}/${currentStatus}/transitions`
      );
      return response.data.data;
    },
    enabled: enabled && !!entityType && !!currentStatus,
  });
}

/**
 * Get workflow analytics
 */
export function useWorkflowAnalytics(
  entityType: WorkflowEntityType,
  startDate?: Date,
  endDate?: Date
) {
  return useQuery({
    queryKey: ['workflows', 'analytics', entityType, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await api.get<{ data: WorkflowAnalytics }>(
        `/workflows/analytics/${entityType}?${params.toString()}`
      );
      return response.data.data;
    },
    enabled: !!entityType,
  });
}

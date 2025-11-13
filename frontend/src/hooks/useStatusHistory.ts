/**
 * Status History Hooks
 * React Query hooks for status history operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, handleApiError } from '@/lib/api';
import { StatusHistory, WorkflowEntityType, ExecuteTransitionDTO } from '@/types/workflow';

/**
 * Fetch status history for an entity
 */
export function useStatusHistory(
  entityType: WorkflowEntityType,
  entityId: string,
  enabled = true
) {
  return useQuery({
    queryKey: ['statusHistory', entityType, entityId],
    queryFn: async () => {
      const response = await api.get<{ data: StatusHistory[] }>(
        `/workflows/history/${entityType}/${entityId}`
      );
      return response.data.data;
    },
    enabled: enabled && !!entityType && !!entityId,
  });
}

/**
 * Execute status transition
 * This would typically be called from the entity-specific hooks
 * but is provided here for direct use if needed
 */
export function useExecuteTransition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ExecuteTransitionDTO) => {
      // The actual transition happens via entity-specific endpoints
      // This is more of a utility hook
      const response = await api.post<{ data: StatusHistory }>(
        `/workflows/transition`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate status history for this entity
      queryClient.invalidateQueries({
        queryKey: ['statusHistory', variables.entityType, variables.entityId],
      });
      // Invalidate the entity itself
      queryClient.invalidateQueries({
        queryKey: [variables.entityType, variables.entityId],
      });
      // Invalidate analytics
      queryClient.invalidateQueries({
        queryKey: ['workflows', 'analytics', variables.entityType],
      });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

/**
 * Format duration for display
 */
export function formatDuration(milliseconds?: number): string {
  if (!milliseconds) return 'N/A';

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Get relative time string
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}

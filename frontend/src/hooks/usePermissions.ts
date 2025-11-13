/**
 * Permission Hooks
 * React hooks for managing permissions
 */

import { useQuery } from '@tanstack/react-query';
import { api, handleApiError } from '@/lib/api';
import { Permission, GroupedPermissions, PermissionStats, PermissionKey } from '@/types/permission';
import { useAuthStore } from '@/store/authStore';

/**
 * Get all permissions
 */
export const usePermissions = (filters?: {
  module?: string;
  category?: string;
  action?: string;
}) => {
  return useQuery({
    queryKey: ['permissions', filters],
    queryFn: async (): Promise<Permission[]> => {
      const params = new URLSearchParams();
      if (filters?.module) params.append('module', filters.module);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.action) params.append('action', filters.action);

      const response = await api.get(`/permissions?${params.toString()}`);
      return response.data.data;
    },
  });
};

/**
 * Get permissions grouped by category
 */
export const usePermissionsGrouped = () => {
  return useQuery({
    queryKey: ['permissions', 'grouped'],
    queryFn: async (): Promise<GroupedPermissions[]> => {
      const response = await api.get('/permissions/grouped');
      return response.data.data;
    },
  });
};

/**
 * Get permission by ID
 */
export const usePermission = (id: string) => {
  return useQuery({
    queryKey: ['permission', id],
    queryFn: async (): Promise<Permission> => {
      const response = await api.get(`/permissions/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

/**
 * Get permission statistics
 */
export const usePermissionStats = () => {
  return useQuery({
    queryKey: ['permissions', 'stats'],
    queryFn: async (): Promise<PermissionStats> => {
      const response = await api.get('/permissions/stats');
      return response.data.data;
    },
  });
};

/**
 * Hook to check if current user has a specific permission
 */
export const useHasPermission = (permissionKey: PermissionKey): boolean => {
  const { permissions } = useAuthStore();
  return permissions.includes(permissionKey);
};

/**
 * Hook to check if current user has all specified permissions (AND logic)
 */
export const useHasAllPermissions = (permissionKeys: PermissionKey[]): boolean => {
  const { permissions } = useAuthStore();
  return permissionKeys.every((key) => permissions.includes(key));
};

/**
 * Hook to check if current user has any of the specified permissions (OR logic)
 */
export const useHasAnyPermission = (permissionKeys: PermissionKey[]): boolean => {
  const { permissions } = useAuthStore();
  return permissionKeys.some((key) => permissions.includes(key));
};

/**
 * Get all user's permissions
 */
export const useUserPermissions = (): PermissionKey[] => {
  const { permissions } = useAuthStore();
  return permissions;
};

/**
 * Create a custom permission (advanced feature)
 */
export const useCreatePermission = () => {
  return {
    mutate: async (data: {
      module: string;
      resource: string;
      action: string;
      displayName: string;
      description?: string;
      category: string;
      conditions?: any;
    }): Promise<Permission> => {
      try {
        const response = await api.post('/permissions', data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  };
};

/**
 * Update permission
 */
export const useUpdatePermission = () => {
  return {
    mutate: async (
      id: string,
      data: {
        displayName?: string;
        description?: string;
        category?: string;
        conditions?: any;
      }
    ): Promise<Permission> => {
      try {
        const response = await api.put(`/permissions/${id}`, data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  };
};

/**
 * Delete permission
 */
export const useDeletePermission = () => {
  return {
    mutate: async (id: string): Promise<void> => {
      try {
        await api.delete(`/permissions/${id}`);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  };
};

export default {
  usePermissions,
  usePermissionsGrouped,
  usePermission,
  usePermissionStats,
  useHasPermission,
  useHasAllPermissions,
  useHasAnyPermission,
  useUserPermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
};

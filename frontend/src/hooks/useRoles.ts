/**
 * Role Hooks
 * React hooks for managing roles
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, handleApiError } from '@/lib/api';
import { Role, CreateRoleInput, UpdateRoleInput } from '@/types/permission';
import { toast } from 'sonner';

/**
 * Get all roles
 */
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async (): Promise<Role[]> => {
      const response = await api.get('/roles');
      return response.data.data;
    },
  });
};

/**
 * Get role by ID
 */
export const useRole = (id: string) => {
  return useQuery({
    queryKey: ['role', id],
    queryFn: async (): Promise<Role> => {
      const response = await api.get(`/roles/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

/**
 * Get users with a specific role
 */
export const useRoleUsers = (roleId: string) => {
  return useQuery({
    queryKey: ['role-users', roleId],
    queryFn: async (): Promise<any[]> => {
      const response = await api.get(`/roles/${roleId}/users`);
      return response.data.data;
    },
    enabled: !!roleId,
  });
};

/**
 * Create a new role
 */
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoleInput): Promise<Role> => {
      const response = await api.post('/roles', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Update role
 */
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRoleInput }): Promise<Role> => {
      const response = await api.put(`/roles/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', variables.id] });
      toast.success('Role updated successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Delete role
 */
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Add permissions to role
 */
export const useAddPermissionsToRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }): Promise<Role> => {
      const response = await api.post(`/roles/${roleId}/permissions`, { permissionIds });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', variables.roleId] });
      toast.success('Permissions added successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Remove permission from role
 */
export const useRemovePermissionFromRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: string; permissionId: string }): Promise<Role> => {
      const response = await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', variables.roleId] });
      toast.success('Permission removed successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Duplicate role
 */
export const useDuplicateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sourceId,
      name,
      displayName,
    }: {
      sourceId: string;
      name: string;
      displayName?: string;
    }): Promise<Role> => {
      const response = await api.post(`/roles/${sourceId}/duplicate`, { name, displayName });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role duplicated successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Assign role to user
 */
export const useAssignRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }): Promise<any> => {
      const response = await api.put(`/users/${userId}`, { roleId });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['role-users'] });
      toast.success('Role assigned successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export default {
  useRoles,
  useRole,
  useRoleUsers,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useAddPermissionsToRole,
  useRemovePermissionFromRole,
  useDuplicateRole,
  useAssignRole,
};

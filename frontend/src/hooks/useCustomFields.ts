import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, handleApiError } from "@/lib/api";
import {
  CustomField,
  CustomFieldFormData,
  EntityType,
  GroupedCustomFields,
} from "@/types/customField";
import { toast } from "@/components/ui/use-toast";

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query keys
export const customFieldKeys = {
  all: ["customFields"] as const,
  lists: () => [...customFieldKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) => [...customFieldKeys.lists(), filters] as const,
  details: () => [...customFieldKeys.all, "detail"] as const,
  detail: (id: string) => [...customFieldKeys.details(), id] as const,
  byEntity: (entityType: EntityType) => [...customFieldKeys.all, "entity", entityType] as const,
  byEntityGrouped: (entityType: EntityType) => [...customFieldKeys.all, "entity", entityType, "grouped"] as const,
};

/**
 * Fetch all custom fields with optional filters
 */
export function useCustomFields(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: customFieldKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const { data } = await api.get<ApiResponse<PaginatedResponse<CustomField>>>(
        `/custom-fields?${params.toString()}`
      );
      return data.data;
    },
    staleTime: 30000,
  });
}

/**
 * Fetch single custom field by ID
 */
export function useCustomField(id: string, enabled = true) {
  return useQuery({
    queryKey: customFieldKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<CustomField>>(`/custom-fields/${id}`);
      return data.data;
    },
    enabled: enabled && !!id,
    staleTime: 60000,
  });
}

/**
 * Fetch custom fields for a specific entity type
 */
export function useCustomFieldsByEntity(entityType: EntityType, activeOnly = true) {
  return useQuery({
    queryKey: customFieldKeys.byEntity(entityType),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<CustomField[]>>(
        `/custom-fields/entity/${entityType}?activeOnly=${activeOnly}`
      );
      return data.data;
    },
    enabled: !!entityType,
    staleTime: 60000,
  });
}

/**
 * Fetch custom fields grouped by section for an entity type
 */
export function useCustomFieldsGrouped(entityType: EntityType) {
  return useQuery({
    queryKey: customFieldKeys.byEntityGrouped(entityType),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<GroupedCustomFields>>(
        `/custom-fields/entity/${entityType}/grouped`
      );
      return data.data;
    },
    enabled: !!entityType,
    staleTime: 60000,
  });
}

/**
 * Create new custom field
 */
export function useCreateCustomField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldData: CustomFieldFormData) => {
      const { data } = await api.post<ApiResponse<CustomField>>(
        "/custom-fields",
        fieldData
      );
      return data.data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: customFieldKeys.all });
      queryClient.invalidateQueries({ queryKey: customFieldKeys.byEntity(data.entityType) });

      toast({
        title: "Custom field created",
        description: `${data.fieldLabel} has been created successfully.`,
      });
    },
    onError: (error) => {
      handleApiError(error, "Failed to create custom field");
    },
  });
}

/**
 * Update existing custom field
 */
export function useUpdateCustomField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CustomFieldFormData> }) => {
      const { data } = await api.put<ApiResponse<CustomField>>(
        `/custom-fields/${id}`,
        updates
      );
      return data.data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: customFieldKeys.all });
      queryClient.invalidateQueries({ queryKey: customFieldKeys.detail(data._id) });
      queryClient.invalidateQueries({ queryKey: customFieldKeys.byEntity(data.entityType) });

      toast({
        title: "Custom field updated",
        description: `${data.fieldLabel} has been updated successfully.`,
      });
    },
    onError: (error) => {
      handleApiError(error, "Failed to update custom field");
    },
  });
}

/**
 * Delete (or archive) custom field
 */
export function useDeleteCustomField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, hardDelete = false }: { id: string; hardDelete?: boolean }) => {
      const { data } = await api.delete<ApiResponse<CustomField>>(
        `/custom-fields/${id}?hardDelete=${hardDelete}`
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: customFieldKeys.all });

      toast({
        title: "Custom field deleted",
        description: variables.hardDelete
          ? "Custom field has been permanently deleted."
          : "Custom field has been archived.",
      });
    },
    onError: (error) => {
      handleApiError(error, "Failed to delete custom field");
    },
  });
}

/**
 * Restore archived custom field
 */
export function useRestoreCustomField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<ApiResponse<CustomField>>(
        `/custom-fields/${id}/restore`
      );
      return data.data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: customFieldKeys.all });
      queryClient.invalidateQueries({ queryKey: customFieldKeys.detail(data._id) });
      queryClient.invalidateQueries({ queryKey: customFieldKeys.byEntity(data.entityType) });

      toast({
        title: "Custom field restored",
        description: `${data.fieldLabel} has been restored successfully.`,
      });
    },
    onError: (error) => {
      handleApiError(error, "Failed to restore custom field");
    },
  });
}

/**
 * Reorder custom fields
 */
export function useReorderCustomFields() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldOrders: Array<{ id: string; order: number }>) => {
      const { data } = await api.post<ApiResponse<null>>(
        "/custom-fields/reorder",
        { fieldOrders }
      );
      return data;
    },
    onSuccess: () => {
      // Invalidate all custom field queries
      queryClient.invalidateQueries({ queryKey: customFieldKeys.all });

      toast({
        title: "Fields reordered",
        description: "Custom fields have been reordered successfully.",
      });
    },
    onError: (error) => {
      handleApiError(error, "Failed to reorder custom fields");
    },
  });
}

/**
 * Validate field name availability
 */
export function useValidateFieldName() {
  return useMutation({
    mutationFn: async ({
      entityType,
      fieldName,
      excludeId,
    }: {
      entityType: EntityType;
      fieldName: string;
      excludeId?: string;
    }) => {
      const { data } = await api.post<ApiResponse<{ available: boolean }>>(
        "/custom-fields/validate-name",
        { entityType, fieldName, excludeId }
      );
      return data.data.available;
    },
  });
}

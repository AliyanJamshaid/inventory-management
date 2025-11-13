/**
 * Supplier Hooks
 * React Query hooks for supplier management
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { api, handleApiError } from "@/lib/api";
import { Supplier, SupplierPerformance, SupplierFilters } from "@/types/supplier";
import { SupplierCreateInput, SupplierUpdateInput } from "@/lib/validations/supplierSchema";
import { toast } from "sonner";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Hook to fetch all suppliers with optional filters
 */
export const useSuppliers = (
  filters?: SupplierFilters,
  options?: UseQueryOptions<PaginatedResponse<Supplier>>
) => {
  const queryParams = new URLSearchParams();

  if (filters?.search) queryParams.append("search", filters.search);
  if (filters?.rating) queryParams.append("rating", filters.rating.toString());
  if (filters?.status) queryParams.append("status", filters.status);
  if (filters?.sortBy) queryParams.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

  const queryString = queryParams.toString();

  return useQuery<PaginatedResponse<Supplier>>({
    queryKey: ["suppliers", filters],
    queryFn: async () => {
      const response = await api.get<ApiResponse<PaginatedResponse<Supplier>>>(
        `/suppliers${queryString ? `?${queryString}` : ""}`
      );
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch a single supplier by ID
 */
export const useSupplier = (
  id: string,
  options?: UseQueryOptions<Supplier>
) => {
  return useQuery<Supplier>({
    queryKey: ["supplier", id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create a new supplier
 */
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SupplierCreateInput) => {
      const response = await api.post<ApiResponse<Supplier>>("/suppliers", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier created successfully");
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to update an existing supplier
 */
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SupplierUpdateInput }) => {
      const response = await api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["supplier", variables.id] });
      toast.success("Supplier updated successfully");
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to delete a supplier
 */
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier deleted successfully");
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to fetch supplier performance metrics
 */
export const useSupplierPerformance = (
  id: string,
  options?: UseQueryOptions<SupplierPerformance>
) => {
  return useQuery<SupplierPerformance>({
    queryKey: ["supplier-performance", id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<SupplierPerformance>>(
        `/suppliers/${id}/performance`
      );
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook to get active suppliers (for dropdowns)
 */
export const useActiveSuppliers = (options?: UseQueryOptions<Supplier[]>) => {
  return useQuery<Supplier[]>({
    queryKey: ["suppliers", "active"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Supplier[]>>("/suppliers?status=active");
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

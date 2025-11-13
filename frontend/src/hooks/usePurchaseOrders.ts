/**
 * Purchase Order Hooks
 * React Query hooks for purchase order management
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { api, handleApiError } from "@/lib/api";
import { PurchaseOrder, POFilters, POStatus } from "@/types/purchaseOrder";
import {
  POCreateInput,
  POUpdateInput,
  POReceiveInput,
  POApprovalInput,
} from "@/lib/validations/purchaseOrderSchema";
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
 * Hook to fetch all purchase orders with optional filters
 */
export const usePurchaseOrders = (
  filters?: POFilters,
  options?: UseQueryOptions<PaginatedResponse<PurchaseOrder>>
) => {
  const queryParams = new URLSearchParams();

  if (filters?.search) queryParams.append("search", filters.search);
  if (filters?.status) queryParams.append("status", filters.status);
  if (filters?.supplierId) queryParams.append("supplierId", filters.supplierId);
  if (filters?.startDate) queryParams.append("startDate", filters.startDate);
  if (filters?.endDate) queryParams.append("endDate", filters.endDate);
  if (filters?.sortBy) queryParams.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

  const queryString = queryParams.toString();

  return useQuery<PaginatedResponse<PurchaseOrder>>({
    queryKey: ["purchase-orders", filters],
    queryFn: async () => {
      const response = await api.get<ApiResponse<PaginatedResponse<PurchaseOrder>>>(
        `/purchase-orders${queryString ? `?${queryString}` : ""}`
      );
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Hook to fetch a single purchase order by ID
 */
export const usePurchaseOrder = (
  id: string,
  options?: UseQueryOptions<PurchaseOrder>
) => {
  return useQuery<PurchaseOrder>({
    queryKey: ["purchase-order", id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create a new purchase order
 */
export const useCreatePO = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: POCreateInput) => {
      const response = await api.post<ApiResponse<PurchaseOrder>>("/purchase-orders", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("Purchase order created successfully");
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to update an existing purchase order
 */
export const useUpdatePO = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: POUpdateInput }) => {
      const response = await api.put<ApiResponse<PurchaseOrder>>(
        `/purchase-orders/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", variables.id] });
      toast.success("Purchase order updated successfully");
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to approve a purchase order
 */
export const useApprovePO = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: POApprovalInput }) => {
      const response = await api.post<ApiResponse<PurchaseOrder>>(
        `/purchase-orders/${id}/approve`,
        data || {}
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", variables.id] });
      toast.success("Purchase order approved successfully");
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to receive a purchase order (goods receipt)
 */
export const useReceivePO = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: POReceiveInput }) => {
      const response = await api.post<ApiResponse<PurchaseOrder>>(
        `/purchase-orders/${id}/receive`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Purchase order received successfully");
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to cancel a purchase order
 */
export const useCancelPO = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await api.post<ApiResponse<PurchaseOrder>>(
        `/purchase-orders/${id}/cancel`,
        { reason }
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", variables.id] });
      toast.success("Purchase order cancelled successfully");
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to delete a purchase order (draft only)
 */
export const useDeletePO = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/purchase-orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("Purchase order deleted successfully");
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to fetch overdue purchase orders
 */
export const useOverduePOs = (options?: UseQueryOptions<PurchaseOrder[]>) => {
  return useQuery<PurchaseOrder[]>({
    queryKey: ["purchase-orders", "overdue"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<PurchaseOrder[]>>(
        "/purchase-orders?overdue=true"
      );
      return response.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

/**
 * Hook to duplicate a purchase order
 */
export const useDuplicatePO = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<ApiResponse<PurchaseOrder>>(
        `/purchase-orders/${id}/duplicate`
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("Purchase order duplicated successfully");
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to send PO email to supplier
 */
export const useSendPOEmail = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<ApiResponse<{ message: string }>>(
        `/purchase-orders/${id}/send-email`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Purchase order email sent successfully");
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

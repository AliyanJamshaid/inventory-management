import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, handleApiError } from "@/lib/api";
import {
  SalesOrder,
  CreateSOData,
  UpdateSOData,
  SOFilters,
  SOStats,
  StockAvailability,
} from "@/types/salesOrder";

// Fetch sales orders with filters
export function useSalesOrders(filters?: SOFilters) {
  return useQuery({
    queryKey: ["salesOrders", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      const response = await api.get(`/sales-orders?${params.toString()}`);
      return response.data;
    },
  });
}

// Fetch single sales order
export function useSalesOrder(id: string, enabled = true) {
  return useQuery({
    queryKey: ["salesOrders", id],
    queryFn: async () => {
      const response = await api.get<SalesOrder>(`/sales-orders/${id}`);
      return response.data;
    },
    enabled: enabled && !!id,
  });
}

// Fetch SO stats
export function useSOStats() {
  return useQuery({
    queryKey: ["salesOrders", "stats"],
    queryFn: async () => {
      const response = await api.get<SOStats>("/sales-orders/stats");
      return response.data;
    },
  });
}

// Check stock availability for SO items
export function useCheckStockAvailability() {
  return useMutation({
    mutationFn: async (items: { product: string; quantity: number }[]) => {
      const response = await api.post<StockAvailability[]>("/sales-orders/check-stock", {
        items,
      });
      return response.data;
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Create sales order
export function useCreateSO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSOData) => {
      const response = await api.post<SalesOrder>("/sales-orders", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders"] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Update sales order
export function useUpdateSO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSOData }) => {
      const response = await api.put<SalesOrder>(`/sales-orders/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders"] });
      queryClient.invalidateQueries({ queryKey: ["salesOrders", variables.id] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Confirm sales order
export function useConfirmSO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<SalesOrder>(`/sales-orders/${id}/confirm`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders"] });
      queryClient.invalidateQueries({ queryKey: ["salesOrders", id] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Process sales order
export function useProcessSO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<SalesOrder>(`/sales-orders/${id}/process`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders"] });
      queryClient.invalidateQueries({ queryKey: ["salesOrders", id] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Ship sales order
export function useShipSO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { trackingNumber: string; shippedDate: string; notes?: string };
    }) => {
      const response = await api.post<SalesOrder>(`/sales-orders/${id}/ship`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders"] });
      queryClient.invalidateQueries({ queryKey: ["salesOrders", variables.id] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Deliver sales order
export function useDeliverSO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { deliveredDate: string; notes?: string };
    }) => {
      const response = await api.post<SalesOrder>(`/sales-orders/${id}/deliver`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders"] });
      queryClient.invalidateQueries({ queryKey: ["salesOrders", variables.id] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Cancel sales order
export function useCancelSO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await api.post<SalesOrder>(`/sales-orders/${id}/cancel`, { reason });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders"] });
      queryClient.invalidateQueries({ queryKey: ["salesOrders", variables.id] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Delete sales order (only for drafts)
export function useDeleteSO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sales-orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders"] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Generate invoice from sales order
export function useGenerateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/sales-orders/${id}/generate-invoice`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders", id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

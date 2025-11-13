import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, handleApiError } from "@/lib/api";
import {
  Stock,
  StockAdjustment,
  StockTransfer,
  StockFilters,
  StockSummary,
  LowStockItem,
  ExpiringItem,
} from "@/types/inventory";

// Fetch all stock with filters
export function useStock(filters?: StockFilters) {
  return useQuery<Stock[]>({
    queryKey: ["stock", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });
      }
      const response = await api.get(`/stock?${params.toString()}`);
      return response.data.data;
    },
  });
}

// Fetch stock by ID
export function useStockById(id: string) {
  return useQuery<Stock>({
    queryKey: ["stock", id],
    queryFn: async () => {
      const response = await api.get(`/stock/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

// Fetch stock by product
export function useStockByProduct(productId: string) {
  return useQuery<Stock[]>({
    queryKey: ["stock", "product", productId],
    queryFn: async () => {
      const response = await api.get(`/stock/product/${productId}`);
      return response.data.data;
    },
    enabled: !!productId,
  });
}

// Fetch stock summary
export function useStockSummary() {
  return useQuery<StockSummary>({
    queryKey: ["stock", "summary"],
    queryFn: async () => {
      const response = await api.get("/stock/summary");
      return response.data.data;
    },
  });
}

// Fetch low stock items
export function useLowStock() {
  return useQuery<LowStockItem[]>({
    queryKey: ["stock", "low"],
    queryFn: async () => {
      const response = await api.get("/stock/low-stock");
      return response.data.data;
    },
  });
}

// Fetch expiring stock items
export function useExpiringStock(days: number = 30) {
  return useQuery<ExpiringItem[]>({
    queryKey: ["stock", "expiring", days],
    queryFn: async () => {
      const response = await api.get(`/stock/expiring?days=${days}`);
      return response.data.data;
    },
  });
}

// Adjust stock mutation
export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StockAdjustment) => {
      const response = await api.post("/stock/adjust", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Transfer stock mutation
export function useTransferStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StockTransfer) => {
      const response = await api.post("/stock/transfer", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

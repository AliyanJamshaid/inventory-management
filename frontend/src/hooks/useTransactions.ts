import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { StockTransaction, TransactionFilters } from "@/types/inventory";

// Fetch all transactions with filters
export function useTransactions(filters?: TransactionFilters) {
  return useQuery<StockTransaction[]>({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });
      }
      const response = await api.get(`/stock/transactions?${params.toString()}`);
      return response.data.data;
    },
  });
}

// Fetch transaction by ID
export function useTransaction(id: string) {
  return useQuery<StockTransaction>({
    queryKey: ["transactions", id],
    queryFn: async () => {
      const response = await api.get(`/stock/transactions/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

// Fetch transactions by product
export function useProductTransactions(productId: string) {
  return useQuery<StockTransaction[]>({
    queryKey: ["transactions", "product", productId],
    queryFn: async () => {
      const response = await api.get(`/stock/transactions/product/${productId}`);
      return response.data.data;
    },
    enabled: !!productId,
  });
}

// Fetch transactions by warehouse
export function useWarehouseTransactions(warehouseId: string) {
  return useQuery<StockTransaction[]>({
    queryKey: ["transactions", "warehouse", warehouseId],
    queryFn: async () => {
      const response = await api.get(`/stock/transactions/warehouse/${warehouseId}`);
      return response.data.data;
    },
    enabled: !!warehouseId,
  });
}

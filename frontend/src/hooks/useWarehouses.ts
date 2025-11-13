import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, handleApiError } from "@/lib/api";
import { Warehouse, Stock } from "@/types/inventory";
import { WarehouseInput } from "@/lib/validations/inventorySchema";

// Fetch all warehouses
export function useWarehouses() {
  return useQuery<Warehouse[]>({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const response = await api.get("/warehouses");
      return response.data.data;
    },
  });
}

// Fetch warehouse by ID
export function useWarehouse(id: string) {
  return useQuery<Warehouse>({
    queryKey: ["warehouses", id],
    queryFn: async () => {
      const response = await api.get(`/warehouses/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

// Fetch stock by warehouse
export function useWarehouseStock(id: string) {
  return useQuery<Stock[]>({
    queryKey: ["warehouses", id, "stock"],
    queryFn: async () => {
      const response = await api.get(`/warehouses/${id}/stock`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

// Create warehouse mutation
export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WarehouseInput) => {
      const response = await api.post("/warehouses", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Update warehouse mutation
export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: WarehouseInput }) => {
      const response = await api.put(`/warehouses/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["warehouses", variables.id] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Delete warehouse mutation
export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/warehouses/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

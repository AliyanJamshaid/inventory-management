import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, handleApiError } from "@/lib/api";
import {
  Customer,
  CustomerFilters,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerStats,
  CustomerActivity,
  LoyaltyTransaction,
} from "@/types/customer";

// Fetch customers with filters
export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: ["customers", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      const response = await api.get(`/customers?${params.toString()}`);
      return response.data;
    },
  });
}

// Fetch single customer
export function useCustomer(id: string, enabled = true) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: async () => {
      const response = await api.get<Customer>(`/customers/${id}`);
      return response.data;
    },
    enabled: enabled && !!id,
  });
}

// Fetch customer stats
export function useCustomerStats() {
  return useQuery({
    queryKey: ["customers", "stats"],
    queryFn: async () => {
      const response = await api.get<CustomerStats>("/customers/stats");
      return response.data;
    },
  });
}

// Fetch customer activity
export function useCustomerActivity(customerId: string) {
  return useQuery({
    queryKey: ["customers", customerId, "activity"],
    queryFn: async () => {
      const response = await api.get<CustomerActivity[]>(`/customers/${customerId}/activity`);
      return response.data;
    },
    enabled: !!customerId,
  });
}

// Create customer
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCustomerData) => {
      const response = await api.post<Customer>("/customers", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Update customer
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCustomerData }) => {
      const response = await api.put<Customer>(`/customers/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", variables.id] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Delete customer
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Update loyalty points
export function useUpdateLoyalty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      data,
    }: {
      customerId: string;
      data: {
        type: "earn" | "redeem";
        points: number;
        description: string;
        reference?: string;
      };
    }) => {
      const response = await api.post<Customer>(`/customers/${customerId}/loyalty`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ["customers", variables.customerId, "activity"] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Fetch loyalty history
export function useLoyaltyHistory(customerId: string) {
  return useQuery({
    queryKey: ["customers", customerId, "loyalty"],
    queryFn: async () => {
      const response = await api.get<LoyaltyTransaction[]>(`/customers/${customerId}/loyalty`);
      return response.data;
    },
    enabled: !!customerId,
  });
}

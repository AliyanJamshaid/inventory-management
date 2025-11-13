import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, handleApiError } from "@/lib/api";
import {
  Payment,
  CreatePaymentData,
  PaymentFilters,
  PaymentStats,
  PaymentSummary,
} from "@/types/payment";

// Fetch payments with filters
export function usePayments(filters?: PaymentFilters) {
  return useQuery({
    queryKey: ["payments", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      const response = await api.get(`/payments?${params.toString()}`);
      return response.data;
    },
  });
}

// Fetch single payment
export function usePayment(id: string, enabled = true) {
  return useQuery({
    queryKey: ["payments", id],
    queryFn: async () => {
      const response = await api.get<Payment>(`/payments/${id}`);
      return response.data;
    },
    enabled: enabled && !!id,
  });
}

// Fetch payment stats
export function usePaymentStats() {
  return useQuery({
    queryKey: ["payments", "stats"],
    queryFn: async () => {
      const response = await api.get<PaymentStats>("/payments/stats");
      return response.data;
    },
  });
}

// Fetch payment summary
export function usePaymentSummary() {
  return useQuery({
    queryKey: ["payments", "summary"],
    queryFn: async () => {
      const response = await api.get<PaymentSummary>("/payments/summary");
      return response.data;
    },
  });
}

// Create payment
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePaymentData) => {
      const response = await api.post<Payment>("/payments", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Update payment status
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: "completed" | "pending" | "failed" | "cancelled";
      notes?: string;
    }) => {
      const response = await api.patch<Payment>(`/payments/${id}/status`, { status, notes });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments", variables.id] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Delete payment
export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/payments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

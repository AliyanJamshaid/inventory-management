import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, handleApiError } from "@/lib/api";
import {
  Invoice,
  CreateInvoiceData,
  UpdateInvoiceData,
  RecordPaymentData,
  InvoiceFilters,
  InvoiceStats,
  OverdueInvoice,
} from "@/types/invoice";

// Fetch invoices with filters
export function useInvoices(filters?: InvoiceFilters) {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      const response = await api.get(`/invoices?${params.toString()}`);
      return response.data;
    },
  });
}

// Fetch single invoice
export function useInvoice(id: string, enabled = true) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: async () => {
      const response = await api.get<Invoice>(`/invoices/${id}`);
      return response.data;
    },
    enabled: enabled && !!id,
  });
}

// Fetch invoice stats
export function useInvoiceStats() {
  return useQuery({
    queryKey: ["invoices", "stats"],
    queryFn: async () => {
      const response = await api.get<InvoiceStats>("/invoices/stats");
      return response.data;
    },
  });
}

// Fetch overdue invoices
export function useOverdueInvoices() {
  return useQuery({
    queryKey: ["invoices", "overdue"],
    queryFn: async () => {
      const response = await api.get<OverdueInvoice[]>("/invoices/overdue");
      return response.data;
    },
  });
}

// Create invoice
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInvoiceData) => {
      const response = await api.post<Invoice>("/invoices", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Update invoice
export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateInvoiceData }) => {
      const response = await api.put<Invoice>(`/invoices/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", variables.id] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Send invoice (mark as sent and optionally send email)
export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      email,
    }: {
      id: string;
      email?: { to: string; subject?: string; message?: string };
    }) => {
      const response = await api.post<Invoice>(`/invoices/${id}/send`, email);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", variables.id] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Record payment for invoice
export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RecordPaymentData }) => {
      const response = await api.post<Invoice>(`/invoices/${id}/payment`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Cancel invoice
export function useCancelInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await api.post<Invoice>(`/invoices/${id}/cancel`, { reason });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", variables.id] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Delete invoice (only for drafts)
export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

// Download invoice PDF
export function useDownloadInvoicePDF() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
}

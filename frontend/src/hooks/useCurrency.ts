import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, handleApiError } from "@/lib/api";
import {
  Currency,
  CurrencyConversion,
  CurrencyFormData,
  UpdateRatesResult,
  ExchangeRateHistory,
} from "@/types/currency";
import { toast } from "@/components/ui/use-toast";

// API Response type
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

// Query keys
export const currencyKeys = {
  all: ["currencies"] as const,
  lists: () => [...currencyKeys.all, "list"] as const,
  list: (filters?: any) => [...currencyKeys.lists(), filters] as const,
  details: () => [...currencyKeys.all, "detail"] as const,
  detail: (code: string) => [...currencyKeys.details(), code] as const,
  base: () => [...currencyKeys.all, "base"] as const,
  active: () => [...currencyKeys.all, "active"] as const,
  history: (fromCurrency: string, toCurrency: string, startDate?: string, endDate?: string) =>
    [...currencyKeys.all, "history", fromCurrency, toCurrency, startDate, endDate] as const,
};

// Fetch all currencies
export function useCurrencies(filters?: { active?: boolean }) {
  return useQuery({
    queryKey: currencyKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.active !== undefined) {
        params.append("active", filters.active.toString());
      }
      const { data } = await api.get<ApiResponse<Currency[]>>(
        `/currencies?${params.toString()}`
      );
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch active currencies only
export function useActiveCurrencies() {
  return useQuery({
    queryKey: currencyKeys.active(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Currency[]>>("/currencies/active");
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch base currency
export function useBaseCurrency() {
  return useQuery({
    queryKey: currencyKeys.base(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Currency>>("/currencies/base");
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch single currency by code
export function useCurrency(code: string, enabled = true) {
  return useQuery({
    queryKey: currencyKeys.detail(code),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Currency>>(`/currencies/${code}`);
      return data.data;
    },
    enabled: enabled && !!code,
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch exchange rate history
export function useExchangeRateHistory(
  fromCurrency: string,
  toCurrency: string,
  startDate?: string,
  endDate?: string,
  enabled = true
) {
  return useQuery({
    queryKey: currencyKeys.history(fromCurrency, toCurrency, startDate, endDate),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const { data } = await api.get<ApiResponse<ExchangeRateHistory[]>>(
        `/currencies/history/${fromCurrency}/${toCurrency}?${params.toString()}`
      );
      return data.data;
    },
    enabled: enabled && !!fromCurrency && !!toCurrency,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// Create currency mutation
export function useCreateCurrency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (currencyData: CurrencyFormData) => {
      const { data } = await api.post<ApiResponse<Currency>>(
        "/currencies",
        currencyData
      );
      return data.data;
    },
    onSuccess: (newCurrency) => {
      queryClient.invalidateQueries({ queryKey: currencyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: currencyKeys.active() });

      toast({
        title: "Success",
        description: `Currency "${newCurrency.name}" created successfully`,
      });
    },
    onError: (error) => {
      const message = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

// Update currency mutation
export function useUpdateCurrency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, ...currencyData }: CurrencyFormData & { code: string }) => {
      const { data } = await api.put<ApiResponse<Currency>>(
        `/currencies/${code}`,
        currencyData
      );
      return data.data;
    },
    onSuccess: (updatedCurrency) => {
      queryClient.invalidateQueries({ queryKey: currencyKeys.detail(updatedCurrency.code) });
      queryClient.invalidateQueries({ queryKey: currencyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: currencyKeys.active() });

      toast({
        title: "Success",
        description: `Currency "${updatedCurrency.name}" updated successfully`,
      });
    },
    onError: (error) => {
      const message = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

// Deactivate currency mutation
export function useDeactivateCurrency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await api.delete<ApiResponse<Currency>>(`/currencies/${code}`);
      return data.data;
    },
    onSuccess: (deactivatedCurrency) => {
      queryClient.invalidateQueries({ queryKey: currencyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: currencyKeys.active() });

      toast({
        title: "Success",
        description: `Currency "${deactivatedCurrency.name}" deactivated successfully`,
      });
    },
    onError: (error) => {
      const message = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

// Set base currency mutation
export function useSetBaseCurrency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await api.post<ApiResponse<Currency>>(
        `/currencies/${code}/set-base`
      );
      return data.data;
    },
    onSuccess: (baseCurrency) => {
      queryClient.invalidateQueries({ queryKey: currencyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: currencyKeys.active() });
      queryClient.invalidateQueries({ queryKey: currencyKeys.base() });

      toast({
        title: "Success",
        description: `${baseCurrency.code} set as base currency`,
      });
    },
    onError: (error) => {
      const message = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

// Update exchange rates mutation
export function useUpdateExchangeRates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiResponse<UpdateRatesResult>>(
        "/currencies/update-rates"
      );
      return data.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: currencyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: currencyKeys.active() });

      toast({
        title: "Success",
        description: `Updated ${result.updated} exchange rates successfully`,
      });

      if (result.failed.length > 0) {
        toast({
          title: "Warning",
          description: `Failed to update: ${result.failed.join(", ")}`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      const message = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

// Convert amount mutation
export function useConvertAmount() {
  return useMutation({
    mutationFn: async ({
      amount,
      fromCurrency,
      toCurrency,
    }: {
      amount: number;
      fromCurrency: string;
      toCurrency: string;
    }) => {
      const { data } = await api.post<ApiResponse<CurrencyConversion>>(
        "/currencies/convert",
        {
          amount,
          fromCurrency,
          toCurrency,
        }
      );
      return data.data;
    },
    onError: (error) => {
      const message = handleApiError(error);
      toast({
        title: "Conversion Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Reports Hooks
 * React Query hooks for fetching report data
 */

import { useQuery, useMutation, UseQueryOptions } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function for API requests
const fetchWithAuth = async (endpoint: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  const data = await response.json();
  return data.data;
};

// Types
export interface StockValuationReport {
  items: Array<{
    productName: string;
    sku: string;
    category: string;
    warehouse: string;
    quantity: number;
    costPrice: number;
    sellingPrice: number;
    totalCost: number;
    totalSellingValue: number;
    potentialProfit: number;
  }>;
  summary: {
    totalItems: number;
    totalQuantity: number;
    totalCostValue: number;
    totalSellingValue: number;
    totalPotentialProfit: number;
    averageMargin: string;
  };
  generatedAt: string;
}

export interface SalesSummaryReport {
  items: Array<{
    orderId: string;
    orderDate: string;
    customerName: string;
    customerEmail: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    lineTotal: number;
    status: string;
    paymentStatus: string;
  }>;
  summary: {
    totalOrders: number;
    totalQuantity: number;
    totalRevenue: number;
    totalDiscount: number;
    averageOrderValue: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  generatedAt: string;
}

export interface PurchaseSummaryReport {
  items: Array<{
    orderId: string;
    orderDate: string;
    supplierName: string;
    supplierEmail: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    status: string;
    expectedDelivery: string;
  }>;
  summary: {
    totalOrders: number;
    totalQuantity: number;
    totalCost: number;
    averageOrderValue: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  generatedAt: string;
}

export interface ProfitLossReport {
  revenue: {
    totalSales: number;
    orderCount: number;
  };
  costs: {
    costOfGoodsSold: number;
    operatingExpenses: number;
    totalCosts: number;
  };
  profit: {
    grossProfit: number;
    grossMargin: number;
    netProfit: number;
    netMargin: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  generatedAt: string;
}

export interface CustomerSummaryReport {
  items: Array<{
    customerId: string;
    customerName: string;
    email: string;
    phone: string;
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: string;
    firstOrderDate: string;
    daysSinceLastOrder: number;
  }>;
  summary: {
    totalCustomers: number;
    totalRevenue: number;
    totalOrders: number;
    averageCustomerValue: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  generatedAt: string;
}

export interface SupplierSummaryReport {
  items: Array<{
    supplierId: string;
    supplierName: string;
    contactPerson: string;
    email: string;
    phone: string;
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: string;
    firstOrderDate: string;
    daysSinceLastOrder: number;
  }>;
  summary: {
    totalSuppliers: number;
    totalPurchases: number;
    totalOrders: number;
    averageSupplierValue: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  generatedAt: string;
}

/**
 * Hook to fetch stock valuation report
 */
export const useStockValuationReport = (
  params?: {
    warehouseId?: string;
    categoryId?: string;
  },
  options?: UseQueryOptions<StockValuationReport>
) => {
  const queryParams = new URLSearchParams();
  if (params?.warehouseId) queryParams.append('warehouseId', params.warehouseId);
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);

  const queryString = queryParams.toString();

  return useQuery<StockValuationReport>({
    queryKey: ['stock-valuation-report', params],
    queryFn: () => fetchWithAuth(`/reports/stock-valuation${queryString ? `?${queryString}` : ''}`),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch sales summary report
 */
export const useSalesSummaryReport = (
  params?: {
    startDate?: string;
    endDate?: string;
    customerId?: string;
  },
  options?: UseQueryOptions<SalesSummaryReport>
) => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.customerId) queryParams.append('customerId', params.customerId);

  const queryString = queryParams.toString();

  return useQuery<SalesSummaryReport>({
    queryKey: ['sales-summary-report', params],
    queryFn: () => fetchWithAuth(`/reports/sales-summary${queryString ? `?${queryString}` : ''}`),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch purchase summary report
 */
export const usePurchaseSummaryReport = (
  params?: {
    startDate?: string;
    endDate?: string;
    supplierId?: string;
  },
  options?: UseQueryOptions<PurchaseSummaryReport>
) => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.supplierId) queryParams.append('supplierId', params.supplierId);

  const queryString = queryParams.toString();

  return useQuery<PurchaseSummaryReport>({
    queryKey: ['purchase-summary-report', params],
    queryFn: () => fetchWithAuth(`/reports/purchase-summary${queryString ? `?${queryString}` : ''}`),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch profit and loss report
 */
export const useProfitLossReport = (
  params?: {
    startDate?: string;
    endDate?: string;
  },
  options?: UseQueryOptions<ProfitLossReport>
) => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();

  return useQuery<ProfitLossReport>({
    queryKey: ['profit-loss-report', params],
    queryFn: () => fetchWithAuth(`/reports/profit-loss${queryString ? `?${queryString}` : ''}`),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch customer summary report
 */
export const useCustomerSummaryReport = (
  params?: {
    startDate?: string;
    endDate?: string;
  },
  options?: UseQueryOptions<CustomerSummaryReport>
) => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();

  return useQuery<CustomerSummaryReport>({
    queryKey: ['customer-summary-report', params],
    queryFn: () => fetchWithAuth(`/reports/customer-summary${queryString ? `?${queryString}` : ''}`),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch supplier summary report
 */
export const useSupplierSummaryReport = (
  params?: {
    startDate?: string;
    endDate?: string;
  },
  options?: UseQueryOptions<SupplierSummaryReport>
) => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();

  return useQuery<SupplierSummaryReport>({
    queryKey: ['supplier-summary-report', params],
    queryFn: () => fetchWithAuth(`/reports/supplier-summary${queryString ? `?${queryString}` : ''}`),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to export report
 */
export const useExportReport = () => {
  return useMutation({
    mutationFn: async (params: {
      reportType: string;
      format: 'csv' | 'pdf';
      data: any[];
    }) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/reports/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      // For CSV, we get the text response
      if (params.format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${params.reportType}-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      return response;
    },
  });
};

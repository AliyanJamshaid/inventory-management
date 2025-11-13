/**
 * Analytics Hooks
 * React Query hooks for fetching analytics data
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';

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
export interface DashboardStats {
  totalProducts: number;
  totalStockValue: number;
  lowStockCount: number;
  orders: {
    today: number;
    week: number;
    month: number;
  };
  revenue: {
    today: number;
    week: number;
    month: number;
  };
  topProducts: Array<{
    productId: string;
    name: string;
    sku: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  recentActivities: Array<{
    _id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    } | null;
    action: string;
    resource: string;
    resourceId?: string;
    details: any;
    timestamp: string;
  }>;
}

export interface SalesAnalytics {
  salesByDate: Array<{
    _id: { year: number; month: number; day?: number; week?: number };
    totalSales: number;
    orderCount: number;
    averageOrderValue: number;
  }>;
  salesByCategory: Array<{
    _id: string;
    categoryName: string;
    totalSales: number;
    totalQuantity: number;
  }>;
  salesByCustomer: Array<{
    customerId: string;
    customerName: string;
    email: string;
    totalSales: number;
    orderCount: number;
  }>;
  summary: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
  };
}

export interface InventoryAnalytics {
  stockByWarehouse: Array<{
    _id: string;
    warehouseName: string;
    totalProducts: number;
    totalQuantity: number;
    totalValue: number;
  }>;
  turnoverData: Array<{
    _id: string;
    productName: string;
    sku: string;
    totalSold: number;
    currentStock: number;
    turnoverRatio: number;
  }>;
  deadStock: Array<{
    productId: string;
    productName: string;
    sku: string;
    warehouse: string;
    quantity: number;
    value: number;
  }>;
  abcAnalysis: {
    categoryA: number;
    categoryB: number;
    categoryC: number;
    items: Array<{
      productId: string;
      productName: string;
      sku: string;
      quantity: number;
      value: number;
      category: string;
      cumulativePercentage: number;
    }>;
  };
}

export interface RevenueAnalytics {
  profitData: Array<{
    date: { year: number; month: number; day: number };
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    averageMargin: number;
  };
}

export interface TopProduct {
  productId: string;
  name: string;
  sku: string;
  category: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
  averagePrice: number;
}

export interface LowStockItem {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  warehouse: string;
  currentQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  deficit: number;
  status: 'OUT_OF_STOCK' | 'LOW_STOCK';
}

export interface ExpiringProduct {
  productId: string;
  productName: string;
  sku: string;
  batchNumber: string;
  warehouse: string;
  quantity: number;
  expiryDate: string;
  daysUntilExpiry: number;
  value: number;
}

/**
 * Hook to fetch dashboard statistics
 */
export const useDashboardStats = (options?: UseQueryOptions<DashboardStats>) => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => fetchWithAuth('/analytics/dashboard'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch sales analytics
 */
export const useSalesAnalytics = (
  params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'daily' | 'weekly' | 'monthly';
  },
  options?: UseQueryOptions<SalesAnalytics>
) => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.groupBy) queryParams.append('groupBy', params.groupBy);

  const queryString = queryParams.toString();

  return useQuery<SalesAnalytics>({
    queryKey: ['sales-analytics', params],
    queryFn: () => fetchWithAuth(`/analytics/sales${queryString ? `?${queryString}` : ''}`),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch inventory analytics
 */
export const useInventoryAnalytics = (options?: UseQueryOptions<InventoryAnalytics>) => {
  return useQuery<InventoryAnalytics>({
    queryKey: ['inventory-analytics'],
    queryFn: () => fetchWithAuth('/analytics/inventory'),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook to fetch revenue analytics
 */
export const useRevenueAnalytics = (
  params?: {
    startDate?: string;
    endDate?: string;
  },
  options?: UseQueryOptions<RevenueAnalytics>
) => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();

  return useQuery<RevenueAnalytics>({
    queryKey: ['revenue-analytics', params],
    queryFn: () => fetchWithAuth(`/analytics/revenue${queryString ? `?${queryString}` : ''}`),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch top products
 */
export const useTopProducts = (
  params?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
  },
  options?: UseQueryOptions<TopProduct[]>
) => {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();

  return useQuery<TopProduct[]>({
    queryKey: ['top-products', params],
    queryFn: () => fetchWithAuth(`/analytics/top-products${queryString ? `?${queryString}` : ''}`),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch low stock items
 */
export const useLowStockItems = (options?: UseQueryOptions<LowStockItem[]>) => {
  return useQuery<LowStockItem[]>({
    queryKey: ['low-stock-items'],
    queryFn: () => fetchWithAuth('/analytics/low-stock'),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Hook to fetch expiring products
 */
export const useExpiringProducts = (
  params?: {
    days?: number;
  },
  options?: UseQueryOptions<ExpiringProduct[]>
) => {
  const queryParams = new URLSearchParams();
  if (params?.days) queryParams.append('days', params.days.toString());

  const queryString = queryParams.toString();

  return useQuery<ExpiringProduct[]>({
    queryKey: ['expiring-products', params],
    queryFn: () => fetchWithAuth(`/analytics/expiring${queryString ? `?${queryString}` : ''}`),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

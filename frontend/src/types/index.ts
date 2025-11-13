export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  category: string;
  price: number;
  cost?: number;
  supplier?: Supplier;
  stock?: number;
  reorderLevel?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  product: Product;
  quantity: number;
  location?: string;
  warehouse?: string;
  lastUpdated: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: Supplier;
  status: "pending" | "approved" | "received" | "cancelled";
  items: PurchaseOrderItem[];
  totalAmount: number;
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customer: Customer;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: SalesOrderItem[];
  totalAmount: number;
  orderDate: string;
  shippedDate?: string;
  deliveredDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrderItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalInventoryValue: number;
  lowStockProducts: number;
  pendingOrders: number;
  recentSales: number;
  salesGrowth: number;
}

import { Product } from "./index";

export interface Stock {
  _id: string;
  product: Product | string;
  warehouse: Warehouse | string;
  location?: StockLocation | string;
  quantity: number;
  available: number;
  reserved: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  batchNumber?: string;
  serialNumber?: string;
  expirationDate?: string;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  _id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  manager?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockLocation {
  _id: string;
  warehouse: Warehouse | string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  zone?: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransaction {
  _id: string;
  product: Product | string;
  warehouse: Warehouse | string;
  location?: StockLocation | string;
  type: "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT";
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  reasonCode?: string;
  reference?: string;
  notes?: string;
  performedBy: string;
  batchNumber?: string;
  serialNumber?: string;
  expirationDate?: string;
  transferTo?: Warehouse | string;
  transferFrom?: Warehouse | string;
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustment {
  product: string;
  warehouse: string;
  location?: string;
  adjustmentType: "ADD" | "REMOVE" | "SET";
  quantity: number;
  reasonCode: "PURCHASE" | "SALE" | "DAMAGE" | "LOSS" | "FOUND" | "RETURN" | "ADJUSTMENT";
  reference?: string;
  notes?: string;
  batchNumber?: string;
  serialNumber?: string;
  expirationDate?: string;
  reorderPoint?: number;
  reorderQuantity?: number;
}

export interface StockTransfer {
  product: string;
  fromWarehouse: string;
  fromLocation?: string;
  toWarehouse: string;
  toLocation?: string;
  quantity: number;
  reference?: string;
  notes?: string;
  batchNumber?: string;
  serialNumber?: string;
  expirationDate?: string;
}

export interface StockSummary {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringCount: number;
}

export interface LowStockItem {
  product: Product;
  warehouse: Warehouse;
  currentStock: number;
  reorderPoint: number;
  reorderQuantity?: number;
  status: "LOW" | "OUT_OF_STOCK";
}

export interface ExpiringItem {
  product: Product;
  warehouse: Warehouse;
  batchNumber?: string;
  expirationDate: string;
  quantity: number;
  daysUntilExpiry: number;
}

export type StockStatus = "HIGH_STOCK" | "NORMAL" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface StockFilters {
  warehouse?: string;
  product?: string;
  category?: string;
  status?: StockStatus;
  lowStock?: boolean;
  expiringSoon?: boolean;
  search?: string;
}

export interface TransactionFilters {
  warehouse?: string;
  product?: string;
  type?: StockTransaction["type"];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

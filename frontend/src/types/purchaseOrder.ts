import { Supplier } from "./supplier";
import { Product } from "./index";

export enum POStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  RECEIVED = "RECEIVED",
  CANCELLED = "CANCELLED",
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: Supplier;
  status: POStatus;
  orderDate: string;
  expectedDeliveryDate: string;
  receivedDate?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  notes?: string;
  approvedBy?: {
    id: string;
    name: string;
  };
  approvedAt?: string;
  receivedBy?: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  product: Product;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
}

export interface POFormData {
  supplierId: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
  }>;
  shippingCost: number;
  tax: number;
  notes?: string;
  status: POStatus;
}

export interface POReceiveData {
  warehouseId: string;
  items: Array<{
    itemId: string;
    receivedQuantity: number;
    batchNumber?: string;
    qualityNotes?: string;
  }>;
  notes?: string;
}

export interface POFilters {
  search?: string;
  status?: POStatus;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "orderDate" | "expectedDeliveryDate" | "totalAmount" | "orderNumber";
  sortOrder?: "asc" | "desc";
}

export interface POStatusTimeline {
  status: POStatus;
  timestamp: string;
  user?: {
    id: string;
    name: string;
  };
  notes?: string;
}

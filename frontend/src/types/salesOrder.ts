import { Customer } from "./customer";
import { Product } from "./index";

export type SOStatus = "draft" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "partial" | "paid";

export interface SOItem {
  _id?: string;
  product: Product | string;
  productName?: string;
  sku?: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
  availableStock?: number;
}

export interface SOPricing {
  subtotal: number;
  discount: number;
  discountPercentage?: number;
  tax: number;
  taxRate: number;
  shipping: number;
  total: number;
}

export interface SalesOrder {
  _id: string;
  orderNumber: string;
  customer: Customer;
  items: SOItem[];
  pricing: SOPricing;
  status: SOStatus;
  paymentStatus: PaymentStatus;
  orderDate: string;
  deliveryDate?: string;
  expectedDeliveryDate?: string;
  shippedDate?: string;
  deliveredDate?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  internalNotes?: string;
  trackingNumber?: string;
  invoiceGenerated: boolean;
  invoice?: string; // Invoice ID
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSOData {
  customer: string;
  items: Omit<SOItem, "_id" | "total">[];
  orderDate: string;
  expectedDeliveryDate?: string;
  shippingAddress?: SalesOrder["shippingAddress"];
  billingAddress?: SalesOrder["billingAddress"];
  pricing: {
    discountPercentage?: number;
    discount?: number;
    taxRate: number;
    shipping: number;
  };
  notes?: string;
  internalNotes?: string;
  status?: "draft" | "confirmed";
}

export interface UpdateSOData extends Partial<CreateSOData> {
  status?: SOStatus;
  paymentStatus?: PaymentStatus;
  shippedDate?: string;
  deliveredDate?: string;
  trackingNumber?: string;
}

export interface SOFilters {
  search?: string;
  customer?: string;
  status?: SOStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "orderDate" | "total" | "orderNumber";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface SOStats {
  totalOrders: number;
  draftOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  pendingPayments: number;
  averageOrderValue: number;
}

export interface SOStatusHistory {
  status: SOStatus;
  timestamp: string;
  updatedBy?: string;
  notes?: string;
}

export interface StockAvailability {
  product: string;
  productName: string;
  sku: string;
  requestedQuantity: number;
  availableQuantity: number;
  isAvailable: boolean;
}

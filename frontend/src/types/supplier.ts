export enum PaymentTerms {
  NET_30 = "NET_30",
  NET_60 = "NET_60",
  NET_90 = "NET_90",
  COD = "COD",
  ADVANCE = "ADVANCE",
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  website?: string;
  contactPerson: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  taxId?: string;
  paymentTerms: PaymentTerms;
  rating: number; // 1-5
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierFormData {
  name: string;
  code: string;
  email: string;
  phone: string;
  website?: string;
  contactPerson: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  taxId?: string;
  paymentTerms: PaymentTerms;
  rating: number;
  notes?: string;
  isActive: boolean;
}

export interface SupplierPerformance {
  supplierId: string;
  totalOrders: number;
  totalValue: number;
  averageOrderValue: number;
  onTimeDeliveryRate: number;
  qualityRating: number;
  orderHistory: Array<{
    month: string;
    orderCount: number;
    orderValue: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    orderDate: string;
    status: string;
    totalAmount: number;
  }>;
}

export interface SupplierFilters {
  search?: string;
  rating?: number;
  status?: "active" | "inactive";
  sortBy?: "name" | "rating" | "totalOrders" | "totalValue";
  sortOrder?: "asc" | "desc";
}

export type CustomerType = "B2B" | "B2C";
export type CustomerStatus = "active" | "inactive";

export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Customer {
  _id: string;
  customerNumber: string;
  name: string;
  type: CustomerType;
  email: string;
  phone: string;
  contactPerson?: string; // For B2B
  address: CustomerAddress;
  taxId?: string;
  creditLimit?: number; // For B2B
  paymentTerms?: number; // Days
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  status: CustomerStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerStats {
  totalCustomers: number;
  b2bCount: number;
  b2cCount: number;
  totalRevenue: number;
  activeCustomers: number;
  inactiveCustomers: number;
  averageOrderValue: number;
  topCustomers: Customer[];
}

export interface CustomerFilters {
  search?: string;
  type?: CustomerType;
  status?: CustomerStatus;
  sortBy?: "name" | "totalSpent" | "totalOrders" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CreateCustomerData {
  name: string;
  type: CustomerType;
  email: string;
  phone: string;
  contactPerson?: string;
  address: CustomerAddress;
  taxId?: string;
  creditLimit?: number;
  paymentTerms?: number;
  notes?: string;
  status?: CustomerStatus;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {}

export interface CustomerActivity {
  _id: string;
  customer: string;
  type: "order" | "payment" | "loyalty" | "note";
  description: string;
  amount?: number;
  createdAt: string;
}

export interface LoyaltyTransaction {
  _id: string;
  customer: string;
  type: "earn" | "redeem";
  points: number;
  description: string;
  reference?: string; // Order or invoice ID
  createdAt: string;
}

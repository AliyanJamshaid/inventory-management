import { Customer } from "./customer";
import { SOItem } from "./salesOrder";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled" | "partial";

export interface InvoiceItem extends SOItem {}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: Customer;
  salesOrder?: string; // SO ID reference
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  discountPercentage?: number;
  tax: number;
  taxRate: number;
  shipping: number;
  total: number;
  paidAmount: number;
  balanceAmount: number;
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate: string;
  sentDate?: string;
  paidDate?: string;
  paymentTerms?: number; // Days
  notes?: string;
  termsAndConditions?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  payments: InvoicePayment[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoicePayment {
  _id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export type PaymentMethod = "cash" | "card" | "bank_transfer" | "check" | "other";

export interface CreateInvoiceData {
  customer: string;
  salesOrder?: string;
  items: Omit<InvoiceItem, "_id" | "total">[];
  invoiceDate: string;
  dueDate: string;
  paymentTerms?: number;
  pricing: {
    discountPercentage?: number;
    discount?: number;
    taxRate: number;
    shipping: number;
  };
  billingAddress?: Invoice["billingAddress"];
  notes?: string;
  termsAndConditions?: string;
  status?: "draft" | "sent";
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  status?: InvoiceStatus;
}

export interface RecordPaymentData {
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
}

export interface InvoiceFilters {
  search?: string;
  customer?: string;
  salesOrder?: string;
  status?: InvoiceStatus;
  dateFrom?: string;
  dateTo?: string;
  overdue?: boolean;
  sortBy?: "invoiceDate" | "dueDate" | "total" | "invoiceNumber";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface InvoiceStats {
  totalInvoices: number;
  draftInvoices: number;
  sentInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  cancelledInvoices: number;
  totalRevenue: number;
  totalPaid: number;
  totalOutstanding: number;
  totalOverdue: number;
  averageInvoiceValue: number;
}

export interface OverdueInvoice {
  invoice: Invoice;
  daysOverdue: number;
  overdueAmount: number;
}

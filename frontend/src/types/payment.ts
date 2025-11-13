import { Customer } from "./customer";
import { Invoice, PaymentMethod } from "./invoice";

export interface Payment {
  _id: string;
  paymentNumber: string;
  customer: Customer;
  invoice: Invoice | string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  transactionId?: string;
  reference?: string;
  notes?: string;
  status: "completed" | "pending" | "failed" | "cancelled";
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentData {
  customer: string;
  invoice: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  transactionId?: string;
  reference?: string;
  notes?: string;
}

export interface PaymentFilters {
  search?: string;
  customer?: string;
  invoice?: string;
  paymentMethod?: PaymentMethod;
  status?: Payment["status"];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "paymentDate" | "amount" | "paymentNumber";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  averagePayment: number;
  paymentsByMethod: {
    method: PaymentMethod;
    count: number;
    total: number;
  }[];
}

export interface PaymentSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

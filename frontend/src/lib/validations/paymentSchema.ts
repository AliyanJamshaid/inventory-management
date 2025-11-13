import { z } from "zod";

export const createPaymentSchema = z.object({
  customer: z.string().min(1, "Customer is required"),
  invoice: z.string().min(1, "Invoice is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.enum(["cash", "card", "bank_transfer", "check", "other"]),
  paymentDate: z.string().min(1, "Payment date is required"),
  transactionId: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const updatePaymentSchema = createPaymentSchema.partial().extend({
  status: z.enum(["completed", "pending", "failed", "cancelled"]).optional(),
});

export type CreatePaymentFormData = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentFormData = z.infer<typeof updatePaymentSchema>;

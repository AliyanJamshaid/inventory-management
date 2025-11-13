import { z } from "zod";

export const invoiceItemSchema = z.object({
  product: z.string().min(1, "Product is required"),
  productName: z.string().optional(),
  sku: z.string().optional(),
  variant: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  discount: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
});

export const invoiceAddressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
});

export const createInvoiceSchema = z.object({
  customer: z.string().min(1, "Customer is required"),
  salesOrder: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  paymentTerms: z.number().min(0).optional(),
  pricing: z.object({
    discountPercentage: z.number().min(0).max(100).optional(),
    discount: z.number().min(0).optional(),
    taxRate: z.number().min(0).max(100),
    shipping: z.number().min(0).default(0),
  }),
  billingAddress: invoiceAddressSchema.optional(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  status: z.enum(["draft", "sent"]).optional(),
}).refine(
  (data) => {
    // Ensure due date is after invoice date
    if (data.invoiceDate && data.dueDate) {
      return new Date(data.dueDate) >= new Date(data.invoiceDate);
    }
    return true;
  },
  {
    message: "Due date must be on or after invoice date",
    path: ["dueDate"],
  }
);

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled", "partial"]).optional(),
});

export const recordPaymentSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.enum(["cash", "card", "bank_transfer", "check", "other"]),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

export const sendInvoiceSchema = z.object({
  email: z.string().email("Invalid email address"),
  subject: z.string().optional(),
  message: z.string().optional(),
  copyToSelf: z.boolean().optional(),
});

export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceFormData = z.infer<typeof updateInvoiceSchema>;
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;
export type RecordPaymentFormData = z.infer<typeof recordPaymentSchema>;
export type SendInvoiceFormData = z.infer<typeof sendInvoiceSchema>;

import { z } from "zod";

export const soItemSchema = z.object({
  product: z.string().min(1, "Product is required"),
  productName: z.string().optional(),
  sku: z.string().optional(),
  variant: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  discount: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
});

export const soAddressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
});

export const createSOSchema = z.object({
  customer: z.string().min(1, "Customer is required"),
  items: z.array(soItemSchema).min(1, "At least one item is required"),
  orderDate: z.string().min(1, "Order date is required"),
  expectedDeliveryDate: z.string().optional(),
  shippingAddress: soAddressSchema.optional(),
  billingAddress: soAddressSchema.optional(),
  pricing: z.object({
    discountPercentage: z.number().min(0).max(100).optional(),
    discount: z.number().min(0).optional(),
    taxRate: z.number().min(0).max(100),
    shipping: z.number().min(0).default(0),
  }),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  status: z.enum(["draft", "confirmed"]).optional(),
});

export const updateSOSchema = z.object({
  customer: z.string().optional(),
  items: z.array(soItemSchema).optional(),
  orderDate: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  shippingAddress: soAddressSchema.optional(),
  billingAddress: soAddressSchema.optional(),
  pricing: z.object({
    discountPercentage: z.number().min(0).max(100).optional(),
    discount: z.number().min(0).optional(),
    taxRate: z.number().min(0).max(100).optional(),
    shipping: z.number().min(0).optional(),
  }).optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  status: z.enum(["draft", "confirmed", "processing", "shipped", "delivered", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending", "partial", "paid"]).optional(),
  shippedDate: z.string().optional(),
  deliveredDate: z.string().optional(),
  trackingNumber: z.string().optional(),
});

export const confirmSOSchema = z.object({
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
});

export const shipSOSchema = z.object({
  trackingNumber: z.string().min(1, "Tracking number is required"),
  shippedDate: z.string().min(1, "Shipped date is required"),
  notes: z.string().optional(),
});

export const deliverSOSchema = z.object({
  deliveredDate: z.string().min(1, "Delivered date is required"),
  notes: z.string().optional(),
});

export type CreateSOFormData = z.infer<typeof createSOSchema>;
export type UpdateSOFormData = z.infer<typeof updateSOSchema>;
export type SOItemFormData = z.infer<typeof soItemSchema>;
export type ConfirmSOFormData = z.infer<typeof confirmSOSchema>;
export type ShipSOFormData = z.infer<typeof shipSOSchema>;
export type DeliverSOFormData = z.infer<typeof deliverSOSchema>;

import { z } from "zod";
import { POStatus } from "@/types/purchaseOrder";

export const poItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  variantId: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Price must be positive"),
});

export const poCreateSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  orderDate: z.string().min(1, "Order date is required"),
  expectedDeliveryDate: z.string().min(1, "Expected delivery date is required"),
  items: z.array(poItemSchema).min(1, "At least one item is required"),
  shippingCost: z.number().min(0, "Shipping cost must be positive").default(0),
  tax: z.number().min(0, "Tax must be positive").default(0),
  notes: z.string().optional(),
  status: z.nativeEnum(POStatus).default(POStatus.DRAFT),
}).refine(
  (data) => {
    const orderDate = new Date(data.orderDate);
    const deliveryDate = new Date(data.expectedDeliveryDate);
    return deliveryDate >= orderDate;
  },
  {
    message: "Expected delivery date must be after order date",
    path: ["expectedDeliveryDate"],
  }
);

export const poUpdateSchema = poCreateSchema.partial();

export const poReceiveItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  receivedQuantity: z.number().min(0, "Received quantity must be positive"),
  batchNumber: z.string().optional(),
  qualityNotes: z.string().optional(),
});

export const poReceiveSchema = z.object({
  warehouseId: z.string().min(1, "Warehouse is required"),
  items: z.array(poReceiveItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
});

export const poApprovalSchema = z.object({
  notes: z.string().optional(),
});

export type POCreateInput = z.infer<typeof poCreateSchema>;
export type POUpdateInput = z.infer<typeof poUpdateSchema>;
export type POReceiveInput = z.infer<typeof poReceiveSchema>;
export type POApprovalInput = z.infer<typeof poApprovalSchema>;

import { z } from "zod";

export const stockAdjustmentSchema = z.object({
  product: z.string().min(1, "Product is required"),
  warehouse: z.string().min(1, "Warehouse is required"),
  location: z.string().optional(),
  adjustmentType: z.enum(["ADD", "REMOVE", "SET"], {
    required_error: "Adjustment type is required",
  }),
  quantity: z.number().positive("Quantity must be positive"),
  reasonCode: z.enum([
    "PURCHASE",
    "SALE",
    "DAMAGE",
    "LOSS",
    "FOUND",
    "RETURN",
    "ADJUSTMENT",
  ], {
    required_error: "Reason code is required",
  }),
  reference: z.string().optional(),
  notes: z.string().optional(),
  batchNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  expirationDate: z.string().optional(),
  reorderPoint: z.number().min(0).optional(),
  reorderQuantity: z.number().min(0).optional(),
});

export const stockTransferSchema = z.object({
  product: z.string().min(1, "Product is required"),
  fromWarehouse: z.string().min(1, "Source warehouse is required"),
  fromLocation: z.string().optional(),
  toWarehouse: z.string().min(1, "Destination warehouse is required"),
  toLocation: z.string().optional(),
  quantity: z.number().positive("Quantity must be positive"),
  reference: z.string().optional(),
  notes: z.string().optional(),
  batchNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  expirationDate: z.string().optional(),
}).refine((data) => data.fromWarehouse !== data.toWarehouse, {
  message: "Source and destination warehouses must be different",
  path: ["toWarehouse"],
});

export const warehouseSchema = z.object({
  name: z.string().min(1, "Warehouse name is required"),
  code: z.string().min(1, "Warehouse code is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  manager: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const locationSchema = z.object({
  warehouse: z.string().min(1, "Warehouse is required"),
  aisle: z.string().optional(),
  rack: z.string().optional(),
  shelf: z.string().optional(),
  bin: z.string().optional(),
  zone: z.string().optional(),
  code: z.string().min(1, "Location code is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
export type StockTransferInput = z.infer<typeof stockTransferSchema>;
export type WarehouseInput = z.infer<typeof warehouseSchema>;
export type LocationInput = z.infer<typeof locationSchema>;

import { z } from "zod";

// Product variant schema
export const productVariantSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().min(1, "SKU is required"),
  attributes: z.record(z.string()),
  costPrice: z.number().min(0, "Cost price must be positive"),
  sellingPrice: z.number().min(0, "Selling price must be positive"),
  stock: z.number().min(0, "Stock must be positive").optional(),
  isActive: z.boolean().default(true),
});

// Product dimensions schema
export const productDimensionsSchema = z.object({
  length: z.number().min(0, "Length must be positive"),
  width: z.number().min(0, "Width must be positive"),
  height: z.number().min(0, "Height must be positive"),
  unit: z.enum(["cm", "in", "m", "ft"]).default("cm"),
});

// Create product schema
export const productCreateSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200, "Name is too long"),
  description: z.string().max(2000, "Description is too long").optional(),
  sku: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  supplier: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  costPrice: z.number().min(0, "Cost price must be positive"),
  sellingPrice: z.number().min(0, "Selling price must be positive"),
  taxRate: z.number().min(0).max(100, "Tax rate must be between 0 and 100").default(0),
  minStockLevel: z.number().min(0, "Min stock level must be positive").default(0),
  maxStockLevel: z.number().min(0, "Max stock level must be positive").default(0),
  reorderPoint: z.number().min(0, "Reorder point must be positive").default(0),
  reorderQuantity: z.number().min(0, "Reorder quantity must be positive").default(0),
  variants: z.array(productVariantSchema).optional(),
  images: z.array(z.string()).optional(),
  barcode: z.string().optional(),
  weight: z.number().min(0, "Weight must be positive").optional(),
  dimensions: productDimensionsSchema.optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
}).refine(
  (data) => data.sellingPrice >= data.costPrice,
  {
    message: "Selling price should be greater than or equal to cost price",
    path: ["sellingPrice"],
  }
).refine(
  (data) => !data.maxStockLevel || data.maxStockLevel >= data.minStockLevel,
  {
    message: "Max stock level should be greater than min stock level",
    path: ["maxStockLevel"],
  }
);

// Update product schema
export const productUpdateSchema = productCreateSchema.partial().extend({
  _id: z.string().min(1, "Product ID is required"),
});

// Category schema
export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  parent: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Update category schema
export const categoryUpdateSchema = categoryCreateSchema.partial().extend({
  _id: z.string().min(1, "Category ID is required"),
});

// Product filters schema
export const productFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  supplier: z.string().optional(),
  status: z.enum(["active", "inactive", "all"]).default("all"),
  stockStatus: z.enum(["in_stock", "low_stock", "out_of_stock", "all"]).default("all"),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(["name", "price", "stock", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Export types inferred from schemas
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;

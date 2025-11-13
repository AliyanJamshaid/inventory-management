export interface Category {
  _id: string;
  name: string;
  description?: string;
  parent?: string | Category;
  level: number;
  path: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface ProductVariant {
  _id?: string;
  name: string;
  sku: string;
  attributes: Record<string, string>;
  costPrice: number;
  sellingPrice: number;
  stock?: number;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  sku: string;
  category: string | Category;
  supplier?: string | Supplier;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  taxRate: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  reorderQuantity: number;
  variants?: ProductVariant[];
  images?: string[];
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed fields
  totalStock?: number;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  profitMargin?: number;
}

export interface CreateProductDTO {
  name: string;
  description?: string;
  sku?: string;
  category: string;
  supplier?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  taxRate?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  variants?: Omit<ProductVariant, "_id">[];
  images?: string[];
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  tags?: string[];
  isActive?: boolean;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  _id: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  supplier?: string;
  status?: "active" | "inactive" | "all";
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock" | "all";
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  sortBy?: "name" | "price" | "stock" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  parent?: string;
  isActive?: boolean;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {
  _id: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

// Stock-related types
export interface StockLevel {
  warehouse: string;
  quantity: number;
  reserved: number;
  available: number;
}

export interface ProductWithStock extends Product {
  stockLevels: StockLevel[];
}

// Transaction-related types
export interface ProductTransaction {
  _id: string;
  product: string | Product;
  type: "purchase" | "sale" | "adjustment" | "transfer";
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  warehouse?: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

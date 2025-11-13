import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, handleApiError } from "@/lib/api";
import {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilters,
  PaginatedResponse,
  ApiResponse,
  ProductWithStock,
  ProductTransaction,
} from "@/types/product";
import { toast } from "@/components/ui/use-toast";

// Query keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  search: (query: string) => [...productKeys.all, "search", query] as const,
  stock: (id: string) => [...productKeys.all, "stock", id] as const,
  transactions: (id: string) => [...productKeys.all, "transactions", id] as const,
};

// Fetch products with filters and pagination
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const { data } = await api.get<ApiResponse<PaginatedResponse<Product>>>(
        `/products?${params.toString()}`
      );
      return data.data;
    },
    staleTime: 30000,
  });
}

// Fetch single product
export function useProduct(id: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`);
      return data.data;
    },
    enabled: enabled && !!id,
    staleTime: 60000,
  });
}

// Search products
export function useProductSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Product[]>>(
        `/products/search?q=${encodeURIComponent(query)}`
      );
      return data.data;
    },
    enabled: enabled && query.length > 0,
    staleTime: 30000,
  });
}

// Fetch product with stock levels
export function useProductStock(id: string) {
  return useQuery({
    queryKey: productKeys.stock(id),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ProductWithStock>>(
        `/products/${id}/stock`
      );
      return data.data;
    },
    enabled: !!id,
    staleTime: 10000,
  });
}

// Fetch product transactions
export function useProductTransactions(id: string) {
  return useQuery({
    queryKey: productKeys.transactions(id),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ProductTransaction[]>>(
        `/products/${id}/transactions`
      );
      return data.data;
    },
    enabled: !!id,
    staleTime: 30000,
  });
}

// Create product mutation
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: CreateProductDTO) => {
      const { data } = await api.post<ApiResponse<Product>>(
        "/products",
        productData
      );
      return data.data;
    },
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      toast({
        title: "Success",
        description: `Product "${newProduct.name}" created successfully`,
      });
    },
    onError: (error) => {
      const message = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

// Update product mutation
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ _id, ...productData }: UpdateProductDTO) => {
      const { data } = await api.put<ApiResponse<Product>>(
        `/products/${_id}`,
        productData
      );
      return data.data;
    },
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(updatedProduct._id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      toast({
        title: "Success",
        description: `Product "${updatedProduct.name}" updated successfully`,
      });
    },
    onError: (error) => {
      const message = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

// Delete product mutation
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiResponse<void>>(`/products/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error) => {
      const message = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

// Bulk delete products mutation
export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data } = await api.post<ApiResponse<void>>("/products/bulk-delete", {
        ids,
      });
      return data;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      toast({
        title: "Success",
        description: `${ids.length} product(s) deleted successfully`,
      });
    },
    onError: (error) => {
      const message = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

// Export products mutation
export function useExportProducts() {
  return useMutation({
    mutationFn: async (filters: ProductFilters = {}) => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await api.get(`/products/export?${params.toString()}`, {
        responseType: "blob",
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `products-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Products exported successfully",
      });
    },
    onError: (error) => {
      const message = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

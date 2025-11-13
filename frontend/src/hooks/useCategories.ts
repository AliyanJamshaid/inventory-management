import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, handleApiError } from "@/lib/api";
import {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  ApiResponse,
} from "@/types/product";
import { toast } from "@/components/ui/use-toast";

// Query keys
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters?: any) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  tree: () => [...categoryKeys.all, "tree"] as const,
};

// Fetch all categories
export function useCategories(filters?: { isActive?: boolean }) {
  return useQuery({
    queryKey: categoryKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.isActive !== undefined) {
        params.append("isActive", filters.isActive.toString());
      }
      const { data } = await api.get<ApiResponse<Category[]>>(
        `/categories?${params.toString()}`
      );
      return data.data;
    },
    staleTime: 60000, // 1 minute
  });
}

// Fetch single category
export function useCategory(id: string, enabled = true) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Category>>(`/categories/${id}`);
      return data.data;
    },
    enabled: enabled && !!id,
    staleTime: 60000,
  });
}

// Fetch category tree (hierarchical structure)
export function useCategoryTree() {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Category[]>>("/categories/tree");
      return data.data;
    },
    staleTime: 60000,
  });
}

// Create category mutation
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: CreateCategoryDTO) => {
      const { data } = await api.post<ApiResponse<Category>>(
        "/categories",
        categoryData
      );
      return data.data;
    },
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      
      toast({
        title: "Success",
        description: `Category "${newCategory.name}" created successfully`,
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

// Update category mutation
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ _id, ...categoryData }: UpdateCategoryDTO) => {
      const { data } = await api.put<ApiResponse<Category>>(
        `/categories/${_id}`,
        categoryData
      );
      return data.data;
    },
    onSuccess: (updatedCategory) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(updatedCategory._id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      
      toast({
        title: "Success",
        description: `Category "${updatedCategory.name}" updated successfully`,
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

// Delete category mutation
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiResponse<void>>(`/categories/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      
      toast({
        title: "Success",
        description: "Category deleted successfully",
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Download,
  Trash2,
  LayoutGrid,
  LayoutList,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { ProductTable } from "@/components/features/ProductTable";
import { ProductCard } from "@/components/features/ProductCard";
import { ProductForm } from "@/components/features/ProductForm";
import { ProductFilters } from "@/components/features/ProductFilters";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useBulkDeleteProducts,
  useExportProducts,
} from "@/hooks/useProducts";
import { Product, ProductFilters as ProductFiltersType, CreateProductDTO } from "@/types/product";

const DEFAULT_FILTERS: ProductFiltersType = {
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
  status: "all",
  stockStatus: "all",
};

export default function ProductsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ProductFiltersType>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Hooks
  const { data: productsData, isLoading, error } = useProducts(filters);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const bulkDelete = useBulkDeleteProducts();
  const exportProducts = useExportProducts();

  // Handlers
  const handleFiltersChange = (newFilters: ProductFiltersType) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleSort = (field: string) => {
    setFilters({
      ...filters,
      sortBy: field as any,
      sortOrder: filters.sortBy === field && filters.sortOrder === "asc" ? "desc" : "asc",
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleView = (product: Product) => {
    router.push(`/products/${product._id}`);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const handleCreate = async (data: CreateProductDTO) => {
    await createProduct.mutateAsync(data);
    setShowCreateDialog(false);
  };

  const handleUpdate = async (data: CreateProductDTO) => {
    if (selectedProduct) {
      await updateProduct.mutateAsync({ _id: selectedProduct._id, ...data });
      setShowEditDialog(false);
      setSelectedProduct(null);
    }
  };

  const handleDelete = async () => {
    if (selectedProduct) {
      await deleteProduct.mutateAsync(selectedProduct._id);
      setShowDeleteDialog(false);
      setSelectedProduct(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length > 0) {
      await bulkDelete.mutateAsync(selectedProducts);
      setSelectedProducts([]);
    }
  };

  const handleExport = async () => {
    await exportProducts.mutateAsync(filters);
  };

  const products = productsData?.data || [];
  const pagination = productsData?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportProducts.isPending}
          >
            {exportProducts.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load products. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ProductFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Toolbar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedProducts.length > 0 && (
                    <>
                      <span className="text-sm text-muted-foreground">
                        {selectedProducts.length} selected
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={bulkDelete.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected
                      </Button>
                      <Separator orientation="vertical" className="h-6" />
                    </>
                  )}
                  {pagination && (
                    <span className="text-sm text-muted-foreground">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                      {pagination.total} products
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                    <TabsList>
                      <TabsTrigger value="table">
                        <LayoutList className="h-4 w-4" />
                      </TabsTrigger>
                      <TabsTrigger value="grid">
                        <LayoutGrid className="h-4 w-4" />
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Display */}
          {isLoading ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading products...</p>
                </div>
              </CardContent>
            </Card>
          ) : viewMode === "table" ? (
            <ProductTable
              products={products}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              selectedProducts={selectedProducts}
              onSelectionChange={setSelectedProducts}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSort={handleSort}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.pages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Product Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product in your inventory
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateDialog(false)}
            isSubmitting={createProduct.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm
              product={selectedProduct}
              onSubmit={handleUpdate}
              onCancel={() => {
                setShowEditDialog(false);
                setSelectedProduct(null);
              }}
              isSubmitting={updateProduct.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { ProductForm } from "@/components/features/ProductForm";
import {
  useProduct,
  useUpdateProduct,
  useDeleteProduct,
  useProductStock,
  useProductTransactions,
} from "@/hooks/useProducts";
import { CreateProductDTO } from "@/types/product";
import { format } from "date-fns";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: product, isLoading, error } = useProduct(productId);
  const { data: stockData } = useProductStock(productId);
  const { data: transactions } = useProductTransactions(productId);
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleUpdate = async (data: CreateProductDTO) => {
    if (product) {
      await updateProduct.mutateAsync({ _id: product._id, ...data });
      setShowEditDialog(false);
    }
  };

  const handleDelete = async () => {
    if (product) {
      await deleteProduct.mutateAsync(product._id);
      router.push("/products");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/products")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load product details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const profitMargin =
    ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100;
  const totalStock = stockData?.totalStock || product.totalStock || 0;

  const getStockStatus = () => {
    if (totalStock === 0) return "out_of_stock";
    if (totalStock <= product.minStockLevel) return "low_stock";
    return "in_stock";
  };

  const stockStatus = getStockStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Status</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{totalStock}</div>
              <Badge
                className={
                  stockStatus === "in_stock"
                    ? "bg-green-500"
                    : stockStatus === "low_stock"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }
              >
                {stockStatus === "in_stock"
                  ? "In Stock"
                  : stockStatus === "low_stock"
                  ? "Low Stock"
                  : "Out of Stock"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selling Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${product.sellingPrice.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Cost: ${product.costPrice.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                profitMargin > 30
                  ? "text-green-600"
                  : profitMargin > 15
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Profit: ${(product.sellingPrice - product.costPrice).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive ? "Active" : "Inactive"}
              </Badge>
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {product.tags.slice(0, 2).map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="stock">Stock Levels</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          {product.variants && product.variants.length > 0 && (
            <TabsTrigger value="variants">Variants</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Name
                  </p>
                  <p className="text-sm">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">SKU</p>
                  <p className="text-sm">{product.sku}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Category
                  </p>
                  <p className="text-sm">
                    {typeof product.category === "object"
                      ? product.category.name
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unit</p>
                  <p className="text-sm">{product.unit}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Barcode
                  </p>
                  <p className="text-sm">{product.barcode || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Weight
                  </p>
                  <p className="text-sm">
                    {product.weight ? `${product.weight} kg` : "N/A"}
                  </p>
                </div>
              </div>

              {product.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Description
                    </p>
                    <p className="text-sm">{product.description}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Min Stock Level
                  </p>
                  <p className="text-sm">{product.minStockLevel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Max Stock Level
                  </p>
                  <p className="text-sm">{product.maxStockLevel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Reorder Point
                  </p>
                  <p className="text-sm">{product.reorderPoint}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Reorder Quantity
                  </p>
                  <p className="text-sm">{product.reorderQuantity}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created At
                  </p>
                  <p className="text-sm">
                    {format(new Date(product.createdAt), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Updated At
                  </p>
                  <p className="text-sm">
                    {format(new Date(product.updatedAt), "PPP")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <CardTitle>Stock Levels by Warehouse</CardTitle>
            </CardHeader>
            <CardContent>
              {stockData?.stockLevels && stockData.stockLevels.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Warehouse</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Reserved</TableHead>
                      <TableHead className="text-right">Available</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockData.stockLevels.map((stock, index) => (
                      <TableRow key={index}>
                        <TableCell>{stock.warehouse}</TableCell>
                        <TableCell className="text-right">{stock.quantity}</TableCell>
                        <TableCell className="text-right">{stock.reserved}</TableCell>
                        <TableCell className="text-right font-medium">
                          {stock.available}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No stock information available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions && transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn._id}>
                        <TableCell>
                          {format(new Date(txn.createdAt), "PPp")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              txn.type === "sale"
                                ? "default"
                                : txn.type === "purchase"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {txn.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{txn.quantity}</TableCell>
                        <TableCell className="text-right">
                          ${txn.unitPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${txn.totalPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {txn.reference || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No transactions found
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {product.variants && product.variants.length > 0 && (
          <TabsContent value="variants">
            <Card>
              <CardHeader>
                <CardTitle>Product Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Cost Price</TableHead>
                      <TableHead className="text-right">Selling Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.variants.map((variant) => (
                      <TableRow key={variant._id}>
                        <TableCell className="font-medium">
                          {variant.name}
                        </TableCell>
                        <TableCell>{variant.sku}</TableCell>
                        <TableCell className="text-right">
                          ${variant.costPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${variant.sellingPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {variant.stock || 0}
                        </TableCell>
                        <TableCell>
                          <Badge variant={variant.isActive ? "default" : "secondary"}>
                            {variant.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          <ProductForm
            product={product}
            onSubmit={handleUpdate}
            onCancel={() => setShowEditDialog(false)}
            isSubmitting={updateProduct.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{product.name}"? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
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

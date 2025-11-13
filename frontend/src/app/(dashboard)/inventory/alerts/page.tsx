"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StockAdjustmentDialog } from "@/components/features/StockAdjustmentDialog";
import { useLowStock, useExpiringStock } from "@/hooks/useStock";
import { Stock } from "@/types/inventory";
import { Product } from "@/types";
import {
  AlertTriangle,
  Clock,
  ShoppingCart,
  Package,
  Bell,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function AlertsPage() {
  const { data: lowStockItems, isLoading: loadingLowStock } = useLowStock();
  const { data: expiringItems, isLoading: loadingExpiring } = useExpiringStock(30);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | undefined>();

  const handleReorder = (item: any) => {
    // In a real app, this would navigate to a purchase order creation page
    // or open a dialog to create a purchase order
    console.log("Create reorder for:", item);
    alert("Purchase order creation not implemented in this demo");
  };

  const handleAdjustStock = (stock: Stock) => {
    setSelectedStock(stock);
    setAdjustDialogOpen(true);
  };

  const getExpiryBadge = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 7) {
      return (
        <Badge className="bg-red-100 text-red-800">
          {daysUntilExpiry} days
        </Badge>
      );
    } else if (daysUntilExpiry <= 14) {
      return (
        <Badge className="bg-orange-100 text-orange-800">
          {daysUntilExpiry} days
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          {daysUntilExpiry} days
        </Badge>
      );
    }
  };

  const totalAlerts = (lowStockItems?.length || 0) + (expiringItems?.length || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock Alerts</h1>
          <p className="text-muted-foreground">
            Manage low stock and expiring items
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Bell className="h-4 w-4 mr-2" />
          {totalAlerts} Alerts
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {lowStockItems?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Need reordering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {expiringItems?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Within 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Low Stock Items
            </CardTitle>
            <Badge className="bg-yellow-100 text-yellow-800">
              {lowStockItems?.length || 0} items
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loadingLowStock ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading low stock items...
            </div>
          ) : lowStockItems && lowStockItems.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Reorder Point</TableHead>
                    <TableHead className="text-right">Reorder Qty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item, index) => {
                    const product = item.product as Product;
                    const isOutOfStock = item.currentStock === 0;

                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.sku}
                        </TableCell>
                        <TableCell>{item.warehouse.name}</TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={isOutOfStock ? "text-red-600" : "text-yellow-600"}>
                            {item.currentStock}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.reorderPoint}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.reorderQuantity || "-"}
                        </TableCell>
                        <TableCell>
                          {isOutOfStock ? (
                            <Badge className="bg-red-100 text-red-800">
                              Out of Stock
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Low Stock
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReorder(item)}
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Reorder
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No low stock items</h3>
              <p className="text-muted-foreground">
                All items are above their reorder points
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expiring Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-600" />
              Expiring Items
            </CardTitle>
            <Badge className="bg-red-100 text-red-800">
              {expiringItems?.length || 0} items
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loadingExpiring ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading expiring items...
            </div>
          ) : expiringItems && expiringItems.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Batch Number</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Expiration Date</TableHead>
                    <TableHead>Days Until Expiry</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiringItems.map((item, index) => {
                    const product = item.product as Product;

                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.sku}
                        </TableCell>
                        <TableCell>{item.warehouse.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.batchNumber || "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.quantity}
                        </TableCell>
                        <TableCell>
                          {format(new Date(item.expirationDate), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          {getExpiryBadge(item.daysUntilExpiry)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            Mark as Clearance
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No expiring items</h3>
              <p className="text-muted-foreground">
                No items expiring within the next 30 days
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reorder Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Reorder Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Based on current stock levels and reorder points, the following items
              should be reordered:
            </p>
            {lowStockItems && lowStockItems.length > 0 ? (
              <div className="space-y-2">
                {lowStockItems.slice(0, 5).map((item, index) => {
                  const product = item.product as Product;
                  const suggestedQty = item.reorderQuantity || item.reorderPoint * 2;

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.warehouse.name} - Current: {item.currentStock}, Reorder
                          Point: {item.reorderPoint}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Suggested Qty
                          </p>
                          <p className="font-medium">{suggestedQty}</p>
                        </div>
                        <Button onClick={() => handleReorder(item)}>
                          Create PO
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No reorder suggestions at this time
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        stock={selectedStock}
      />
    </div>
  );
}

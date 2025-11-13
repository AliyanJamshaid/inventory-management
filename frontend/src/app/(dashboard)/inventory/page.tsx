"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { StockTable } from "@/components/features/StockTable";
import { StockAdjustmentDialog } from "@/components/features/StockAdjustmentDialog";
import { StockTransferDialog } from "@/components/features/StockTransferDialog";
import { useStock, useStockSummary } from "@/hooks/useStock";
import { useWarehouses } from "@/hooks/useWarehouses";
import { Stock, StockFilters } from "@/types/inventory";
import {
  Download,
  Package,
  DollarSign,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";

export default function InventoryPage() {
  const [filters, setFilters] = useState<StockFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | undefined>();
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { data: stocks, refetch, isLoading } = useStock(filters);
  const { data: summary } = useStockSummary();
  const { data: warehouses } = useWarehouses();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm || undefined }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAdjustStock = (stock: Stock) => {
    setSelectedStock(stock);
    setAdjustDialogOpen(true);
  };

  const handleTransferStock = (stock: Stock) => {
    setSelectedStock(stock);
    setTransferDialogOpen(true);
  };

  const handleExportCSV = () => {
    if (!stocks || stocks.length === 0) return;

    const headers = [
      "Product",
      "SKU",
      "Warehouse",
      "Location",
      "Quantity",
      "Available",
      "Reserved",
      "Reorder Point",
      "Batch Number",
      "Serial Number",
      "Expiration Date",
    ];

    const rows = stocks.map((stock) => {
      const product = typeof stock.product === "object" ? stock.product : null;
      const warehouse = typeof stock.warehouse === "object" ? stock.warehouse : null;
      const location = stock.location && typeof stock.location === "object" ? stock.location.code : stock.location || "";

      return [
        product?.name || "",
        product?.sku || "",
        warehouse?.name || "",
        location,
        stock.quantity,
        stock.available,
        stock.reserved,
        stock.reorderPoint || "",
        stock.batchNumber || "",
        stock.serialNumber || "",
        stock.expirationDate || "",
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">
            Track and manage your inventory levels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label className="text-sm">Auto-refresh (30s)</Label>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalItems.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique stock items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary?.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Inventory value
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
              {summary?.lowStockCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Items need reorder
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
              {summary?.expiringCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Within 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters({});
                setSearchTerm("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="warehouse">Warehouse</Label>
              <Select
                value={filters.warehouse || ""}
                onValueChange={(value) =>
                  setFilters({ ...filters, warehouse: value || undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All warehouses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All warehouses</SelectItem>
                  {warehouses?.map((warehouse) => (
                    <SelectItem key={warehouse._id} value={warehouse._id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || ""}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value || undefined } as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="HIGH_STOCK">High Stock</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quickFilter">Quick Filter</Label>
              <Select
                value={
                  filters.lowStock
                    ? "lowStock"
                    : filters.expiringSoon
                    ? "expiring"
                    : ""
                }
                onValueChange={(value) => {
                  if (value === "lowStock") {
                    setFilters({ ...filters, lowStock: true, expiringSoon: undefined });
                  } else if (value === "expiring") {
                    setFilters({ ...filters, lowStock: undefined, expiringSoon: true });
                  } else {
                    setFilters({ ...filters, lowStock: undefined, expiringSoon: undefined });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Quick filters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No filter</SelectItem>
                  <SelectItem value="lowStock">Low Stock Only</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading stock data...
            </div>
          ) : (
            <StockTable
              stocks={stocks || []}
              onAdjust={handleAdjustStock}
              onTransfer={handleTransferStock}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <StockAdjustmentDialog
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        stock={selectedStock}
        onSuccess={() => refetch()}
      />

      <StockTransferDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        stock={selectedStock}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

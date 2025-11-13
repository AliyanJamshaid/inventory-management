"use client";

import { useState } from "react";
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
import { TransactionHistoryTable } from "@/components/features/TransactionHistoryTable";
import { useTransactions } from "@/hooks/useTransactions";
import { useWarehouses } from "@/hooks/useWarehouses";
import { TransactionFilters, StockTransaction } from "@/types/inventory";
import {
  Download,
  History,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  Settings,
  Filter as FilterIcon,
} from "lucide-react";
import { format } from "date-fns";

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const { data: transactions, isLoading } = useTransactions(filters);
  const { data: warehouses } = useWarehouses();

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) return;

    const headers = [
      "Date",
      "Type",
      "Product",
      "SKU",
      "Warehouse",
      "Quantity",
      "Balance Before",
      "Balance After",
      "Reference",
      "Reason Code",
      "Performed By",
      "Notes",
    ];

    const rows = transactions.map((transaction) => {
      const product = typeof transaction.product === "object" ? transaction.product : null;
      const warehouse = typeof transaction.warehouse === "object" ? transaction.warehouse : null;

      return [
        format(new Date(transaction.createdAt), "yyyy-MM-dd HH:mm:ss"),
        transaction.type,
        product?.name || "",
        product?.sku || "",
        warehouse?.name || "",
        transaction.quantity,
        transaction.balanceBefore,
        transaction.balanceAfter,
        transaction.reference || "",
        transaction.reasonCode || "",
        transaction.performedBy,
        transaction.notes || "",
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const transactionStats = transactions
    ? {
        total: transactions.length,
        in: transactions.filter((t) => t.type === "IN").length,
        out: transactions.filter((t) => t.type === "OUT").length,
        transfers: transactions.filter((t) => t.type === "TRANSFER").length,
        adjustments: transactions.filter((t) => t.type === "ADJUSTMENT").length,
      }
    : { total: 0, in: 0, out: 0, transfers: 0, adjustments: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock Transactions</h1>
          <p className="text-muted-foreground">
            View complete transaction history
          </p>
        </div>
        <Button onClick={handleExportCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionStats.total}</div>
            <p className="text-xs text-muted-foreground">All transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock In</CardTitle>
            <ArrowDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {transactionStats.in}
            </div>
            <p className="text-xs text-muted-foreground">Incoming stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Out</CardTitle>
            <ArrowUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {transactionStats.out}
            </div>
            <p className="text-xs text-muted-foreground">Outgoing stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfers</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {transactionStats.transfers}
            </div>
            <p className="text-xs text-muted-foreground">Between warehouses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adjustments</CardTitle>
            <Settings className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {transactionStats.adjustments}
            </div>
            <p className="text-xs text-muted-foreground">Manual adjustments</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FilterIcon className="h-5 w-5" />
              Filters
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({})}
            >
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select
                value={filters.type || ""}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value || undefined } as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="IN">Stock In</SelectItem>
                  <SelectItem value="OUT">Stock Out</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value || undefined })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value || undefined })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading transactions...
            </div>
          ) : transactions && transactions.length > 0 ? (
            <TransactionHistoryTable transactions={transactions} />
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
              <p className="text-muted-foreground">
                {Object.keys(filters).length > 0
                  ? "Try adjusting your filters"
                  : "Stock transactions will appear here"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

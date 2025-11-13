"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useStockValuationReport,
  useSalesSummaryReport,
  usePurchaseSummaryReport,
  useProfitLossReport,
  useCustomerSummaryReport,
  useSupplierSummaryReport,
  useExportReport,
} from "@/hooks/useReports";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  const exportMutation = useExportReport();

  // Fetch reports
  const { data: stockValuation, isLoading: isStockLoading } = useStockValuationReport();
  const { data: salesSummary, isLoading: isSalesLoading } = useSalesSummaryReport({
    startDate: dateRange.from.toISOString(),
    endDate: dateRange.to.toISOString(),
  });
  const { data: purchaseSummary, isLoading: isPurchaseLoading } = usePurchaseSummaryReport({
    startDate: dateRange.from.toISOString(),
    endDate: dateRange.to.toISOString(),
  });
  const { data: profitLoss, isLoading: isProfitLossLoading } = useProfitLossReport({
    startDate: dateRange.from.toISOString(),
    endDate: dateRange.to.toISOString(),
  });
  const { data: customerSummary, isLoading: isCustomerLoading } = useCustomerSummaryReport({
    startDate: dateRange.from.toISOString(),
    endDate: dateRange.to.toISOString(),
  });
  const { data: supplierSummary, isLoading: isSupplierLoading } = useSupplierSummaryReport({
    startDate: dateRange.from.toISOString(),
    endDate: dateRange.to.toISOString(),
  });

  const handleExport = (reportType: string, data: any[]) => {
    exportMutation.mutate({
      reportType,
      format: 'csv',
      data,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Generate and export various business reports
          </p>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Select date range for time-based reports</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? format(dateRange.from, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateRange.from}
                onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <span className="flex items-center">to</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.to ? format(dateRange.to, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateRange.to}
                onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="stock-valuation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock-valuation">Stock Valuation</TabsTrigger>
          <TabsTrigger value="sales">Sales Summary</TabsTrigger>
          <TabsTrigger value="purchases">Purchase Summary</TabsTrigger>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="customers">Customer Summary</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Summary</TabsTrigger>
        </TabsList>

        {/* Stock Valuation Report */}
        <TabsContent value="stock-valuation">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Stock Valuation Report</CardTitle>
                <CardDescription>Current inventory valuation by product</CardDescription>
              </div>
              <Button
                onClick={() => stockValuation && handleExport('stock-valuation', stockValuation.items)}
                disabled={!stockValuation || exportMutation.isPending}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {isStockLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : stockValuation ? (
                <>
                  <div className="grid grid-cols-5 gap-4 mb-6 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Items</p>
                      <p className="text-2xl font-bold">{stockValuation.summary.totalItems}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Quantity</p>
                      <p className="text-2xl font-bold">{stockValuation.summary.totalQuantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cost Value</p>
                      <p className="text-2xl font-bold">${stockValuation.summary.totalCostValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Selling Value</p>
                      <p className="text-2xl font-bold">${stockValuation.summary.totalSellingValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Margin</p>
                      <p className="text-2xl font-bold">{stockValuation.summary.averageMargin}%</p>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Warehouse</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Cost Value</TableHead>
                        <TableHead className="text-right">Selling Value</TableHead>
                        <TableHead className="text-right">Profit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockValuation.items.slice(0, 20).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>{item.warehouse}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.totalCost.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${item.totalSellingValue.toFixed(2)}</TableCell>
                          <TableCell className="text-right text-green-600">
                            ${item.potentialProfit.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <p className="text-center text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Summary Report */}
        <TabsContent value="sales">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sales Summary Report</CardTitle>
                <CardDescription>
                  {dateRange.from && dateRange.to &&
                    `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`}
                </CardDescription>
              </div>
              <Button
                onClick={() => salesSummary && handleExport('sales-summary', salesSummary.items)}
                disabled={!salesSummary || exportMutation.isPending}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {isSalesLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : salesSummary ? (
                <>
                  <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{salesSummary.summary.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Quantity</p>
                      <p className="text-2xl font-bold">{salesSummary.summary.totalQuantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">${salesSummary.summary.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Order Value</p>
                      <p className="text-2xl font-bold">${salesSummary.summary.averageOrderValue.toFixed(2)}</p>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesSummary.items.slice(0, 20).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.orderId}</TableCell>
                          <TableCell>{item.customerName}</TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.lineTotal.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge>{item.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <p className="text-center text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Summary Report */}
        <TabsContent value="purchases">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Purchase Summary Report</CardTitle>
                <CardDescription>
                  {dateRange.from && dateRange.to &&
                    `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`}
                </CardDescription>
              </div>
              <Button
                onClick={() => purchaseSummary && handleExport('purchase-summary', purchaseSummary.items)}
                disabled={!purchaseSummary || exportMutation.isPending}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {isPurchaseLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : purchaseSummary ? (
                <>
                  <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{purchaseSummary.summary.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Quantity</p>
                      <p className="text-2xl font-bold">{purchaseSummary.summary.totalQuantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="text-2xl font-bold">${purchaseSummary.summary.totalCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Order Value</p>
                      <p className="text-2xl font-bold">${purchaseSummary.summary.averageOrderValue.toFixed(2)}</p>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseSummary.items.slice(0, 20).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.orderId}</TableCell>
                          <TableCell>{item.supplierName}</TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.lineTotal.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge>{item.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <p className="text-center text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit & Loss Report */}
        <TabsContent value="profit-loss">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profit & Loss Report</CardTitle>
                <CardDescription>
                  {dateRange.from && dateRange.to &&
                    `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`}
                </CardDescription>
              </div>
              <Button
                onClick={() => profitLoss && handleExport('profit-loss', [profitLoss])}
                disabled={!profitLoss || exportMutation.isPending}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {isProfitLossLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : profitLoss ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Revenue</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Sales:</span>
                          <span className="font-bold">${profitLoss.revenue.totalSales.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Order Count:</span>
                          <span className="font-bold">{profitLoss.revenue.orderCount}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Costs</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">COGS:</span>
                          <span className="font-bold">${profitLoss.costs.costOfGoodsSold.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Operating Expenses:</span>
                          <span className="font-bold">${profitLoss.costs.operatingExpenses.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-muted-foreground">Total Costs:</span>
                          <span className="font-bold">${profitLoss.costs.totalCosts.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-lg">Profit Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-lg">
                        <span className="text-muted-foreground">Gross Profit:</span>
                        <span className="font-bold text-green-600">${profitLoss.profit.grossProfit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gross Margin:</span>
                        <span className="font-semibold">{profitLoss.profit.grossMargin.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between text-lg border-t pt-3">
                        <span className="text-muted-foreground">Net Profit:</span>
                        <span className={`font-bold ${profitLoss.profit.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${profitLoss.profit.netProfit.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Net Margin:</span>
                        <span className="font-semibold">{profitLoss.profit.netMargin.toFixed(2)}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Summary Report */}
        <TabsContent value="customers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Customer Summary Report</CardTitle>
                <CardDescription>Customer purchase history and statistics</CardDescription>
              </div>
              <Button
                onClick={() => customerSummary && handleExport('customer-summary', customerSummary.items)}
                disabled={!customerSummary || exportMutation.isPending}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {isCustomerLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : customerSummary ? (
                <>
                  <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Customers</p>
                      <p className="text-2xl font-bold">{customerSummary.summary.totalCustomers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">${customerSummary.summary.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{customerSummary.summary.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Customer Value</p>
                      <p className="text-2xl font-bold">${customerSummary.summary.averageCustomerValue.toFixed(2)}</p>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Total Spent</TableHead>
                        <TableHead className="text-right">Avg Order</TableHead>
                        <TableHead className="text-right">Days Since Last Order</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerSummary.items.slice(0, 20).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.customerName}</TableCell>
                          <TableCell>{item.email}</TableCell>
                          <TableCell className="text-right">{item.totalOrders}</TableCell>
                          <TableCell className="text-right">${item.totalSpent.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${item.averageOrderValue.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item.daysSinceLastOrder}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <p className="text-center text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supplier Summary Report */}
        <TabsContent value="suppliers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Supplier Summary Report</CardTitle>
                <CardDescription>Supplier order history and statistics</CardDescription>
              </div>
              <Button
                onClick={() => supplierSummary && handleExport('supplier-summary', supplierSummary.items)}
                disabled={!supplierSummary || exportMutation.isPending}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {isSupplierLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : supplierSummary ? (
                <>
                  <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Suppliers</p>
                      <p className="text-2xl font-bold">{supplierSummary.summary.totalSuppliers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Purchases</p>
                      <p className="text-2xl font-bold">${supplierSummary.summary.totalPurchases.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{supplierSummary.summary.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Supplier Value</p>
                      <p className="text-2xl font-bold">${supplierSummary.summary.averageSupplierValue.toFixed(2)}</p>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Total Spent</TableHead>
                        <TableHead className="text-right">Avg Order</TableHead>
                        <TableHead className="text-right">Days Since Last Order</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplierSummary.items.slice(0, 20).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.supplierName}</TableCell>
                          <TableCell>{item.email}</TableCell>
                          <TableCell className="text-right">{item.totalOrders}</TableCell>
                          <TableCell className="text-right">${item.totalSpent.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${item.averageOrderValue.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item.daysSinceLastOrder}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <p className="text-center text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

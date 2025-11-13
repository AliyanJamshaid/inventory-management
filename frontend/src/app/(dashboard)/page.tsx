"use client";

import { Package, DollarSign, AlertTriangle, ShoppingCart, TrendingUp, Users } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import SalesChart from "@/components/dashboard/SalesChart";
import StockChart from "@/components/dashboard/StockChart";
import TopProductsTable from "@/components/dashboard/TopProductsTable";
import LowStockAlerts from "@/components/dashboard/LowStockAlerts";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { useDashboardStats, useLowStockItems, useInventoryAnalytics, useRevenueAnalytics, useSalesAnalytics } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  // Fetch dashboard data
  const { data: dashboardStats, isLoading: isDashboardLoading } = useDashboardStats();
  const { data: lowStockItems, isLoading: isLowStockLoading } = useLowStockItems();
  const { data: inventoryAnalytics, isLoading: isInventoryLoading } = useInventoryAnalytics();
  const { data: revenueAnalytics, isLoading: isRevenueLoading } = useRevenueAnalytics({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });
  const { data: salesAnalytics, isLoading: isSalesLoading } = useSalesAnalytics({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    groupBy: 'daily',
  });

  // Stats cards data
  const stats = [
    {
      title: "Total Products",
      value: isDashboardLoading ? "..." : dashboardStats?.totalProducts.toLocaleString() || "0",
      icon: Package,
      description: "Active products in inventory",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Inventory Value",
      value: isDashboardLoading ? "..." : `$${dashboardStats?.totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` || "$0",
      icon: DollarSign,
      description: "Total stock valuation",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Low Stock Items",
      value: isDashboardLoading ? "..." : dashboardStats?.lowStockCount || "0",
      icon: AlertTriangle,
      description: "Need attention",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Orders This Month",
      value: isDashboardLoading ? "..." : dashboardStats?.orders.month || "0",
      icon: ShoppingCart,
      description: `${dashboardStats?.orders.week || 0} this week`,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Monthly Revenue",
      value: isDashboardLoading ? "..." : `$${dashboardStats?.revenue.month.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` || "$0",
      icon: TrendingUp,
      description: `$${dashboardStats?.revenue.week.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0} this week`,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Today's Revenue",
      value: isDashboardLoading ? "..." : `$${dashboardStats?.revenue.today.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` || "$0",
      icon: DollarSign,
      description: `${dashboardStats?.orders.today || 0} orders today`,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your inventory.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        {isRevenueLoading ? (
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ) : revenueAnalytics?.profitData ? (
          <RevenueChart
            data={revenueAnalytics.profitData}
            title="Revenue & Profit Trends"
            description="Last 30 days"
          />
        ) : null}

        {/* Sales by Category Chart */}
        {isSalesLoading ? (
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ) : salesAnalytics?.salesByCategory ? (
          <SalesChart
            data={salesAnalytics.salesByCategory.map(cat => ({
              name: cat.categoryName,
              totalSales: cat.totalSales,
              totalQuantity: cat.totalQuantity,
            }))}
            title="Sales by Category"
            description="Top performing categories"
          />
        ) : null}
      </div>

      {/* Stock Distribution Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {isInventoryLoading ? (
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ) : inventoryAnalytics?.stockByWarehouse ? (
            <StockChart
              data={inventoryAnalytics.stockByWarehouse}
              title="Stock Distribution"
              description="By warehouse"
            />
          ) : null}
        </div>

        {/* Top Products Table */}
        <div className="lg:col-span-2">
          {isDashboardLoading ? (
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ) : dashboardStats?.topProducts ? (
            <TopProductsTable
              data={dashboardStats.topProducts}
              title="Top Selling Products"
              description="Best performers this period"
            />
          ) : null}
        </div>
      </div>

      {/* Alerts and Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        {isLowStockLoading ? (
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ) : lowStockItems && lowStockItems.length > 0 ? (
          <LowStockAlerts
            data={lowStockItems.slice(0, 5)}
            title="Low Stock Alerts"
            description="Products that need reordering"
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No low stock items</p>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {isDashboardLoading ? (
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ) : dashboardStats?.recentActivities ? (
          <RecentActivity
            data={dashboardStats.recentActivities}
            title="Recent Activity"
            description="Latest system actions"
          />
        ) : null}
      </div>
    </div>
  );
}

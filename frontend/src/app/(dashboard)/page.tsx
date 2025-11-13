"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, AlertTriangle, ShoppingCart } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Products",
      value: "2,345",
      icon: Package,
      description: "+12% from last month",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Inventory Value",
      value: "$453,678",
      icon: DollarSign,
      description: "+8% from last month",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Low Stock Items",
      value: "23",
      icon: AlertTriangle,
      description: "Need attention",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Pending Orders",
      value: "145",
      icon: ShoppingCart,
      description: "+5% from last month",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">Order #SO-{1000 + i}</p>
                    <p className="text-sm text-muted-foreground">
                      Customer {i}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(Math.random() * 5000).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Product A", stock: 5, reorder: 20 },
                { name: "Product B", stock: 8, reorder: 25 },
                { name: "Product C", stock: 3, reorder: 15 },
                { name: "Product D", stock: 12, reorder: 30 },
              ].map((product, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Reorder level: {product.reorder}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-yellow-600">
                      {product.stock} units
                    </p>
                    <p className="text-sm text-muted-foreground">In stock</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

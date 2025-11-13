"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage supplier purchase orders</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Order List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Purchase order management features coming soon. Track orders, approvals, and deliveries.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

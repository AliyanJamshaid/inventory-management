"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Check,
  X,
  Truck,
  Package,
  FileText,
  Printer,
} from "lucide-react";
import {
  useSalesOrder,
  useConfirmSO,
  useProcessSO,
  useShipSO,
  useDeliverSO,
  useCancelSO,
  useGenerateInvoice,
} from "@/hooks/useSalesOrders";
import { SOStatusBadge } from "@/components/features/SOStatusBadge";
import { PaymentStatusBadge } from "@/components/features/PaymentStatusBadge";
import { StatusTimeline, TimelineStep } from "@/components/features/StatusTimeline";
import { useToast } from "@/components/ui/toast";
import { format } from "date-fns";

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { toast } = useToast();

  const { data: order, isLoading } = useSalesOrder(orderId);
  const confirmMutation = useConfirmSO();
  const processMutation = useProcessSO();
  const shipMutation = useShipSO();
  const deliverMutation = useDeliverSO();
  const cancelMutation = useCancelSO();
  const generateInvoiceMutation = useGenerateInvoice();

  const handleConfirm = async () => {
    if (!confirm("Confirm this order?")) return;
    try {
      await confirmMutation.mutateAsync(orderId);
      toast({
        title: "Success",
        description: "Order confirmed successfully",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm order",
        type: "error",
      });
    }
  };

  const handleProcess = async () => {
    if (!confirm("Start processing this order?")) return;
    try {
      await processMutation.mutateAsync(orderId);
      toast({
        title: "Success",
        description: "Order processing started",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process order",
        type: "error",
      });
    }
  };

  const handleShip = async () => {
    const trackingNumber = prompt("Enter tracking number:");
    if (!trackingNumber) return;

    try {
      await shipMutation.mutateAsync({
        id: orderId,
        data: {
          trackingNumber,
          shippedDate: new Date().toISOString(),
        },
      });
      toast({
        title: "Success",
        description: "Order marked as shipped",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to ship order",
        type: "error",
      });
    }
  };

  const handleDeliver = async () => {
    if (!confirm("Mark this order as delivered?")) return;
    try {
      await deliverMutation.mutateAsync({
        id: orderId,
        data: {
          deliveredDate: new Date().toISOString(),
        },
      });
      toast({
        title: "Success",
        description: "Order marked as delivered",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to deliver order",
        type: "error",
      });
    }
  };

  const handleCancel = async () => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;

    try {
      await cancelMutation.mutateAsync({ id: orderId, reason });
      toast({
        title: "Success",
        description: "Order cancelled",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel order",
        type: "error",
      });
    }
  };

  const handleGenerateInvoice = async () => {
    if (!confirm("Generate invoice for this order?")) return;
    try {
      await generateInvoiceMutation.mutateAsync(orderId);
      toast({
        title: "Success",
        description: "Invoice generated successfully",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate invoice",
        type: "error",
      });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!order) {
    return <div className="p-8 text-center">Sales order not found</div>;
  }

  const customer = typeof order.customer === "object" ? order.customer : null;

  // Build timeline
  const timelineSteps: TimelineStep[] = [
    {
      label: "Draft",
      status: order.status === "draft" ? "current" : "completed",
      date: format(new Date(order.createdAt), "MMM dd, yyyy"),
    },
    {
      label: "Confirmed",
      status:
        order.status === "confirmed"
          ? "current"
          : ["processing", "shipped", "delivered"].includes(order.status)
            ? "completed"
            : "upcoming",
      date: order.status !== "draft" ? format(new Date(order.orderDate), "MMM dd, yyyy") : undefined,
    },
    {
      label: "Processing",
      status:
        order.status === "processing"
          ? "current"
          : ["shipped", "delivered"].includes(order.status)
            ? "completed"
            : "upcoming",
    },
    {
      label: "Shipped",
      status:
        order.status === "shipped"
          ? "current"
          : order.status === "delivered"
            ? "completed"
            : "upcoming",
      date: order.shippedDate ? format(new Date(order.shippedDate), "MMM dd, yyyy") : undefined,
    },
    {
      label: "Delivered",
      status: order.status === "delivered" ? "completed" : "upcoming",
      date: order.deliveredDate ? format(new Date(order.deliveredDate), "MMM dd, yyyy") : undefined,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/sales-orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
              <SOStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
            <p className="text-gray-500">
              Ordered on {format(new Date(order.orderDate), "MMMM dd, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          {order.status === "draft" && (
            <Button onClick={handleConfirm}>
              <Check className="h-4 w-4 mr-2" />
              Confirm Order
            </Button>
          )}
          {order.status === "confirmed" && (
            <Button onClick={handleProcess}>
              <Package className="h-4 w-4 mr-2" />
              Start Processing
            </Button>
          )}
          {order.status === "processing" && (
            <Button onClick={handleShip}>
              <Truck className="h-4 w-4 mr-2" />
              Mark as Shipped
            </Button>
          )}
          {order.status === "shipped" && (
            <Button onClick={handleDeliver}>
              <Check className="h-4 w-4 mr-2" />
              Mark as Delivered
            </Button>
          )}
          {order.status === "delivered" && !order.invoiceGenerated && (
            <Button onClick={handleGenerateInvoice}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Invoice
            </Button>
          )}
          {["draft", "confirmed", "processing"].includes(order.status) && (
            <Button variant="destructive" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Customer Info */}
          {customer && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-gray-600">{customer.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-gray-600">{customer.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Customer #</p>
                  <p className="text-sm text-gray-600">{customer.customerNumber}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.productName || "N/A"}</TableCell>
                      <TableCell>{item.sku || "-"}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${item.discount.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${item.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pricing Summary */}
              <div className="mt-6 flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${order.pricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount:</span>
                    <span>-${order.pricing.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax ({order.pricing.taxRate}%):</span>
                    <span>${order.pricing.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>${order.pricing.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>${order.pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline steps={timelineSteps} />
            </CardContent>
          </Card>

          {/* Shipping Info */}
          {order.trackingNumber && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Tracking Number</p>
                  <p className="text-sm text-gray-600">{order.trackingNumber}</p>
                </div>
                {order.shippedDate && (
                  <div>
                    <p className="text-sm font-medium">Shipped Date</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(order.shippedDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

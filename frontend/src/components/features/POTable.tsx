"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { POStatusBadge } from "./POStatusBadge";
import { PurchaseOrder, POStatus } from "@/types/purchaseOrder";
import { Eye, Edit, CheckCircle, Package, XCircle, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface POTableProps {
  purchaseOrders: PurchaseOrder[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReceive?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function POTable({
  purchaseOrders,
  onView,
  onEdit,
  onApprove,
  onReceive,
  onCancel,
}: POTableProps) {
  if (purchaseOrders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No purchase orders found</p>
      </div>
    );
  }

  const isOverdue = (po: PurchaseOrder) => {
    if (po.status === POStatus.RECEIVED || po.status === POStatus.CANCELLED) {
      return false;
    }
    return new Date(po.expectedDeliveryDate) < new Date();
  };

  const canEdit = (po: PurchaseOrder) => po.status === POStatus.DRAFT;
  const canApprove = (po: PurchaseOrder) =>
    po.status === POStatus.DRAFT || po.status === POStatus.PENDING;
  const canReceive = (po: PurchaseOrder) => po.status === POStatus.APPROVED;
  const canCancel = (po: PurchaseOrder) =>
    po.status !== POStatus.RECEIVED && po.status !== POStatus.CANCELLED;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PO Number</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Expected Delivery</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchaseOrders.map((po) => {
            const overdue = isOverdue(po);

            return (
              <TableRow
                key={po.id}
                className={cn(overdue && "bg-red-50 dark:bg-red-950/20")}
              >
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-medium">
                        {po.orderNumber}
                      </code>
                      {overdue && (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    {overdue && (
                      <p className="text-xs text-red-600 font-medium">Overdue</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{po.supplier.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {po.supplier.code}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{formatDate(po.orderDate)}</p>
                </TableCell>
                <TableCell>
                  <p className={cn("text-sm", overdue && "text-red-600 font-medium")}>
                    {formatDate(po.expectedDeliveryDate)}
                  </p>
                </TableCell>
                <TableCell>
                  <POStatusBadge status={po.status} />
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(po.totalAmount)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(po.id)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && canEdit(po) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(po.id)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onApprove && canApprove(po) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onApprove(po.id)}
                        title="Approve"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {onReceive && canReceive(po) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onReceive(po.id)}
                        title="Receive Goods"
                      >
                        <Package className="h-4 w-4 text-blue-600" />
                      </Button>
                    )}
                    {onCancel && canCancel(po) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onCancel(po.id)}
                        title="Cancel"
                      >
                        <XCircle className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

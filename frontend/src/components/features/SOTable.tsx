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
import { SalesOrder } from "@/types/salesOrder";
import { SOStatusBadge } from "./SOStatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface SOTableProps {
  orders: SalesOrder[];
  onEdit?: (order: SalesOrder) => void;
  onDelete?: (order: SalesOrder) => void;
}

export function SOTable({ orders, onEdit, onDelete }: SOTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SO #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Delivery Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-500">
                No sales orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>
                  {typeof order.customer === "object" ? order.customer.name : "N/A"}
                </TableCell>
                <TableCell>{format(new Date(order.orderDate), "MMM dd, yyyy")}</TableCell>
                <TableCell>
                  {order.expectedDeliveryDate
                    ? format(new Date(order.expectedDeliveryDate), "MMM dd, yyyy")
                    : "-"}
                </TableCell>
                <TableCell>
                  <SOStatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </TableCell>
                <TableCell className="text-right font-semibold">
                  ${order.pricing.total.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/sales-orders/${order._id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {onEdit && order.status === "draft" && (
                      <Button variant="ghost" size="sm" onClick={() => onEdit(order)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && order.status === "draft" && (
                      <Button variant="ghost" size="sm" onClick={() => onDelete(order)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

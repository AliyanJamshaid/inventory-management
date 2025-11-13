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
import { Invoice } from "@/types/invoice";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { Eye, Edit, Trash2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format, isPast } from "date-fns";
import { cn } from "@/lib/utils";

interface InvoiceTableProps {
  invoices: Invoice[];
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
}

export function InvoiceTable({ invoices, onEdit, onDelete }: InvoiceTableProps) {
  const isOverdue = (invoice: Invoice) => {
    return (
      invoice.status !== "paid" &&
      invoice.status !== "cancelled" &&
      isPast(new Date(invoice.dueDate))
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>SO #</TableHead>
            <TableHead>Invoice Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-gray-500">
                No invoices found
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => {
              const overdue = isOverdue(invoice);
              return (
                <TableRow
                  key={invoice._id}
                  className={cn(overdue && "bg-red-50")}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {overdue && <AlertCircle className="h-4 w-4 text-red-500" />}
                      {invoice.invoiceNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    {typeof invoice.customer === "object" ? invoice.customer.name : "N/A"}
                  </TableCell>
                  <TableCell>
                    {invoice.salesOrder ? (
                      <Link
                        href={`/sales-orders/${invoice.salesOrder}`}
                        className="text-blue-600 hover:underline"
                      >
                        View SO
                      </Link>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(invoice.invoiceDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${invoice.total.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${invoice.paidAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${invoice.balanceAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/invoices/${invoice._id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {onEdit && invoice.status === "draft" && (
                        <Button variant="ghost" size="sm" onClick={() => onEdit(invoice)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && invoice.status === "draft" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(invoice)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StockTransaction, Warehouse } from "@/types/inventory";
import { Product } from "@/types";
import { format } from "date-fns";
import { ArrowUp, ArrowDown, ArrowLeftRight, Settings } from "lucide-react";

interface TransactionHistoryTableProps {
  transactions: StockTransaction[];
}

export function TransactionHistoryTable({
  transactions,
}: TransactionHistoryTableProps) {
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case "createdAt":
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case "type":
        aValue = a.type;
        bValue = b.type;
        break;
      case "quantity":
        aValue = a.quantity;
        bValue = b.quantity;
        break;
      default:
        return 0;
    }

    if (typeof aValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
  });

  const getTransactionIcon = (type: StockTransaction["type"]) => {
    switch (type) {
      case "IN":
        return <ArrowDown className="h-4 w-4" />;
      case "OUT":
        return <ArrowUp className="h-4 w-4" />;
      case "TRANSFER":
        return <ArrowLeftRight className="h-4 w-4" />;
      case "ADJUSTMENT":
        return <Settings className="h-4 w-4" />;
    }
  };

  const getTransactionBadge = (type: StockTransaction["type"]) => {
    const config = {
      IN: { label: "IN", className: "bg-green-100 text-green-800" },
      OUT: { label: "OUT", className: "bg-red-100 text-red-800" },
      TRANSFER: { label: "TRANSFER", className: "bg-blue-100 text-blue-800" },
      ADJUSTMENT: {
        label: "ADJUSTMENT",
        className: "bg-purple-100 text-purple-800",
      },
    };

    const { label, className } = config[type];
    return (
      <Badge className={className}>
        <span className="flex items-center gap-1">
          {getTransactionIcon(type)}
          {label}
        </span>
      </Badge>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-accent"
              onClick={() => handleSort("createdAt")}
            >
              Date
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-accent"
              onClick={() => handleSort("type")}
            >
              Type
            </TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Warehouse</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-accent text-right"
              onClick={() => handleSort("quantity")}
            >
              Quantity
            </TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Performed By</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTransactions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center text-muted-foreground"
              >
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            sortedTransactions.map((transaction) => {
              const product = transaction.product as Product;
              const warehouse = transaction.warehouse as Warehouse;

              return (
                <TableRow key={transaction._id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(transaction.createdAt), "MMM dd, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{getTransactionBadge(transaction.type)}</TableCell>
                  <TableCell className="font-medium">
                    {product?.name || "Unknown"}
                    {product?.sku && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({product.sku})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{warehouse?.name || "Unknown"}</TableCell>
                  <TableCell className="text-right font-medium">
                    {transaction.type === "OUT" ? "-" : "+"}
                    {transaction.quantity}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {transaction.balanceBefore} → {transaction.balanceAfter}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {transaction.reference || "-"}
                  </TableCell>
                  <TableCell>{transaction.performedBy}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {transaction.notes || "-"}
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

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
import { Button } from "@/components/ui/button";
import { Stock, Warehouse } from "@/types/inventory";
import { Product } from "@/types";
import { StockStatusBadge, getStockStatus } from "./StockStatusBadge";
import { Package, ArrowLeftRight, Eye } from "lucide-react";

interface StockTableProps {
  stocks: Stock[];
  onAdjust?: (stock: Stock) => void;
  onTransfer?: (stock: Stock) => void;
  onViewDetails?: (stock: Stock) => void;
}

export function StockTable({
  stocks,
  onAdjust,
  onTransfer,
  onViewDetails,
}: StockTableProps) {
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case "product":
        aValue = typeof a.product === "object" ? a.product.name : "";
        bValue = typeof b.product === "object" ? b.product.name : "";
        break;
      case "warehouse":
        aValue = typeof a.warehouse === "object" ? a.warehouse.name : "";
        bValue = typeof b.warehouse === "object" ? b.warehouse.name : "";
        break;
      case "quantity":
        aValue = a.quantity;
        bValue = b.quantity;
        break;
      case "available":
        aValue = a.available;
        bValue = b.available;
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-accent"
              onClick={() => handleSort("product")}
            >
              Product
            </TableHead>
            <TableHead>SKU</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-accent"
              onClick={() => handleSort("warehouse")}
            >
              Warehouse
            </TableHead>
            <TableHead>Location</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-accent text-right"
              onClick={() => handleSort("quantity")}
            >
              Quantity
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-accent text-right"
              onClick={() => handleSort("available")}
            >
              Available
            </TableHead>
            <TableHead className="text-right">Reserved</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStocks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">
                No stock items found
              </TableCell>
            </TableRow>
          ) : (
            sortedStocks.map((stock) => {
              const product = stock.product as Product;
              const warehouse = stock.warehouse as Warehouse;
              const status = getStockStatus(stock.quantity, stock.reorderPoint);

              return (
                <TableRow key={stock._id}>
                  <TableCell className="font-medium">
                    {product?.name || "Unknown"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product?.sku || "-"}
                  </TableCell>
                  <TableCell>{warehouse?.name || "Unknown"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {stock.location
                      ? typeof stock.location === "object"
                        ? stock.location.code
                        : stock.location
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {stock.quantity}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {stock.available}
                  </TableCell>
                  <TableCell className="text-right text-orange-600">
                    {stock.reserved}
                  </TableCell>
                  <TableCell>
                    <StockStatusBadge status={status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onAdjust && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAdjust(stock)}
                          title="Adjust Stock"
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                      )}
                      {onTransfer && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onTransfer(stock)}
                          title="Transfer Stock"
                        >
                          <ArrowLeftRight className="h-4 w-4" />
                        </Button>
                      )}
                      {onViewDetails && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(stock)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
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

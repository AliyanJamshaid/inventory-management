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
import { Badge } from "@/components/ui/badge";
import { SupplierRating } from "./SupplierRating";
import { Supplier } from "@/types/supplier";
import { Edit, Eye, Trash2, Mail, Phone } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SupplierTableProps {
  suppliers: Supplier[];
  supplierMetrics?: Record<string, { totalOrders: number; totalValue: number }>;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function SupplierTable({
  suppliers,
  supplierMetrics = {},
  onView,
  onEdit,
  onDelete,
}: SupplierTableProps) {
  if (suppliers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No suppliers found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Supplier</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Total Orders</TableHead>
            <TableHead>Total Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => {
            const metrics = supplierMetrics[supplier.id] || {
              totalOrders: 0,
              totalValue: 0,
            };

            return (
              <TableRow key={supplier.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {supplier.address.city}, {supplier.address.country}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    {supplier.code}
                  </code>
                </TableCell>
                <TableCell>{supplier.contactPerson}</TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">
                        {supplier.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{supplier.phone}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <SupplierRating rating={supplier.rating} size="sm" />
                </TableCell>
                <TableCell className="text-center">{metrics.totalOrders}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(metrics.totalValue)}
                </TableCell>
                <TableCell>
                  <Badge variant={supplier.isActive ? "default" : "secondary"}>
                    {supplier.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(supplier.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(supplier.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(supplier.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
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

"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SupplierRating } from "./SupplierRating";
import { Supplier } from "@/types/supplier";
import { Mail, Phone, MapPin, DollarSign, ShoppingCart, Edit, Eye, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SupplierCardProps {
  supplier: Supplier;
  totalOrders?: number;
  totalValue?: number;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function SupplierCard({
  supplier,
  totalOrders = 0,
  totalValue = 0,
  onView,
  onEdit,
  onDelete,
}: SupplierCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{supplier.name}</h3>
            <p className="text-sm text-muted-foreground">{supplier.code}</p>
          </div>
          <Badge variant={supplier.isActive ? "default" : "secondary"}>
            {supplier.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <SupplierRating rating={supplier.rating} />
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{supplier.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{supplier.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">
              {supplier.address.city}, {supplier.address.country}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <ShoppingCart className="h-3 w-3" />
                <span>Total Orders</span>
              </div>
              <p className="text-lg font-semibold">{totalOrders}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <DollarSign className="h-3 w-3" />
                <span>Total Value</span>
              </div>
              <p className="text-lg font-semibold">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>

        {supplier.contactPerson && (
          <div className="pt-2 text-xs text-muted-foreground">
            Contact: {supplier.contactPerson}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {onView && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView(supplier.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        )}
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(supplier.id)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(supplier.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

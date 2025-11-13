import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Warehouse } from "@/types/inventory";
import { MapPin, User, Phone, Mail, Edit, Trash2, Eye } from "lucide-react";

interface WarehouseCardProps {
  warehouse: Warehouse;
  stockCount?: number;
  stockValue?: number;
  onEdit?: (warehouse: Warehouse) => void;
  onDelete?: (warehouse: Warehouse) => void;
  onViewDetails?: (warehouse: Warehouse) => void;
}

export function WarehouseCard({
  warehouse,
  stockCount = 0,
  stockValue = 0,
  onEdit,
  onDelete,
  onViewDetails,
}: WarehouseCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold">{warehouse.name}</CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{warehouse.code}</Badge>
            {warehouse.isActive ? (
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            ) : (
              <Badge variant="destructive">Inactive</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(warehouse)}
              title="Edit Warehouse"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(warehouse)}
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(warehouse)}
              title="Delete Warehouse"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {warehouse.address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p>{warehouse.address}</p>
                {(warehouse.city || warehouse.state || warehouse.country) && (
                  <p className="text-muted-foreground">
                    {[warehouse.city, warehouse.state, warehouse.country]
                      .filter(Boolean)
                      .join(", ")}
                    {warehouse.zipCode && ` ${warehouse.zipCode}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {warehouse.manager && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{warehouse.manager}</span>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm">
            {warehouse.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{warehouse.phone}</span>
              </div>
            )}
            {warehouse.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{warehouse.email}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Stock Items</p>
              <p className="text-2xl font-bold">{stockCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stock Value</p>
              <p className="text-2xl font-bold">
                ${stockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Product } from "@/types/product";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Eye, Package } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductCard({
  product,
  onView,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const profitMargin =
    ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100;

  const getStockBadge = () => {
    const stock = product.totalStock || 0;
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stock <= product.minStockLevel) {
      return <Badge className="bg-yellow-500">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-500">In Stock</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-16 w-16 text-gray-400" />
        )}
        {!product.isActive && (
          <Badge
            variant="destructive"
            className="absolute top-2 right-2"
          >
            Inactive
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-1">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground">{product.sku}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(product)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(product)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(product)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-2xl font-bold">
                ${product.sellingPrice.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                Cost: ${product.costPrice.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              {getStockBadge()}
              <p className="text-xs text-muted-foreground mt-1">
                Stock: {product.totalStock || 0}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Profit Margin:</span>
            <span
              className={
                profitMargin > 30
                  ? "text-green-600 font-medium"
                  : profitMargin > 15
                  ? "text-yellow-600 font-medium"
                  : "text-red-600 font-medium"
              }
            >
              {profitMargin.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onView(product)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

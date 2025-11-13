"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, ArrowUpDown } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  selectedProducts?: string[];
  onSelectionChange?: (ids: string[]) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
}

export function ProductTable({
  products,
  onView,
  onEdit,
  onDelete,
  selectedProducts = [],
  onSelectionChange,
  sortBy,
  sortOrder,
  onSort,
}: ProductTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? products.map((p) => p._id) : []);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (onSelectionChange) {
      const newSelection = checked
        ? [...selectedProducts, id]
        : selectedProducts.filter((pid) => pid !== id);
      onSelectionChange(newSelection);
    }
  };

  const getStockBadge = (product: Product) => {
    const stock = product.totalStock || 0;
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stock <= product.minStockLevel) {
      return <Badge className="bg-yellow-500">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-500">In Stock</Badge>;
    }
  };

  const getProfitMargin = (product: Product) => {
    return ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100;
  };

  const renderSortButton = (field: string, label: string) => {
    if (!onSort) return label;

    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8"
        onClick={() => onSort(field)}
      >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {onSelectionChange && (
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    products.length > 0 &&
                    selectedProducts.length === products.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead>{renderSortButton("name", "Name")}</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">
              {renderSortButton("price", "Price")}
            </TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead className="text-right">Margin</TableHead>
            <TableHead className="text-right">
              {renderSortButton("stock", "Stock")}
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={onSelectionChange ? 10 : 9}
                className="text-center h-24 text-muted-foreground"
              >
                No products found
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product._id} className="cursor-pointer hover:bg-muted/50">
                {onSelectionChange && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedProducts.includes(product._id)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(product._id, checked as boolean)
                      }
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium" onClick={() => onView(product)}>
                  <div>
                    <div>{product.name}</div>
                    {!product.isActive && (
                      <Badge variant="outline" className="mt-1">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell onClick={() => onView(product)}>{product.sku}</TableCell>
                <TableCell onClick={() => onView(product)}>
                  {typeof product.category === "object"
                    ? product.category.name
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right" onClick={() => onView(product)}>
                  ${product.sellingPrice.toFixed(2)}
                </TableCell>
                <TableCell className="text-right" onClick={() => onView(product)}>
                  ${product.costPrice.toFixed(2)}
                </TableCell>
                <TableCell className="text-right" onClick={() => onView(product)}>
                  <span
                    className={
                      getProfitMargin(product) > 30
                        ? "text-green-600"
                        : getProfitMargin(product) > 15
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  >
                    {getProfitMargin(product).toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-right" onClick={() => onView(product)}>
                  {product.totalStock || 0}
                </TableCell>
                <TableCell onClick={() => onView(product)}>
                  {getStockBadge(product)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

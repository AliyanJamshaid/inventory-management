"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
  const products = [
    { id: 1, name: "Laptop Pro 15", sku: "LAP-001", category: "Electronics", price: 1299.99, stock: 45, status: "In Stock" },
    { id: 2, name: "Wireless Mouse", sku: "MOU-002", category: "Accessories", price: 29.99, stock: 150, status: "In Stock" },
    { id: 3, name: "USB-C Cable", sku: "CAB-003", category: "Accessories", price: 12.99, stock: 8, status: "Low Stock" },
    { id: 4, name: "Monitor 27\"", sku: "MON-004", category: "Electronics", price: 399.99, stock: 0, status: "Out of Stock" },
    { id: 5, name: "Keyboard Mechanical", sku: "KEY-005", category: "Accessories", price: 89.99, stock: 67, status: "In Stock" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "In Stock"
                          ? "success"
                          : product.status === "Low Stock"
                          ? "warning"
                          : "destructive"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

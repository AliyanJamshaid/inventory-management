"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Search } from "lucide-react";
import { ProductFilters as ProductFiltersType } from "@/types/product";
import { useCategories } from "@/hooks/useCategories";

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onFiltersChange: (filters: ProductFiltersType) => void;
  onReset: () => void;
}

export function ProductFilters({
  filters,
  onFiltersChange,
  onReset,
}: ProductFiltersProps) {
  const { data: categories } = useCategories({ isActive: true });
  const [localSearch, setLocalSearch] = useState(filters.search || "");

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: localSearch, page: 1 });
  };

  const handleFilterChange = (key: keyof ProductFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) =>
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all" &&
      key !== "page" &&
      key !== "limit" &&
      key !== "sortBy" &&
      key !== "sortOrder"
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="flex gap-2">
            <Input
              id="search"
              placeholder="Search products..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={filters.category || "all"}
            onValueChange={(value) =>
              handleFilterChange("category", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              handleFilterChange("status", value as any)
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stockStatus">Stock Status</Label>
          <Select
            value={filters.stockStatus || "all"}
            onValueChange={(value) =>
              handleFilterChange("stockStatus", value as any)
            }
          >
            <SelectTrigger id="stockStatus">
              <SelectValue placeholder="All Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock Status</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minPrice">Min Price</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="0"
              value={filters.minPrice || ""}
              onChange={(e) =>
                handleFilterChange(
                  "minPrice",
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPrice">Max Price</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="999999"
              value={filters.maxPrice || ""}
              onChange={(e) =>
                handleFilterChange(
                  "maxPrice",
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortBy">Sort By</Label>
          <Select
            value={filters.sortBy || "createdAt"}
            onValueChange={(value) =>
              handleFilterChange("sortBy", value as any)
            }
          >
            <SelectTrigger id="sortBy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="stock">Stock</SelectItem>
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="updatedAt">Date Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Select
            value={filters.sortOrder || "desc"}
            onValueChange={(value) =>
              handleFilterChange("sortOrder", value as any)
            }
          >
            <SelectTrigger id="sortOrder">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

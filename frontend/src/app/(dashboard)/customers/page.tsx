"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Users, TrendingUp, DollarSign } from "lucide-react";
import { useCustomers, useCustomerStats, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/useCustomers";
import { CustomerTable } from "@/components/features/CustomerTable";
import { CustomerFormDialog } from "@/components/features/CustomerFormDialog";
import { Customer, CustomerType, CustomerStatus } from "@/types/customer";
import { CreateCustomerFormData } from "@/lib/validations/customerSchema";
import { useToast } from "@/components/ui/toast";

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<CustomerType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "totalSpent" | "totalOrders">("name");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { toast } = useToast();

  // Build filters
  const filters = {
    search: searchTerm || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sortBy,
    sortOrder: "desc" as const,
  };

  const { data: customersData, isLoading } = useCustomers(filters);
  const { data: stats } = useCustomerStats();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const customers = customersData?.data || [];

  const handleCreateCustomer = async (data: CreateCustomerFormData) => {
    try {
      await createMutation.mutateAsync(data);
      toast({
        title: "Success",
        description: "Customer created successfully",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create customer",
        type: "error",
      });
      throw error;
    }
  };

  const handleUpdateCustomer = async (data: CreateCustomerFormData) => {
    if (!selectedCustomer) return;
    try {
      await updateMutation.mutateAsync({ id: selectedCustomer._id, data });
      toast({
        title: "Success",
        description: "Customer updated successfully",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update customer",
        type: "error",
      });
      throw error;
    }
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Are you sure you want to delete ${customer.name}?`)) return;
    try {
      await deleteMutation.mutateAsync(customer._id);
      toast({
        title: "Success",
        description: "Customer deleted successfully",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete customer",
        type: "error",
      });
    }
  };

  const handleAddNew = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-gray-500">Manage your customer base</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-gray-500">
                {stats.activeCustomers} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">B2B Customers</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.b2bCount}</div>
              <p className="text-xs text-gray-500">Business accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">B2C Customers</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.b2cCount}</div>
              <p className="text-xs text-gray-500">Consumer accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-gray-500">
                Avg: ${stats.averageOrderValue.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="B2B">B2B</SelectItem>
                <SelectItem value="B2C">B2C</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="totalSpent">Total Spent</SelectItem>
                <SelectItem value="totalOrders">Total Orders</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <CustomerTable
              customers={customers}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Customer Form Dialog */}
      <CustomerFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        customer={selectedCustomer}
        onSubmit={selectedCustomer ? handleUpdateCustomer : handleCreateCustomer}
      />
    </div>
  );
}

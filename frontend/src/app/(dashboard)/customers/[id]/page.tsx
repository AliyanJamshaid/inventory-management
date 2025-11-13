"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Award,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useCustomer, useUpdateCustomer, useUpdateLoyalty } from "@/hooks/useCustomers";
import { useSalesOrders } from "@/hooks/useSalesOrders";
import { useInvoices } from "@/hooks/useInvoices";
import { CustomerTypeBadge } from "@/components/features/CustomerTypeBadge";
import { CustomerFormDialog } from "@/components/features/CustomerFormDialog";
import { LoyaltyPointsDialog } from "@/components/features/LoyaltyPointsDialog";
import { SOTable } from "@/components/features/SOTable";
import { InvoiceTable } from "@/components/features/InvoiceTable";
import { useToast } from "@/components/ui/toast";
import { format } from "date-fns";

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);

  const { toast } = useToast();

  const { data: customer, isLoading } = useCustomer(customerId);
  const { data: ordersData } = useSalesOrders({ customer: customerId });
  const { data: invoicesData } = useInvoices({ customer: customerId });
  const updateMutation = useUpdateCustomer();
  const loyaltyMutation = useUpdateLoyalty();

  const orders = ordersData?.data || [];
  const invoices = invoicesData?.data || [];

  const handleUpdate = async (data: any) => {
    try {
      await updateMutation.mutateAsync({ id: customerId, data });
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

  const handleLoyaltyUpdate = async (data: any) => {
    try {
      await loyaltyMutation.mutateAsync({ customerId, data });
      toast({
        title: "Success",
        description: "Loyalty points updated successfully",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update loyalty points",
        type: "error",
      });
      throw error;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!customer) {
    return <div className="p-8 text-center">Customer not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/customers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{customer.name}</h1>
              <CustomerTypeBadge type={customer.type} />
              <Badge
                className={
                  customer.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {customer.status}
              </Badge>
            </div>
            <p className="text-gray-500">#{customer.customerNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsLoyaltyOpen(true)}>
            <Award className="h-4 w-4 mr-2" />
            Manage Loyalty
          </Button>
          <Button onClick={() => setIsEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Customer
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${customer.totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{customer.loyaltyPoints}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${customer.totalOrders > 0 ? (customer.totalSpent / customer.totalOrders).toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  </div>
                </div>
                {customer.contactPerson && (
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">Contact Person</p>
                      <p className="text-sm text-gray-600">{customer.contactPerson}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="text-sm text-gray-600">
                    <p>{customer.address.street}</p>
                    <p>
                      {customer.address.city}, {customer.address.state} {customer.address.zipCode}
                    </p>
                    <p>{customer.address.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Details (B2B) */}
            {customer.type === "B2B" && (
              <Card>
                <CardHeader>
                  <CardTitle>Business Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customer.taxId && (
                    <div>
                      <p className="text-sm font-medium">Tax ID</p>
                      <p className="text-sm text-gray-600">{customer.taxId}</p>
                    </div>
                  )}
                  {customer.creditLimit !== undefined && (
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Credit Limit</p>
                        <p className="text-sm text-gray-600">${customer.creditLimit.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                  {customer.paymentTerms !== undefined && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Payment Terms</p>
                        <p className="text-sm text-gray-600">{customer.paymentTerms} days</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {customer.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{customer.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Sales Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <SOTable orders={orders} />
              ) : (
                <p className="text-center text-gray-500 py-8">No orders found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <InvoiceTable invoices={invoices} />
              ) : (
                <p className="text-center text-gray-500 py-8">No invoices found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CustomerFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        customer={customer}
        onSubmit={handleUpdate}
      />

      <LoyaltyPointsDialog
        open={isLoyaltyOpen}
        onOpenChange={setIsLoyaltyOpen}
        customer={customer}
        onSubmit={handleLoyaltyUpdate}
      />
    </div>
  );
}

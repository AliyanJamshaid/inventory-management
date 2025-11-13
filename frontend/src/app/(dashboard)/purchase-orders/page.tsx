"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { POTable } from "@/components/features/POTable";
import { PurchaseOrderForm } from "@/components/features/PurchaseOrderForm";
import { POApprovalDialog } from "@/components/features/POApprovalDialog";
import { POReceiveDialog } from "@/components/features/POReceiveDialog";
import {
  usePurchaseOrders,
  useDeletePO,
  useCancelPO,
} from "@/hooks/usePurchaseOrders";
import { useActiveSuppliers } from "@/hooks/useSuppliers";
import { POFilters, POStatus } from "@/types/purchaseOrder";
import { Plus, Search, Filter, Loader2, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPOId, setSelectedPOId] = useState<string | null>(null);
  const [selectedPO, setSelectedPO] = useState<any>(null);

  const [filters, setFilters] = useState<POFilters>({
    search: "",
    status: undefined,
    supplierId: undefined,
    sortBy: "orderDate",
    sortOrder: "desc",
  });

  const { data, isLoading } = usePurchaseOrders(filters);
  const { data: suppliers } = useActiveSuppliers();
  const deletePO = useDeletePO();
  const cancelPO = useCancelPO();

  const purchaseOrders = data?.data || [];
  const pagination = data?.pagination;

  const handleView = (id: string) => {
    router.push(`/purchase-orders/${id}`);
  };

  const handleEdit = (id: string) => {
    const po = purchaseOrders.find((p) => p.id === id);
    setSelectedPO(po);
    setFormOpen(true);
  };

  const handleApprove = (id: string) => {
    const po = purchaseOrders.find((p) => p.id === id);
    if (po) {
      setSelectedPOId(id);
      setSelectedPO(po);
      setApprovalDialogOpen(true);
    }
  };

  const handleReceive = (id: string) => {
    const po = purchaseOrders.find((p) => p.id === id);
    if (po) {
      setSelectedPO(po);
      setReceiveDialogOpen(true);
    }
  };

  const handleCancelClick = (id: string) => {
    setSelectedPOId(id);
    setCancelDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSelectedPOId(id);
    setDeleteDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (selectedPOId) {
      await cancelPO.mutateAsync({ id: selectedPOId });
      setCancelDialogOpen(false);
      setSelectedPOId(null);
    }
  };

  const confirmDelete = async () => {
    if (selectedPOId) {
      await deletePO.mutateAsync(selectedPOId);
      setDeleteDialogOpen(false);
      setSelectedPOId(null);
    }
  };

  const handleAddNew = () => {
    setSelectedPO(null);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedPO(null);
  };

  // Calculate stats
  const totalValue = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  const draftCount = purchaseOrders.filter((po) => po.status === POStatus.DRAFT).length;
  const pendingCount = purchaseOrders.filter(
    (po) => po.status === POStatus.PENDING || po.status === POStatus.APPROVED
  ).length;
  const overdueCount = purchaseOrders.filter((po) => {
    if (po.status === POStatus.RECEIVED || po.status === POStatus.CANCELLED) {
      return false;
    }
    return new Date(po.expectedDeliveryDate) < new Date();
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage supplier purchase orders</p>
        </div>
        <Button className="gap-2" onClick={handleAddNew}>
          <Plus className="h-4 w-4" />
          Create Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by PO number..."
                className="pl-10"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>

            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  status: value === "all" ? undefined : (value as POStatus),
                })
              }
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={POStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={POStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={POStatus.APPROVED}>Approved</SelectItem>
                <SelectItem value={POStatus.RECEIVED}>Received</SelectItem>
                <SelectItem value={POStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.supplierId || "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  supplierId: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Filter by supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers?.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={(value: any) =>
                setFilters({ ...filters, sortBy: value })
              }
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="orderDate">Order Date</SelectItem>
                <SelectItem value="expectedDeliveryDate">
                  Expected Delivery
                </SelectItem>
                <SelectItem value="totalAmount">Total Amount</SelectItem>
                <SelectItem value="orderNumber">PO Number</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Order List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Purchase Orders
            {pagination && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({pagination.total} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <POTable
              purchaseOrders={purchaseOrders}
              onView={handleView}
              onEdit={handleEdit}
              onApprove={handleApprove}
              onReceive={handleReceive}
              onCancel={handleCancelClick}
            />
          )}
        </CardContent>
      </Card>

      {/* Purchase Order Form Dialog */}
      <PurchaseOrderForm
        open={formOpen}
        onOpenChange={handleFormClose}
        purchaseOrder={selectedPO}
      />

      {/* Approval Dialog */}
      {selectedPOId && selectedPO && (
        <POApprovalDialog
          open={approvalDialogOpen}
          onOpenChange={setApprovalDialogOpen}
          purchaseOrderId={selectedPOId}
          orderNumber={selectedPO.orderNumber}
        />
      )}

      {/* Receive Dialog */}
      {selectedPO && (
        <POReceiveDialog
          open={receiveDialogOpen}
          onOpenChange={setReceiveDialogOpen}
          purchaseOrder={selectedPO}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this purchase order? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              purchase order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

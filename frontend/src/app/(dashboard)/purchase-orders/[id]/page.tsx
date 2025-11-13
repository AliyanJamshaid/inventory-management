"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { POStatusBadge } from "@/components/features/POStatusBadge";
import { PurchaseOrderForm } from "@/components/features/PurchaseOrderForm";
import { POApprovalDialog } from "@/components/features/POApprovalDialog";
import { POReceiveDialog } from "@/components/features/POReceiveDialog";
import {
  usePurchaseOrder,
  useDeletePO,
  useCancelPO,
  useDuplicatePO,
  useSendPOEmail,
} from "@/hooks/usePurchaseOrders";
import { POStatus } from "@/types/purchaseOrder";
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  Package,
  XCircle,
  Printer,
  Mail,
  Copy,
  Loader2,
  Building2,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PurchaseOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const poId = params.id as string;

  const [formOpen, setFormOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: purchaseOrder, isLoading } = usePurchaseOrder(poId);
  const deletePO = useDeletePO();
  const cancelPO = useCancelPO();
  const duplicatePO = useDuplicatePO();
  const sendEmail = useSendPOEmail();

  const handleDelete = async () => {
    await deletePO.mutateAsync(poId);
    setDeleteDialogOpen(false);
    router.push("/purchase-orders");
  };

  const handleCancel = async () => {
    await cancelPO.mutateAsync({ id: poId });
    setCancelDialogOpen(false);
  };

  const handleDuplicate = async () => {
    await duplicatePO.mutateAsync(poId);
  };

  const handleSendEmail = async () => {
    await sendEmail.mutateAsync(poId);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Purchase order not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/purchase-orders")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Purchase Orders
        </Button>
      </div>
    );
  }

  const canEdit = purchaseOrder.status === POStatus.DRAFT;
  const canApprove =
    purchaseOrder.status === POStatus.DRAFT ||
    purchaseOrder.status === POStatus.PENDING;
  const canReceive = purchaseOrder.status === POStatus.APPROVED;
  const canCancel =
    purchaseOrder.status !== POStatus.RECEIVED &&
    purchaseOrder.status !== POStatus.CANCELLED;
  const canDelete = purchaseOrder.status === POStatus.DRAFT;

  const isOverdue =
    purchaseOrder.status !== POStatus.RECEIVED &&
    purchaseOrder.status !== POStatus.CANCELLED &&
    new Date(purchaseOrder.expectedDeliveryDate) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/purchase-orders")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{purchaseOrder.orderNumber}</h1>
              <POStatusBadge status={purchaseOrder.status} />
              {isOverdue && (
                <Badge variant="destructive">Overdue</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Supplier: {purchaseOrder.supplier.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrint}
            title="Print PO"
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleSendEmail}
            disabled={sendEmail.isPending}
            title="Email to Supplier"
          >
            {sendEmail.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleDuplicate}
            disabled={duplicatePO.isPending}
            title="Duplicate PO"
          >
            {duplicatePO.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          {canEdit && (
            <Button variant="outline" onClick={() => setFormOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {canApprove && (
            <Button onClick={() => setApprovalDialogOpen(true)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
          {canReceive && (
            <Button onClick={() => setReceiveDialogOpen(true)}>
              <Package className="h-4 w-4 mr-2" />
              Receive
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(true)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* PO Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Supplier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{purchaseOrder.supplier.name}</p>
            <p className="text-sm text-muted-foreground">
              {purchaseOrder.supplier.code}
            </p>
            <p className="text-sm text-muted-foreground">
              {purchaseOrder.supplier.email}
            </p>
            <p className="text-sm text-muted-foreground">
              {purchaseOrder.supplier.phone}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Order Date</p>
              <p className="font-medium">{formatDate(purchaseOrder.orderDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expected Delivery</p>
              <p className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>
                {formatDate(purchaseOrder.expectedDeliveryDate)}
              </p>
            </div>
            {purchaseOrder.receivedDate && (
              <div>
                <p className="text-xs text-muted-foreground">Received Date</p>
                <p className="font-medium">
                  {formatDate(purchaseOrder.receivedDate)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Created By</p>
              <p className="font-medium">{purchaseOrder.createdBy.name}</p>
            </div>
            {purchaseOrder.approvedBy && (
              <div>
                <p className="text-xs text-muted-foreground">Approved By</p>
                <p className="font-medium">{purchaseOrder.approvedBy.name}</p>
              </div>
            )}
            {purchaseOrder.receivedBy && (
              <div>
                <p className="text-xs text-muted-foreground">Received By</p>
                <p className="font-medium">{purchaseOrder.receivedBy.name}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrder.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      {item.variantName && (
                        <p className="text-sm text-muted-foreground">
                          Variant: {item.variantName}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {item.product.sku}
                    </code>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {item.quantity}
                    {item.receivedQuantity !== undefined && (
                      <span className="text-xs text-muted-foreground ml-1">
                        (Received: {item.receivedQuantity})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(item.totalPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(purchaseOrder.subtotal)}
                </span>
              </div>
              {purchaseOrder.shippingCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {formatCurrency(purchaseOrder.shippingCost)}
                  </span>
                </div>
              )}
              {purchaseOrder.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">
                    {formatCurrency(purchaseOrder.tax)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(purchaseOrder.totalAmount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {purchaseOrder.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{purchaseOrder.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Status Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div className="flex-1">
                <p className="font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(purchaseOrder.createdAt)} by{" "}
                  {purchaseOrder.createdBy.name}
                </p>
              </div>
            </div>

            {purchaseOrder.approvedAt && purchaseOrder.approvedBy && (
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="font-medium">Approved</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(purchaseOrder.approvedAt)} by{" "}
                    {purchaseOrder.approvedBy.name}
                  </p>
                </div>
              </div>
            )}

            {purchaseOrder.receivedDate && purchaseOrder.receivedBy && (
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="font-medium">Received</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(purchaseOrder.receivedDate)} by{" "}
                    {purchaseOrder.receivedBy.name}
                  </p>
                </div>
              </div>
            )}

            {purchaseOrder.status === POStatus.CANCELLED && (
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">Cancelled</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(purchaseOrder.updatedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Form Dialog */}
      <PurchaseOrderForm
        open={formOpen}
        onOpenChange={setFormOpen}
        purchaseOrder={purchaseOrder}
      />

      {/* Approval Dialog */}
      <POApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        purchaseOrderId={poId}
        orderNumber={purchaseOrder.orderNumber}
      />

      {/* Receive Dialog */}
      <POReceiveDialog
        open={receiveDialogOpen}
        onOpenChange={setReceiveDialogOpen}
        purchaseOrder={purchaseOrder}
      />

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel purchase order{" "}
              <strong>{purchaseOrder.orderNumber}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
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
              This action cannot be undone. This will permanently delete purchase
              order <strong>{purchaseOrder.orderNumber}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

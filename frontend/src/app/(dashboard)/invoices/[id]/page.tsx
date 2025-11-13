"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Send,
  DollarSign,
  Download,
  Mail,
  X,
  AlertCircle,
} from "lucide-react";
import {
  useInvoice,
  useSendInvoice,
  useRecordPayment,
  useCancelInvoice,
  useDownloadInvoicePDF,
} from "@/hooks/useInvoices";
import { InvoiceStatusBadge } from "@/components/features/InvoiceStatusBadge";
import { PaymentDialog } from "@/components/features/PaymentDialog";
import { useToast } from "@/components/ui/toast";
import { format, isPast } from "date-fns";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const { toast } = useToast();

  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const sendMutation = useSendInvoice();
  const recordPaymentMutation = useRecordPayment();
  const cancelMutation = useCancelInvoice();
  const downloadMutation = useDownloadInvoicePDF();

  const handleSend = async () => {
    if (!invoice) return;
    const customer = typeof invoice.customer === "object" ? invoice.customer : null;
    if (!customer) return;

    const email = prompt("Enter email address:", customer.email);
    if (!email) return;

    try {
      await sendMutation.mutateAsync({
        id: invoiceId,
        email: { to: email },
      });
      toast({
        title: "Success",
        description: "Invoice sent successfully",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invoice",
        type: "error",
      });
    }
  };

  const handleRecordPayment = async (data: any) => {
    try {
      await recordPaymentMutation.mutateAsync({ id: invoiceId, data });
      toast({
        title: "Success",
        description: "Payment recorded successfully",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record payment",
        type: "error",
      });
      throw error;
    }
  };

  const handleCancel = async () => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;

    try {
      await cancelMutation.mutateAsync({ id: invoiceId, reason });
      toast({
        title: "Success",
        description: "Invoice cancelled",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel invoice",
        type: "error",
      });
    }
  };

  const handleDownload = async () => {
    try {
      await downloadMutation.mutateAsync(invoiceId);
      toast({
        title: "Success",
        description: "Invoice downloaded",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download invoice",
        type: "error",
      });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!invoice) {
    return <div className="p-8 text-center">Invoice not found</div>;
  }

  const customer = typeof invoice.customer === "object" ? invoice.customer : null;
  const isOverdue = invoice.status !== "paid" && invoice.status !== "cancelled" && isPast(new Date(invoice.dueDate));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
              <InvoiceStatusBadge status={invoice.status} />
              {isOverdue && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Overdue</span>
                </div>
              )}
            </div>
            <p className="text-gray-500">
              Due {format(new Date(invoice.dueDate), "MMMM dd, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {invoice.status === "draft" && (
            <Button variant="outline" onClick={handleSend}>
              <Send className="h-4 w-4 mr-2" />
              Send Invoice
            </Button>
          )}
          {["sent", "partial", "overdue"].includes(invoice.status) && (
            <Button onClick={() => setIsPaymentOpen(true)}>
              <DollarSign className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          )}
          {["draft", "sent"].includes(invoice.status) && (
            <Button variant="destructive" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium">Invoice Date</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(invoice.invoiceDate), "MMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Due Date</p>
                <p className={`text-sm ${isOverdue ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                  {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                </p>
              </div>
              {invoice.paymentTerms && (
                <div>
                  <p className="text-sm font-medium">Payment Terms</p>
                  <p className="text-sm text-gray-600">{invoice.paymentTerms} days</p>
                </div>
              )}
              {invoice.salesOrder && (
                <div>
                  <p className="text-sm font-medium">Sales Order</p>
                  <Link
                    href={`/sales-orders/${invoice.salesOrder}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Order
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          {customer && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-gray-600">{customer.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-gray-600">{customer.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Customer #</p>
                  <p className="text-sm text-gray-600">{customer.customerNumber}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.productName || "N/A"}</TableCell>
                      <TableCell>{item.sku || "-"}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${item.discount.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${item.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pricing Summary */}
              <div className="mt-6 flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount:</span>
                    <span>-${invoice.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax ({invoice.taxRate}%):</span>
                    <span>${invoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>${invoice.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>${invoice.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Paid:</span>
                    <span>${invoice.paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg text-blue-600 pt-1 border-t">
                    <span>Balance:</span>
                    <span>${invoice.balanceAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.payments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell>
                          {format(new Date(payment.paymentDate), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="capitalize">
                          {payment.paymentMethod.replace("_", " ")}
                        </TableCell>
                        <TableCell>{payment.transactionId || "-"}</TableCell>
                        <TableCell className="text-right font-semibold">
                          ${payment.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold">${invoice.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Paid Amount</p>
                <p className="text-xl font-semibold text-green-600">
                  ${invoice.paidAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Balance Due</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${invoice.balanceAmount.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          {invoice.billingAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p>{invoice.billingAddress.street}</p>
                  <p>
                    {invoice.billingAddress.city}, {invoice.billingAddress.state}{" "}
                    {invoice.billingAddress.zipCode}
                  </p>
                  <p>{invoice.billingAddress.country}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      {invoice && (
        <PaymentDialog
          open={isPaymentOpen}
          onOpenChange={setIsPaymentOpen}
          invoice={invoice}
          onSubmit={handleRecordPayment}
        />
      )}
    </div>
  );
}

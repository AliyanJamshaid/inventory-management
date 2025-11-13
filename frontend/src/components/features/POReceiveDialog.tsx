"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { poReceiveSchema, POReceiveInput } from "@/lib/validations/purchaseOrderSchema";
import { useReceivePO } from "@/hooks/usePurchaseOrders";
import { PurchaseOrder } from "@/types/purchaseOrder";
import { Loader2, Package, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface POReceiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder: PurchaseOrder;
}

export function POReceiveDialog({
  open,
  onOpenChange,
  purchaseOrder,
}: POReceiveDialogProps) {
  const receivePO = useReceivePO();
  const [itemsReceived, setItemsReceived] = useState<Record<string, number>>({});
  const [batchNumbers, setBatchNumbers] = useState<Record<string, string>>({});
  const [qualityNotes, setQualityNotes] = useState<Record<string, string>>({});

  const form = useForm<any>({
    defaultValues: {
      warehouseId: "",
      notes: "",
    },
  });

  // Initialize item quantities
  useEffect(() => {
    if (open && purchaseOrder) {
      const initialQuantities: Record<string, number> = {};
      purchaseOrder.items.forEach((item) => {
        initialQuantities[item.id] = item.quantity;
      });
      setItemsReceived(initialQuantities);
    }
  }, [open, purchaseOrder]);

  const handleQuantityChange = (itemId: string, value: string) => {
    const quantity = parseInt(value) || 0;
    setItemsReceived((prev) => ({ ...prev, [itemId]: quantity }));
  };

  const handleBatchNumberChange = (itemId: string, value: string) => {
    setBatchNumbers((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleQualityNotesChange = (itemId: string, value: string) => {
    setQualityNotes((prev) => ({ ...prev, [itemId]: value }));
  };

  const onSubmit = async (data: any) => {
    try {
      const receiveData: POReceiveInput = {
        warehouseId: data.warehouseId,
        items: purchaseOrder.items.map((item) => ({
          itemId: item.id,
          receivedQuantity: itemsReceived[item.id] || 0,
          batchNumber: batchNumbers[item.id],
          qualityNotes: qualityNotes[item.id],
        })),
        notes: data.notes,
      };

      await receivePO.mutateAsync({ id: purchaseOrder.id, data: receiveData });
      onOpenChange(false);
      form.reset();
      setItemsReceived({});
      setBatchNumbers({});
      setQualityNotes({});
    } catch (error) {
      // Error handled by mutation
    }
  };

  const totalExpected = purchaseOrder.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalReceived = Object.values(itemsReceived).reduce(
    (sum, qty) => sum + qty,
    0
  );
  const hasDiscrepancy = totalReceived !== totalExpected;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Receive Purchase Order
          </DialogTitle>
          <DialogDescription>
            Record receipt of goods for PO <strong>{purchaseOrder.orderNumber}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Warehouse Selection */}
            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse / Location *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="main-warehouse">Main Warehouse</SelectItem>
                      <SelectItem value="warehouse-2">Warehouse 2</SelectItem>
                      <SelectItem value="warehouse-3">Warehouse 3</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Items Table */}
            <div className="space-y-2">
              <h3 className="font-semibold">Items to Receive</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Product</th>
                      <th className="text-center p-3">Ordered</th>
                      <th className="text-center p-3">Received</th>
                      <th className="text-left p-3">Batch #</th>
                      <th className="text-left p-3">Quality Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrder.items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              SKU: {item.product.sku}
                            </p>
                            {item.variantName && (
                              <p className="text-xs text-muted-foreground">
                                Variant: {item.variantName}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-medium">{item.quantity}</span>
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min="0"
                            value={itemsReceived[item.id] || 0}
                            onChange={(e) =>
                              handleQuantityChange(item.id, e.target.value)
                            }
                            className="w-20 text-center"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            placeholder="Optional"
                            value={batchNumbers[item.id] || ""}
                            onChange={(e) =>
                              handleBatchNumberChange(item.id, e.target.value)
                            }
                            className="w-32"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            placeholder="Optional"
                            value={qualityNotes[item.id] || ""}
                            onChange={(e) =>
                              handleQualityNotesChange(item.id, e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted font-medium">
                    <tr>
                      <td className="p-3">Total</td>
                      <td className="p-3 text-center">{totalExpected}</td>
                      <td className="p-3 text-center">{totalReceived}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {hasDiscrepancy && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Quantity discrepancy detected. Total received ({totalReceived}) does
                    not match total ordered ({totalExpected}).
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* General Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>General Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this receipt..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={receivePO.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={receivePO.isPending}>
                {receivePO.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Receive Goods
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

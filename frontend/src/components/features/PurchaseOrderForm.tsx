"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Badge } from "@/components/ui/badge";
import { poCreateSchema, POCreateInput } from "@/lib/validations/purchaseOrderSchema";
import { POStatus } from "@/types/purchaseOrder";
import { useCreatePO, useUpdatePO } from "@/hooks/usePurchaseOrders";
import { useActiveSuppliers } from "@/hooks/useSuppliers";
import { Loader2, Plus, Trash2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PurchaseOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder?: any;
}

export function PurchaseOrderForm({
  open,
  onOpenChange,
  purchaseOrder,
}: PurchaseOrderFormProps) {
  const isEditing = !!purchaseOrder;
  const [step, setStep] = useState(1);
  const createPO = useCreatePO();
  const updatePO = useUpdatePO();
  const { data: suppliers } = useActiveSuppliers();

  const form = useForm<any>({
    defaultValues: {
      supplierId: "",
      orderDate: new Date().toISOString().split("T")[0],
      expectedDeliveryDate: "",
      items: [{ productId: "", quantity: 1, unitPrice: 0 }],
      shippingCost: 0,
      tax: 0,
      notes: "",
      status: POStatus.DRAFT,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch("items");
  const watchShipping = form.watch("shippingCost");
  const watchTax = form.watch("tax");

  // Calculate totals
  const subtotal = watchItems?.reduce((sum: number, item: any) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0);
  }, 0) || 0;

  const total = subtotal + (watchShipping || 0) + (watchTax || 0);

  useEffect(() => {
    if (purchaseOrder) {
      form.reset({
        supplierId: purchaseOrder.supplier.id,
        orderDate: purchaseOrder.orderDate.split("T")[0],
        expectedDeliveryDate: purchaseOrder.expectedDeliveryDate.split("T")[0],
        items: purchaseOrder.items.map((item: any) => ({
          productId: item.product.id,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        shippingCost: purchaseOrder.shippingCost,
        tax: purchaseOrder.tax,
        notes: purchaseOrder.notes || "",
        status: purchaseOrder.status,
      });
    } else {
      form.reset({
        supplierId: "",
        orderDate: new Date().toISOString().split("T")[0],
        expectedDeliveryDate: "",
        items: [{ productId: "", quantity: 1, unitPrice: 0 }],
        shippingCost: 0,
        tax: 0,
        notes: "",
        status: POStatus.DRAFT,
      });
    }
  }, [purchaseOrder, form]);

  const onSubmit = async (data: any) => {
    try {
      if (isEditing) {
        await updatePO.mutateAsync({ id: purchaseOrder.id, data });
      } else {
        await createPO.mutateAsync(data);
      }
      onOpenChange(false);
      form.reset();
      setStep(1);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep(1);
    form.reset();
  };

  const isLoading = createPO.isPending || updatePO.isPending;

  const steps = [
    { number: 1, title: "Supplier & Dates" },
    { number: 2, title: "Items" },
    { number: 3, title: "Additional Info" },
    { number: 4, title: "Review" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Purchase Order" : "Create Purchase Order"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update purchase order details below."
              : "Fill in the purchase order details below."}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= s.number
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s.number ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    s.number
                  )}
                </div>
                <p className="text-xs mt-1 text-center">{s.title}</p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    step > s.number ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Supplier & Dates */}
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers?.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name} ({supplier.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="orderDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expectedDeliveryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Delivery Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Items */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Order Items</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({ productId: "", quantity: 1, unitPrice: 0 })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Item {index + 1}</h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.productId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Product ID or search"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseInt(e.target.value) || 1)
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit Price *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Line Total:{" "}
                          <span className="font-semibold">
                            {formatCurrency(
                              (watchItems[index]?.quantity || 0) *
                                (watchItems[index]?.unitPrice || 0)
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <p className="text-right text-lg font-semibold">
                    Subtotal: {formatCurrency(subtotal)}
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Additional Info */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shippingCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Cost</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={POStatus.DRAFT}>
                            Save as Draft
                          </SelectItem>
                          <SelectItem value={POStatus.PENDING}>
                            Submit for Approval
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-semibold">Order Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Supplier</p>
                      <p className="font-medium">
                        {suppliers?.find((s) => s.id === form.watch("supplierId"))
                          ?.name || "Not selected"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Order Date</p>
                      <p className="font-medium">{form.watch("orderDate")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expected Delivery</p>
                      <p className="font-medium">
                        {form.watch("expectedDeliveryDate")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge>{form.watch("status")}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Items ({watchItems.length})</h3>
                  <div className="border rounded-lg divide-y">
                    {watchItems.map((item: any, index: number) => (
                      <div key={index} className="p-3 flex justify-between">
                        <div>
                          <p className="font-medium">Product ID: {item.productId}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity} × {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {formatCurrency(watchShipping || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">
                      {formatCurrency(watchTax || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex justify-between">
              <div>
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                {step < 4 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEditing ? "Update Order" : "Create Order"}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

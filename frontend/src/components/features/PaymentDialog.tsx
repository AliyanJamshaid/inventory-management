"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recordPaymentSchema, RecordPaymentFormData } from "@/lib/validations/invoiceSchema";
import { Invoice } from "@/types/invoice";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  onSubmit: (data: RecordPaymentFormData) => Promise<void>;
}

export function PaymentDialog({
  open,
  onOpenChange,
  invoice,
  onSubmit,
}: PaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RecordPaymentFormData>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      amount: invoice.balanceAmount,
      paymentDate: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: "cash",
    },
  });

  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    if (open) {
      reset({
        amount: invoice.balanceAmount,
        paymentDate: format(new Date(), "yyyy-MM-dd"),
        paymentMethod: "cash",
      });
    }
  }, [open, invoice, reset]);

  const handleFormSubmit = async (data: RecordPaymentFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Error recording payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Invoice: {invoice.invoiceNumber} | Balance: ${invoice.balanceAmount.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                max={invoice.balanceAmount}
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Maximum: ${invoice.balanceAmount.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">
                Payment Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="paymentDate"
                type="date"
                {...register("paymentDate")}
              />
              {errors.paymentDate && (
                <p className="text-sm text-red-500">{errors.paymentDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) => setValue("paymentMethod", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentMethod && (
                <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input id="transactionId" {...register("transactionId")} />
              {errors.transactionId && (
                <p className="text-sm text-red-500">{errors.transactionId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
              {errors.notes && (
                <p className="text-sm text-red-500">{errors.notes.message}</p>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

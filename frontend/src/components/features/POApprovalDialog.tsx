"use client";

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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { poApprovalSchema, POApprovalInput } from "@/lib/validations/purchaseOrderSchema";
import { useApprovePO } from "@/hooks/usePurchaseOrders";
import { Loader2, CheckCircle } from "lucide-react";

interface POApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrderId: string;
  orderNumber: string;
}

export function POApprovalDialog({
  open,
  onOpenChange,
  purchaseOrderId,
  orderNumber,
}: POApprovalDialogProps) {
  const approvePO = useApprovePO();

  const form = useForm<POApprovalInput>({
    resolver: zodResolver(poApprovalSchema),
    defaultValues: {
      notes: "",
    },
  });

  const onSubmit = async (data: POApprovalInput) => {
    try {
      await approvePO.mutateAsync({ id: purchaseOrderId, data });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Approve Purchase Order
          </DialogTitle>
          <DialogDescription>
            Approve purchase order <strong>{orderNumber}</strong>. This will move the order
            to approved status and allow it to be received.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approval Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this approval..."
                      className="resize-none"
                      rows={4}
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
                disabled={approvePO.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={approvePO.isPending}>
                {approvePO.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Approve Order
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { loyaltyTransactionSchema, LoyaltyTransactionFormData } from "@/lib/validations/customerSchema";
import { Customer } from "@/types/customer";
import { Loader2, Award } from "lucide-react";

interface LoyaltyPointsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  onSubmit: (data: LoyaltyTransactionFormData) => Promise<void>;
}

export function LoyaltyPointsDialog({
  open,
  onOpenChange,
  customer,
  onSubmit,
}: LoyaltyPointsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LoyaltyTransactionFormData>({
    resolver: zodResolver(loyaltyTransactionSchema),
    defaultValues: {
      type: "earn",
    },
  });

  const transactionType = watch("type");

  useEffect(() => {
    if (open) {
      reset({
        type: "earn",
        points: 0,
        description: "",
      });
    }
  }, [open, reset]);

  const handleFormSubmit = async (data: LoyaltyTransactionFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Error updating loyalty points:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Loyalty Points</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span>
                {customer.name} - Current Balance: {customer.loyaltyPoints} points
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label>
                Transaction Type <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={transactionType}
                onValueChange={(value) => setValue("type", value as "earn" | "redeem")}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="earn" id="type-earn" />
                  <Label htmlFor="type-earn" className="cursor-pointer">
                    Add Points
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="redeem" id="type-redeem" />
                  <Label htmlFor="type-redeem" className="cursor-pointer">
                    Redeem Points
                  </Label>
                </div>
              </RadioGroup>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">
                Points <span className="text-red-500">*</span>
              </Label>
              <Input
                id="points"
                type="number"
                min="1"
                max={transactionType === "redeem" ? customer.loyaltyPoints : undefined}
                {...register("points", { valueAsNumber: true })}
              />
              {errors.points && (
                <p className="text-sm text-red-500">{errors.points.message}</p>
              )}
              {transactionType === "redeem" && (
                <p className="text-xs text-gray-500">
                  Maximum redeemable: {customer.loyaltyPoints} points
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="e.g., Bonus points for purchase, Redeemed for discount"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input
                id="reference"
                placeholder="Order or invoice number"
                {...register("reference")}
              />
              {errors.reference && (
                <p className="text-sm text-red-500">{errors.reference.message}</p>
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
              {transactionType === "earn" ? "Add" : "Redeem"} Points
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

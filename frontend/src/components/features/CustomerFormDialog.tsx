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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { createCustomerSchema, CreateCustomerFormData } from "@/lib/validations/customerSchema";
import { Customer } from "@/types/customer";
import { Loader2 } from "lucide-react";

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
  onSubmit: (data: CreateCustomerFormData) => Promise<void>;
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
  onSubmit,
}: CustomerFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateCustomerFormData>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      type: "B2C",
      status: "active",
    },
  });

  const customerType = watch("type");
  const isActive = watch("status") === "active";

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        type: customer.type,
        email: customer.email,
        phone: customer.phone,
        contactPerson: customer.contactPerson || "",
        address: customer.address,
        taxId: customer.taxId || "",
        creditLimit: customer.creditLimit || 0,
        paymentTerms: customer.paymentTerms || 0,
        notes: customer.notes || "",
        status: customer.status,
      });
    } else {
      reset({
        type: "B2C",
        status: "active",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
      });
    }
  }, [customer, reset]);

  const handleFormSubmit = async (data: CreateCustomerFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Error submitting customer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogBody className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Customer Type <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={customerType}
                  onValueChange={(value) => setValue("type", value as "B2B" | "B2C")}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="B2C" id="type-b2c" />
                    <Label htmlFor="type-b2c" className="cursor-pointer">
                      B2C (Consumer)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="B2B" id="type-b2b" />
                    <Label htmlFor="type-b2b" className="cursor-pointer">
                      B2B (Business)
                    </Label>
                  </div>
                </RadioGroup>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input id="phone" {...register("phone")} />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {customerType === "B2B" && (
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">
                    Contact Person <span className="text-red-500">*</span>
                  </Label>
                  <Input id="contactPerson" {...register("contactPerson")} />
                  {errors.contactPerson && (
                    <p className="text-sm text-red-500">{errors.contactPerson.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Address</h3>

              <div className="space-y-2">
                <Label htmlFor="street">
                  Street Address <span className="text-red-500">*</span>
                </Label>
                <Input id="street" {...register("address.street")} />
                {errors.address?.street && (
                  <p className="text-sm text-red-500">{errors.address.street.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input id="city" {...register("address.city")} />
                  {errors.address?.city && (
                    <p className="text-sm text-red-500">{errors.address.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Input id="state" {...register("address.state")} />
                  {errors.address?.state && (
                    <p className="text-sm text-red-500">{errors.address.state.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">
                    Zip Code <span className="text-red-500">*</span>
                  </Label>
                  <Input id="zipCode" {...register("address.zipCode")} />
                  {errors.address?.zipCode && (
                    <p className="text-sm text-red-500">{errors.address.zipCode.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Input id="country" {...register("address.country")} />
                  {errors.address?.country && (
                    <p className="text-sm text-red-500">{errors.address.country.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Business Details (B2B only) */}
            {customerType === "B2B" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Business Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input id="taxId" {...register("taxId")} />
                  {errors.taxId && (
                    <p className="text-sm text-red-500">{errors.taxId.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="creditLimit">Credit Limit ($)</Label>
                    <Input
                      id="creditLimit"
                      type="number"
                      step="0.01"
                      {...register("creditLimit", { valueAsNumber: true })}
                    />
                    {errors.creditLimit && (
                      <p className="text-sm text-red-500">{errors.creditLimit.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
                    <Input
                      id="paymentTerms"
                      type="number"
                      {...register("paymentTerms", { valueAsNumber: true })}
                    />
                    {errors.paymentTerms && (
                      <p className="text-sm text-red-500">{errors.paymentTerms.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Additional Information</h3>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" rows={3} {...register("notes")} />
                {errors.notes && (
                  <p className="text-sm text-red-500">{errors.notes.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="status"
                  checked={isActive}
                  onCheckedChange={(checked) =>
                    setValue("status", checked ? "active" : "inactive")
                  }
                />
                <Label htmlFor="status" className="cursor-pointer">
                  Active
                </Label>
              </div>
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
              {customer ? "Update" : "Create"} Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

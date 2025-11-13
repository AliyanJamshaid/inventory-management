"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransferStock } from "@/hooks/useStock";
import { useWarehouses } from "@/hooks/useWarehouses";
import { Stock, Warehouse } from "@/types/inventory";
import { Product } from "@/types";
import { Loader2, ArrowRight } from "lucide-react";

interface StockTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock?: Stock;
  onSuccess?: () => void;
}

export function StockTransferDialog({
  open,
  onOpenChange,
  stock,
  onSuccess,
}: StockTransferDialogProps) {
  const { data: warehouses } = useWarehouses();
  const transferStock = useTransferStock();

  const [formData, setFormData] = useState({
    product: "",
    fromWarehouse: "",
    fromLocation: "",
    toWarehouse: "",
    toLocation: "",
    quantity: "",
    reference: "",
    notes: "",
    batchNumber: "",
    serialNumber: "",
    expirationDate: "",
  });

  const [currentQuantity, setCurrentQuantity] = useState(0);
  const [availableQuantity, setAvailableQuantity] = useState(0);

  useEffect(() => {
    if (stock) {
      const product = stock.product as Product;
      const warehouseId =
        typeof stock.warehouse === "object" ? stock.warehouse._id : stock.warehouse;
      const locationId = stock.location
        ? typeof stock.location === "object"
          ? stock.location._id
          : stock.location
        : "";

      setFormData({
        product: product._id || "",
        fromWarehouse: warehouseId,
        fromLocation: locationId,
        toWarehouse: "",
        toLocation: "",
        quantity: "",
        reference: "",
        notes: "",
        batchNumber: stock.batchNumber || "",
        serialNumber: stock.serialNumber || "",
        expirationDate: stock.expirationDate || "",
      });
      setCurrentQuantity(stock.quantity);
      setAvailableQuantity(stock.available);
    }
  }, [stock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const qty = parseFloat(formData.quantity);
    if (qty > availableQuantity) {
      alert(`Cannot transfer more than available quantity (${availableQuantity})`);
      return;
    }

    try {
      await transferStock.mutateAsync({
        product: formData.product,
        fromWarehouse: formData.fromWarehouse,
        fromLocation: formData.fromLocation || undefined,
        toWarehouse: formData.toWarehouse,
        toLocation: formData.toLocation || undefined,
        quantity: qty,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined,
        batchNumber: formData.batchNumber || undefined,
        serialNumber: formData.serialNumber || undefined,
        expirationDate: formData.expirationDate || undefined,
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to transfer stock:", error);
    }
  };

  const fromWarehouseName =
    warehouses?.find((w) => w._id === formData.fromWarehouse)?.name || "Source";
  const toWarehouseName =
    warehouses?.find((w) => w._id === formData.toWarehouse)?.name || "Destination";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transfer Stock</DialogTitle>
          <DialogDescription>
            Move stock between warehouses
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-muted rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">From Warehouse</p>
                <p className="font-medium">{fromWarehouseName}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">To Warehouse</p>
                <p className="font-medium">{toWarehouseName}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromWarehouse">From Warehouse *</Label>
              <Select
                value={formData.fromWarehouse}
                onValueChange={(value) =>
                  setFormData({ ...formData, fromWarehouse: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses?.map((warehouse) => (
                    <SelectItem key={warehouse._id} value={warehouse._id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toWarehouse">To Warehouse *</Label>
              <Select
                value={formData.toWarehouse}
                onValueChange={(value) =>
                  setFormData({ ...formData, toWarehouse: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses
                    ?.filter((w) => w._id !== formData.fromWarehouse)
                    .map((warehouse) => (
                      <SelectItem key={warehouse._id} value={warehouse._id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Current Quantity</Label>
              <Input value={currentQuantity} disabled />
            </div>

            <div className="space-y-2">
              <Label>Available</Label>
              <Input
                value={availableQuantity}
                disabled
                className="text-green-600 font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Transfer Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                max={availableQuantity}
                step="0.01"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
              />
            </div>
          </div>

          {parseFloat(formData.quantity) > availableQuantity && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">
                Transfer quantity cannot exceed available quantity ({availableQuantity})
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) =>
                  setFormData({ ...formData, reference: e.target.value })
                }
                placeholder="e.g., TR-12345"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input
                id="batchNumber"
                value={formData.batchNumber}
                onChange={(e) =>
                  setFormData({ ...formData, batchNumber: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Reason for transfer or additional notes..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                transferStock.isPending ||
                parseFloat(formData.quantity) > availableQuantity ||
                !formData.toWarehouse ||
                formData.fromWarehouse === formData.toWarehouse
              }
            >
              {transferStock.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Transfer Stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

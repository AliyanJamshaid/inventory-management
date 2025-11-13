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
import { useAdjustStock } from "@/hooks/useStock";
import { useWarehouses } from "@/hooks/useWarehouses";
import { Stock } from "@/types/inventory";
import { Product } from "@/types";
import { Loader2 } from "lucide-react";

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock?: Stock;
  onSuccess?: () => void;
}

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  stock,
  onSuccess,
}: StockAdjustmentDialogProps) {
  const { data: warehouses } = useWarehouses();
  const adjustStock = useAdjustStock();

  const [formData, setFormData] = useState({
    product: "",
    warehouse: "",
    location: "",
    adjustmentType: "ADD" as "ADD" | "REMOVE" | "SET",
    quantity: "",
    reasonCode: "ADJUSTMENT" as any,
    reference: "",
    notes: "",
    batchNumber: "",
    serialNumber: "",
    expirationDate: "",
    reorderPoint: "",
    reorderQuantity: "",
  });

  const [currentQuantity, setCurrentQuantity] = useState(0);

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
        warehouse: warehouseId,
        location: locationId,
        adjustmentType: "ADD",
        quantity: "",
        reasonCode: "ADJUSTMENT",
        reference: "",
        notes: "",
        batchNumber: stock.batchNumber || "",
        serialNumber: stock.serialNumber || "",
        expirationDate: stock.expirationDate || "",
        reorderPoint: stock.reorderPoint?.toString() || "",
        reorderQuantity: stock.reorderQuantity?.toString() || "",
      });
      setCurrentQuantity(stock.quantity);
    }
  }, [stock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await adjustStock.mutateAsync({
        product: formData.product,
        warehouse: formData.warehouse,
        location: formData.location || undefined,
        adjustmentType: formData.adjustmentType,
        quantity: parseFloat(formData.quantity),
        reasonCode: formData.reasonCode,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined,
        batchNumber: formData.batchNumber || undefined,
        serialNumber: formData.serialNumber || undefined,
        expirationDate: formData.expirationDate || undefined,
        reorderPoint: formData.reorderPoint
          ? parseFloat(formData.reorderPoint)
          : undefined,
        reorderQuantity: formData.reorderQuantity
          ? parseFloat(formData.reorderQuantity)
          : undefined,
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to adjust stock:", error);
    }
  };

  const getNewQuantity = () => {
    const qty = parseFloat(formData.quantity) || 0;
    switch (formData.adjustmentType) {
      case "ADD":
        return currentQuantity + qty;
      case "REMOVE":
        return currentQuantity - qty;
      case "SET":
        return qty;
      default:
        return currentQuantity;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Modify stock quantity for this product
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warehouse">Warehouse *</Label>
              <Select
                value={formData.warehouse}
                onValueChange={(value) =>
                  setFormData({ ...formData, warehouse: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
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
              <Label>Current Quantity</Label>
              <Input value={currentQuantity} disabled />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adjustmentType">Adjustment Type *</Label>
              <Select
                value={formData.adjustmentType}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, adjustmentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADD">Add</SelectItem>
                  <SelectItem value="REMOVE">Remove</SelectItem>
                  <SelectItem value="SET">Set</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">
              <span className="font-medium">New Quantity: </span>
              <span className="text-lg font-bold">{getNewQuantity()}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reasonCode">Reason *</Label>
              <Select
                value={formData.reasonCode}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, reasonCode: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PURCHASE">Purchase</SelectItem>
                  <SelectItem value="SALE">Sale</SelectItem>
                  <SelectItem value="DAMAGE">Damage</SelectItem>
                  <SelectItem value="LOSS">Loss</SelectItem>
                  <SelectItem value="FOUND">Found</SelectItem>
                  <SelectItem value="RETURN">Return</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) =>
                  setFormData({ ...formData, reference: e.target.value })
                }
                placeholder="e.g., PO-12345"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) =>
                  setFormData({ ...formData, serialNumber: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reorderPoint">Reorder Point</Label>
              <Input
                id="reorderPoint"
                type="number"
                min="0"
                value={formData.reorderPoint}
                onChange={(e) =>
                  setFormData({ ...formData, reorderPoint: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorderQuantity">Reorder Quantity</Label>
              <Input
                id="reorderQuantity"
                type="number"
                min="0"
                value={formData.reorderQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, reorderQuantity: e.target.value })
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
              placeholder="Additional notes or comments..."
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
            <Button type="submit" disabled={adjustStock.isPending}>
              {adjustStock.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Adjust Stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

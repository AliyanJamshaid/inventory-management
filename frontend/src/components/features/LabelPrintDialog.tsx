'use client';

/**
 * Label Print Dialog Component
 * Dialog for printing product labels
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePrintLabels } from '@/hooks/useBarcodes';
import { Loader2, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface LabelPrintDialogProps {
  open: boolean;
  onClose: () => void;
  productIds: string[];
  productNames?: string[];
}

export function LabelPrintDialog({
  open,
  onClose,
  productIds,
  productNames = [],
}: LabelPrintDialogProps) {
  const [quantityPerProduct, setQuantityPerProduct] = useState(1);
  const [templateId, setTemplateId] = useState('');

  const { printLabels, loading } = usePrintLabels();

  const handlePrint = async () => {
    if (productIds.length === 0) {
      toast.error('No products selected');
      return;
    }

    const pdfBlob = await printLabels({
      productIds,
      templateId: templateId || undefined,
      quantityPerProduct,
    });

    if (pdfBlob) {
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `labels-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Also open print dialog
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }

      onClose();
    }
  };

  const handleClose = () => {
    setQuantityPerProduct(1);
    setTemplateId('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Print Labels</DialogTitle>
          <DialogDescription>
            Configure label printing options for {productIds.length} product
            {productIds.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product List */}
          {productNames.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Products</Label>
              <div className="mt-2 max-h-32 overflow-y-auto border rounded-md p-2">
                <ul className="text-sm space-y-1">
                  {productNames.slice(0, 5).map((name, index) => (
                    <li key={index} className="text-gray-700">
                      • {name}
                    </li>
                  ))}
                  {productNames.length > 5 && (
                    <li className="text-gray-500 italic">
                      ... and {productNames.length - 5} more
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Label Template */}
          <div>
            <Label htmlFor="template">Label Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger id="template" className="mt-1">
                <SelectValue placeholder="Default template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Default (Product Label)</SelectItem>
                <SelectItem value="price-tag">Price Tag</SelectItem>
                <SelectItem value="shelf-label">Shelf Label</SelectItem>
                <SelectItem value="box-label">Box Label</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="quantity">Quantity per Product</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="100"
              value={quantityPerProduct}
              onChange={(e) => setQuantityPerProduct(parseInt(e.target.value) || 1)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Total labels: {productIds.length * quantityPerProduct}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handlePrint} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Printer className="mr-2 h-4 w-4" />
                Print Labels
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

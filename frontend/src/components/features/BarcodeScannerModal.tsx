'use client';

/**
 * Barcode Scanner Modal Component
 * Full-screen modal for barcode scanning
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarcodeScanner } from './BarcodeScanner';
import { ScanResult, ScannerConfig } from '@/types/barcode';
import { useSearchByBarcode } from '@/hooks/useBarcodes';
import { Product } from '@/types/product';
import { X, Keyboard, Loader2, Package, DollarSign, Hash } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface BarcodeScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string, product?: Product) => void;
  title?: string;
  description?: string;
  config?: ScannerConfig;
  autoSearchProduct?: boolean;
  showManualEntry?: boolean;
}

export function BarcodeScannerModal({
  open,
  onClose,
  onScan,
  title = 'Scan Barcode',
  description = 'Position the barcode within the camera frame',
  config = {},
  autoSearchProduct = true,
  showManualEntry = true,
}: BarcodeScannerModalProps) {
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [showProductInfo, setShowProductInfo] = useState(false);

  const { searchByBarcode, loading: searchLoading } = useSearchByBarcode();

  const handleScan = useCallback(
    async (result: ScanResult) => {
      const barcode = result.barcode;

      // Search for product if enabled
      if (autoSearchProduct) {
        const product = await searchByBarcode(barcode);

        if (product) {
          setScannedProduct(product);
          setShowProductInfo(true);

          // Auto-close after showing product info for 2 seconds
          setTimeout(() => {
            onScan(barcode, product);
            onClose();
          }, 2000);
        } else {
          // Product not found, but still return the barcode
          onScan(barcode);
          onClose();
        }
      } else {
        // Just return the barcode without searching
        onScan(barcode);
        onClose();
      }
    },
    [autoSearchProduct, searchByBarcode, onScan, onClose]
  );

  const handleManualSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!manualBarcode.trim()) return;

      const barcode = manualBarcode.trim();

      // Search for product if enabled
      if (autoSearchProduct) {
        const product = await searchByBarcode(barcode);
        onScan(barcode, product || undefined);
      } else {
        onScan(barcode);
      }

      onClose();
    },
    [manualBarcode, autoSearchProduct, searchByBarcode, onScan, onClose]
  );

  const handleClose = useCallback(() => {
    setShowManualInput(false);
    setManualBarcode('');
    setScannedProduct(null);
    setShowProductInfo(false);
    onClose();
  }, [onClose]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setShowManualInput(false);
      setManualBarcode('');
      setScannedProduct(null);
      setShowProductInfo(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {showProductInfo && scannedProduct ? (
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="text-center">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Product Found!</h3>
                <div className="space-y-2 text-sm text-green-800">
                  <p>
                    <strong>Name:</strong> {scannedProduct.name}
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <Hash className="h-4 w-4" />
                    <strong>SKU:</strong> {scannedProduct.sku}
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <strong>Price:</strong> ${scannedProduct.sellingPrice.toFixed(2)}
                  </p>
                </div>
                <div className="mt-4">
                  <Loader2 className="h-5 w-5 animate-spin text-green-600 mx-auto" />
                  <p className="text-xs text-green-600 mt-2">Processing...</p>
                </div>
              </div>
            </Card>
          ) : showManualInput ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <Label htmlFor="manual-barcode">Enter Barcode Manually</Label>
                <Input
                  id="manual-barcode"
                  type="text"
                  placeholder="Type or scan barcode..."
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  autoFocus
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={!manualBarcode.trim() || searchLoading}>
                  {searchLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowManualInput(false)}
                >
                  Back to Camera
                </Button>
              </div>
            </form>
          ) : (
            <>
              <BarcodeScanner
                onScan={handleScan}
                config={{
                  ...config,
                  continuous: false,
                  beepOnScan: true,
                  vibrateOnScan: true,
                }}
              />

              {showManualEntry && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowManualInput(true)}
                    className="w-full"
                  >
                    <Keyboard className="mr-2 h-4 w-4" />
                    Enter Manually
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" onClick={handleClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

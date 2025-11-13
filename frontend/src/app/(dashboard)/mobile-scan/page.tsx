'use client';

/**
 * Mobile Scanner Page
 * Mobile-optimized full-screen barcode scanning interface
 */

import React, { useState, useCallback, useEffect } from 'react';
import { BarcodeScanner } from '@/components/features/BarcodeScanner';
import { ScanResult } from '@/types/barcode';
import { useSearchByBarcode } from '@/hooks/useBarcodes';
import { Product } from '@/types/product';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  DollarSign,
  Hash,
  CheckCircle,
  XCircle,
  Volume2,
  VolumeX,
  Vibrate,
  X,
} from 'lucide-react';
import { isMobileDevice } from '@/lib/cameraUtils';

export default function MobileScanPage() {
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [scanCount, setScanCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const { searchByBarcode, loading } = useSearchByBarcode();

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  const handleScan = useCallback(
    async (result: ScanResult) => {
      const barcode = result.barcode;

      // Search for product
      const product = await searchByBarcode(barcode);

      setCurrentProduct(product);
      setShowProductModal(true);
      setScanCount((prev) => prev + 1);

      // Auto-hide modal after 3 seconds if not on mobile
      if (!isMobile) {
        setTimeout(() => {
          setShowProductModal(false);
        }, 3000);
      }
    },
    [searchByBarcode, isMobile]
  );

  const handleCloseModal = () => {
    setShowProductModal(false);
    setCurrentProduct(null);
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between z-10">
        <div>
          <h1 className="text-lg font-semibold">Mobile Scanner</h1>
          <p className="text-xs text-gray-400">Scanned: {scanCount}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-white hover:bg-gray-800"
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVibrateEnabled(!vibrateEnabled)}
            className="text-white hover:bg-gray-800"
          >
            <Vibrate className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Scanner */}
      <div className="flex-1 relative">
        <BarcodeScanner
          onScan={handleScan}
          config={{
            continuous: true,
            beepOnScan: soundEnabled,
            vibrateOnScan: vibrateEnabled,
            fps: 10,
          }}
          className="h-full"
        />

        {/* Scanning Guide Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-72 h-72">
              {/* Corner borders */}
              <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-white" />
              <div className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-white" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-white" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-white" />

              {/* Scanning line animation */}
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-white animate-pulse" />
            </div>
          </div>

          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-white text-sm bg-black bg-opacity-50 inline-block px-4 py-2 rounded-full">
              Position barcode within frame
            </p>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {currentProduct ? (
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">
                      {currentProduct ? 'Product Found' : 'Product Not Found'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {currentProduct ? 'Scan successful' : 'No matching product'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {currentProduct ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg mb-1">{currentProduct.name}</h4>
                    {currentProduct.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {currentProduct.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Hash className="h-4 w-4" />
                        <span className="text-xs">SKU</span>
                      </div>
                      <p className="font-semibold">{currentProduct.sku}</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs">Price</span>
                      </div>
                      <p className="font-semibold">
                        ${currentProduct.sellingPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {currentProduct.barcode && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Package className="h-4 w-4" />
                        <span className="text-xs">Barcode</span>
                      </div>
                      <p className="font-mono text-sm">{currentProduct.barcode}</p>
                    </div>
                  )}

                  <Badge
                    variant={currentProduct.isActive ? 'default' : 'secondary'}
                    className="w-full justify-center py-2"
                  >
                    {currentProduct.isActive ? 'Active' : 'Inactive'}
                  </Badge>

                  <Button
                    onClick={handleCloseModal}
                    className="w-full"
                    size="lg"
                  >
                    Continue Scanning
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-center text-gray-600">
                    The scanned barcode does not match any product in the system.
                  </p>
                  <Button
                    onClick={handleCloseModal}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    Scan Again
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

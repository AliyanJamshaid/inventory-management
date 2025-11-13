'use client';

/**
 * Quick Scan Page
 * Dedicated barcode scanning interface for quick product lookup
 */

import React, { useState, useCallback } from 'react';
import { BarcodeScanner } from '@/components/features/BarcodeScanner';
import { ScanResult } from '@/types/barcode';
import { useSearchByBarcode } from '@/hooks/useBarcodes';
import { Product } from '@/types/product';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  DollarSign,
  Hash,
  Warehouse,
  History,
  Eye,
  ShoppingCart,
  Edit,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface ScanHistoryItem {
  id: string;
  barcode: string;
  product: Product | null;
  timestamp: Date;
}

export default function ScanPage() {
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const { searchByBarcode, loading } = useSearchByBarcode();

  const handleScan = useCallback(
    async (result: ScanResult) => {
      const barcode = result.barcode;

      // Search for product
      const product = await searchByBarcode(barcode);

      // Add to history
      const historyItem: ScanHistoryItem = {
        id: `${Date.now()}-${barcode}`,
        barcode,
        product,
        timestamp: new Date(),
      };

      setScanHistory((prev) => [historyItem, ...prev.slice(0, 9)]);
      setCurrentProduct(product);
    },
    [searchByBarcode]
  );

  const handleClearProduct = () => {
    setCurrentProduct(null);
  };

  const handleClearHistory = () => {
    setScanHistory([]);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quick Scan</h1>
        <p className="text-gray-500 mt-2">
          Scan barcodes to quickly view product information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Camera Scanner</CardTitle>
            </CardHeader>
            <CardContent>
              <BarcodeScanner
                onScan={handleScan}
                config={{
                  continuous: true,
                  beepOnScan: true,
                  vibrateOnScan: true,
                  fps: 10,
                }}
              />
            </CardContent>
          </Card>

          {/* Product Info */}
          {currentProduct && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Product Information</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearProduct}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{currentProduct.name}</h3>
                  {currentProduct.description && (
                    <p className="text-sm text-gray-600">{currentProduct.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">SKU</p>
                      <p className="font-medium">{currentProduct.sku}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Barcode</p>
                      <p className="font-medium">{currentProduct.barcode || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="font-medium">${currentProduct.sellingPrice.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Warehouse className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <Badge variant={currentProduct.isActive ? 'default' : 'secondary'}>
                        {currentProduct.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/products/${currentProduct._id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/products/${currentProduct._id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Scan History Column */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Scan History
              </CardTitle>
              {scanHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                >
                  Clear
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {scanHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No scans yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {scanHistory.map((item) => (
                    <Card
                      key={item.id}
                      className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setCurrentProduct(item.product)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {item.product ? (
                              <>
                                <p className="text-sm font-medium truncate">
                                  {item.product.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  SKU: {item.product.sku}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-medium text-red-600">
                                  Not Found
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {item.barcode}
                                </p>
                              </>
                            )}
                          </div>
                          <Badge
                            variant={item.product ? 'default' : 'destructive'}
                            className="shrink-0"
                          >
                            {item.product ? 'Found' : 'Missing'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">
                          {item.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

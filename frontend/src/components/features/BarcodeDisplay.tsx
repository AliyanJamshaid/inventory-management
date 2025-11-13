'use client';

/**
 * Barcode Display Component
 * Displays barcode images generated from backend
 */

import React, { useEffect, useState } from 'react';
import { BarcodeType } from '@/types/barcode';
import { useGenerateBarcode } from '@/hooks/useBarcodes';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BarcodeDisplayProps {
  barcode: string;
  type: BarcodeType;
  width?: number;
  height?: number;
  showValue?: boolean;
  showDownload?: boolean;
  className?: string;
}

export function BarcodeDisplay({
  barcode,
  type,
  width = 2,
  height = 50,
  showValue = true,
  showDownload = false,
  className = '',
}: BarcodeDisplayProps) {
  const [barcodeImage, setBarcodeImage] = useState<string | null>(null);
  const { generateBarcode, loading, error } = useGenerateBarcode();

  useEffect(() => {
    if (barcode) {
      loadBarcode();
    }
  }, [barcode, type, width, height]);

  const loadBarcode = async () => {
    const image = await generateBarcode({
      data: barcode,
      type,
      width,
      height,
      includeText: showValue,
      scale: 2,
    });

    if (image) {
      setBarcodeImage(image);
    }
  };

  const handleDownload = () => {
    if (!barcodeImage) return;

    const link = document.createElement('a');
    link.href = barcodeImage;
    link.download = `barcode-${barcode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <Skeleton className="h-20 w-full" />
        {showValue && <Skeleton className="h-4 w-32 mx-auto mt-2" />}
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!barcodeImage) {
    return null;
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <img
          src={barcodeImage}
          alt={`Barcode: ${barcode}`}
          className="max-w-full h-auto"
        />

        {showDownload && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="mt-2"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        )}
      </div>
    </Card>
  );
}

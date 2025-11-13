'use client';

/**
 * QR Code Display Component
 * Displays QR code images generated from backend
 */

import React, { useEffect, useState } from 'react';
import { useGenerateQRCode } from '@/hooks/useBarcodes';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRCodeDisplayProps {
  data: any;
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  showDownload?: boolean;
  className?: string;
}

export function QRCodeDisplay({
  data,
  size = 150,
  errorCorrectionLevel = 'M',
  showDownload = false,
  className = '',
}: QRCodeDisplayProps) {
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const { generateQRCode, loading, error } = useGenerateQRCode();

  useEffect(() => {
    if (data) {
      loadQRCode();
    }
  }, [data, size, errorCorrectionLevel]);

  const loadQRCode = async () => {
    const image = await generateQRCode({
      data,
      width: size,
      errorCorrectionLevel,
    });

    if (image) {
      setQrCodeImage(image);
    }
  };

  const handleDownload = () => {
    if (!qrCodeImage) return;

    const link = document.createElement('a');
    link.href = qrCodeImage;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <Skeleton className={`h-[${size}px] w-[${size}px] mx-auto`} />
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

  if (!qrCodeImage) {
    return null;
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <img
          src={qrCodeImage}
          alt="QR Code"
          className="max-w-full h-auto"
          style={{ width: size, height: size }}
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

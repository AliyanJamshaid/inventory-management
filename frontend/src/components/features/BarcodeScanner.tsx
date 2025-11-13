'use client';

/**
 * Barcode Scanner Component
 * Camera-based barcode and QR code scanner
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { BarcodeFormat, ScannerConfig, ScanResult } from '@/types/barcode';
import { playBeepSound, vibrateDevice } from '@/lib/barcodeUtils';
import { getPreferredCamera, stopCameraStream } from '@/lib/cameraUtils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Camera, AlertCircle } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (result: ScanResult) => void;
  onError?: (error: string) => void;
  config?: ScannerConfig;
  className?: string;
}

export function BarcodeScanner({
  onScan,
  onError,
  config = {},
  className = '',
}: BarcodeScannerProps) {
  const {
    formats = ['ean_13', 'code_128', 'upc_a', 'qr_code'],
    continuous = false,
    beepOnScan = true,
    vibrateOnScan = true,
    fps = 10,
  } = config;

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = useRef(`barcode-scanner-${Math.random().toString(36).substring(7)}`);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  // Format mapping for html5-qrcode
  const formatMap: Record<BarcodeFormat, number> = {
    ean_13: 13,
    ean_8: 8,
    code_128: 0,
    code_39: 1,
    code_93: 2,
    codabar: 3,
    upc_a: 12,
    upc_e: 14,
    qr_code: 11,
    data_matrix: 10,
  };

  const handleScan = useCallback(
    (decodedText: string, decodedResult: any) => {
      // Prevent duplicate scans within 2 seconds
      const now = Date.now();
      if (!continuous && decodedText === lastScan && now - lastScanTimeRef.current < 2000) {
        return;
      }

      setLastScan(decodedText);
      lastScanTimeRef.current = now;

      // Play feedback
      if (beepOnScan) {
        playBeepSound();
      }
      if (vibrateOnScan) {
        vibrateDevice();
      }

      // Call onScan callback
      const result: ScanResult = {
        barcode: decodedText,
        format: decodedResult?.result?.format?.formatName || 'unknown',
        timestamp: new Date(),
      };

      onScan(result);
    },
    [onScan, continuous, lastScan, beepOnScan, vibrateOnScan]
  );

  const handleScanError = useCallback(
    (errorMessage: string) => {
      // Ignore common scanning errors (no barcode in view)
      if (errorMessage.includes('No MultiFormat Readers')) {
        return;
      }
      console.warn('Scan error:', errorMessage);
    },
    []
  );

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Initialize scanner
      const scanner = new Html5Qrcode(scannerElementId.current);
      scannerRef.current = scanner;

      // Get preferred camera
      const cameraId = await getPreferredCamera();

      const config = {
        fps: fps,
        qrbox: { width: 250, height: 250 },
        formatsToSupport: formats.map(f => formatMap[f]).filter(Boolean),
        aspectRatio: 1.0,
      };

      // Start scanning
      await scanner.start(
        cameraId || { facingMode: 'environment' },
        config,
        handleScan,
        handleScanError
      );
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      const errorMessage = err.message || 'Failed to start camera';
      setError(errorMessage);
      setIsScanning(false);
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [formats, fps, handleScan, handleScanError, onError]);

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  useEffect(() => {
    startScanning();

    return () => {
      stopScanning();
    };
  }, [startScanning, stopScanning]);

  return (
    <div className={`barcode-scanner ${className}`}>
      <Card className="overflow-hidden">
        <div className="relative">
          {!isScanning && !error && (
            <div className="flex items-center justify-center h-96 bg-gray-100">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500">Initializing camera...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="h-96 flex items-center justify-center p-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          <div id={scannerElementId.current} className={error ? 'hidden' : ''} />

          {isScanning && (
            <div className="absolute top-4 left-4 right-4 z-10">
              <div className="bg-black bg-opacity-50 text-white text-sm px-3 py-2 rounded-md text-center">
                <Camera className="inline-block h-4 w-4 mr-2" />
                Position barcode within the frame
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 border-t">
            <Button onClick={startScanning} className="w-full">
              Retry
            </Button>
          </div>
        )}
      </Card>

      {lastScan && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            <strong>Last scan:</strong> {lastScan}
          </p>
        </div>
      )}
    </div>
  );
}

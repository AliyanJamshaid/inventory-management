'use client';

/**
 * Barcode Generator Form Component
 * Form for generating and managing product barcodes
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { BarcodeDisplay } from './BarcodeDisplay';
import { QRCodeDisplay } from './QRCodeDisplay';
import { BarcodeType } from '@/types/barcode';
import { useGenerateInternalBarcode, useValidateBarcode } from '@/hooks/useBarcodes';
import { getBarcodeTypeName, validateBarcodeFormat } from '@/lib/barcodeUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Sparkles, QrCode as QrCodeIcon } from 'lucide-react';
import { toast } from 'sonner';

interface BarcodeGeneratorFormProps {
  initialBarcode?: string;
  initialType?: BarcodeType;
  initialQRCode?: string;
  onChange?: (data: {
    barcode: string;
    barcodeType: BarcodeType;
    generateQR: boolean;
  }) => void;
  className?: string;
}

export function BarcodeGeneratorForm({
  initialBarcode = '',
  initialType = 'CODE128',
  initialQRCode,
  onChange,
  className = '',
}: BarcodeGeneratorFormProps) {
  const [barcodeType, setBarcodeType] = useState<BarcodeType>(initialType);
  const [barcode, setBarcode] = useState(initialBarcode);
  const [generateQR, setGenerateQR] = useState(!!initialQRCode);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState('');

  const { generateInternalBarcode, loading: generating } = useGenerateInternalBarcode();
  const { validateBarcode: validateBarcodeAPI } = useValidateBarcode();

  const barcodeTypes: BarcodeType[] = ['EAN13', 'UPC', 'CODE128', 'CODE39', 'INTERNAL'];

  useEffect(() => {
    if (barcode && barcodeType) {
      validateBarcode();
    } else {
      setIsValid(null);
      setValidationMessage('');
    }
  }, [barcode, barcodeType]);

  useEffect(() => {
    if (onChange) {
      onChange({
        barcode,
        barcodeType,
        generateQR,
      });
    }
  }, [barcode, barcodeType, generateQR]);

  const validateBarcode = async () => {
    if (!barcode.trim()) {
      setIsValid(null);
      setValidationMessage('');
      return;
    }

    // Client-side validation
    const clientValid = validateBarcodeFormat(barcode, barcodeType);

    if (!clientValid) {
      setIsValid(false);
      setValidationMessage(`Invalid ${getBarcodeTypeName(barcodeType)} format`);
      return;
    }

    // Server-side validation
    const serverValid = await validateBarcodeAPI(barcode, barcodeType);

    setIsValid(serverValid);
    setValidationMessage(
      serverValid
        ? `Valid ${getBarcodeTypeName(barcodeType)} barcode`
        : `Invalid ${getBarcodeTypeName(barcodeType)} barcode`
    );
  };

  const handleGenerateInternal = async () => {
    const result = await generateInternalBarcode();

    if (result) {
      setBarcode(result.barcode);
      setBarcodeType('INTERNAL');
      toast.success('Internal barcode generated');
    }
  };

  const handleBarcodeTypeChange = (value: string) => {
    setBarcodeType(value as BarcodeType);
    setIsValid(null);
    setValidationMessage('');
  };

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarcode(e.target.value);
    setIsValid(null);
    setValidationMessage('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Barcode Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="barcode-type">Barcode Type</Label>
              <Select value={barcodeType} onValueChange={handleBarcodeTypeChange}>
                <SelectTrigger id="barcode-type" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {barcodeTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getBarcodeTypeName(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="barcode"
                  type="text"
                  value={barcode}
                  onChange={handleBarcodeChange}
                  placeholder="Enter barcode..."
                  className="flex-1"
                />
                {barcodeType === 'INTERNAL' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateInternal}
                    disabled={generating}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {validationMessage && (
                <div className="mt-2">
                  {isValid ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      {validationMessage}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {validationMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="generate-qr"
              checked={generateQR}
              onCheckedChange={setGenerateQR}
            />
            <Label htmlFor="generate-qr" className="cursor-pointer">
              <QrCodeIcon className="inline-block h-4 w-4 mr-2" />
              Generate QR Code
            </Label>
          </div>

          {barcode && isValid && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-4">Preview</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500 mb-2 block">Barcode</Label>
                  <BarcodeDisplay
                    barcode={barcode}
                    type={barcodeType}
                    showValue={true}
                    showDownload={false}
                  />
                </div>

                {generateQR && (
                  <div>
                    <Label className="text-xs text-gray-500 mb-2 block">QR Code</Label>
                    <QRCodeDisplay
                      data={{
                        barcode,
                        type: barcodeType,
                        timestamp: new Date().toISOString(),
                      }}
                      size={150}
                      showDownload={false}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

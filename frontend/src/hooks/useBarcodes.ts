/**
 * Barcode Hooks
 * Custom React hooks for barcode operations
 */

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import {
  BarcodeType,
  GenerateBarcodeRequest,
  GenerateQRCodeRequest,
  ValidateBarcodeRequest,
  BulkGenerateBarcodesRequest,
  PrintLabelRequest,
} from '@/types/barcode';
import { Product } from '@/types/product';
import { toast } from 'sonner';

/**
 * Hook for generating barcodes
 */
export function useGenerateBarcode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBarcode = useCallback(
    async (request: GenerateBarcodeRequest): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.post('/barcodes/generate', request);

        if (response.data.success) {
          return response.data.data.image;
        } else {
          throw new Error(response.data.message || 'Failed to generate barcode');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to generate barcode';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { generateBarcode, loading, error };
}

/**
 * Hook for generating QR codes
 */
export function useGenerateQRCode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQRCode = useCallback(
    async (request: GenerateQRCodeRequest): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.post('/barcodes/generate-qr', request);

        if (response.data.success) {
          return response.data.data.qrCode;
        } else {
          throw new Error(response.data.message || 'Failed to generate QR code');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to generate QR code';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { generateQRCode, loading, error };
}

/**
 * Hook for validating barcodes
 */
export function useValidateBarcode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateBarcode = useCallback(
    async (barcode: string, type: BarcodeType): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.post('/barcodes/validate', { barcode, type });

        if (response.data.success) {
          return response.data.data.isValid;
        } else {
          throw new Error(response.data.message || 'Failed to validate barcode');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to validate barcode';
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { validateBarcode, loading, error };
}

/**
 * Hook for searching products by barcode
 */
export function useSearchByBarcode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchByBarcode = useCallback(
    async (barcode: string): Promise<Product | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/barcodes/search?barcode=${encodeURIComponent(barcode)}`);

        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Product not found');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Product not found';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { searchByBarcode, loading, error };
}

/**
 * Hook for generating internal barcodes
 */
export function useGenerateInternalBarcode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInternalBarcode = useCallback(async (): Promise<{
    barcode: string;
    image: string;
  } | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/barcodes/generate-internal');

      if (response.data.success) {
        return {
          barcode: response.data.data.barcode,
          image: response.data.data.image,
        };
      } else {
        throw new Error(response.data.message || 'Failed to generate internal barcode');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to generate internal barcode';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generateInternalBarcode, loading, error };
}

/**
 * Hook for bulk generating barcodes
 */
export function useBulkGenerateBarcodes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkGenerateBarcodes = useCallback(
    async (request: BulkGenerateBarcodesRequest): Promise<any | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.post('/barcodes/bulk-generate', request);

        if (response.data.success) {
          toast.success(`Generated barcodes for ${response.data.data.processed} products`);
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to bulk generate barcodes');
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to bulk generate barcodes';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { bulkGenerateBarcodes, loading, error };
}

/**
 * Hook for printing labels
 */
export function usePrintLabels() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const printLabels = useCallback(
    async (request: PrintLabelRequest): Promise<Blob | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.post('/barcodes/print-labels', request, {
          responseType: 'blob',
        });

        if (response.data) {
          toast.success('Labels generated successfully');
          return response.data;
        } else {
          throw new Error('Failed to generate labels');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to print labels';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { printLabels, loading, error };
}

/**
 * Hook for parsing barcodes
 */
export function useParseBarcode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseBarcode = useCallback(
    async (scannedData: string): Promise<{ type: BarcodeType; data: string } | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.post('/barcodes/parse', { scannedData });

        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to parse barcode');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to parse barcode';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { parseBarcode, loading, error };
}

/**
 * Barcode Types and Interfaces
 * For barcode scanning and label printing functionality
 */

import { Product } from './product';

/**
 * Barcode type enumeration
 */
export type BarcodeType = 'EAN13' | 'UPC' | 'CODE128' | 'CODE39' | 'QR' | 'INTERNAL';

/**
 * Barcode format enumeration (for scanner)
 */
export type BarcodeFormat =
  | 'ean_13'
  | 'ean_8'
  | 'code_128'
  | 'code_39'
  | 'code_93'
  | 'codabar'
  | 'upc_a'
  | 'upc_e'
  | 'qr_code'
  | 'data_matrix';

/**
 * Barcode data interface
 */
export interface BarcodeData {
  barcode: string;
  type: BarcodeType;
  image?: string; // base64 or URL
}

/**
 * Scan result interface
 */
export interface ScanResult {
  barcode: string;
  format?: string;
  product?: Product;
  timestamp: Date;
}

/**
 * Scanner configuration interface
 */
export interface ScannerConfig {
  formats?: BarcodeFormat[];
  continuous?: boolean;
  beepOnScan?: boolean;
  vibrateOnScan?: boolean;
  showOverlay?: boolean;
  fps?: number;
}

/**
 * Label template type enumeration
 */
export type LabelTemplateType = 'product' | 'location' | 'box' | 'asset' | 'price_tag';

/**
 * Label layout interface
 */
export interface LabelLayout {
  showBarcode: boolean;
  showQRCode: boolean;
  showProductName: boolean;
  showPrice: boolean;
  showSKU: boolean;
  showDescription: boolean;
  showCategory: boolean;
  fontSize: number;
  barcodeHeight: number;
}

/**
 * Label template interface
 */
export interface LabelTemplate {
  _id: string;
  name: string;
  type: LabelTemplateType;
  width: number; // in mm
  height: number; // in mm
  layout: LabelLayout;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Print label request interface
 */
export interface PrintLabelRequest {
  productIds: string[];
  templateId?: string;
  quantityPerProduct?: number;
}

/**
 * Generate barcode request interface
 */
export interface GenerateBarcodeRequest {
  data: string;
  type: BarcodeType;
  width?: number;
  height?: number;
  includeText?: boolean;
  scale?: number;
}

/**
 * Generate QR code request interface
 */
export interface GenerateQRCodeRequest {
  data: any;
  width?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
}

/**
 * Validate barcode request interface
 */
export interface ValidateBarcodeRequest {
  barcode: string;
  type: BarcodeType;
}

/**
 * Bulk generate barcodes request interface
 */
export interface BulkGenerateBarcodesRequest {
  productIds: string[];
  type?: BarcodeType;
}

/**
 * Parse barcode request interface
 */
export interface ParseBarcodeRequest {
  scannedData: string;
}

/**
 * Camera device interface
 */
export interface CameraDevice {
  id: string;
  label: string;
  kind: 'videoinput';
}

/**
 * Scan history item interface
 */
export interface ScanHistoryItem {
  id: string;
  barcode: string;
  productId?: string;
  productName?: string;
  productSKU?: string;
  timestamp: Date;
}

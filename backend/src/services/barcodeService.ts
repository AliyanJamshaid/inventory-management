import bwipjs from 'bwip-js';
import QRCode from 'qrcode';
import { BarcodeType } from '../types/models';

/**
 * Barcode Service
 * Handles barcode generation, validation, and QR code operations
 */
class BarcodeService {
  /**
   * Generate barcode image as base64 string
   * @param data - Barcode data
   * @param type - Barcode type
   * @param options - Additional options
   * @returns Base64 encoded barcode image
   */
  async generateBarcode(
    data: string,
    type: BarcodeType,
    options: {
      width?: number;
      height?: number;
      includeText?: boolean;
      scale?: number;
    } = {}
  ): Promise<string> {
    const {
      width = 2,
      height = 50,
      includeText = true,
      scale = 2
    } = options;

    try {
      // Map our barcode types to bwip-js barcode types
      const barcodeTypeMap: Record<string, string> = {
        EAN13: 'ean13',
        UPC: 'upca',
        CODE128: 'code128',
        CODE39: 'code39',
        INTERNAL: 'code128', // Use Code128 for internal barcodes
      };

      const bcType = barcodeTypeMap[type] || 'code128';

      // Generate barcode using bwip-js
      const png = await bwipjs.toBuffer({
        bcid: bcType,
        text: data,
        scale: scale,
        height: height,
        width: width,
        includetext: includeText,
        textxalign: 'center',
      });

      // Convert to base64
      const base64 = png.toString('base64');
      return `data:image/png;base64,${base64}`;
    } catch (error) {
      throw new Error(`Failed to generate barcode: ${(error as Error).message}`);
    }
  }

  /**
   * Generate QR code as base64 string
   * @param data - QR code data (can be string or object)
   * @param options - QR code options
   * @returns Base64 encoded QR code image
   */
  async generateQRCode(
    data: any,
    options: {
      width?: number;
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
      margin?: number;
    } = {}
  ): Promise<string> {
    const {
      width = 200,
      errorCorrectionLevel = 'M',
      margin = 4
    } = options;

    try {
      // Convert object to JSON string if needed
      const qrData = typeof data === 'string' ? data : JSON.stringify(data);

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(qrData, {
        width,
        errorCorrectionLevel,
        margin,
        type: 'image/png',
      });

      return qrCodeUrl;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${(error as Error).message}`);
    }
  }

  /**
   * Validate barcode format
   * @param barcode - Barcode string
   * @param type - Barcode type
   * @returns Whether the barcode is valid
   */
  validateBarcode(barcode: string, type: BarcodeType): boolean {
    if (!barcode || typeof barcode !== 'string') {
      return false;
    }

    const trimmedBarcode = barcode.trim();

    switch (type) {
      case BarcodeType.EAN13:
        return this.validateEAN13(trimmedBarcode);
      case BarcodeType.UPC:
        return this.validateUPC(trimmedBarcode);
      case BarcodeType.CODE128:
        return this.validateCode128(trimmedBarcode);
      case BarcodeType.CODE39:
        return this.validateCode39(trimmedBarcode);
      case BarcodeType.INTERNAL:
        return this.validateInternal(trimmedBarcode);
      default:
        return true;
    }
  }

  /**
   * Validate EAN-13 barcode
   * @param barcode - EAN-13 barcode string
   * @returns Whether the barcode is valid
   */
  private validateEAN13(barcode: string): boolean {
    if (!/^\d{13}$/.test(barcode)) {
      return false;
    }

    // Validate check digit
    const digits = barcode.split('').map(Number);
    const checkDigit = digits[12];
    const calculatedCheckDigit = this.calculateEAN13CheckDigit(barcode.slice(0, 12));

    return checkDigit === calculatedCheckDigit;
  }

  /**
   * Validate UPC-A barcode
   * @param barcode - UPC-A barcode string
   * @returns Whether the barcode is valid
   */
  private validateUPC(barcode: string): boolean {
    if (!/^\d{12}$/.test(barcode)) {
      return false;
    }

    // Validate check digit
    const digits = barcode.split('').map(Number);
    const checkDigit = digits[11];
    const calculatedCheckDigit = this.calculateUPCCheckDigit(barcode.slice(0, 11));

    return checkDigit === calculatedCheckDigit;
  }

  /**
   * Validate Code128 barcode
   * @param barcode - Code128 barcode string
   * @returns Whether the barcode is valid
   */
  private validateCode128(barcode: string): boolean {
    // Code128 can contain alphanumeric characters
    return /^[\x20-\x7E]{1,80}$/.test(barcode);
  }

  /**
   * Validate Code39 barcode
   * @param barcode - Code39 barcode string
   * @returns Whether the barcode is valid
   */
  private validateCode39(barcode: string): boolean {
    // Code39 supports: 0-9, A-Z, and special characters - . $ / + % space
    return /^[0-9A-Z\-.\s$/+%]{1,80}$/.test(barcode);
  }

  /**
   * Validate internal barcode format
   * @param barcode - Internal barcode string
   * @returns Whether the barcode is valid
   */
  private validateInternal(barcode: string): boolean {
    // Internal barcodes follow pattern: IMS-XXXXXXXXXX (alphanumeric)
    return /^IMS-[A-Z0-9]{10}$/.test(barcode);
  }

  /**
   * Calculate EAN-13 check digit
   * @param barcode - First 12 digits of EAN-13
   * @returns Check digit
   */
  calculateEAN13CheckDigit(barcode: string): number {
    if (barcode.length !== 12 || !/^\d{12}$/.test(barcode)) {
      throw new Error('Invalid EAN-13 barcode format');
    }

    const digits = barcode.split('').map(Number);
    let sum = 0;

    for (let i = 0; i < 12; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }

    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
  }

  /**
   * Calculate UPC-A check digit
   * @param barcode - First 11 digits of UPC-A
   * @returns Check digit
   */
  calculateUPCCheckDigit(barcode: string): number {
    if (barcode.length !== 11 || !/^\d{11}$/.test(barcode)) {
      throw new Error('Invalid UPC barcode format');
    }

    const digits = barcode.split('').map(Number);
    let sum = 0;

    for (let i = 0; i < 11; i++) {
      sum += digits[i] * (i % 2 === 0 ? 3 : 1);
    }

    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
  }

  /**
   * Generate unique internal barcode
   * @returns Unique internal barcode
   */
  generateInternalBarcode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const uniqueId = (timestamp + random).padEnd(10, '0').substring(0, 10);
    return `IMS-${uniqueId}`;
  }

  /**
   * Parse scanned barcode data
   * @param scannedData - Raw scanned data
   * @returns Parsed barcode type and data
   */
  parseBarcode(scannedData: string): { type: BarcodeType; data: string } {
    const trimmedData = scannedData.trim();

    // Check for internal barcode
    if (/^IMS-[A-Z0-9]{10}$/.test(trimmedData)) {
      return { type: BarcodeType.INTERNAL, data: trimmedData };
    }

    // Check for EAN-13
    if (/^\d{13}$/.test(trimmedData) && this.validateEAN13(trimmedData)) {
      return { type: BarcodeType.EAN13, data: trimmedData };
    }

    // Check for UPC-A
    if (/^\d{12}$/.test(trimmedData) && this.validateUPC(trimmedData)) {
      return { type: BarcodeType.UPC, data: trimmedData };
    }

    // Check for Code39
    if (/^[0-9A-Z\-.\s$/+%]{1,80}$/.test(trimmedData)) {
      return { type: BarcodeType.CODE39, data: trimmedData };
    }

    // Default to Code128
    return { type: BarcodeType.CODE128, data: trimmedData };
  }

  /**
   * Generate complete barcode with check digit
   * @param data - Barcode data without check digit
   * @param type - Barcode type
   * @returns Complete barcode with check digit
   */
  generateCompleteBarcode(data: string, type: BarcodeType): string {
    switch (type) {
      case BarcodeType.EAN13:
        if (data.length === 12) {
          const checkDigit = this.calculateEAN13CheckDigit(data);
          return data + checkDigit;
        }
        return data;

      case BarcodeType.UPC:
        if (data.length === 11) {
          const checkDigit = this.calculateUPCCheckDigit(data);
          return data + checkDigit;
        }
        return data;

      case BarcodeType.INTERNAL:
        return this.generateInternalBarcode();

      default:
        return data;
    }
  }

  /**
   * Generate product QR code data
   * @param product - Product data
   * @returns QR code data object
   */
  generateProductQRData(product: {
    _id: string;
    name: string;
    sku: string;
    barcode?: string;
    price?: number;
  }): string {
    const qrData = {
      id: product._id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      price: product.price,
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(qrData);
  }
}

export default new BarcodeService();

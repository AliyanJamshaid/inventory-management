/**
 * Barcode Utility Functions
 * Helper functions for barcode operations
 */

import { BarcodeType } from '@/types/barcode';

/**
 * Validate barcode check digit for EAN-13
 * @param barcode - EAN-13 barcode string
 * @returns Whether the check digit is valid
 */
export function validateEAN13CheckDigit(barcode: string): boolean {
  if (!/^\d{13}$/.test(barcode)) {
    return false;
  }

  const digits = barcode.split('').map(Number);
  const checkDigit = digits[12];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }

  const remainder = sum % 10;
  const calculatedCheckDigit = remainder === 0 ? 0 : 10 - remainder;

  return checkDigit === calculatedCheckDigit;
}

/**
 * Validate barcode check digit for UPC-A
 * @param barcode - UPC-A barcode string
 * @returns Whether the check digit is valid
 */
export function validateUPCCheckDigit(barcode: string): boolean {
  if (!/^\d{12}$/.test(barcode)) {
    return false;
  }

  const digits = barcode.split('').map(Number);
  const checkDigit = digits[11];

  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += digits[i] * (i % 2 === 0 ? 3 : 1);
  }

  const remainder = sum % 10;
  const calculatedCheckDigit = remainder === 0 ? 0 : 10 - remainder;

  return checkDigit === calculatedCheckDigit;
}

/**
 * Validate barcode format
 * @param barcode - Barcode string
 * @param type - Barcode type
 * @returns Whether the barcode is valid
 */
export function validateBarcodeFormat(barcode: string, type: BarcodeType): boolean {
  if (!barcode || typeof barcode !== 'string') {
    return false;
  }

  const trimmedBarcode = barcode.trim();

  switch (type) {
    case 'EAN13':
      return /^\d{13}$/.test(trimmedBarcode) && validateEAN13CheckDigit(trimmedBarcode);
    case 'UPC':
      return /^\d{12}$/.test(trimmedBarcode) && validateUPCCheckDigit(trimmedBarcode);
    case 'CODE128':
      return /^[\x20-\x7E]{1,80}$/.test(trimmedBarcode);
    case 'CODE39':
      return /^[0-9A-Z\-.\s$/+%]{1,80}$/.test(trimmedBarcode);
    case 'INTERNAL':
      return /^IMS-[A-Z0-9]{10}$/.test(trimmedBarcode);
    default:
      return true;
  }
}

/**
 * Format barcode for display
 * @param barcode - Barcode string
 * @param type - Barcode type
 * @returns Formatted barcode string
 */
export function formatBarcode(barcode: string, type: BarcodeType): string {
  if (!barcode) return '';

  switch (type) {
    case 'EAN13':
      // Format: X-XXXXXX-XXXXXX-X
      return barcode.replace(/(\d{1})(\d{6})(\d{5})(\d{1})/, '$1-$2-$3-$4');
    case 'UPC':
      // Format: X-XXXXX-XXXXX-X
      return barcode.replace(/(\d{1})(\d{5})(\d{5})(\d{1})/, '$1-$2-$3-$4');
    case 'INTERNAL':
      // Already formatted: IMS-XXXXXXXXXX
      return barcode;
    default:
      return barcode;
  }
}

/**
 * Generate random barcode for testing
 * @param type - Barcode type
 * @returns Random barcode string
 */
export function generateRandomBarcode(type: BarcodeType): string {
  switch (type) {
    case 'EAN13': {
      const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
      const checkDigit = calculateEAN13CheckDigit(digits);
      return digits + checkDigit;
    }
    case 'UPC': {
      const digits = Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join('');
      const checkDigit = calculateUPCCheckDigit(digits);
      return digits + checkDigit;
    }
    case 'CODE128':
      return 'CODE' + Math.random().toString(36).substring(2, 12).toUpperCase();
    case 'CODE39':
      return Math.random().toString(36).substring(2, 12).toUpperCase();
    case 'INTERNAL': {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const uniqueId = (timestamp + random).padEnd(10, '0').substring(0, 10);
      return `IMS-${uniqueId}`;
    }
    default:
      return Math.random().toString(36).substring(2, 12);
  }
}

/**
 * Calculate EAN-13 check digit
 * @param digits - First 12 digits of EAN-13
 * @returns Check digit
 */
export function calculateEAN13CheckDigit(digits: string): number {
  if (digits.length !== 12 || !/^\d{12}$/.test(digits)) {
    throw new Error('Invalid EAN-13 format');
  }

  const nums = digits.split('').map(Number);
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    sum += nums[i] * (i % 2 === 0 ? 1 : 3);
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Calculate UPC-A check digit
 * @param digits - First 11 digits of UPC-A
 * @returns Check digit
 */
export function calculateUPCCheckDigit(digits: string): number {
  if (digits.length !== 11 || !/^\d{11}$/.test(digits)) {
    throw new Error('Invalid UPC format');
  }

  const nums = digits.split('').map(Number);
  let sum = 0;

  for (let i = 0; i < 11; i++) {
    sum += nums[i] * (i % 2 === 0 ? 3 : 1);
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Parse GS1 barcode data
 * @param data - GS1 barcode string
 * @returns Parsed GS1 data object
 */
export function parseGS1Barcode(data: string): Record<string, string> {
  const parsed: Record<string, string> = {};

  // GS1 Application Identifiers
  const aiPatterns = [
    { ai: '01', length: 14, name: 'GTIN' },
    { ai: '10', length: -1, name: 'Batch/Lot' },
    { ai: '17', length: 6, name: 'Expiration Date' },
    { ai: '21', length: -1, name: 'Serial Number' },
    { ai: '310', length: 6, name: 'Net Weight (kg)' },
    { ai: '37', length: -1, name: 'Count' },
  ];

  let position = 0;

  while (position < data.length) {
    let matched = false;

    for (const pattern of aiPatterns) {
      if (data.substring(position, position + pattern.ai.length) === pattern.ai) {
        position += pattern.ai.length;

        let value = '';
        if (pattern.length > 0) {
          value = data.substring(position, position + pattern.length);
          position += pattern.length;
        } else {
          // Variable length - read until FNC1 (ASCII 29) or end
          const endPos = data.indexOf(String.fromCharCode(29), position);
          if (endPos >= 0) {
            value = data.substring(position, endPos);
            position = endPos + 1;
          } else {
            value = data.substring(position);
            position = data.length;
          }
        }

        parsed[pattern.name] = value;
        matched = true;
        break;
      }
    }

    if (!matched) {
      position++;
    }
  }

  return parsed;
}

/**
 * Get barcode type name
 * @param type - Barcode type
 * @returns Human-readable barcode type name
 */
export function getBarcodeTypeName(type: BarcodeType): string {
  switch (type) {
    case 'EAN13':
      return 'EAN-13';
    case 'UPC':
      return 'UPC-A';
    case 'CODE128':
      return 'Code 128';
    case 'CODE39':
      return 'Code 39';
    case 'QR':
      return 'QR Code';
    case 'INTERNAL':
      return 'Internal Code';
    default:
      return type;
  }
}

/**
 * Check if barcode type supports check digit
 * @param type - Barcode type
 * @returns Whether the type supports check digit
 */
export function supportsCheckDigit(type: BarcodeType): boolean {
  return type === 'EAN13' || type === 'UPC';
}

/**
 * Play beep sound on scan
 */
export function playBeepSound(): void {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

/**
 * Vibrate device on scan (if supported)
 * @param duration - Vibration duration in milliseconds
 */
export function vibrateDevice(duration: number = 200): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
  }
}

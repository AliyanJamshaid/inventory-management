import { Router } from 'express';
import * as barcodeController from '../controllers/barcodeController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

/**
 * Barcode Routes
 * All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/v1/barcodes/generate
 * @desc    Generate barcode image
 * @access  Private
 */
router.post('/generate', barcodeController.generateBarcode);

/**
 * @route   POST /api/v1/barcodes/generate-qr
 * @desc    Generate QR code image
 * @access  Private
 */
router.post('/generate-qr', barcodeController.generateQRCode);

/**
 * @route   POST /api/v1/barcodes/validate
 * @desc    Validate barcode format
 * @access  Private
 */
router.post('/validate', barcodeController.validateBarcode);

/**
 * @route   GET /api/v1/barcodes/search
 * @desc    Search products by barcode
 * @access  Private
 */
router.get('/search', barcodeController.searchByBarcode);

/**
 * @route   POST /api/v1/barcodes/generate-internal
 * @desc    Generate unique internal barcode
 * @access  Private
 */
router.post('/generate-internal', barcodeController.generateInternalBarcode);

/**
 * @route   POST /api/v1/barcodes/bulk-generate
 * @desc    Bulk generate barcodes for products
 * @access  Private (requires product:update permission)
 */
router.post(
  '/bulk-generate',
  authorize('product', 'update'),
  barcodeController.bulkGenerateBarcodes
);

/**
 * @route   POST /api/v1/barcodes/print-labels
 * @desc    Generate printable labels PDF
 * @access  Private
 */
router.post('/print-labels', barcodeController.printLabels);

/**
 * @route   POST /api/v1/barcodes/parse
 * @desc    Parse scanned barcode data
 * @access  Private
 */
router.post('/parse', barcodeController.parseBarcode);

export default router;

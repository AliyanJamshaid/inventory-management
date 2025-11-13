import { Request, Response } from 'express';
import barcodeService from '../services/barcodeService';
import Product from '../models/Product';
import LabelTemplate from '../models/LabelTemplate';
import { BarcodeType } from '../types/models';
import PDFDocument from 'pdfkit';

/**
 * Barcode Controller
 * Handles barcode generation, validation, and label printing
 */

/**
 * Generate barcode image
 * POST /api/v1/barcodes/generate
 */
export const generateBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      data,
      type = 'CODE128',
      width,
      height,
      includeText = true,
      scale
    } = req.body;

    if (!data) {
      res.status(400).json({
        success: false,
        message: 'Barcode data is required',
      });
      return;
    }

    // Validate barcode type
    if (!Object.values(BarcodeType).includes(type as BarcodeType)) {
      res.status(400).json({
        success: false,
        message: 'Invalid barcode type',
      });
      return;
    }

    // Validate barcode format
    const isValid = barcodeService.validateBarcode(data, type as BarcodeType);
    if (!isValid) {
      res.status(400).json({
        success: false,
        message: `Invalid ${type} barcode format`,
      });
      return;
    }

    // Generate barcode
    const barcodeImage = await barcodeService.generateBarcode(
      data,
      type as BarcodeType,
      { width, height, includeText, scale }
    );

    res.status(200).json({
      success: true,
      data: {
        barcode: data,
        type,
        image: barcodeImage,
      },
    });
  } catch (error) {
    console.error('Generate barcode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate barcode',
      error: (error as Error).message,
    });
  }
};

/**
 * Generate QR code
 * POST /api/v1/barcodes/generate-qr
 */
export const generateQRCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, width, errorCorrectionLevel, margin } = req.body;

    if (!data) {
      res.status(400).json({
        success: false,
        message: 'QR code data is required',
      });
      return;
    }

    // Generate QR code
    const qrCodeImage = await barcodeService.generateQRCode(data, {
      width,
      errorCorrectionLevel,
      margin,
    });

    res.status(200).json({
      success: true,
      data: {
        qrCode: qrCodeImage,
      },
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: (error as Error).message,
    });
  }
};

/**
 * Validate barcode
 * POST /api/v1/barcodes/validate
 */
export const validateBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode, type = 'CODE128' } = req.body;

    if (!barcode) {
      res.status(400).json({
        success: false,
        message: 'Barcode is required',
      });
      return;
    }

    const isValid = barcodeService.validateBarcode(barcode, type as BarcodeType);

    res.status(200).json({
      success: true,
      data: {
        barcode,
        type,
        isValid,
      },
    });
  } catch (error) {
    console.error('Validate barcode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate barcode',
      error: (error as Error).message,
    });
  }
};

/**
 * Search products by barcode
 * GET /api/v1/barcodes/search?barcode=xxx
 */
export const searchByBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode } = req.query;

    if (!barcode || typeof barcode !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Barcode is required',
      });
      return;
    }

    // Find product by barcode
    const product = await Product.findOne({
      $or: [
        { barcode: barcode.trim() },
        { alternativeBarcodes: barcode.trim() }
      ],
      isActive: true
    })
      .populate('category')
      .populate('supplier');

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Search by barcode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search by barcode',
      error: (error as Error).message,
    });
  }
};

/**
 * Generate internal barcode
 * POST /api/v1/barcodes/generate-internal
 */
export const generateInternalBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const barcode = barcodeService.generateInternalBarcode();

    // Check if barcode already exists
    const existingProduct = await Product.findOne({
      $or: [
        { barcode },
        { alternativeBarcodes: barcode }
      ]
    });

    if (existingProduct) {
      // Generate a new one if collision (very rare)
      return generateInternalBarcode(req, res);
    }

    // Generate barcode image
    const barcodeImage = await barcodeService.generateBarcode(
      barcode,
      BarcodeType.INTERNAL
    );

    res.status(200).json({
      success: true,
      data: {
        barcode,
        type: BarcodeType.INTERNAL,
        image: barcodeImage,
      },
    });
  } catch (error) {
    console.error('Generate internal barcode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate internal barcode',
      error: (error as Error).message,
    });
  }
};

/**
 * Bulk generate barcodes for products
 * POST /api/v1/barcodes/bulk-generate
 */
export const bulkGenerateBarcodes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productIds, type = 'INTERNAL' } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Product IDs are required',
      });
      return;
    }

    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true
    });

    const results = [];

    for (const product of products) {
      // Skip if product already has a barcode
      if (product.barcode) {
        results.push({
          productId: product._id,
          sku: product.sku,
          name: product.name,
          barcode: product.barcode,
          barcodeType: product.barcodeType,
          status: 'skipped',
          message: 'Product already has a barcode',
        });
        continue;
      }

      // Generate barcode
      const barcode = barcodeService.generateInternalBarcode();

      // Update product
      product.barcode = barcode;
      product.barcodeType = type as BarcodeType;
      await product.save();

      results.push({
        productId: product._id,
        sku: product.sku,
        name: product.name,
        barcode,
        barcodeType: type,
        status: 'success',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        total: productIds.length,
        processed: results.length,
        results,
      },
    });
  } catch (error) {
    console.error('Bulk generate barcodes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk generate barcodes',
      error: (error as Error).message,
    });
  }
};

/**
 * Generate printable labels
 * POST /api/v1/barcodes/print-labels
 */
export const printLabels = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productIds, templateId, quantityPerProduct = 1 } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Product IDs are required',
      });
      return;
    }

    // Get products
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true
    })
      .populate('category')
      .populate('supplier');

    if (products.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No products found',
      });
      return;
    }

    // Get label template
    let template;
    if (templateId) {
      template = await LabelTemplate.findById(templateId);
    } else {
      // Get default product label template
      template = await LabelTemplate.findOne({ type: 'product', isDefault: true });
    }

    if (!template) {
      res.status(404).json({
        success: false,
        message: 'Label template not found',
      });
      return;
    }

    // Generate PDF
    const doc = new PDFDocument({ size: [template.width * 2.83465, template.height * 2.83465] });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=labels.pdf');

    doc.pipe(res);

    // Generate labels for each product
    for (const product of products) {
      for (let i = 0; i < quantityPerProduct; i++) {
        if (i > 0 || product !== products[0]) {
          doc.addPage();
        }

        // Draw label content
        let yPosition = 20;

        // Product name
        if (template.layout.showProductName) {
          doc.fontSize(template.layout.fontSize)
             .text(product.name, 20, yPosition, { width: template.width * 2.83465 - 40 });
          yPosition += template.layout.fontSize + 10;
        }

        // SKU
        if (template.layout.showSKU) {
          doc.fontSize(template.layout.fontSize - 2)
             .text(`SKU: ${product.sku}`, 20, yPosition);
          yPosition += template.layout.fontSize + 5;
        }

        // Price
        if (template.layout.showPrice) {
          doc.fontSize(template.layout.fontSize)
             .text(`$${product.sellingPrice.toFixed(2)}`, 20, yPosition);
          yPosition += template.layout.fontSize + 10;
        }

        // Category
        if (template.layout.showCategory && product.category) {
          doc.fontSize(template.layout.fontSize - 2)
             .text(`Category: ${(product.category as any).name}`, 20, yPosition);
          yPosition += template.layout.fontSize + 5;
        }

        // Barcode
        if (template.layout.showBarcode && product.barcode) {
          try {
            const barcodeImage = await barcodeService.generateBarcode(
              product.barcode,
              product.barcodeType || BarcodeType.CODE128,
              { height: template.layout.barcodeHeight, scale: 2 }
            );

            // Convert base64 to buffer
            const imageBuffer = Buffer.from(barcodeImage.split(',')[1], 'base64');
            doc.image(imageBuffer, 20, yPosition, {
              width: template.width * 2.83465 - 40,
              height: template.layout.barcodeHeight
            });
            yPosition += template.layout.barcodeHeight + 10;
          } catch (error) {
            console.error('Error generating barcode image:', error);
          }
        }

        // QR Code
        if (template.layout.showQRCode) {
          try {
            const qrData = barcodeService.generateProductQRData({
              _id: product._id.toString(),
              name: product.name,
              sku: product.sku,
              barcode: product.barcode,
              price: product.sellingPrice,
            });
            const qrCodeImage = await barcodeService.generateQRCode(qrData, { width: 100 });

            // Convert base64 to buffer
            const imageBuffer = Buffer.from(qrCodeImage.split(',')[1], 'base64');
            doc.image(imageBuffer, 20, yPosition, { width: 100, height: 100 });
          } catch (error) {
            console.error('Error generating QR code:', error);
          }
        }
      }
    }

    doc.end();
  } catch (error) {
    console.error('Print labels error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate labels',
      error: (error as Error).message,
    });
  }
};

/**
 * Parse scanned barcode
 * POST /api/v1/barcodes/parse
 */
export const parseBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scannedData } = req.body;

    if (!scannedData) {
      res.status(400).json({
        success: false,
        message: 'Scanned data is required',
      });
      return;
    }

    const parsed = barcodeService.parseBarcode(scannedData);

    res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error('Parse barcode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to parse barcode',
      error: (error as Error).message,
    });
  }
};

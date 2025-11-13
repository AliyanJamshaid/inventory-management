/**
 * Product Controller
 * Handles product management operations
 */

import { Response } from 'express';
import { IAuthRequest } from '../types';
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendBadRequest,
  sendSuccessWithPagination,
} from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import { Product, ProductVariant, Category, Stock } from '../models';
import logger from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Helper function to generate SKU
 */
const generateSKU = async (): Promise<string> => {
  const prefix = 'PRD';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Get all products (with search, filter, pagination)
 * GET /api/v1/products
 */
export const getAllProducts = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter query
    const filter: any = {};

    // Filter by active status
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    } else {
      filter.isActive = true; // Default to active products only
    }

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by supplier
    if (req.query.supplier) {
      filter.supplier = req.query.supplier;
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filter.sellingPrice = {};
      if (req.query.minPrice) {
        filter.sellingPrice.$gte = parseFloat(req.query.minPrice as string);
      }
      if (req.query.maxPrice) {
        filter.sellingPrice.$lte = parseFloat(req.query.maxPrice as string);
      }
    }

    // Search by name or description
    if (req.query.search) {
      filter.$text = { $search: req.query.search as string };
    }

    logger.info('Getting all products', {
      filter,
      page,
      limit,
      userId: req.user?.userId,
    });

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('supplier', 'name code')
      .populate('createdBy', 'firstName lastName email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    sendSuccessWithPagination(
      res,
      products,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      'Products retrieved successfully'
    );
  }
);

/**
 * Get product by ID
 * GET /api/v1/products/:id
 */
export const getProductById = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    logger.info('Getting product by ID', {
      productId: id,
      userId: req.user?.userId,
    });

    const product = await Product.findById(id)
      .populate('category', 'name slug')
      .populate('supplier', 'name code email phone')
      .populate('variants')
      .populate('createdBy', 'firstName lastName email');

    if (!product) {
      return sendNotFound(res, 'Product not found');
    }

    // Get total stock across all warehouses
    const stockData = await Stock.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          totalReserved: { $sum: '$reservedQuantity' },
        },
      },
    ]);

    const stockInfo = stockData[0] || {
      totalQuantity: 0,
      totalReserved: 0,
    };

    sendSuccess(
      res,
      {
        ...product.toObject(),
        stock: {
          total: stockInfo.totalQuantity,
          reserved: stockInfo.totalReserved,
          available: stockInfo.totalQuantity - stockInfo.totalReserved,
        },
      },
      'Product retrieved successfully'
    );
  }
);

/**
 * Create new product
 * POST /api/v1/products
 */
export const createProduct = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const {
      name,
      description,
      sku,
      barcode,
      category,
      supplier,
      unit,
      costPrice,
      sellingPrice,
      tax,
      images,
      attributes,
    } = req.body;

    logger.info('Creating new product', {
      name,
      userId: req.user?.userId,
    });

    // Generate SKU if not provided
    const productSKU = sku || (await generateSKU());

    // Validate category if provided
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return sendBadRequest(res, 'Category not found');
      }
    }

    const product = await Product.create({
      name,
      description,
      sku: productSKU,
      barcode,
      category,
      supplier,
      unit,
      costPrice,
      sellingPrice,
      tax: tax || 0,
      images: images || [],
      attributes: attributes || {},
      createdBy: req.user!.userId,
    });

    await product.populate([
      { path: 'category', select: 'name slug' },
      { path: 'supplier', select: 'name code' },
      { path: 'createdBy', select: 'firstName lastName email' },
    ]);

    logger.info('Product created successfully', {
      productId: product._id,
      sku: productSKU,
      userId: req.user?.userId,
    });

    sendCreated(res, product, 'Product created successfully');
  }
);

/**
 * Update product
 * PUT /api/v1/products/:id
 */
export const updateProduct = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;

    logger.info('Updating product', {
      productId: id,
      userId: req.user?.userId,
    });

    const product = await Product.findById(id);

    if (!product) {
      return sendNotFound(res, 'Product not found');
    }

    // Validate category if being updated
    if (updateData.category) {
      const categoryExists = await Category.findById(updateData.category);
      if (!categoryExists) {
        return sendBadRequest(res, 'Category not found');
      }
    }

    // Don't allow updating createdBy
    delete updateData.createdBy;
    delete updateData.variants; // Variants managed through separate endpoints

    Object.assign(product, updateData);
    await product.save();

    await product.populate([
      { path: 'category', select: 'name slug' },
      { path: 'supplier', select: 'name code' },
      { path: 'createdBy', select: 'firstName lastName email' },
    ]);

    logger.info('Product updated successfully', {
      productId: id,
      userId: req.user?.userId,
    });

    sendSuccess(res, product, 'Product updated successfully');
  }
);

/**
 * Delete product
 * DELETE /api/v1/products/:id
 */
export const deleteProduct = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    logger.info('Deleting product', {
      productId: id,
      userId: req.user?.userId,
    });

    const product = await Product.findById(id);

    if (!product) {
      return sendNotFound(res, 'Product not found');
    }

    // Check if product has stock
    const stockExists = await Stock.findOne({ product: id });
    if (stockExists) {
      return sendBadRequest(
        res,
        'Cannot delete product with existing stock. Please remove all stock first.'
      );
    }

    // Delete all variants
    await ProductVariant.deleteMany({ product: id });

    await product.deleteOne();

    logger.info('Product deleted successfully', {
      productId: id,
      userId: req.user?.userId,
    });

    sendSuccess(res, null, 'Product deleted successfully');
  }
);

/**
 * Search products
 * GET /api/v1/products/search
 */
export const searchProducts = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { q } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    if (!q) {
      return sendBadRequest(res, 'Search query is required');
    }

    logger.info('Searching products', {
      query: q,
      userId: req.user?.userId,
    });

    const filter = {
      $text: { $search: q as string },
      isActive: true,
    };

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter, {
      score: { $meta: 'textScore' },
    })
      .populate('category', 'name slug')
      .populate('supplier', 'name code')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit);

    sendSuccessWithPagination(
      res,
      products,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      'Search results retrieved successfully'
    );
  }
);

/**
 * Get product variants
 * GET /api/v1/products/:id/variants
 */
export const getProductVariants = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    logger.info('Getting product variants', {
      productId: id,
      userId: req.user?.userId,
    });

    const product = await Product.findById(id);

    if (!product) {
      return sendNotFound(res, 'Product not found');
    }

    const variants = await ProductVariant.find({ product: id }).sort({
      variantName: 1,
    });

    sendSuccess(res, variants, 'Product variants retrieved successfully');
  }
);

/**
 * Add product variant
 * POST /api/v1/products/:id/variants
 */
export const addProductVariant = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { variantName, sku, barcode, attributes, costPrice, sellingPrice, images } =
      req.body;

    logger.info('Adding product variant', {
      productId: id,
      variantName,
      userId: req.user?.userId,
    });

    const product = await Product.findById(id);

    if (!product) {
      return sendNotFound(res, 'Product not found');
    }

    // Generate SKU if not provided
    const variantSKU =
      sku ||
      `${product.sku}-VAR-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')}`;

    const variant = await ProductVariant.create({
      product: id,
      variantName,
      sku: variantSKU,
      barcode,
      attributes: attributes || {},
      costPrice,
      sellingPrice,
      images: images || [],
    });

    // Add variant to product
    await (product as any).addVariant(variant._id);

    logger.info('Product variant added successfully', {
      productId: id,
      variantId: variant._id,
      userId: req.user?.userId,
    });

    sendCreated(res, variant, 'Product variant added successfully');
  }
);

/**
 * Update product variant
 * PUT /api/v1/products/:id/variants/:variantId
 */
export const updateProductVariant = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id, variantId } = req.params;
    const updateData = req.body;

    logger.info('Updating product variant', {
      productId: id,
      variantId,
      userId: req.user?.userId,
    });

    const product = await Product.findById(id);

    if (!product) {
      return sendNotFound(res, 'Product not found');
    }

    const variant = await ProductVariant.findOne({
      _id: variantId,
      product: id,
    });

    if (!variant) {
      return sendNotFound(res, 'Product variant not found');
    }

    // Don't allow changing the product reference
    delete updateData.product;

    Object.assign(variant, updateData);
    await variant.save();

    logger.info('Product variant updated successfully', {
      productId: id,
      variantId,
      userId: req.user?.userId,
    });

    sendSuccess(res, variant, 'Product variant updated successfully');
  }
);

/**
 * Delete product variant
 * DELETE /api/v1/products/:id/variants/:variantId
 */
export const deleteProductVariant = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id, variantId } = req.params;

    logger.info('Deleting product variant', {
      productId: id,
      variantId,
      userId: req.user?.userId,
    });

    const product = await Product.findById(id);

    if (!product) {
      return sendNotFound(res, 'Product not found');
    }

    const variant = await ProductVariant.findOne({
      _id: variantId,
      product: id,
    });

    if (!variant) {
      return sendNotFound(res, 'Product variant not found');
    }

    // Check if variant has stock
    const stockExists = await Stock.findOne({ variant: variantId });
    if (stockExists) {
      return sendBadRequest(
        res,
        'Cannot delete variant with existing stock'
      );
    }

    // Remove variant from product
    await (product as any).removeVariant(variantId);

    await variant.deleteOne();

    logger.info('Product variant deleted successfully', {
      productId: id,
      variantId,
      userId: req.user?.userId,
    });

    sendSuccess(res, null, 'Product variant deleted successfully');
  }
);

/**
 * Bulk import products (CSV)
 * POST /api/v1/products/bulk-import
 * Note: This is a placeholder - actual CSV parsing would require additional libraries
 */
export const bulkImportProducts = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { products } = req.body;

    logger.info('Bulk importing products', {
      count: products?.length,
      userId: req.user?.userId,
    });

    if (!products || !Array.isArray(products)) {
      return sendBadRequest(res, 'Products array is required');
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const productData of products) {
      try {
        // Generate SKU if not provided
        const productSKU = productData.sku || (await generateSKU());

        // Validate category if provided
        if (productData.category) {
          const categoryExists = await Category.findById(productData.category);
          if (!categoryExists) {
            results.failed++;
            results.errors.push({
              product: productData.name,
              error: 'Category not found',
            });
            continue;
          }
        }

        await Product.create({
          ...productData,
          sku: productSKU,
          createdBy: req.user!.userId,
        });

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          product: productData.name,
          error: error.message,
        });
      }
    }

    logger.info('Bulk import completed', {
      results,
      userId: req.user?.userId,
    });

    sendSuccess(
      res,
      results,
      `Bulk import completed: ${results.success} succeeded, ${results.failed} failed`
    );
  }
);

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductVariants,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
  bulkImportProducts,
};

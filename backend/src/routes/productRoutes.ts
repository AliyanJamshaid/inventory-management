/**
 * Product Routes
 * Routes for product management
 */

import { Router } from 'express';
import {
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
} from '../controllers/productController';
import { authenticate, isAdminOrManager, isStaffOrAbove } from '../middleware/auth';
import { validateObjectId, validatePagination, validateRequest } from '../middleware/validate';
import {
  createProductValidator,
  updateProductValidator,
  searchProductValidator,
  createVariantValidator,
  bulkImportValidator,
} from '../validators/productValidators';

const router = Router();

/**
 * GET /api/v1/products/search
 * Search products
 * Must be before /:id route to avoid conflict
 */
router.get(
  '/search',
  authenticate,
  searchProductValidator,
  validateRequest(searchProductValidator),
  searchProducts
);

/**
 * GET /api/v1/products
 * Get all products (with search, filter, pagination)
 * Public endpoint - all authenticated users can view
 */
router.get('/', authenticate, validatePagination, getAllProducts);

/**
 * GET /api/v1/products/:id
 * Get product by ID
 * Public endpoint - all authenticated users can view
 */
router.get('/:id', authenticate, validateObjectId('id'), getProductById);

/**
 * POST /api/v1/products
 * Create new product
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.post(
  '/',
  authenticate,
  isAdminOrManager,
  createProductValidator,
  validateRequest(createProductValidator),
  createProduct
);

/**
 * PUT /api/v1/products/:id
 * Update product
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.put(
  '/:id',
  authenticate,
  isAdminOrManager,
  validateObjectId('id'),
  updateProductValidator,
  validateRequest(updateProductValidator),
  updateProduct
);

/**
 * DELETE /api/v1/products/:id
 * Delete product
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.delete(
  '/:id',
  authenticate,
  isAdminOrManager,
  validateObjectId('id'),
  deleteProduct
);

/**
 * POST /api/v1/products/bulk-import
 * Bulk import products
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.post(
  '/bulk-import',
  authenticate,
  isAdminOrManager,
  bulkImportValidator,
  validateRequest(bulkImportValidator),
  bulkImportProducts
);

/**
 * GET /api/v1/products/:id/variants
 * Get product variants
 * Public endpoint - all authenticated users can view
 */
router.get(
  '/:id/variants',
  authenticate,
  validateObjectId('id'),
  getProductVariants
);

/**
 * POST /api/v1/products/:id/variants
 * Add product variant
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.post(
  '/:id/variants',
  authenticate,
  isAdminOrManager,
  validateObjectId('id'),
  createVariantValidator,
  validateRequest(createVariantValidator),
  addProductVariant
);

/**
 * PUT /api/v1/products/:id/variants/:variantId
 * Update product variant
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.put(
  '/:id/variants/:variantId',
  authenticate,
  isAdminOrManager,
  validateObjectId('id'),
  validateObjectId('variantId'),
  updateProductVariant
);

/**
 * DELETE /api/v1/products/:id/variants/:variantId
 * Delete product variant
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.delete(
  '/:id/variants/:variantId',
  authenticate,
  isAdminOrManager,
  validateObjectId('id'),
  validateObjectId('variantId'),
  deleteProductVariant
);

export default router;

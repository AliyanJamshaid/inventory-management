/**
 * Category Routes
 * Routes for category management
 */

import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
} from '../controllers/categoryController';
import { authenticate, isAdminOrManager } from '../middleware/auth';
import { validateObjectId } from '../middleware/validate';

const router = Router();

/**
 * GET /api/v1/categories
 * Get all categories (with optional tree structure)
 * Query params: tree=true for hierarchical structure
 * Public endpoint - all authenticated users can view
 */
router.get('/', authenticate, getAllCategories);

/**
 * GET /api/v1/categories/:id
 * Get category by ID
 * Public endpoint - all authenticated users can view
 */
router.get('/:id', authenticate, validateObjectId('id'), getCategoryById);

/**
 * POST /api/v1/categories
 * Create new category
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.post('/', authenticate, isAdminOrManager, createCategory);

/**
 * PUT /api/v1/categories/:id
 * Update category
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.put(
  '/:id',
  authenticate,
  isAdminOrManager,
  validateObjectId('id'),
  updateCategory
);

/**
 * DELETE /api/v1/categories/:id
 * Delete category
 * Protected endpoint - requires ADMIN or MANAGER role
 */
router.delete(
  '/:id',
  authenticate,
  isAdminOrManager,
  validateObjectId('id'),
  deleteCategory
);

/**
 * GET /api/v1/categories/:id/products
 * Get products in category (including subcategories)
 * Public endpoint - all authenticated users can view
 */
router.get(
  '/:id/products',
  authenticate,
  validateObjectId('id'),
  getCategoryProducts
);

export default router;

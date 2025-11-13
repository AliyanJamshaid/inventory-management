/**
 * Category Controller
 * Handles category management operations
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
import { Category, Product } from '../models';
import logger from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Get all categories (with tree structure)
 * GET /api/v1/categories
 */
export const getAllCategories = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { tree } = req.query;

    logger.info('Getting all categories', { userId: req.user?.userId });

    if (tree === 'true') {
      // Return hierarchical tree structure
      const categoryTree = await (Category as any).getCategoryTree();
      sendSuccess(res, categoryTree, 'Categories retrieved successfully');
    } else {
      // Return flat list
      const categories = await Category.find({ isActive: true })
        .populate('parent', 'name slug')
        .sort({ name: 1 });

      sendSuccess(res, categories, 'Categories retrieved successfully');
    }
  }
);

/**
 * Get category by ID
 * GET /api/v1/categories/:id
 */
export const getCategoryById = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    logger.info('Getting category by ID', {
      categoryId: id,
      userId: req.user?.userId,
    });

    const category = await Category.findById(id)
      .populate('parent', 'name slug')
      .populate('children');

    if (!category) {
      return sendNotFound(res, 'Category not found');
    }

    // Get category path
    const path = await (category as any).getPath();

    sendSuccess(
      res,
      {
        ...category.toObject(),
        path,
      },
      'Category retrieved successfully'
    );
  }
);

/**
 * Create new category
 * POST /api/v1/categories
 */
export const createCategory = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { name, description, parent, slug, image } = req.body;

    logger.info('Creating new category', {
      name,
      userId: req.user?.userId,
    });

    // Validate parent if provided
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return sendBadRequest(res, 'Parent category not found');
      }
    }

    const category = await Category.create({
      name,
      description,
      parent: parent || null,
      slug,
      image,
    });

    logger.info('Category created successfully', {
      categoryId: category._id,
      userId: req.user?.userId,
    });

    sendCreated(res, category, 'Category created successfully');
  }
);

/**
 * Update category
 * PUT /api/v1/categories/:id
 */
export const updateCategory = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, description, parent, slug, image, isActive } = req.body;

    logger.info('Updating category', {
      categoryId: id,
      userId: req.user?.userId,
    });

    const category = await Category.findById(id);

    if (!category) {
      return sendNotFound(res, 'Category not found');
    }

    // Validate parent if provided (prevent circular reference)
    if (parent) {
      if (parent === id) {
        return sendBadRequest(res, 'Category cannot be its own parent');
      }

      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return sendBadRequest(res, 'Parent category not found');
      }

      // Check if parent is a descendant of current category
      let currentParent = parentCategory;
      while (currentParent.parent) {
        if (currentParent.parent.toString() === id) {
          return sendBadRequest(
            res,
            'Cannot set parent to a descendant category'
          );
        }
        currentParent = await Category.findById(currentParent.parent);
        if (!currentParent) break;
      }
    }

    // Update fields
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (parent !== undefined) category.parent = parent || null;
    if (slug !== undefined) category.slug = slug;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    logger.info('Category updated successfully', {
      categoryId: id,
      userId: req.user?.userId,
    });

    sendSuccess(res, category, 'Category updated successfully');
  }
);

/**
 * Delete category
 * DELETE /api/v1/categories/:id
 */
export const deleteCategory = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    logger.info('Deleting category', {
      categoryId: id,
      userId: req.user?.userId,
    });

    const category = await Category.findById(id);

    if (!category) {
      return sendNotFound(res, 'Category not found');
    }

    // Check if category has child categories
    const childrenCount = await Category.countDocuments({ parent: id });
    if (childrenCount > 0) {
      return sendBadRequest(
        res,
        'Cannot delete category with child categories'
      );
    }

    // Check if category has products
    const productsCount = await Product.countDocuments({ category: id });
    if (productsCount > 0) {
      return sendBadRequest(
        res,
        'Cannot delete category with associated products'
      );
    }

    await category.deleteOne();

    logger.info('Category deleted successfully', {
      categoryId: id,
      userId: req.user?.userId,
    });

    sendSuccess(res, null, 'Category deleted successfully');
  }
);

/**
 * Get products in category
 * GET /api/v1/categories/:id/products
 */
export const getCategoryProducts = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    logger.info('Getting products in category', {
      categoryId: id,
      userId: req.user?.userId,
    });

    const category = await Category.findById(id);

    if (!category) {
      return sendNotFound(res, 'Category not found');
    }

    // Get all descendant categories
    const getAllDescendants = async (
      categoryId: string
    ): Promise<string[]> => {
      const children = await Category.find({ parent: categoryId });
      const descendantIds = [categoryId];

      for (const child of children) {
        const childDescendants = await getAllDescendants(child._id.toString());
        descendantIds.push(...childDescendants);
      }

      return descendantIds;
    };

    const categoryIds = await getAllDescendants(id);

    const total = await Product.countDocuments({
      category: { $in: categoryIds },
      isActive: true,
    });

    const products = await Product.find({
      category: { $in: categoryIds },
      isActive: true,
    })
      .populate('category', 'name slug')
      .populate('supplier', 'name code')
      .sort({ name: 1 })
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

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
};

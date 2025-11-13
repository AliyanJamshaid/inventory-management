import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../types/models';

/**
 * Category Schema
 * Manages product categories with hierarchical structure
 */
const categorySchema = new Schema<ICategory>(
  {
    /**
     * Category name
     */
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },

    /**
     * Category description
     */
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    /**
     * Parent category ID for nested categories
     */
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },

    /**
     * URL-friendly slug for the category
     */
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },

    /**
     * URL to category image
     */
    image: {
      type: String,
      default: null,
    },

    /**
     * Custom fields (user-defined dynamic fields)
     */
    customFields: {
      type: Map,
      of: Schema.Types.Mixed,
      default: new Map(),
    },

    /**
     * Whether the category is active
     */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parent: 1 });
categorySchema.index({ name: 'text' });
categorySchema.index({ isActive: 1 });

/**
 * Virtual to get child categories
 */
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

/**
 * Pre-save middleware to generate slug from name if not provided
 */
categorySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

/**
 * Static method to find root categories (categories without parent)
 * @returns Array of root category documents
 */
categorySchema.statics.findRootCategories = function () {
  return this.find({ parent: null, isActive: true }).sort({ name: 1 });
};

/**
 * Static method to find categories by parent ID
 * @param parentId - Parent category ID
 * @returns Array of child category documents
 */
categorySchema.statics.findByParent = function (parentId: mongoose.Types.ObjectId) {
  return this.find({ parent: parentId, isActive: true }).sort({ name: 1 });
};

/**
 * Static method to get full category tree
 * @returns Nested category structure
 */
categorySchema.statics.getCategoryTree = async function () {
  const categories = await this.find({ isActive: true }).sort({ name: 1 });

  const buildTree = (parentId: any = null): any[] => {
    return categories
      .filter((cat) => {
        if (parentId === null) {
          return cat.parent === null || cat.parent === undefined;
        }
        return cat.parent && cat.parent.toString() === parentId.toString();
      })
      .map((cat) => ({
        ...cat.toObject(),
        children: buildTree(cat._id),
      }));
  };

  return buildTree();
};

/**
 * Instance method to get all ancestor categories
 * @returns Array of ancestor categories from root to direct parent
 */
categorySchema.methods.getAncestors = async function (): Promise<ICategory[]> {
  const ancestors: ICategory[] = [];
  let currentCategory: ICategory | null = this;

  while (currentCategory && currentCategory.parent) {
    const parent = await mongoose
      .model<ICategory>('Category')
      .findById(currentCategory.parent);
    if (parent) {
      ancestors.unshift(parent);
      currentCategory = parent;
    } else {
      break;
    }
  }

  return ancestors;
};

/**
 * Instance method to get category path (breadcrumb)
 * @returns Category path as string (e.g., "Electronics > Computers > Laptops")
 */
categorySchema.methods.getPath = async function (): Promise<string> {
  const ancestors = await this.getAncestors();
  const path = [...ancestors.map((a) => a.name), this.name];
  return path.join(' > ');
};

const Category = mongoose.model<ICategory>('Category', categorySchema);

export default Category;

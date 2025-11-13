/**
 * Category Seeder
 * Creates hierarchical product categories
 */

import Category from '../models_temp/Category';
import logger from '../utils/logger';

/**
 * Seed categories into the database
 */
export const seedCategories = async (): Promise<void> => {
  try {
    // Check if categories already exist
    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
      logger.info(`Categories already exist (${existingCount} found). Skipping category seeding.`);
      return;
    }

    // Create parent categories first
    const parentCategories = [
      {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        slug: 'electronics',
        isActive: true,
      },
      {
        name: 'Office Supplies',
        description: 'Office and stationery supplies',
        slug: 'office-supplies',
        isActive: true,
      },
      {
        name: 'Furniture',
        description: 'Office and home furniture',
        slug: 'furniture',
        isActive: true,
      },
      {
        name: 'Industrial Equipment',
        description: 'Industrial machinery and equipment',
        slug: 'industrial-equipment',
        isActive: true,
      },
      {
        name: 'Safety Equipment',
        description: 'Safety and protective equipment',
        slug: 'safety-equipment',
        isActive: true,
      },
      {
        name: 'Cleaning Supplies',
        description: 'Cleaning products and supplies',
        slug: 'cleaning-supplies',
        isActive: true,
      },
      {
        name: 'Food & Beverages',
        description: 'Food items and beverages',
        slug: 'food-beverages',
        isActive: true,
      },
      {
        name: 'Medical Supplies',
        description: 'Medical equipment and supplies',
        slug: 'medical-supplies',
        isActive: true,
      },
    ];

    const createdParents = await Category.insertMany(parentCategories);
    logger.info(`✓ Created ${createdParents.length} parent categories`);

    // Create subcategories
    const subcategories = [
      // Electronics subcategories
      {
        name: 'Laptops',
        description: 'Laptop computers',
        slug: 'laptops',
        parent: createdParents.find(c => c.slug === 'electronics')?._id,
        isActive: true,
      },
      {
        name: 'Desktop Computers',
        description: 'Desktop computer systems',
        slug: 'desktop-computers',
        parent: createdParents.find(c => c.slug === 'electronics')?._id,
        isActive: true,
      },
      {
        name: 'Monitors',
        description: 'Computer monitors and displays',
        slug: 'monitors',
        parent: createdParents.find(c => c.slug === 'electronics')?._id,
        isActive: true,
      },
      {
        name: 'Phones & Tablets',
        description: 'Mobile phones and tablets',
        slug: 'phones-tablets',
        parent: createdParents.find(c => c.slug === 'electronics')?._id,
        isActive: true,
      },
      {
        name: 'Accessories',
        description: 'Electronic accessories',
        slug: 'accessories',
        parent: createdParents.find(c => c.slug === 'electronics')?._id,
        isActive: true,
      },

      // Office Supplies subcategories
      {
        name: 'Writing Instruments',
        description: 'Pens, pencils, and markers',
        slug: 'writing-instruments',
        parent: createdParents.find(c => c.slug === 'office-supplies')?._id,
        isActive: true,
      },
      {
        name: 'Paper Products',
        description: 'Paper, notebooks, and pads',
        slug: 'paper-products',
        parent: createdParents.find(c => c.slug === 'office-supplies')?._id,
        isActive: true,
      },
      {
        name: 'Filing & Organization',
        description: 'Folders, binders, and organizers',
        slug: 'filing-organization',
        parent: createdParents.find(c => c.slug === 'office-supplies')?._id,
        isActive: true,
      },
      {
        name: 'Desk Accessories',
        description: 'Desk organizers and accessories',
        slug: 'desk-accessories',
        parent: createdParents.find(c => c.slug === 'office-supplies')?._id,
        isActive: true,
      },

      // Furniture subcategories
      {
        name: 'Office Desks',
        description: 'Office and computer desks',
        slug: 'office-desks',
        parent: createdParents.find(c => c.slug === 'furniture')?._id,
        isActive: true,
      },
      {
        name: 'Office Chairs',
        description: 'Office and ergonomic chairs',
        slug: 'office-chairs',
        parent: createdParents.find(c => c.slug === 'furniture')?._id,
        isActive: true,
      },
      {
        name: 'Storage Cabinets',
        description: 'Filing and storage cabinets',
        slug: 'storage-cabinets',
        parent: createdParents.find(c => c.slug === 'furniture')?._id,
        isActive: true,
      },
      {
        name: 'Conference Tables',
        description: 'Meeting and conference tables',
        slug: 'conference-tables',
        parent: createdParents.find(c => c.slug === 'furniture')?._id,
        isActive: true,
      },

      // Industrial Equipment subcategories
      {
        name: 'Power Tools',
        description: 'Electric and cordless power tools',
        slug: 'power-tools',
        parent: createdParents.find(c => c.slug === 'industrial-equipment')?._id,
        isActive: true,
      },
      {
        name: 'Hand Tools',
        description: 'Manual hand tools',
        slug: 'hand-tools',
        parent: createdParents.find(c => c.slug === 'industrial-equipment')?._id,
        isActive: true,
      },
      {
        name: 'Machinery',
        description: 'Industrial machinery',
        slug: 'machinery',
        parent: createdParents.find(c => c.slug === 'industrial-equipment')?._id,
        isActive: true,
      },

      // Safety Equipment subcategories
      {
        name: 'Personal Protective Equipment',
        description: 'PPE and safety gear',
        slug: 'ppe',
        parent: createdParents.find(c => c.slug === 'safety-equipment')?._id,
        isActive: true,
      },
      {
        name: 'First Aid',
        description: 'First aid kits and supplies',
        slug: 'first-aid',
        parent: createdParents.find(c => c.slug === 'safety-equipment')?._id,
        isActive: true,
      },

      // Cleaning Supplies subcategories
      {
        name: 'Cleaning Chemicals',
        description: 'Cleaning solutions and chemicals',
        slug: 'cleaning-chemicals',
        parent: createdParents.find(c => c.slug === 'cleaning-supplies')?._id,
        isActive: true,
      },
      {
        name: 'Cleaning Tools',
        description: 'Mops, brooms, and cleaning tools',
        slug: 'cleaning-tools',
        parent: createdParents.find(c => c.slug === 'cleaning-supplies')?._id,
        isActive: true,
      },

      // Food & Beverages subcategories
      {
        name: 'Snacks',
        description: 'Snacks and treats',
        slug: 'snacks',
        parent: createdParents.find(c => c.slug === 'food-beverages')?._id,
        isActive: true,
      },
      {
        name: 'Beverages',
        description: 'Drinks and beverages',
        slug: 'beverages',
        parent: createdParents.find(c => c.slug === 'food-beverages')?._id,
        isActive: true,
      },

      // Medical Supplies subcategories
      {
        name: 'Diagnostic Equipment',
        description: 'Medical diagnostic tools',
        slug: 'diagnostic-equipment',
        parent: createdParents.find(c => c.slug === 'medical-supplies')?._id,
        isActive: true,
      },
      {
        name: 'Disposable Supplies',
        description: 'Disposable medical supplies',
        slug: 'disposable-supplies',
        parent: createdParents.find(c => c.slug === 'medical-supplies')?._id,
        isActive: true,
      },
    ];

    const createdSubcategories = await Category.insertMany(subcategories);
    logger.info(`✓ Created ${createdSubcategories.length} subcategories`);
    logger.info(`✓ Total categories: ${createdParents.length + createdSubcategories.length}`);
  } catch (error) {
    logger.error('Error seeding categories:', error);
    throw error;
  }
};

/**
 * Clear all categories from the database
 */
export const clearCategories = async (): Promise<void> => {
  try {
    await Category.deleteMany({});
    logger.info('✓ Cleared all categories');
  } catch (error) {
    logger.error('Error clearing categories:', error);
    throw error;
  }
};

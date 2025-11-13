/**
 * Product Seeder
 * Creates 100+ products across different categories
 */

import Product from '../models_temp/Product';
import Category from '../models_temp/Category';
import Supplier from '../models_temp/Supplier';
import User from '../models_temp/User';
import logger from '../utils/logger';

/**
 * Helper function to generate SKU
 */
const generateSKU = (prefix: string, index: number): string => {
  return `${prefix}-${index.toString().padStart(5, '0')}`;
};

/**
 * Seed products into the database
 */
export const seedProducts = async (): Promise<void> => {
  try {
    // Check if products already exist
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      logger.info(`Products already exist (${existingCount} found). Skipping product seeding.`);
      return;
    }

    // Get necessary references
    const categories = await Category.find({});
    const suppliers = await Supplier.find({});
    const admin = await User.findOne({ role: 'ADMIN' });

    if (!admin) {
      throw new Error('Admin user not found. Please seed users first.');
    }

    const products = [];
    let productIndex = 1;

    // Electronics - Laptops (15 products)
    const laptopCategory = categories.find(c => c.slug === 'laptops');
    const techSupplier = suppliers.find(s => s.code === 'SUP001');
    if (laptopCategory && techSupplier) {
      const laptopModels = [
        { name: 'Dell XPS 13', cost: 899, price: 1299, desc: '13-inch ultrabook with Intel Core i7' },
        { name: 'Dell XPS 15', cost: 1299, price: 1799, desc: '15-inch premium laptop' },
        { name: 'HP ProBook 450', cost: 649, price: 899, desc: 'Business laptop with AMD Ryzen' },
        { name: 'HP EliteBook 840', cost: 1099, price: 1499, desc: 'Enterprise-grade laptop' },
        { name: 'Lenovo ThinkPad X1', cost: 1199, price: 1699, desc: 'Carbon fiber ultrabook' },
        { name: 'Lenovo IdeaPad 3', cost: 449, price: 649, desc: 'Budget-friendly laptop' },
        { name: 'ASUS VivoBook 15', cost: 549, price: 749, desc: '15-inch everyday laptop' },
        { name: 'ASUS ROG Zephyrus', cost: 1599, price: 2199, desc: 'Gaming laptop with RTX 3070' },
        { name: 'MacBook Air M2', cost: 999, price: 1399, desc: 'Apple Silicon laptop' },
        { name: 'MacBook Pro 14"', cost: 1799, price: 2499, desc: 'Professional laptop with M2 Pro' },
        { name: 'Acer Aspire 5', cost: 499, price: 699, desc: 'Reliable everyday laptop' },
        { name: 'Microsoft Surface Laptop 4', cost: 899, price: 1299, desc: 'Premium Windows laptop' },
        { name: 'MSI GF63 Thin', cost: 749, price: 1099, desc: 'Gaming laptop for budget' },
        { name: 'Razer Blade 15', cost: 1899, price: 2599, desc: 'Premium gaming laptop' },
        { name: 'Samsung Galaxy Book Pro', cost: 899, price: 1249, desc: 'Ultra-lightweight laptop' },
      ];

      laptopModels.forEach(model => {
        products.push({
          name: model.name,
          description: model.desc,
          sku: generateSKU('LAP', productIndex++),
          category: laptopCategory._id,
          supplier: techSupplier._id,
          unit: 'piece',
          costPrice: model.cost,
          sellingPrice: model.price,
          tax: 10,
          isActive: true,
          createdBy: admin._id,
        });
      });
    }

    // Monitors (12 products)
    const monitorCategory = categories.find(c => c.slug === 'monitors');
    if (monitorCategory && techSupplier) {
      const monitors = [
        { name: 'Dell 24" FHD Monitor', cost: 149, price: 229, desc: '24-inch Full HD display' },
        { name: 'Dell 27" QHD Monitor', cost: 249, price: 379, desc: '27-inch Quad HD display' },
        { name: 'LG 27" 4K UHD Monitor', cost: 349, price: 529, desc: '4K Ultra HD monitor' },
        { name: 'LG 34" Ultrawide Monitor', cost: 449, price: 679, desc: '34-inch curved ultrawide' },
        { name: 'Samsung 24" Curved Monitor', cost: 179, price: 269, desc: 'Curved Full HD display' },
        { name: 'Samsung 32" 4K Monitor', cost: 399, price: 599, desc: '32-inch 4K display' },
        { name: 'ASUS TUF Gaming 27"', cost: 299, price: 449, desc: '144Hz gaming monitor' },
        { name: 'ASUS ProArt 27"', cost: 449, price: 679, desc: 'Professional color-accurate display' },
        { name: 'BenQ 24" Business Monitor', cost: 159, price: 239, desc: 'Eye-care business monitor' },
        { name: 'AOC 27" Gaming Monitor', cost: 219, price: 329, desc: 'Affordable gaming display' },
        { name: 'ViewSonic 24" Monitor', cost: 139, price: 209, desc: 'Budget Full HD monitor' },
        { name: 'HP 27" Monitor', cost: 199, price: 299, desc: 'IPS panel monitor' },
      ];

      monitors.forEach(monitor => {
        products.push({
          name: monitor.name,
          description: monitor.desc,
          sku: generateSKU('MON', productIndex++),
          category: monitorCategory._id,
          supplier: techSupplier._id,
          unit: 'piece',
          costPrice: monitor.cost,
          sellingPrice: monitor.price,
          tax: 10,
          isActive: true,
          createdBy: admin._id,
        });
      });
    }

    // Office Supplies - Writing Instruments (15 products)
    const writingCategory = categories.find(c => c.slug === 'writing-instruments');
    const officeSupplier = suppliers.find(s => s.code === 'SUP002');
    if (writingCategory && officeSupplier) {
      const writingItems = [
        { name: 'BIC Ballpoint Pens (Pack of 12)', cost: 3.99, price: 6.99, desc: 'Blue ballpoint pens' },
        { name: 'BIC Ballpoint Pens Black (Pack of 12)', cost: 3.99, price: 6.99, desc: 'Black ballpoint pens' },
        { name: 'Pilot G2 Gel Pens (Pack of 6)', cost: 8.99, price: 12.99, desc: 'Premium gel pens' },
        { name: 'Sharpie Permanent Markers (Pack of 12)', cost: 9.99, price: 14.99, desc: 'Fine point markers' },
        { name: 'Sharpie Highlighters (Pack of 6)', cost: 5.99, price: 8.99, desc: 'Assorted colors' },
        { name: 'Paper Mate Pencils (Pack of 12)', cost: 4.99, price: 7.99, desc: 'No. 2 pencils' },
        { name: 'Mechanical Pencils (Pack of 5)', cost: 6.99, price: 10.99, desc: '0.7mm lead pencils' },
        { name: 'Staedtler Fine Liners (Pack of 10)', cost: 12.99, price: 18.99, desc: 'Technical drawing pens' },
        { name: 'Crayola Markers (Pack of 24)', cost: 7.99, price: 11.99, desc: 'Washable markers' },
        { name: 'Expo Dry Erase Markers (Pack of 8)', cost: 8.99, price: 13.99, desc: 'Whiteboard markers' },
        { name: 'Post-it Flags', cost: 2.99, price: 4.99, desc: 'Colored sticky flags' },
        { name: 'Correction Tape (Pack of 3)', cost: 4.99, price: 7.99, desc: 'White-out tape' },
        { name: 'Fountain Pen Set', cost: 24.99, price: 39.99, desc: 'Premium fountain pen' },
        { name: 'Colored Pencils (Set of 24)', cost: 9.99, price: 14.99, desc: 'Pre-sharpened colored pencils' },
        { name: 'Calligraphy Pen Set', cost: 19.99, price: 29.99, desc: 'Calligraphy starter kit' },
      ];

      writingItems.forEach(item => {
        products.push({
          name: item.name,
          description: item.desc,
          sku: generateSKU('WRI', productIndex++),
          category: writingCategory._id,
          supplier: officeSupplier._id,
          unit: 'pack',
          costPrice: item.cost,
          sellingPrice: item.price,
          tax: 8,
          isActive: true,
          createdBy: admin._id,
        });
      });
    }

    // Paper Products (12 products)
    const paperCategory = categories.find(c => c.slug === 'paper-products');
    if (paperCategory && officeSupplier) {
      const paperItems = [
        { name: 'Copy Paper 8.5x11 (500 sheets)', cost: 5.99, price: 8.99, desc: 'Standard copy paper' },
        { name: 'Copy Paper Legal (500 sheets)', cost: 6.99, price: 9.99, desc: 'Legal size paper' },
        { name: 'Spiral Notebooks (3 pack)', cost: 8.99, price: 12.99, desc: 'College ruled notebooks' },
        { name: 'Composition Notebooks (5 pack)', cost: 9.99, price: 14.99, desc: 'Classic composition books' },
        { name: 'Sticky Notes 3x3 (12 pads)', cost: 7.99, price: 11.99, desc: 'Yellow sticky notes' },
        { name: 'Sticky Notes Assorted (6 pads)', cost: 6.99, price: 9.99, desc: 'Multi-color sticky notes' },
        { name: 'Index Cards 3x5 (500 count)', cost: 4.99, price: 7.99, desc: 'White index cards' },
        { name: 'Cardstock Paper (100 sheets)', cost: 9.99, price: 14.99, desc: 'Heavy weight cardstock' },
        { name: 'Photo Paper Glossy (50 sheets)', cost: 14.99, price: 21.99, desc: 'High-quality photo paper' },
        { name: 'Legal Pads (6 pack)', cost: 11.99, price: 16.99, desc: 'Yellow legal pads' },
        { name: 'Graph Paper Notebook', cost: 5.99, price: 8.99, desc: 'Engineering graph paper' },
        { name: 'Presentation Paper (100 sheets)', cost: 12.99, price: 18.99, desc: 'Premium presentation paper' },
      ];

      paperItems.forEach(item => {
        products.push({
          name: item.name,
          description: item.desc,
          sku: generateSKU('PAP', productIndex++),
          category: paperCategory._id,
          supplier: officeSupplier._id,
          unit: 'pack',
          costPrice: item.cost,
          sellingPrice: item.price,
          tax: 8,
          isActive: true,
          createdBy: admin._id,
        });
      });
    }

    // Furniture - Office Desks (10 products)
    const deskCategory = categories.find(c => c.slug === 'office-desks');
    const furnitureSupplier = suppliers.find(s => s.code === 'SUP003');
    if (deskCategory && furnitureSupplier) {
      const desks = [
        { name: 'L-Shaped Executive Desk', cost: 299, price: 499, desc: 'Large executive desk with drawers' },
        { name: 'Standing Desk Adjustable', cost: 349, price: 549, desc: 'Electric height-adjustable desk' },
        { name: 'Computer Desk with Hutch', cost: 199, price: 329, desc: 'Compact desk with storage' },
        { name: 'Writing Desk 48"', cost: 149, price: 249, desc: 'Simple writing desk' },
        { name: 'Corner Desk with Shelves', cost: 229, price: 379, desc: 'Space-saving corner desk' },
        { name: 'Executive Office Desk 60"', cost: 399, price: 649, desc: 'Premium executive desk' },
        { name: 'Mobile Standing Desk', cost: 179, price: 299, desc: 'Portable standing desk' },
        { name: 'Gaming Desk with LED', cost: 249, price: 399, desc: 'Gaming desk with RGB lighting' },
        { name: 'Reception Desk', cost: 599, price: 999, desc: 'Professional reception desk' },
        { name: 'Folding Desk', cost: 79, price: 129, desc: 'Space-saving folding desk' },
      ];

      desks.forEach(desk => {
        products.push({
          name: desk.name,
          description: desk.desc,
          sku: generateSKU('DSK', productIndex++),
          category: deskCategory._id,
          supplier: furnitureSupplier._id,
          unit: 'piece',
          costPrice: desk.cost,
          sellingPrice: desk.price,
          tax: 8,
          isActive: true,
          createdBy: admin._id,
        });
      });
    }

    // Office Chairs (10 products)
    const chairCategory = categories.find(c => c.slug === 'office-chairs');
    if (chairCategory && furnitureSupplier) {
      const chairs = [
        { name: 'Ergonomic Office Chair', cost: 149, price: 249, desc: 'Lumbar support office chair' },
        { name: 'Executive Leather Chair', cost: 299, price: 499, desc: 'High-back leather chair' },
        { name: 'Mesh Back Task Chair', cost: 99, price: 169, desc: 'Breathable mesh chair' },
        { name: 'Gaming Chair RGB', cost: 199, price: 329, desc: 'Racing-style gaming chair' },
        { name: 'Conference Room Chair', cost: 119, price: 199, desc: 'Stackable conference chair' },
        { name: 'Drafting Chair with Stool', cost: 159, price: 259, desc: 'Adjustable drafting chair' },
        { name: 'Kneeling Chair', cost: 129, price: 219, desc: 'Ergonomic kneeling chair' },
        { name: 'Executive Chair with Footrest', cost: 349, price: 579, desc: 'Reclining executive chair' },
        { name: 'Reception Guest Chair', cost: 79, price: 139, desc: 'Comfortable guest chair' },
        { name: 'Stool Chair Adjustable', cost: 59, price: 99, desc: 'Simple adjustable stool' },
      ];

      chairs.forEach(chair => {
        products.push({
          name: chair.name,
          description: chair.desc,
          sku: generateSKU('CHR', productIndex++),
          category: chairCategory._id,
          supplier: furnitureSupplier._id,
          unit: 'piece',
          costPrice: chair.cost,
          sellingPrice: chair.price,
          tax: 8,
          isActive: true,
          createdBy: admin._id,
        });
      });
    }

    // Safety Equipment (15 products)
    const safetyCategory = categories.find(c => c.slug === 'ppe');
    const safetySupplier = suppliers.find(s => s.code === 'SUP005');
    if (safetyCategory && safetySupplier) {
      const safetyItems = [
        { name: 'Hard Hat Yellow', cost: 12.99, price: 19.99, desc: 'ANSI approved hard hat' },
        { name: 'Safety Glasses Clear', cost: 5.99, price: 9.99, desc: 'Impact-resistant safety glasses' },
        { name: 'N95 Respirator Masks (Box of 20)', cost: 24.99, price: 39.99, desc: 'NIOSH approved respirators' },
        { name: 'Work Gloves (Pair)', cost: 8.99, price: 14.99, desc: 'Cut-resistant work gloves' },
        { name: 'Safety Vest High-Vis', cost: 9.99, price: 15.99, desc: 'Reflective safety vest' },
        { name: 'Ear Plugs (Box of 100)', cost: 14.99, price: 22.99, desc: 'Foam ear plugs' },
        { name: 'Ear Muffs Noise Canceling', cost: 19.99, price: 29.99, desc: 'Industrial ear muffs' },
        { name: 'Steel Toe Boots Size 10', cost: 79.99, price: 129.99, desc: 'Safety work boots' },
        { name: 'Face Shield Clear', cost: 14.99, price: 22.99, desc: 'Full face protection shield' },
        { name: 'Welding Helmet Auto-Darkening', cost: 49.99, price: 79.99, desc: 'Auto-darkening welding helmet' },
        { name: 'Fall Protection Harness', cost: 89.99, price: 149.99, desc: 'Full body safety harness' },
        { name: 'Fire Extinguisher 5lb', cost: 29.99, price: 49.99, desc: 'ABC fire extinguisher' },
        { name: 'First Aid Kit 100-Piece', cost: 19.99, price: 32.99, desc: 'Complete first aid kit' },
        { name: 'Safety Cones (Set of 4)', cost: 24.99, price: 39.99, desc: '28-inch traffic cones' },
        { name: 'Caution Tape 300ft', cost: 8.99, price: 14.99, desc: 'Yellow caution tape roll' },
      ];

      safetyItems.forEach(item => {
        products.push({
          name: item.name,
          description: item.desc,
          sku: generateSKU('SAF', productIndex++),
          category: safetyCategory._id,
          supplier: safetySupplier._id,
          unit: 'piece',
          costPrice: item.cost,
          sellingPrice: item.price,
          tax: 8,
          isActive: true,
          createdBy: admin._id,
        });
      });
    }

    // Cleaning Supplies (15 products)
    const cleaningCategory = categories.find(c => c.slug === 'cleaning-chemicals');
    const cleaningSupplier = suppliers.find(s => s.code === 'SUP006');
    if (cleaningCategory && cleaningSupplier) {
      const cleaningItems = [
        { name: 'All-Purpose Cleaner Gallon', cost: 8.99, price: 14.99, desc: 'Multi-surface cleaner' },
        { name: 'Glass Cleaner 32oz', cost: 4.99, price: 7.99, desc: 'Streak-free glass cleaner' },
        { name: 'Disinfectant Spray 19oz', cost: 6.99, price: 10.99, desc: 'EPA registered disinfectant' },
        { name: 'Floor Cleaner Gallon', cost: 9.99, price: 15.99, desc: 'No-rinse floor cleaner' },
        { name: 'Bleach Gallon', cost: 5.99, price: 8.99, desc: 'Concentrated bleach' },
        { name: 'Degreaser Industrial 32oz', cost: 11.99, price: 18.99, desc: 'Heavy-duty degreaser' },
        { name: 'Dish Soap Gallon', cost: 12.99, price: 19.99, desc: 'Commercial dish soap' },
        { name: 'Laundry Detergent 5L', cost: 14.99, price: 22.99, desc: 'HE laundry detergent' },
        { name: 'Toilet Bowl Cleaner 24oz', cost: 3.99, price: 6.99, desc: 'Acid-free toilet cleaner' },
        { name: 'Air Freshener Spray 10oz', cost: 4.99, price: 7.99, desc: 'Odor eliminating spray' },
        { name: 'Hand Soap Refill Gallon', cost: 13.99, price: 20.99, desc: 'Antibacterial hand soap' },
        { name: 'Furniture Polish 16oz', cost: 5.99, price: 9.99, desc: 'Wood furniture polish' },
        { name: 'Carpet Cleaner 128oz', cost: 15.99, price: 24.99, desc: 'Deep cleaning carpet solution' },
        { name: 'Stainless Steel Cleaner 17oz', cost: 6.99, price: 10.99, desc: 'Stainless steel polish' },
        { name: 'Oven Cleaner 24oz', cost: 7.99, price: 12.99, desc: 'Heavy-duty oven cleaner' },
      ];

      cleaningItems.forEach(item => {
        products.push({
          name: item.name,
          description: item.desc,
          sku: generateSKU('CLN', productIndex++),
          category: cleaningCategory._id,
          supplier: cleaningSupplier._id,
          unit: 'bottle',
          costPrice: item.cost,
          sellingPrice: item.price,
          tax: 8,
          isActive: true,
          createdBy: admin._id,
        });
      });
    }

    const createdProducts = await Product.insertMany(products);
    logger.info(`✓ Created ${createdProducts.length} products`);
  } catch (error) {
    logger.error('Error seeding products:', error);
    throw error;
  }
};

/**
 * Clear all products from the database
 */
export const clearProducts = async (): Promise<void> => {
  try {
    await Product.deleteMany({});
    logger.info('✓ Cleared all products');
  } catch (error) {
    logger.error('Error clearing products:', error);
    throw error;
  }
};

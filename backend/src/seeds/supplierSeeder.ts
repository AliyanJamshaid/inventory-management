/**
 * Supplier Seeder
 * Creates supplier companies with realistic data
 */

import Supplier from '../models_temp/Supplier';
import logger from '../utils/logger';

/**
 * Seed suppliers into the database
 */
export const seedSuppliers = async (): Promise<void> => {
  try {
    // Check if suppliers already exist
    const existingCount = await Supplier.countDocuments();
    if (existingCount > 0) {
      logger.info(`Suppliers already exist (${existingCount} found). Skipping supplier seeding.`);
      return;
    }

    const suppliers = [
      {
        name: 'TechGlobal Inc.',
        code: 'SUP001',
        email: 'sales@techglobal.com',
        phone: '+1-800-555-0101',
        website: 'www.techglobal.com',
        contactPerson: 'Michael Chen',
        address: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zipCode: '94102',
        taxId: 'TG-123456789',
        paymentTerms: 'Net 30',
        creditLimit: 100000,
        rating: 4.8,
        notes: 'Primary electronics supplier with excellent delivery times',
        isActive: true,
      },
      {
        name: 'Office Essentials Ltd.',
        code: 'SUP002',
        email: 'orders@officeessentials.com',
        phone: '+1-800-555-0102',
        website: 'www.officeessentials.com',
        contactPerson: 'Sarah Johnson',
        address: '456 Business Blvd',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        taxId: 'OE-987654321',
        paymentTerms: 'Net 45',
        creditLimit: 75000,
        rating: 4.5,
        notes: 'Reliable office supplies distributor',
        isActive: true,
      },
      {
        name: 'FurniCo Wholesale',
        code: 'SUP003',
        email: 'wholesale@furnico.com',
        phone: '+1-800-555-0103',
        website: 'www.furnico.com',
        contactPerson: 'David Martinez',
        address: '789 Furniture Ave',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        zipCode: '60601',
        taxId: 'FC-456789123',
        paymentTerms: 'Net 60',
        creditLimit: 150000,
        rating: 4.6,
        notes: 'Quality furniture manufacturer and distributor',
        isActive: true,
      },
      {
        name: 'Industrial Solutions Corp.',
        code: 'SUP004',
        email: 'info@industrialsolutions.com',
        phone: '+1-800-555-0104',
        website: 'www.industrialsolutions.com',
        contactPerson: 'Robert Wilson',
        address: '321 Industry Road',
        city: 'Houston',
        state: 'TX',
        country: 'USA',
        zipCode: '77001',
        taxId: 'IS-789123456',
        paymentTerms: 'Net 30',
        creditLimit: 200000,
        rating: 4.9,
        notes: 'Heavy machinery and industrial equipment specialist',
        isActive: true,
      },
      {
        name: 'SafetyFirst Equipment',
        code: 'SUP005',
        email: 'sales@safetyfirst.com',
        phone: '+1-800-555-0105',
        website: 'www.safetyfirst.com',
        contactPerson: 'Jennifer Lee',
        address: '654 Safety Lane',
        city: 'Boston',
        state: 'MA',
        country: 'USA',
        zipCode: '02101',
        taxId: 'SF-321654987',
        paymentTerms: 'Net 30',
        creditLimit: 80000,
        rating: 4.7,
        notes: 'Complete safety equipment and PPE provider',
        isActive: true,
      },
      {
        name: 'CleanPro Supplies',
        code: 'SUP006',
        email: 'orders@cleanpro.com',
        phone: '+1-800-555-0106',
        website: 'www.cleanpro.com',
        contactPerson: 'Amanda White',
        address: '987 Clean Street',
        city: 'Seattle',
        state: 'WA',
        country: 'USA',
        zipCode: '98101',
        taxId: 'CP-654987321',
        paymentTerms: 'Net 45',
        creditLimit: 60000,
        rating: 4.4,
        notes: 'Commercial cleaning supplies and janitorial products',
        isActive: true,
      },
      {
        name: 'MediSupply International',
        code: 'SUP007',
        email: 'medical@medisupply.com',
        phone: '+1-800-555-0107',
        website: 'www.medisupply.com',
        contactPerson: 'Dr. James Brown',
        address: '147 Medical Center Dr',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
        zipCode: '33101',
        taxId: 'MS-147258369',
        paymentTerms: 'Net 30',
        creditLimit: 120000,
        rating: 4.8,
        notes: 'Certified medical equipment and supplies',
        isActive: true,
      },
      {
        name: 'GlobalTrade Partners',
        code: 'SUP008',
        email: 'trade@globaltrade.com',
        phone: '+1-800-555-0108',
        website: 'www.globaltrade.com',
        contactPerson: 'Maria Garcia',
        address: '258 Trade Plaza',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        zipCode: '90001',
        taxId: 'GT-258369147',
        paymentTerms: 'Net 60',
        creditLimit: 180000,
        rating: 4.5,
        notes: 'International import/export trading company',
        isActive: true,
      },
      {
        name: 'EcoGreen Products',
        code: 'SUP009',
        email: 'eco@ecogreen.com',
        phone: '+1-800-555-0109',
        website: 'www.ecogreen.com',
        contactPerson: 'Thomas Green',
        address: '369 Eco Way',
        city: 'Portland',
        state: 'OR',
        country: 'USA',
        zipCode: '97201',
        taxId: 'EG-369147258',
        paymentTerms: 'Net 30',
        creditLimit: 70000,
        rating: 4.6,
        notes: 'Sustainable and eco-friendly product supplier',
        isActive: true,
      },
      {
        name: 'Pacific Wholesale Group',
        code: 'SUP010',
        email: 'wholesale@pacificgroup.com',
        phone: '+1-800-555-0110',
        website: 'www.pacificgroup.com',
        contactPerson: 'Linda Taylor',
        address: '741 Pacific Ave',
        city: 'San Diego',
        state: 'CA',
        country: 'USA',
        zipCode: '92101',
        taxId: 'PW-741852963',
        paymentTerms: 'Net 45',
        creditLimit: 90000,
        rating: 4.3,
        notes: 'Diverse product range and competitive pricing',
        isActive: true,
      },
      {
        name: 'Eastern Distribution Inc.',
        code: 'SUP011',
        email: 'distribution@eastern.com',
        phone: '+1-800-555-0111',
        website: 'www.eastern.com',
        contactPerson: 'Kevin Anderson',
        address: '852 Eastern Pkwy',
        city: 'Philadelphia',
        state: 'PA',
        country: 'USA',
        zipCode: '19101',
        taxId: 'ED-852963741',
        paymentTerms: 'Net 30',
        creditLimit: 110000,
        rating: 4.7,
        notes: 'Fast delivery and excellent customer service',
        isActive: true,
      },
      {
        name: 'Prime Tech Solutions',
        code: 'SUP012',
        email: 'prime@primetech.com',
        phone: '+1-800-555-0112',
        website: 'www.primetech.com',
        contactPerson: 'Brian Kim',
        address: '963 Tech Center',
        city: 'Austin',
        state: 'TX',
        country: 'USA',
        zipCode: '78701',
        taxId: 'PT-963741852',
        paymentTerms: 'Net 30',
        creditLimit: 95000,
        rating: 4.6,
        notes: 'Cutting-edge technology products and solutions',
        isActive: true,
      },
    ];

    const createdSuppliers = await Supplier.insertMany(suppliers);
    logger.info(`✓ Created ${createdSuppliers.length} suppliers`);
  } catch (error) {
    logger.error('Error seeding suppliers:', error);
    throw error;
  }
};

/**
 * Clear all suppliers from the database
 */
export const clearSuppliers = async (): Promise<void> => {
  try {
    await Supplier.deleteMany({});
    logger.info('✓ Cleared all suppliers');
  } catch (error) {
    logger.error('Error clearing suppliers:', error);
    throw error;
  }
};

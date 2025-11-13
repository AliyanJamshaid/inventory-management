# Database Seed Scripts

Comprehensive database seeding system for the Inventory Management application. Populates the database with realistic sample data for development and testing.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Seed Scripts](#seed-scripts)
- [Data Summary](#data-summary)
- [Test Credentials](#test-credentials)
- [Usage Examples](#usage-examples)
- [Seeding Order](#seeding-order)
- [Best Practices](#best-practices)

## Overview

The seeding system creates a complete, realistic dataset including:
- User accounts with different roles
- Role-based permissions
- Hierarchical product categories
- Suppliers and warehouses
- 100+ products with variants
- Stock distributed across warehouses
- Customer accounts (B2B and B2C)
- Purchase and sales orders
- Invoices and payments
- Stock transactions
- System notifications
- Application settings

## Quick Start

### Run All Seeds

```bash
# Run all seeders in sequence
npm run seed
```

### Fresh Database Seed

```bash
# Drop all collections and reseed (requires --confirm)
npm run seed:fresh
```

### Drop Database Only

```bash
# Drop all collections (requires --confirm flag)
npm run db:drop -- --confirm
```

## Seed Scripts

### 1. userSeeder.ts

Creates 5 user accounts with different roles:

- **Admin User**: Full system access
- **Manager**: Manage inventory and orders
- **Staff 1 & 2**: Create/edit products and orders
- **Viewer**: Read-only access

**File:** `src/seeds/userSeeder.ts`

### 2. roleSeeder.ts

Creates roles with appropriate permissions:

- **ADMIN**: All permissions (full access)
- **MANAGER**: Manage inventory, orders, customers, suppliers
- **STAFF**: Create/edit products, manage orders
- **VIEWER**: Read-only access to all resources

Also creates 20+ permission entries covering all resources.

**File:** `src/seeds/roleSeeder.ts`

### 3. categorySeeder.ts

Creates hierarchical product categories:

**Parent Categories (8):**
- Electronics
- Office Supplies
- Furniture
- Industrial Equipment
- Safety Equipment
- Cleaning Supplies
- Food & Beverages
- Medical Supplies

**Subcategories (24+):**
Each parent category has 2-5 subcategories for detailed organization.

**File:** `src/seeds/categorySeeder.ts`

### 4. supplierSeeder.ts

Creates 12 suppliers with realistic data:

- Company names and codes
- Contact information (email, phone, contact person)
- Complete addresses
- Payment terms (Net 30, 45, 60)
- Credit limits
- Supplier ratings (4.3 - 4.9)
- Tax IDs

**File:** `src/seeds/supplierSeeder.ts`

### 5. warehouseSeeder.ts

Creates 3 warehouses with storage locations:

**Warehouses:**
1. Main Warehouse (Dallas, TX)
2. East Coast Distribution Center (Newark, NJ)
3. West Coast Fulfillment Center (Oakland, CA)

**Storage Locations per Warehouse:**
- 5 Aisles (with 10 shelves each)
- 20 Bins
- 8 Racks
- 5 Floor locations
- 10 Pallet locations

**Total:** 500+ storage locations

**File:** `src/seeds/warehouseSeeder.ts`

### 6. productSeeder.ts

Creates 100+ products across categories:

- **Laptops (15)**: Dell, HP, Lenovo, ASUS, Apple, etc.
- **Monitors (12)**: Various sizes and brands
- **Writing Instruments (15)**: Pens, pencils, markers
- **Paper Products (12)**: Copy paper, notebooks, sticky notes
- **Office Desks (10)**: Various desk types
- **Office Chairs (10)**: Ergonomic, executive, gaming
- **Safety Equipment (15)**: PPE, safety gear
- **Cleaning Supplies (15)**: Chemicals and tools

Each product includes:
- Unique SKU
- Cost and selling prices
- Category assignment
- Supplier linkage
- Tax rates
- Images (placeholders)

**File:** `src/seeds/productSeeder.ts`

### 7. stockSeeder.ts

Creates stock records for all products:

- Distributed across 3 warehouses
- Multiple storage locations
- Batch numbers
- Various stock levels
- ~7% low stock items (below reorder point)
- ~5% items with expiration dates
- Reserved quantities for active orders
- Last stock take dates

**Total:** 300+ stock records

**File:** `src/seeds/stockSeeder.ts`

### 8. customerSeeder.ts

Creates 22 customers:

**B2B Customers (10):**
- Companies with credit accounts
- Credit limits ($40k - $150k)
- Payment terms (Net 30-60)
- Loyalty points
- Tax IDs

**B2C Customers (12):**
- Individual customers
- Lower credit limits ($2k - $5k)
- Due on receipt payment terms
- Loyalty points

**File:** `src/seeds/customerSeeder.ts`

### 9. purchaseOrderSeeder.ts

Creates 25 purchase orders:

**Status Distribution:**
- DRAFT (5%)
- PENDING (10%)
- APPROVED (10%)
- RECEIVED (60%)
- CANCELLED (15%)

**Features:**
- Order dates within last 180 days
- Multiple items per order (3-8 products)
- Calculated totals (subtotal, tax, shipping)
- Expected and actual delivery dates
- Approval tracking

**File:** `src/seeds/purchaseOrderSeeder.ts`

### 10. salesOrderSeeder.ts

Creates 35 sales orders:

**Status Distribution:**
- DRAFT (5%)
- CONFIRMED (10%)
- PROCESSING (10%)
- SHIPPED (15%)
- DELIVERED (45%)
- CANCELLED (15%)

**Features:**
- Multiple items per order (2-6 products)
- Discounts on 30% of items
- Shipping addresses
- Tracking numbers for shipped orders
- Payment tracking (paid/partial/unpaid)

**File:** `src/seeds/salesOrderSeeder.ts`

### 11. invoiceSeeder.ts

Creates invoices for eligible sales orders:

**Status Distribution:**
- DRAFT
- SENT
- PAID
- OVERDUE
- CANCELLED

**Payment Status:**
- PENDING
- PARTIAL
- PAID

Also creates payment records for paid invoices using various methods:
- Credit Card
- Bank Transfer
- Cash
- Check

**File:** `src/seeds/invoiceSeeder.ts`

### 12. transactionSeeder.ts

Creates 60 stock transactions over 180 days:

**Transaction Types:**
- IN (35%): Stock received from purchases
- OUT (35%): Stock shipped for sales
- TRANSFER (15%): Inter-warehouse transfers
- ADJUSTMENT (15%): Damaged, lost, expired, returns

Each transaction includes:
- Product and warehouse
- Quantity
- Reason codes
- Reference numbers
- Batch/serial numbers
- Performed by user
- Transaction date and notes

**File:** `src/seeds/transactionSeeder.ts`

### 13. notificationSeeder.ts

Creates various notifications for users:

**Notification Types:**
- LOW_STOCK: Alerts for items below reorder point
- EXPIRING_SOON: Items expiring within 30 days
- ORDER_STATUS: Order confirmations and updates
- PAYMENT_RECEIVED: Payment notifications
- STOCK_ADJUSTMENT: Inventory adjustment alerts
- SYSTEM_ALERT: System maintenance and updates

**Features:**
- Targeted to appropriate user roles
- Mix of read/unread notifications
- Created over last 45 days

**File:** `src/seeds/notificationSeeder.ts`

### 14. settingsSeeder.ts

Creates system-wide settings:

**Categories:**
- Company Information
- Regional Settings (currency, timezone, date format)
- Tax Settings
- Inventory Settings (tracking, alerts, thresholds)
- Order Settings (prefixes, approval, auto-invoice)
- Notification Settings
- Email Configuration
- Security Settings (passwords, 2FA, sessions)
- Display Preferences
- Barcode Settings
- Backup Settings
- API Configuration

**File:** `src/seeds/settingsSeeder.ts`

## Data Summary

### Total Records Created

| Collection | Count | Description |
|------------|-------|-------------|
| Users | 5 | Admin, Manager, Staff (2), Viewer |
| Roles | 4 | ADMIN, MANAGER, STAFF, VIEWER |
| Permissions | 20+ | Resource-based permissions |
| Categories | 32+ | 8 parent + 24 subcategories |
| Suppliers | 12 | Various supplier companies |
| Warehouses | 3 | With storage locations |
| Stock Locations | 500+ | Aisles, shelves, bins, racks, etc. |
| Products | 100+ | Across all categories |
| Stock Records | 300+ | Distributed stock |
| Customers | 22 | 10 B2B + 12 B2C |
| Purchase Orders | 25 | Various statuses |
| Sales Orders | 35 | Various statuses |
| Invoices | 35+ | With payment records |
| Payments | 25+ | Various payment methods |
| Stock Transactions | 60 | Last 180 days |
| Notifications | 100+ | Various types |
| Settings | 1 | System configuration |

**Total: 1,200+ records**

## Test Credentials

### Admin User
```
Email: admin@example.com
Password: admin123
Role: ADMIN
Access: Full system access
```

### Manager
```
Email: manager@example.com
Password: manager123
Role: MANAGER
Access: Manage inventory, orders, reports
```

### Staff User 1
```
Email: staff1@example.com
Password: staff123
Role: STAFF
Access: Create/edit products, manage orders
```

### Staff User 2
```
Email: staff2@example.com
Password: staff123
Role: STAFF
Access: Create/edit products, manage orders
```

### Viewer
```
Email: viewer@example.com
Password: viewer123
Role: VIEWER
Access: Read-only access
```

## Usage Examples

### Basic Seeding

```bash
# Run all seeders
npm run seed
```

### Fresh Start

```bash
# Drop all data and reseed
npm run seed:fresh
```

### Drop Database

```bash
# Drop without confirmation (will prompt for --confirm flag)
npm run db:drop

# Drop with confirmation
npm run db:drop -- --confirm
```

### Custom Seeding (Direct TypeScript)

```bash
# Run specific seeder directly
ts-node src/seeds/userSeeder.ts

# Run main orchestrator
ts-node src/seeds/index.ts

# Drop database
ts-node src/seeds/drop.ts --confirm
```

## Seeding Order

The seeders run in this specific order to maintain referential integrity:

1. **Users** - Required by most other collections
2. **Roles & Permissions** - User authorization
3. **Categories** - Product organization
4. **Suppliers** - Product suppliers
5. **Warehouses & Locations** - Storage setup
6. **Products** - Inventory items
7. **Stock** - Product quantities and locations
8. **Customers** - Buyers
9. **Purchase Orders** - Supplier orders
10. **Sales Orders** - Customer orders
11. **Invoices & Payments** - Billing
12. **Stock Transactions** - Inventory movements
13. **Notifications** - User alerts
14. **Settings** - System configuration

## Best Practices

### When to Seed

- **First time setup**: Run seeds to populate initial data
- **After schema changes**: Use `seed:fresh` to rebuild database
- **Testing**: Seed before running integration tests
- **Demo preparation**: Create consistent demo data

### Data Consistency

- Seeds are **idempotent**: Can run multiple times safely
- Existing data check prevents duplicates
- Foreign key relationships maintained automatically
- Timestamps reflect realistic time ranges

### Development Workflow

```bash
# 1. Make schema changes to models
# 2. Drop and reseed database
npm run seed:fresh

# 3. Start development server
npm run dev

# 4. Test with seeded data
```

### Production Warning

⚠️ **Never run seeds in production!**

Seeds are for development and testing only. They will:
- Create test accounts with weak passwords
- Generate sample data
- Potentially overwrite existing data

### Customization

To customize seed data:

1. Edit individual seeder files in `src/seeds/`
2. Modify data arrays and generation logic
3. Adjust quantities and distributions
4. Run `npm run seed:fresh` to see changes

### Troubleshooting

**Seeding fails with connection error:**
```bash
# Check MongoDB is running
# Verify .env configuration
# Check DATABASE_URL in .env
```

**Duplicate key errors:**
```bash
# Drop database and reseed
npm run seed:fresh
```

**Missing dependencies:**
```bash
# Install dependencies
npm install
```

## Environment Variables

Required environment variables for seeding:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/inventory-management

# JWT Secrets (for user creation)
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Optional
NODE_ENV=development
```

## File Structure

```
src/seeds/
├── index.ts                    # Main orchestrator
├── drop.ts                     # Database drop utility
├── userSeeder.ts              # User accounts
├── roleSeeder.ts              # Roles & permissions
├── categorySeeder.ts          # Product categories
├── supplierSeeder.ts          # Supplier companies
├── warehouseSeeder.ts         # Warehouses & locations
├── productSeeder.ts           # Products
├── stockSeeder.ts             # Stock records
├── customerSeeder.ts          # Customer accounts
├── purchaseOrderSeeder.ts     # Purchase orders
├── salesOrderSeeder.ts        # Sales orders
├── invoiceSeeder.ts           # Invoices & payments
├── transactionSeeder.ts       # Stock transactions
├── notificationSeeder.ts      # User notifications
├── settingsSeeder.ts          # System settings
└── README.md                  # This file
```

## Support

For issues or questions:
1. Check the console output for error messages
2. Verify MongoDB connection
3. Ensure all dependencies are installed
4. Review individual seeder files for details

## License

Part of the Inventory Management System - Enterprise Edition

# 🚀 Quick Start Guide - Inventory Management System

Get your complete inventory management system running in **5 minutes**!

## Prerequisites

Before you begin, ensure you have:
- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** (for version control)

## 📦 One-Command Setup

```bash
# 1. Clone the repository (if not already cloned)
git clone <your-repo-url>
cd inventory-management

# 2. Install all dependencies
npm install

# 3. Start MongoDB with Docker
npm run db:up

# 4. Set up environment variables
cp .env.example .env
# Edit .env and add your secrets (see below)

# 5. Install backend dependencies
cd backend && npm install

# 6. Install frontend dependencies
cd ../frontend && npm install

# 7. Seed the database with sample data
cd ../backend && npm run seed

# 8. Start both frontend and backend
cd .. && npm run dev
```

That's it! Your application is now running! 🎉

---

## 🔑 Environment Variables Setup

### Generate JWT Secrets

```bash
# Generate a secure JWT secret (copy output to .env)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Update `.env` File

```env
# Application
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://admin:admin123@localhost:27017/inventory_management?authSource=admin

# JWT Secrets (use the generated secrets above!)
JWT_SECRET=your-generated-secret-here
JWT_REFRESH_SECRET=your-generated-refresh-secret-here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Update Frontend `.env.local`

```bash
cd frontend
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## 🌐 Access Your Application

Once everything is running:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | See test accounts below |
| **Backend API** | http://localhost:5000/api | - |
| **API Documentation** | http://localhost:5000/api-docs | - |
| **MongoDB UI** | http://localhost:8081 | admin / admin123 |

---

## 👥 Test Accounts

The seed script creates these accounts for testing:

### Admin Account
```
Email: admin@example.com
Password: admin123
Role: Full system access
```

### Manager Account
```
Email: manager@example.com
Password: manager123
Role: Manage inventory, approve orders
```

### Staff Account
```
Email: staff1@example.com
Password: staff123
Role: Create/edit products, process orders
```

### Viewer Account
```
Email: viewer@example.com
Password: viewer123
Role: Read-only access
```

---

## 📊 Sample Data

The seed script creates:
- ✅ 5 Users (different roles)
- ✅ 100+ Products across 32 categories
- ✅ 12 Suppliers
- ✅ 22 Customers (B2B & B2C)
- ✅ 3 Warehouses with 500+ storage locations
- ✅ 300+ Stock records
- ✅ 25 Purchase Orders
- ✅ 35 Sales Orders
- ✅ 35+ Invoices with payments
- ✅ 60 Stock Transactions
- ✅ 100+ Notifications

**Total: 1,200+ realistic database records!**

---

## 🛠️ Available Scripts

### Root Commands

```bash
npm run dev              # Start both frontend and backend
npm run dev:backend      # Start backend only (port 5000)
npm run dev:frontend     # Start frontend only (port 3000)
npm run build            # Build both for production
npm run lint             # Lint all code
npm run format           # Format all code with Prettier
```

### Database Commands

```bash
npm run db:up            # Start MongoDB + Mongo Express
npm run db:down          # Stop database services
npm run db:logs          # View MongoDB logs
npm run db:seed          # Seed database (from backend)
npm run db:reset         # Drop and reseed database
```

### Backend Commands (in /backend)

```bash
cd backend
npm run dev              # Start with hot reload
npm run build            # Compile TypeScript
npm start                # Run production build
npm run seed             # Seed database
npm run lint             # Lint code
npm run format           # Format code
```

### Frontend Commands (in /frontend)

```bash
cd frontend
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Lint code
npm run format           # Format code
```

---

## 🎯 Feature Tour

### Dashboard (http://localhost:3000)
- 📊 Real-time analytics and charts
- 📈 Revenue trends
- 🎯 Top selling products
- ⚠️ Low stock alerts
- 📝 Recent activity feed

### Products (http://localhost:3000/products)
- ➕ Add/Edit/Delete products
- 🔍 Search and advanced filtering
- 📑 Table and grid views
- 💰 Profit margin calculator
- 📦 Variant management
- 📊 Stock levels by warehouse

### Inventory (http://localhost:3000/inventory)
- 📦 Stock overview
- ⚖️ Adjust stock quantities
- 🔄 Transfer between warehouses
- ⚠️ Low stock alerts
- 📅 Expiring items tracking
- 📜 Transaction history

### Suppliers (http://localhost:3000/suppliers)
- 🏢 Supplier management
- ⭐ Rating system
- 📊 Performance metrics
- 📧 Email PO to suppliers

### Purchase Orders (http://localhost:3000/purchase-orders)
- 📋 Create multi-item POs
- ✅ Approval workflow
- 📥 Receive goods
- 🔔 Overdue tracking

### Customers (http://localhost:3000/customers)
- 👥 B2B and B2C customers
- 💳 Credit limit tracking
- 🎁 Loyalty points system
- 📊 Purchase history

### Sales Orders (http://localhost:3000/sales-orders)
- 🛒 Order management
- 📦 Status workflow (Draft → Delivered)
- 📧 Email invoices
- 💰 Payment tracking

### Reports (http://localhost:3000/reports)
- 📊 Stock valuation
- 📈 Sales summary
- 💵 Profit & loss
- 📥 Export to CSV

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Problem:** Can't connect to MongoDB

**Solution:**
```bash
# Check if Docker is running
docker ps

# If MongoDB is not running:
npm run db:up

# Check MongoDB logs
npm run db:logs
```

### Port Already in Use

**Problem:** Port 3000 or 5000 already in use

**Solution:**
```bash
# Find process using port
lsof -i :3000  # or :5000

# Kill the process
kill -9 <PID>

# Or change port in .env (backend) or next.config.js (frontend)
```

### Dependencies Issues

**Problem:** Module not found errors

**Solution:**
```bash
# Clean install
rm -rf node_modules backend/node_modules frontend/node_modules
rm package-lock.json backend/package-lock.json frontend/package-lock.json

# Reinstall
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Seed Script Fails

**Problem:** Error running seed script

**Solution:**
```bash
# Make sure MongoDB is running
npm run db:up

# Drop database and try again
cd backend
npm run db:drop -- --confirm
npm run seed
```

### JWT Errors

**Problem:** Invalid token errors

**Solution:**
- Make sure you generated strong JWT secrets
- Check that `.env` has JWT_SECRET and JWT_REFRESH_SECRET
- Clear browser localStorage and login again

---

## 🧪 Testing the Application

### 1. Test Authentication

```bash
# Register a new user (API test)
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "confirmPassword": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Or use the UI: http://localhost:3000/register
```

### 2. Test Product Management

1. Login with admin@example.com / admin123
2. Navigate to Products
3. Click "Add Product"
4. Fill the form and submit
5. View product details
6. Edit and delete

### 3. Test Inventory Operations

1. Go to Inventory page
2. Click "Adjust Stock" on any product
3. Add 100 units
4. Go to Warehouses and select a warehouse
5. Transfer stock between warehouses
6. View transaction history

### 4. Test Order Workflow

1. Go to Sales Orders
2. Create new order
3. Select customer and add items
4. Confirm → Process → Ship → Deliver
5. Generate invoice
6. Record payment

---

## 📚 Learn More

- **Full Documentation:** See [README.md](./README.md)
- **Detailed Setup:** See [SETUP.md](./SETUP.md)
- **Features List:** See [FEATURES.md](./FEATURES.md)
- **Tech Stack:** See [TECH_STACK.md](./TECH_STACK.md)
- **API Documentation:** http://localhost:5000/api-docs (when running)
- **Backend Auth Guide:** [backend/AUTHENTICATION_API.md](./backend/AUTHENTICATION_API.md)

---

## 🎓 Next Steps

1. **Explore the UI:** Login and try all features
2. **Read API Docs:** Visit http://localhost:5000/api-docs
3. **Customize:** Modify to fit your needs
4. **Add Features:** Extend with additional functionality
5. **Deploy:** Follow deployment guides when ready

---

## 💡 Pro Tips

- **Auto-Refresh:** Dashboard auto-refreshes every 30s
- **Keyboard Shortcuts:** Use Tab to navigate forms quickly
- **CSV Export:** Export data from any list page
- **Search:** Use search with filters for powerful queries
- **Dark Mode:** Toggle in settings (coming soon)
- **Bulk Operations:** Select multiple items for bulk actions

---

## 🆘 Need Help?

- Check [SETUP.md](./SETUP.md) for detailed setup instructions
- Review [TROUBLESHOOTING.md](./SETUP.md#troubleshooting) section
- Check MongoDB logs: `npm run db:logs`
- Check backend logs: Look in `backend/logs/` directory

---

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Node.js >= 18.0.0 installed (`node --version`)
- [ ] Docker Desktop is running (`docker ps`)
- [ ] MongoDB container is running (`docker ps | grep mongo`)
- [ ] Environment variables are set (`.env` and `.env.local`)
- [ ] Dependencies installed (`npm install` in root, backend, frontend)
- [ ] Database seeded (`npm run db:seed`)
- [ ] No port conflicts (5000, 3000, 27017, 8081)
- [ ] JWT secrets are strong random strings

---

**You're all set! Enjoy your inventory management system! 🚀**

Need advanced features? Check the full documentation in the project root.

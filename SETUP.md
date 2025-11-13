# Detailed Setup Guide

This guide provides comprehensive instructions for setting up the Inventory Management System on your local machine.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Methods](#installation-methods)
  - [Method 1: Docker Setup (Recommended)](#method-1-docker-setup-recommended)
  - [Method 2: Manual Setup](#method-2-manual-setup)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Common Issues](#common-issues)
- [Advanced Configuration](#advanced-configuration)

## Prerequisites

### Required Software

1. **Node.js** (version 18.0.0 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation:
     ```bash
     node --version  # Should output v18.0.0 or higher
     npm --version   # Should output 9.0.0 or higher
     ```

2. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation:
     ```bash
     git --version
     ```

### Optional (but Recommended)

3. **Docker Desktop**
   - Download from [docker.com](https://www.docker.com/products/docker-desktop)
   - Required for running MongoDB with Docker Compose
   - Verify installation:
     ```bash
     docker --version
     docker-compose --version
     ```

4. **VS Code** (Recommended IDE)
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)
   - Install recommended extensions (see `.vscode/extensions.json`)

### System Requirements

- **OS**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: 2GB free space
- **Internet**: Required for initial setup

## Installation Methods

### Method 1: Docker Setup (Recommended)

This method uses Docker for the database, making setup easier and more consistent.

#### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd inventory-management
```

#### Step 2: Install Dependencies

```bash
npm install
```

This will install dependencies for the root workspace and all child workspaces (frontend and backend).

#### Step 3: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your preferred editor
nano .env  # or vim, code, etc.
```

**Minimum required changes:**
- Keep default values for Docker setup
- Generate secure JWT_SECRET (see instructions below)

#### Step 4: Generate Secure Keys

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the generated values to your .env file
```

#### Step 5: Start Docker Services

```bash
# Start MongoDB and Mongo Express
npm run db:up

# Verify services are running
docker ps
```

You should see:
- `inventory-mongodb` (MongoDB database)
- `inventory-mongo-express` (Database UI)

#### Step 6: Seed the Database (Optional)

```bash
# Populate database with sample data
npm run db:seed
```

This creates:
- Sample users (admin, manager, staff)
- Product categories
- Sample products
- Sample suppliers

#### Step 7: Start Development Servers

```bash
# Start both frontend and backend
npm run dev
```

Or start them separately:

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

#### Step 8: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Mongo Express**: http://localhost:8081
  - Username: `admin`
  - Password: `admin123`

### Method 2: Manual Setup

This method requires you to install and configure MongoDB manually.

#### Step 1: Install MongoDB

**On macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**On Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**On Windows:**
- Download installer from [mongodb.com](https://www.mongodb.com/try/download/community)
- Run installer and follow the wizard
- MongoDB will start automatically as a Windows service

#### Step 2: Verify MongoDB Installation

```bash
# Check if MongoDB is running
mongosh

# In the MongoDB shell:
show dbs
exit
```

#### Step 3: Clone and Install

```bash
git clone <repository-url>
cd inventory-management
npm install
```

#### Step 4: Configure Environment

```bash
cp .env.example .env
```

Update MongoDB connection string in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/inventory_db
```

Generate secure keys and update `.env`:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Step 5: Create MongoDB Database and User

```bash
mongosh

# In MongoDB shell:
use admin
db.createUser({
  user: "admin",
  pwd: "password123",
  roles: ["root"]
})

use inventory_db
db.createCollection("users")
exit
```

#### Step 6: Seed Database (Optional)

```bash
npm run db:seed
```

#### Step 7: Start Application

```bash
npm run dev
```

## Configuration

### Environment Variables

The application uses environment variables for configuration. Here are the most important ones:

#### Application Settings

```env
NODE_ENV=development          # Environment (development/production)
BACKEND_PORT=5000            # Backend server port
FRONTEND_PORT=3000           # Frontend server port
```

#### Database Settings

```env
# For Docker setup
MONGODB_URI=mongodb://admin:password123@localhost:27017/inventory_db?authSource=admin

# For manual setup
MONGODB_URI=mongodb://localhost:27017/inventory_db

MONGO_ROOT_USERNAME=admin    # MongoDB admin username
MONGO_ROOT_PASSWORD=password123  # MongoDB admin password
MONGO_DB_NAME=inventory_db   # Database name
```

#### Security Settings

```env
JWT_SECRET=your-generated-secret-key-here
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-session-secret-here
```

#### CORS Settings

```env
CORS_ORIGIN=http://localhost:3000,http://localhost:5000
```

#### Frontend API Configuration

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Workspace Configuration

The project uses npm workspaces (monorepo structure):

```json
{
  "workspaces": [
    "frontend",
    "backend"
  ]
}
```

This allows you to:
- Manage all dependencies from the root
- Run scripts in specific workspaces
- Share common configurations

## Database Setup

### Using Docker (Recommended)

```bash
# Start database
npm run db:up

# Stop database
npm run db:down

# View database logs
npm run db:logs

# Restart database
npm run docker:restart
```

### Accessing the Database

#### Via Mongo Express (Web UI)

1. Open http://localhost:8081
2. Login with credentials from `.env`:
   - Username: `admin`
   - Password: `admin123`
3. Select `inventory_db` database
4. Browse collections and documents

#### Via MongoDB Shell

```bash
# Connect to database
mongosh mongodb://admin:password123@localhost:27017/inventory_db?authSource=admin

# Common commands
show dbs                     # List all databases
use inventory_db             # Switch to inventory database
show collections             # List all collections
db.products.find()           # Query products
db.users.countDocuments()    # Count users
```

#### Via MongoDB Compass (GUI Client)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect with URI: `mongodb://admin:password123@localhost:27017/inventory_db?authSource=admin`
3. Browse and manage data visually

### Database Seeding

```bash
# Seed database with sample data
npm run db:seed

# Reset database (WARNING: Deletes all data)
npm run db:reset
```

**Seeded Data Includes:**

- **Users**:
  - Admin: `admin@example.com` / `password123`
  - Manager: `manager@example.com` / `password123`
  - Staff: `staff@example.com` / `password123`

- **Categories**: Electronics, Furniture, Clothing, etc.
- **Products**: 50+ sample products with stock levels
- **Suppliers**: 10+ sample suppliers

## Running the Application

### Development Mode

```bash
# Start everything (recommended)
npm run dev

# Or start individually
npm run dev:backend    # Backend only (port 5000)
npm run dev:frontend   # Frontend only (port 3000)
```

**Features in Development Mode:**
- Hot module replacement (HMR)
- Automatic server restart on file changes
- Source maps for debugging
- Detailed error messages

### Production Mode

```bash
# Build for production
npm run build

# Start production servers
cd backend && npm start
cd frontend && npm start
```

### Accessing Services

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | See seeded users |
| Backend API | http://localhost:5000/api | JWT token required |
| API Docs | http://localhost:5000/api/docs | None |
| Mongo Express | http://localhost:8081 | admin / admin123 |

## Development Workflow

### Code Quality Tools

#### Linting

```bash
# Run ESLint on all code
npm run lint

# Lint specific workspace
npm run lint --workspace=frontend
npm run lint --workspace=backend

# Auto-fix issues
npm run lint -- --fix
```

#### Formatting

```bash
# Format all code
npm run format

# Check formatting without changes
npm run format:check
```

#### Type Checking

```bash
# Check TypeScript types
npm run type-check

# Watch mode
npm run type-check -- --watch
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### Recommended Workflow

1. Create a feature branch
2. Make your changes
3. Run tests: `npm run test`
4. Check types: `npm run type-check`
5. Lint code: `npm run lint`
6. Format code: `npm run format`
7. Commit changes with descriptive message
8. Push and create pull request

### VS Code Setup

1. Open the project in VS Code
2. Install recommended extensions (when prompted)
3. Extensions will be listed from `.vscode/extensions.json`
4. Restart VS Code after installing extensions

**Key Extensions:**
- ESLint
- Prettier
- TypeScript
- MongoDB for VS Code
- Docker

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run frontend tests
npm run test --workspace=frontend

# Run backend tests
npm run test --workspace=backend

# Watch mode
npm run test -- --watch

# Coverage report
npm run test -- --coverage
```

### Writing Tests

- Place test files next to source files with `.test.ts` or `.spec.ts` extension
- Use Jest for unit and integration tests
- Use React Testing Library for component tests
- Use Supertest for API endpoint tests

## Common Issues

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find and kill process using the port
lsof -ti:3000 | xargs kill -9  # macOS/Linux
# OR change port in .env file
BACKEND_PORT=5001
FRONTEND_PORT=3001
```

### Cannot Connect to MongoDB

**Error**: `MongoServerError: Authentication failed`

**Solution**:
```bash
# Restart Docker containers
npm run db:down
npm run db:up

# Or check credentials in .env match docker-compose.yml
```

### Module Not Found

**Error**: `Cannot find module '@/components/...'`

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json
npm install
```

### Docker Container Won't Start

**Error**: `Cannot start service mongodb`

**Solution**:
```bash
# Check Docker is running
docker ps

# Remove old volumes and restart
docker-compose down -v
docker-compose up -d

# Check logs
docker logs inventory-mongodb
```

### TypeScript Errors

**Error**: `Property 'x' does not exist on type 'y'`

**Solution**:
```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Or check tsconfig.json is correctly configured
npm run type-check
```

### Build Errors

**Error**: Various build errors

**Solution**:
```bash
# Clear all caches and rebuild
rm -rf .next dist build node_modules
npm install
npm run build
```

## Advanced Configuration

### Custom Ports

Edit `.env`:
```env
BACKEND_PORT=8000
FRONTEND_PORT=4000
```

Update CORS settings:
```env
CORS_ORIGIN=http://localhost:4000
```

### Production Database

For production, use a managed MongoDB service:

1. **MongoDB Atlas** (Recommended)
   - Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Get connection string
   - Update `.env`:
     ```env
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory_db
     ```

2. **Other Providers**
   - AWS DocumentDB
   - Azure Cosmos DB
   - DigitalOcean Managed MongoDB

### Redis Cache (Optional)

To enable Redis for caching:

1. Add Redis to `docker-compose.yml`:
   ```yaml
   redis:
     image: redis:7-alpine
     ports:
       - "6379:6379"
   ```

2. Update `.env`:
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

3. Install Redis client:
   ```bash
   npm install redis --workspace=backend
   ```

### Email Configuration

To enable email notifications:

Update `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@inventory-system.com
```

For Gmail:
1. Enable 2FA on your Google account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the app password in `SMTP_PASS`

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev:backend"],
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Frontend",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev:frontend"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

## Next Steps

After successful setup:

1. Explore the application at http://localhost:3000
2. Login with seeded user credentials
3. Check API documentation at http://localhost:5000/api/docs
4. Review the codebase structure
5. Read [CONTRIBUTING.md](CONTRIBUTING.md) to start contributing
6. Check [FEATURES.md](FEATURES.md) for feature roadmap

## Getting Help

- Check [README.md](README.md) for quick reference
- Search [existing issues](https://github.com/your-repo/issues) on GitHub
- Create a new issue if your problem is not documented
- Join discussions in GitHub Discussions

---

Happy coding!

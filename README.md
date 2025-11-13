# Inventory Management System

A modern, full-stack inventory management system built with Next.js, Express.js, and MongoDB. Designed for businesses to efficiently track products, manage stock levels, handle suppliers, and generate insightful reports.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start (5 Minutes)](#quick-start-5-minutes)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Features

- **Product Management**: Create, read, update, and delete products with detailed information
- **Inventory Tracking**: Real-time stock level monitoring with low stock alerts
- **Category Management**: Organize products into hierarchical categories
- **Supplier Management**: Maintain supplier information and track purchase orders
- **Order Management**: Process sales orders and track order status
- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Dashboard Analytics**: Visual insights with charts and key metrics
- **Search & Filters**: Advanced search and filtering capabilities
- **Bulk Operations**: Import/export products via CSV
- **Responsive Design**: Mobile-friendly interface with modern UI

### Advanced Features

- **Low Stock Alerts**: Automatic notifications when inventory is running low
- **Stock Movements**: Track all inventory movements with detailed history
- **Multi-user Support**: Role-based permissions (Admin, Manager, Staff)
- **Audit Logs**: Complete audit trail of all system changes
- **Reports Generation**: Generate detailed inventory and sales reports
- **Data Export**: Export data to CSV, Excel, and PDF formats

For a complete list of features, see [FEATURES.md](FEATURES.md).

## Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components
- **React Hook Form**: Form handling and validation
- **Zustand**: State management
- **Recharts**: Data visualization
- **Axios**: HTTP client

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **TypeScript**: Type-safe development
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication
- **Bcrypt**: Password hashing
- **Zod**: Schema validation
- **Morgan**: HTTP request logger

### DevOps & Tools
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Concurrently**: Run multiple commands
- **Mongo Express**: Database UI

For detailed information about technology choices, see [TECH_STACK.md](TECH_STACK.md).

## Quick Start (5 Minutes)

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker and Docker Compose (optional, for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the database (with Docker)**
   ```bash
   npm run db:up
   ```

   This will start:
   - MongoDB on http://localhost:27017
   - Mongo Express UI on http://localhost:8081

5. **Seed the database (optional)**
   ```bash
   npm run db:seed
   ```

6. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend on http://localhost:3000
   - Backend API on http://localhost:5000

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Mongo Express: http://localhost:8081 (username: admin, password: admin123)

For detailed setup instructions, see [SETUP.md](SETUP.md).

## Project Structure

```
inventory-management/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js 14 app directory
│   │   ├── components/      # React components
│   │   ├── lib/             # Utility functions
│   │   ├── hooks/           # Custom React hooks
│   │   ├── stores/          # Zustand stores
│   │   ├── types/           # TypeScript types
│   │   └── styles/          # Global styles
│   ├── public/              # Static assets
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                  # Express.js backend application
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   ├── config/          # Configuration files
│   │   └── types/           # TypeScript types
│   ├── package.json
│   └── tsconfig.json
│
├── .vscode/                  # VSCode settings
├── docker-compose.yml        # Docker services configuration
├── .eslintrc.json           # ESLint configuration
├── .prettierrc              # Prettier configuration
├── .editorconfig            # Editor configuration
├── .gitignore               # Git ignore rules
├── .env.example             # Environment variables template
├── package.json             # Root package.json (monorepo)
├── tsconfig.json            # TypeScript base configuration
├── README.md                # This file
├── SETUP.md                 # Detailed setup guide
├── FEATURES.md              # Complete feature list
├── TECH_STACK.md            # Technology documentation
├── CONTRIBUTING.md          # Contribution guidelines
├── CHANGELOG.md             # Version history
└── LICENSE                  # MIT License
```

## Available Scripts

### Root Scripts (Monorepo)

```bash
# Development
npm run dev                  # Start both frontend and backend in development mode
npm run dev:frontend         # Start only frontend
npm run dev:backend          # Start only backend

# Build
npm run build               # Build both frontend and backend for production

# Code Quality
npm run lint                # Run ESLint on all workspaces
npm run format              # Format code with Prettier
npm run format:check        # Check code formatting
npm run type-check          # Run TypeScript type checking

# Testing
npm run test                # Run tests in all workspaces

# Database (Docker)
npm run db:up               # Start MongoDB and Mongo Express
npm run db:down             # Stop database services
npm run db:logs             # View database logs
npm run db:seed             # Seed database with sample data
npm run db:reset            # Reset database to initial state

# Docker
npm run docker:build        # Build Docker images
npm run docker:restart      # Restart Docker containers

# Maintenance
npm run install:all         # Install dependencies in all workspaces
npm run clean               # Clean all node_modules and build folders
```

### Frontend Scripts

```bash
cd frontend
npm run dev                 # Start development server
npm run build               # Build for production
npm run start               # Start production server
npm run lint                # Run ESLint
npm run type-check          # TypeScript type checking
```

### Backend Scripts

```bash
cd backend
npm run dev                 # Start development server with hot reload
npm run build               # Build TypeScript to JavaScript
npm run start               # Start production server
npm run lint                # Run ESLint
npm run type-check          # TypeScript type checking
npm run seed                # Seed database
npm run reset               # Reset database
```

## Environment Variables

The application uses environment variables for configuration. Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### Key Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `BACKEND_PORT` | Backend server port | 5000 |
| `FRONTEND_PORT` | Frontend server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://admin:password123@localhost:27017/inventory_db |
| `JWT_SECRET` | Secret key for JWT tokens | (generate your own) |
| `NEXT_PUBLIC_API_URL` | API URL for frontend | http://localhost:5000/api |

For a complete list of environment variables with descriptions, see `.env.example`.

### Generating Secure Keys

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Main Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user |
| GET | `/products` | Get all products |
| POST | `/products` | Create new product |
| GET | `/products/:id` | Get product by ID |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| GET | `/categories` | Get all categories |
| POST | `/categories` | Create new category |
| GET | `/suppliers` | Get all suppliers |
| POST | `/suppliers` | Create new supplier |
| GET | `/orders` | Get all orders |
| POST | `/orders` | Create new order |
| GET | `/dashboard/stats` | Get dashboard statistics |

For detailed API documentation, visit `/api/docs` when running the backend server.

## Database Schema

### Main Collections

- **Users**: User accounts and authentication
- **Products**: Product information and inventory levels
- **Categories**: Product categories and hierarchies
- **Suppliers**: Supplier information and contacts
- **Orders**: Sales orders and line items
- **StockMovements**: Inventory movement history
- **AuditLogs**: System audit trail

For detailed schema documentation, see the backend models in `backend/src/models/`.

## Screenshots

### Dashboard
[Screenshot placeholder - Dashboard with key metrics and charts]

### Product Management
[Screenshot placeholder - Product list with search and filters]

### Inventory Tracking
[Screenshot placeholder - Inventory levels and stock movements]

### Order Management
[Screenshot placeholder - Orders list and details]

### Reports
[Screenshot placeholder - Analytics and reports]

## Troubleshooting

### Database Connection Issues

If you can't connect to MongoDB:

1. Check if Docker containers are running: `docker ps`
2. Verify MongoDB is accessible: `docker logs inventory-mongodb`
3. Check your `.env` file has correct MongoDB credentials
4. Try restarting Docker: `npm run db:down && npm run db:up`

### Port Already in Use

If ports 3000, 5000, or 27017 are already in use:

1. Stop the conflicting services
2. Or change the ports in `.env`:
   ```
   BACKEND_PORT=5001
   FRONTEND_PORT=3001
   ```

### Module Not Found Errors

```bash
# Clean install
npm run clean
npm install
```

### Build Errors

```bash
# Clear caches and rebuild
rm -rf node_modules frontend/node_modules backend/node_modules
rm -rf frontend/.next backend/dist
npm install
npm run build
```

For more troubleshooting tips, see [SETUP.md](SETUP.md).

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on:

- Code of Conduct
- Development workflow
- Pull request process
- Coding standards
- Testing requirements

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Documentation: See docs in this repository
- Issues: Open an issue on GitHub
- Discussions: Use GitHub Discussions

## Acknowledgments

- Built with modern web technologies
- Inspired by real-world inventory management needs
- Thanks to all contributors

---

Made with ❤️ for efficient inventory management

# Inventory Management System - Backend

Enterprise-grade REST API built with Node.js, Express, TypeScript, and MongoDB for inventory management.

## Features

- **TypeScript**: Full TypeScript support with strict mode enabled
- **Express.js**: Fast and minimalist web framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **Security**:
  - Helmet for security headers
  - CORS protection
  - Rate limiting
  - JWT authentication
- **Validation**: Request validation with express-validator
- **Logging**: Comprehensive logging with Winston
- **API Documentation**: Swagger/OpenAPI documentation
- **Error Handling**: Centralized error handling
- **Code Quality**: ESLint and Prettier configured

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**

   Copy `.env.example` to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/inventory_management
   JWT_SECRET=your_super_secret_jwt_key
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   JWT_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Start MongoDB:**

   Make sure MongoDB is running on your system:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community

   # Linux (systemd)
   sudo systemctl start mongod

   # Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:5000` with hot-reload enabled.

### Production Mode

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format
```

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── config.ts     # Environment configuration
│   │   └── database.ts   # MongoDB connection
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   │   ├── auth.ts       # JWT authentication
│   │   ├── errorHandler.ts # Error handling
│   │   ├── validate.ts   # Request validation
│   │   └── rateLimiter.ts # Rate limiting
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types
│   │   ├── index.ts      # Common types
│   │   └── express.d.ts  # Express extensions
│   ├── utils/            # Utility functions
│   │   ├── logger.ts     # Winston logger
│   │   └── responses.ts  # Standard responses
│   └── server.ts         # App entry point
├── logs/                 # Log files
├── dist/                 # Compiled JavaScript
├── .env.example          # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## API Documentation

Once the server is running, access the interactive API documentation at:

- Swagger UI: `http://localhost:5000/api-docs`

## Available Endpoints

### Health Check
- `GET /health` - Server health status
- `GET /api/v1/health` - API health status

### Authentication (Coming Soon)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout

### Users (Coming Soon)
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Inventory (Coming Soon)
- `GET /api/v1/inventory` - Get all inventory items
- `POST /api/v1/inventory` - Create inventory item
- `GET /api/v1/inventory/:id` - Get item by ID
- `PUT /api/v1/inventory/:id` - Update item
- `DELETE /api/v1/inventory/:id` - Delete item

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_REFRESH_SECRET` | Refresh token secret | Required |
| `JWT_EXPIRE` | Access token expiration | `15m` |
| `JWT_REFRESH_EXPIRE` | Refresh token expiration | `7d` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW` | Rate limit window (ms) | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

## Security Features

### Authentication & Authorization
- JWT-based authentication
- Refresh token rotation
- Role-based access control (RBAC)
- Password hashing with bcryptjs

### Security Middleware
- **Helmet**: Sets secure HTTP headers
- **CORS**: Cross-Origin Resource Sharing protection
- **Rate Limiting**: Prevents brute-force attacks
- **Input Validation**: Validates and sanitizes all inputs

### Best Practices
- Environment variables for sensitive data
- Secure password storage
- SQL injection prevention (NoSQL)
- XSS protection
- Request size limiting

## Logging

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

## Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Response Format

All successful API responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": { },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linter and tests
4. Submit a pull request

## License

ISC

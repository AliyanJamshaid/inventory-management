# Authentication System API Documentation

## Overview

This document provides comprehensive information about the authentication system implemented for the Inventory Management System backend API.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Authentication Endpoints](#authentication-endpoints)
3. [User Management Endpoints](#user-management-endpoints)
4. [Request/Response Examples](#requestresponse-examples)
5. [Security Features](#security-features)
6. [Error Handling](#error-handling)

---

## System Architecture

### Components Created

#### Models (`/backend/src/models/`)
- **User.ts** - User model with authentication methods
- **Role.ts** - Role-based access control model
- **Permission.ts** - Granular permissions model

#### Controllers (`/backend/src/controllers/`)
- **authController.ts** - Handles all authentication operations
- **userController.ts** - Handles user management operations

#### Routes (`/backend/src/routes/`)
- **authRoutes.ts** - Authentication endpoint definitions
- **userRoutes.ts** - User management endpoint definitions

#### Validators (`/backend/src/validators/`)
- **authValidators.ts** - Input validation for authentication
- **userValidators.ts** - Input validation for user management

#### Middleware
- **auth.ts** - JWT authentication and authorization middleware
- **rateLimiter.ts** - Rate limiting for security
- **validate.ts** - Request validation middleware

---

## Authentication Endpoints

Base URL: `/api/v1/auth`

### 1. Register New User
**POST** `/api/v1/auth/register`

**Access:** Public

**Rate Limit:** 5 requests per 15 minutes

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "STAFF"
}
```

**Validation Rules:**
- Email: Valid email format, required
- Password: Min 8 characters, must contain uppercase, lowercase, number, and special character
- Passwords must match
- First/Last name: 2-50 characters, letters only
- Role: Optional, one of [ADMIN, MANAGER, STAFF, VIEWER], defaults to STAFF

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STAFF",
      "isActive": true,
      "createdAt": "2025-11-13T10:30:00.000Z",
      "updatedAt": "2025-11-13T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login
**POST** `/api/v1/auth/login`

**Access:** Public

**Rate Limit:** 5 requests per 15 minutes

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STAFF",
      "isActive": true,
      "lastLogin": "2025-11-13T10:35:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Token Details:**
- Access Token: Expires in 15 minutes
- Refresh Token: Expires in 7 days

---

### 3. Refresh Access Token
**POST** `/api/v1/auth/refresh`

**Access:** Public (requires valid refresh token)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note:** Refresh token can also be sent in Authorization header as Bearer token.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Logout
**POST** `/api/v1/auth/logout`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body (Optional):**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note:** If no refresh token is provided, logs out from all devices (clears all refresh tokens).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

### 5. Get Current User Profile
**GET** `/api/v1/auth/me`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "role": "STAFF",
    "phone": "+1234567890",
    "avatar": null,
    "isActive": true,
    "isTwoFactorEnabled": false,
    "lastLogin": "2025-11-13T10:35:00.000Z",
    "createdAt": "2025-11-13T10:30:00.000Z",
    "updatedAt": "2025-11-13T10:35:00.000Z"
  }
}
```

---

### 6. Update User Profile
**PUT** `/api/v1/auth/profile`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "firstName": "Jonathan",
  "lastName": "Doe",
  "phone": "+1234567891",
  "avatar": "https://example.com/avatar.jpg",
  "email": "jonathan.doe@example.com"
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "jonathan.doe@example.com",
    "firstName": "Jonathan",
    "lastName": "Doe",
    "fullName": "Jonathan Doe",
    "phone": "+1234567891",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

---

### 7. Change Password
**POST** `/api/v1/auth/change-password`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

**Validation:**
- New password must be different from current password
- New password must meet password requirements
- Passwords must match

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully. You have been logged out from all other devices.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note:** Changes password and logs out from all other devices for security.

---

### 8. Forgot Password (Request Reset)
**POST** `/api/v1/auth/forgot-password`

**Access:** Public

**Rate Limit:** 3 requests per hour

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If an account exists with this email, a password reset link will be sent.",
  "data": null
}
```

**Development Response (200):**
```json
{
  "success": true,
  "message": "Password reset token generated successfully",
  "data": {
    "message": "Password reset token generated",
    "resetToken": "3f7a2b4c5d6e7f8a9b0c1d2e3f4a5b6c...",
    "resetUrl": "http://localhost:5000/api/v1/auth/reset-password",
    "expiresIn": "10 minutes"
  }
}
```

**Note:** In development mode, returns the token. In production, sends email (to be implemented).

---

### 9. Reset Password
**POST** `/api/v1/auth/reset-password`

**Access:** Public (requires valid reset token)

**Rate Limit:** 3 requests per hour

**Request Body:**
```json
{
  "token": "3f7a2b4c5d6e7f8a9b0c1d2e3f4a5b6c...",
  "password": "NewSecurePass789!",
  "confirmPassword": "NewSecurePass789!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note:** Resets password and logs out from all devices.

---

## User Management Endpoints

Base URL: `/api/v1/users`

All user management endpoints require authentication and most require ADMIN role.

### 1. Get All Users
**GET** `/api/v1/users`

**Access:** Private (Admin only)

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Items per page
- `sortBy` (string, default: 'createdAt') - Field to sort by
- `sortOrder` ('asc' | 'desc', default: 'desc') - Sort order
- `role` (string) - Filter by role (ADMIN, MANAGER, STAFF, VIEWER)
- `isActive` (boolean) - Filter by active status
- `search` (string) - Search in email, firstName, lastName

**Example Request:**
```
GET /api/v1/users?page=1&limit=20&role=STAFF&isActive=true&search=john
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STAFF",
      "isActive": true,
      "lastLogin": "2025-11-13T10:35:00.000Z",
      "createdAt": "2025-11-13T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### 2. Get User by ID
**GET** `/api/v1/users/:id`

**Access:** Private (Admin/Manager or Self)

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "role": "STAFF",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2025-11-13T10:30:00.000Z"
  }
}
```

---

### 3. Update User
**PUT** `/api/v1/users/:id`

**Access:** Private (Admin only)

**Request Body:**
```json
{
  "email": "john.updated@example.com",
  "firstName": "Jonathan",
  "lastName": "Doe",
  "phone": "+1234567891",
  "role": "MANAGER",
  "isActive": true
}
```

**Note:** All fields are optional.

**Success Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john.updated@example.com",
    "firstName": "Jonathan",
    "lastName": "Doe",
    "role": "MANAGER",
    "isActive": true
  }
}
```

---

### 4. Delete User
**DELETE** `/api/v1/users/:id`

**Access:** Private (Admin only)

**Restrictions:**
- Cannot delete own account
- Cannot delete the last admin

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

---

### 5. Activate User
**PUT** `/api/v1/users/:id/activate`

**Access:** Private (Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "User activated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true
  }
}
```

---

### 6. Deactivate User
**PUT** `/api/v1/users/:id/deactivate`

**Access:** Private (Admin only)

**Restrictions:**
- Cannot deactivate own account
- Cannot deactivate the last active admin

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": false
  }
}
```

**Note:** Deactivating a user clears all their refresh tokens (logs them out from all devices).

---

### 7. Get User Statistics
**GET** `/api/v1/users/stats`

**Access:** Private (Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "totalUsers": 150,
    "activeUsers": 142,
    "inactiveUsers": 8,
    "usersByRole": [
      { "_id": "ADMIN", "count": 3 },
      { "_id": "MANAGER", "count": 12 },
      { "_id": "STAFF", "count": 125 },
      { "_id": "VIEWER", "count": 10 }
    ],
    "recentUsers": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "role": "STAFF",
        "createdAt": "2025-11-13T10:30:00.000Z"
      }
    ]
  }
}
```

---

## Security Features

### Password Security
- **Hashing:** bcrypt with 10 salt rounds
- **Requirements:**
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&)
- **Storage:** Passwords never returned in API responses

### JWT Tokens
- **Access Token:**
  - Expiry: 15 minutes
  - Used for API authentication
  - Contains: userId, email, role

- **Refresh Token:**
  - Expiry: 7 days
  - Used to obtain new access tokens
  - Stored in database (allows revocation)
  - Contains: userId, email, role

### Rate Limiting
- **Auth endpoints:** 5 requests per 15 minutes
- **Password reset:** 3 requests per hour
- **General API:** 100 requests per 15 minutes

### Password Reset
- **Token:** 32-byte random token, hashed with SHA-256
- **Expiry:** 10 minutes
- **One-time use:** Token cleared after use
- **Logout:** Clears all refresh tokens on reset

### Role-Based Access Control (RBAC)
- **Roles:** ADMIN, MANAGER, STAFF, VIEWER
- **Hierarchy:**
  - ADMIN: Full system access
  - MANAGER: User viewing, limited management
  - STAFF: Regular operations
  - VIEWER: Read-only access

### Additional Security
- **Account activation/deactivation**
- **Last login tracking**
- **Comprehensive audit logging**
- **Session management (refresh token storage)**
- **Protection against:**
  - Brute force attacks (rate limiting)
  - Mass assignment (field sanitization)
  - SQL injection (MongoDB + validation)
  - XSS (input sanitization)

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Error",
  "error": "Invalid email or password"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Error",
  "error": "You do not have permission to access this resource."
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Error",
  "error": "User not found"
}
```

#### 409 Conflict
```json
{
  "success": false,
  "message": "Error",
  "error": "User with this email already exists"
}
```

#### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Error",
  "error": "Too many authentication attempts, please try again later."
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error",
  "error": "Failed to register user. Please try again."
}
```

---

## Authentication Flow

### Registration Flow
1. User submits registration form
2. Input validation
3. Check if email already exists
4. Hash password
5. Create user record
6. Generate access and refresh tokens
7. Store refresh token
8. Return user data and tokens

### Login Flow
1. User submits credentials
2. Find user by email
3. Verify password
4. Check if user is active
5. Generate new tokens
6. Store refresh token
7. Update last login timestamp
8. Return user data and tokens

### Token Refresh Flow
1. Client sends refresh token
2. Verify refresh token
3. Check if token exists in database
4. Verify user is active
5. Generate new tokens
6. Replace old refresh token with new one
7. Return new tokens

### Protected Request Flow
1. Client sends request with access token
2. Extract token from Authorization header
3. Verify JWT signature and expiry
4. Extract user info from token
5. Check user permissions if needed
6. Process request
7. Return response

---

## Environment Variables

Required environment variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/inventory_management

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# JWT Expiry
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

---

## Testing the API

### Using cURL

#### Register
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

#### Get Profile
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Next Steps

### Recommended Implementations

1. **Email Service Integration**
   - Password reset emails
   - Welcome emails
   - Account verification

2. **Two-Factor Authentication (2FA)**
   - TOTP implementation
   - Backup codes
   - SMS verification (optional)

3. **OAuth Integration**
   - Google OAuth
   - Microsoft OAuth
   - GitHub OAuth

4. **Advanced Features**
   - Password history
   - Login history
   - Device management
   - Session management UI

5. **Security Enhancements**
   - IP whitelist/blacklist
   - Geolocation tracking
   - Suspicious activity detection
   - Account lockout after failed attempts

---

## Support

For issues or questions, please refer to:
- API Documentation: `/api-docs` (Swagger)
- Health Check: `/health`
- System Info: `/api/v1/system/info`

---

**Last Updated:** November 13, 2025
**API Version:** 1.0.0

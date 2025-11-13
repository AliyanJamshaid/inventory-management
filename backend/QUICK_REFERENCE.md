# Authentication System - Quick Reference

## Quick Start

### 1. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

### 2. Test Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TestPass123!","confirmPassword":"TestPass123!","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TestPass123!"}'
```

---

## Endpoints Summary

### Authentication (`/api/v1/auth`)
| Endpoint | Method | Auth | Rate Limit |
|----------|--------|------|------------|
| `/register` | POST | ❌ | 5/15min |
| `/login` | POST | ❌ | 5/15min |
| `/refresh` | POST | ❌ | - |
| `/logout` | POST | ✅ | - |
| `/me` | GET | ✅ | - |
| `/profile` | PUT | ✅ | - |
| `/change-password` | POST | ✅ | - |
| `/forgot-password` | POST | ❌ | 3/hour |
| `/reset-password` | POST | ❌ | 3/hour |

### User Management (`/api/v1/users`)
| Endpoint | Method | Auth | Role |
|----------|--------|------|------|
| `/` | GET | ✅ | Admin |
| `/stats` | GET | ✅ | Admin |
| `/:id` | GET | ✅ | Admin/Manager/Self |
| `/:id` | PUT | ✅ | Admin |
| `/:id` | DELETE | ✅ | Admin |
| `/:id/activate` | PUT | ✅ | Admin |
| `/:id/deactivate` | PUT | ✅ | Admin |

---

## Common Patterns

### Protected Route (Frontend)
```typescript
const token = localStorage.getItem('accessToken');
const response = await fetch('/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Refresh Token Flow
```typescript
// When access token expires (401 error)
const refreshToken = localStorage.getItem('refreshToken');
const response = await fetch('/api/v1/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});

const { accessToken, refreshToken: newRefreshToken } = await response.json();
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', newRefreshToken);
```

### Using in Controller (Backend)
```typescript
import { authenticate, isAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

// Public route
router.post('/endpoint', controller.method);

// Protected route
router.get('/endpoint', authenticate, controller.method);

// Admin only route
router.delete('/endpoint', authenticate, isAdmin, controller.method);

// With validation
router.post(
  '/endpoint',
  authenticate,
  validateRequest(myValidator),
  controller.method
);
```

### Accessing User in Controller
```typescript
export const myController = async (
  req: IAuthRequest,
  res: Response
): Promise<Response> => {
  // User info from JWT
  const userId = req.user?.userId;
  const userEmail = req.user?.email;
  const userRole = req.user?.role;

  // Fetch full user from database if needed
  const user = await User.findById(userId);
};
```

---

## User Roles

| Role | Access Level |
|------|--------------|
| **ADMIN** | Full system access |
| **MANAGER** | View users, manage operations |
| **STAFF** | Regular operations |
| **VIEWER** | Read-only access |

---

## Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (@$!%*?&)

**Valid:** `SecurePass123!`
**Invalid:** `password` (too simple)

---

## Token Information

| Token Type | Expiry | Storage | Use |
|------------|--------|---------|-----|
| Access | 15 min | Memory/LocalStorage | API requests |
| Refresh | 7 days | Database + Client | Token refresh |

---

## Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Invalid credentials, expired token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | User/resource doesn't exist |
| 409 | Conflict | Email already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Something went wrong |

---

## Useful Commands

### Create Admin User (MongoDB Shell)
```javascript
db.users.insertOne({
  email: "admin@example.com",
  password: "$2a$10$...", // Use bcrypt to hash
  firstName: "Admin",
  lastName: "User",
  role: "ADMIN",
  isActive: true,
  refreshTokens: [],
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Check Logs
```bash
tail -f logs/combined.log
tail -f logs/error.log
```

### Test Health
```bash
curl http://localhost:5000/health
```

---

## Middleware Order

```typescript
// Correct order
router.post(
  '/endpoint',
  rateLimiter,           // 1. Rate limit
  validateRequest(val),  // 2. Validate
  authenticate,          // 3. Auth check
  authorize(roles),      // 4. Role check
  controller            // 5. Execute
);
```

---

## Common Issues

### "Token expired"
**Solution:** Refresh the token using `/auth/refresh`

### "Invalid credentials"
**Solution:** Check email/password, ensure user exists and is active

### "Too many requests"
**Solution:** Wait for rate limit window to reset (15 minutes for auth)

### "Email already exists"
**Solution:** Use different email or try login instead

### "Cannot delete last admin"
**Solution:** Create another admin before deleting

---

## Environment Variables

```env
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
MONGODB_URI=mongodb://localhost:27017/inventory_management
PORT=5000
NODE_ENV=development
```

---

## Code Snippets

### Create Validator
```typescript
// validators/myValidator.ts
import { body } from 'express-validator';

export const myValidator = [
  body('field')
    .notEmpty()
    .withMessage('Field is required')
    .isEmail()
    .withMessage('Must be valid email'),
];
```

### Use Response Utilities
```typescript
import { sendSuccess, sendError, sendNotFound } from '../utils/responses';

// Success
return sendSuccess(res, data, 'Operation successful');

// Error
return sendError(res, 'Something went wrong', 500);

// Not Found
return sendNotFound(res, 'User not found');
```

### Log Events
```typescript
import { logAuth, logError } from '../utils/logger';

// Log auth event
logAuth('User logged in', userId, { email });

// Log error
logError(error, { context: 'additional info' });
```

---

## Testing Checklist

- [ ] User can register
- [ ] User can login
- [ ] Access token works
- [ ] Refresh token works
- [ ] User can logout
- [ ] User can view profile
- [ ] User can update profile
- [ ] User can change password
- [ ] Password reset works
- [ ] Admin can view users
- [ ] Admin can update users
- [ ] Admin can delete users
- [ ] Admin can activate/deactivate users
- [ ] Rate limiting works
- [ ] Validation works
- [ ] Error handling works
- [ ] RBAC works correctly

---

## Security Checklist

- [ ] JWT secrets are strong and unique
- [ ] Passwords are hashed with bcrypt
- [ ] Sensitive data excluded from responses
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] CORS configured correctly
- [ ] Helmet security headers enabled
- [ ] MongoDB injection protection
- [ ] XSS protection
- [ ] Environment variables secured

---

## Resources

- Full API Docs: `/backend/AUTHENTICATION_API.md`
- Implementation Details: `/backend/IMPLEMENTATION_SUMMARY.md`
- Swagger UI: `http://localhost:5000/api-docs`
- Health Check: `http://localhost:5000/health`

---

**Last Updated:** November 13, 2025

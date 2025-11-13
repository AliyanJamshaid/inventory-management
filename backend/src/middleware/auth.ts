/**
 * Authentication Middleware
 * Handles JWT verification and role-based access control
 */

import { Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IAuthRequest, IJwtPayload, UserRole } from '../types';
import { sendUnauthorized, sendForbidden } from '../utils/responses';
import { logAuth, logError } from '../utils/logger';
import config from '../config/config';

/**
 * Extract JWT token from request headers
 */
const extractToken = (req: IAuthRequest): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1] || null;
};

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Extract token from header
    const token = extractToken(req);

    if (!token) {
      logAuth('Authentication failed: No token provided', undefined, {
        url: req.url,
        method: req.method,
      });
      return sendUnauthorized(res, 'Authentication required. Please provide a valid token.');
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as IJwtPayload;

      // Attach user to request
      req.user = decoded;

      logAuth('Authentication successful', decoded.userId, {
        url: req.url,
        method: req.method,
      });

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logAuth('Authentication failed: Token expired', undefined, {
          url: req.url,
        });
        return sendUnauthorized(res, 'Token expired. Please log in again.');
      }

      if (error instanceof jwt.JsonWebTokenError) {
        logAuth('Authentication failed: Invalid token', undefined, {
          url: req.url,
        });
        return sendUnauthorized(res, 'Invalid token. Please log in again.');
      }

      throw error;
    }
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Authentication error'), {
      url: req.url,
      method: req.method,
    });
    return sendUnauthorized(res, 'Authentication failed.');
  }
};

/**
 * Verify refresh token
 */
export const authenticateRefreshToken = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      return sendUnauthorized(res, 'Refresh token required.');
    }

    try {
      const decoded = jwt.verify(
        token,
        config.jwtRefreshSecret
      ) as IJwtPayload;
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return sendUnauthorized(res, 'Refresh token expired. Please log in again.');
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return sendUnauthorized(res, 'Invalid refresh token.');
      }

      throw error;
    }
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Refresh token authentication error'));
    return sendUnauthorized(res, 'Authentication failed.');
  }
};

/**
 * Role-based authorization middleware
 * Checks if authenticated user has required role(s)
 */
export const authorize = (...roles: UserRole[]) => {
  return (
    req: IAuthRequest,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (!req.user) {
      logAuth('Authorization failed: User not authenticated', undefined, {
        url: req.url,
      });
      return sendUnauthorized(res, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      logAuth('Authorization failed: Insufficient permissions', req.user.userId, {
        url: req.url,
        userRole: req.user.role,
        requiredRoles: roles,
      });
      return sendForbidden(
        res,
        'You do not have permission to access this resource.'
      );
    }

    logAuth('Authorization successful', req.user.userId, {
      url: req.url,
      role: req.user.role,
    });

    next();
  };
};

/**
 * Check if user is admin
 */
export const isAdmin = authorize(UserRole.ADMIN);

/**
 * Check if user is admin or manager
 */
export const isAdminOrManager = authorize(UserRole.ADMIN, UserRole.MANAGER);

/**
 * Check if user is staff or above
 */
export const isStaffOrAbove = authorize(
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.STAFF
);

/**
 * Optional authentication - doesn't fail if token is not present
 * Useful for endpoints that work differently for authenticated users
 */
export const optionalAuthenticate = async (
  req: IAuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractToken(req);

  if (!token) {
    // No token provided, continue without user
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as IJwtPayload;
    req.user = decoded;
  } catch (error) {
    // Token is invalid, but we continue without user
    logAuth('Optional authentication: Invalid token', undefined, {
      url: req.url,
    });
  }

  next();
};

/**
 * Generate JWT access token
 */
export const generateAccessToken = (payload: {
  userId: string;
  email: string;
  role: UserRole;
}): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  } as SignOptions);
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (payload: {
  userId: string;
  email: string;
  role: UserRole;
}): string => {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpire,
  } as SignOptions);
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (payload: {
  userId: string;
  email: string;
  role: UserRole;
}): { accessToken: string; refreshToken: string } => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Granular permission-based authorization middleware
 * Checks if authenticated user has a specific permission
 * @param permission - Permission key (module.resource.action)
 */
export const requirePermission = (permission: string) => {
  return async (
    req: IAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    if (!req.user) {
      logAuth('Permission check failed: User not authenticated', undefined, {
        url: req.url,
      });
      return sendUnauthorized(res, 'Authentication required.');
    }

    try {
      const { checkUserPermission } = await import('../utils/permissionHelper');
      const hasPermission = await checkUserPermission(req.user.userId, permission);

      if (!hasPermission) {
        logAuth('Permission check failed: Insufficient permissions', req.user.userId, {
          url: req.url,
          requiredPermission: permission,
        });
        return sendForbidden(
          res,
          `You do not have permission to perform this action. Required: ${permission}`
        );
      }

      logAuth('Permission check passed', req.user.userId, {
        url: req.url,
        permission,
      });

      next();
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Permission check error'), {
        url: req.url,
        permission,
      });
      return sendForbidden(res, 'Permission verification failed.');
    }
  };
};

/**
 * Check if user has all of the specified permissions (AND logic)
 * @param permissions - Array of permission keys
 */
export const requireAllPermissions = (permissions: string[]) => {
  return async (
    req: IAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required.');
    }

    try {
      const { checkUserPermissions } = await import('../utils/permissionHelper');
      const hasAllPermissions = await checkUserPermissions(req.user.userId, permissions);

      if (!hasAllPermissions) {
        logAuth('Permission check failed: Missing required permissions', req.user.userId, {
          url: req.url,
          requiredPermissions: permissions,
        });
        return sendForbidden(
          res,
          `You do not have all required permissions. Required: ${permissions.join(', ')}`
        );
      }

      next();
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Permission check error'));
      return sendForbidden(res, 'Permission verification failed.');
    }
  };
};

/**
 * Check if user has any of the specified permissions (OR logic)
 * @param permissions - Array of permission keys
 */
export const requireAnyPermission = (permissions: string[]) => {
  return async (
    req: IAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required.');
    }

    try {
      const { checkUserAnyPermission } = await import('../utils/permissionHelper');
      const hasAnyPermission = await checkUserAnyPermission(req.user.userId, permissions);

      if (!hasAnyPermission) {
        logAuth('Permission check failed: None of the permissions matched', req.user.userId, {
          url: req.url,
          requiredPermissions: permissions,
        });
        return sendForbidden(
          res,
          `You do not have any of the required permissions. Required (any): ${permissions.join(', ')}`
        );
      }

      next();
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Permission check error'));
      return sendForbidden(res, 'Permission verification failed.');
    }
  };
};

export default {
  authenticate,
  authenticateRefreshToken,
  authorize,
  isAdmin,
  isAdminOrManager,
  isStaffOrAbove,
  optionalAuthenticate,
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  requirePermission,
  requireAllPermissions,
  requireAnyPermission,
};

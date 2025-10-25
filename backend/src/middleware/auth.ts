import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import redisClient from '../config/redis';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// Session cache TTL: 30 minutes
const SESSION_CACHE_TTL = 1800;

/**
 * Authentication middleware - verifies JWT token with session caching
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const sessionKey = `session:${token}`;

    // Try to get cached session
    redisClient.get(sessionKey)
      .then((cachedSession) => {
        if (cachedSession) {
          // Use cached session
          req.user = JSON.parse(cachedSession);
          next();
          return;
        }

        // Verify token and cache session
        try {
          const payload = verifyAccessToken(token);
          req.user = payload;

          // Cache the session for 30 minutes
          redisClient.setEx(sessionKey, SESSION_CACHE_TTL, JSON.stringify(payload))
            .catch((err) => console.error('Failed to cache session:', err));

          next();
        } catch (error) {
          if (error instanceof Error && error.name === 'TokenExpiredError') {
            res.status(401).json({
              code: 'UNAUTHORIZED',
              message: 'Token expired',
            });
            return;
          }
          
          res.status(401).json({
            code: 'UNAUTHORIZED',
            message: 'Invalid token',
          });
          return;
        }
      })
      .catch((err) => {
        console.error('Redis error during authentication:', err);
        // Fallback to token verification without cache
        try {
          const payload = verifyAccessToken(token);
          req.user = payload;
          next();
        } catch (error) {
          if (error instanceof Error && error.name === 'TokenExpiredError') {
            res.status(401).json({
              code: 'UNAUTHORIZED',
              message: 'Token expired',
            });
            return;
          }
          
          res.status(401).json({
            code: 'UNAUTHORIZED',
            message: 'Invalid token',
          });
          return;
        }
      });
  } catch (error) {
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Authentication error',
    });
    return;
  }
}

/**
 * Optional authentication middleware - verifies JWT token if present, but allows request to continue if not
 */
export function authenticateOptional(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user context
      next();
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const payload = verifyAccessToken(token);
      req.user = payload;
      next();
    } catch (error) {
      // Invalid or expired token, continue without user context
      next();
    }
  } catch (error) {
    // Error during authentication, continue without user context
    next();
  }
}

/**
 * Role-based authorization middleware
 */
export function authorize(...allowedRoles: Array<'candidate' | 'recruiter' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
}

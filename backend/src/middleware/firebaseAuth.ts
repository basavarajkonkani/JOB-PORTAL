import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import redisClient from '../config/redis';

// Extend Express Request type to include user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'candidate' | 'recruiter' | 'admin';
  };
}

// Session cache TTL: 30 minutes
const SESSION_CACHE_TTL = 1800;

/**
 * Firebase Authentication middleware - verifies Firebase ID tokens
 */
export async function authenticateFirebase(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'No token provided',
      });
      return;
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    const sessionKey = `firebase:session:${idToken.substring(0, 20)}`; // Use token prefix as key

    try {
      // Try to get cached session
      const cachedSession = await redisClient.get(sessionKey);

      if (cachedSession) {
        // Use cached session
        req.user = JSON.parse(cachedSession);
        next();
        return;
      }

      // Verify Firebase ID token
      const decodedToken = await auth.verifyIdToken(idToken);

      // Extract user information from decoded token
      req.user = {
        userId: decodedToken.uid,
        email: decodedToken.email || '',
        role: (decodedToken.role as 'candidate' | 'recruiter' | 'admin') || 'candidate',
      };

      // Cache the session for 30 minutes
      try {
        await redisClient.setEx(sessionKey, SESSION_CACHE_TTL, JSON.stringify(req.user));
      } catch (cacheError) {
        console.error('Failed to cache Firebase session:', cacheError);
        // Continue without caching
      }

      next();
    } catch (error: any) {
      // Handle Firebase-specific authentication errors
      if (error.code === 'auth/id-token-expired') {
        res.status(401).json({
          code: 'UNAUTHORIZED',
          message: 'Token expired',
        });
        return;
      }

      if (error.code === 'auth/id-token-revoked') {
        res.status(401).json({
          code: 'UNAUTHORIZED',
          message: 'Token revoked',
        });
        return;
      }

      if (error.code === 'auth/invalid-id-token' || error.code === 'auth/argument-error') {
        res.status(401).json({
          code: 'UNAUTHORIZED',
          message: 'Invalid token',
        });
        return;
      }

      // Generic authentication error
      console.error('Firebase authentication error:', error);
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentication failed',
      });
      return;
    }
  } catch (error) {
    console.error('Unexpected authentication error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Authentication error',
    });
    return;
  }
}

/**
 * Optional Firebase authentication middleware - verifies token if present, but allows request to continue if not
 */
export async function authenticateFirebaseOptional(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user context
      next();
      return;
    }

    const idToken = authHeader.substring(7);

    try {
      // Verify Firebase ID token
      const decodedToken = await auth.verifyIdToken(idToken);

      // Extract user information from decoded token
      req.user = {
        userId: decodedToken.uid,
        email: decodedToken.email || '',
        role: (decodedToken.role as 'candidate' | 'recruiter' | 'admin') || 'candidate',
      };

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
 * Role-based authorization middleware for Firebase Auth
 */
export function authorizeFirebase(...allowedRoles: Array<'candidate' | 'recruiter' | 'admin'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
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

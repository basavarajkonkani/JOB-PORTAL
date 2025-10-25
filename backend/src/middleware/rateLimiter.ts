import { Request, Response, NextFunction } from 'express';
import { ErrorFactory } from '../utils/errors';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

const ipStore: RateLimitStore = {};
const userStore: RateLimitStore = {};

/**
 * Clean up expired entries from store
 */
function cleanupStore(store: RateLimitStore): void {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}

/**
 * Get or create rate limit entry
 */
function getRateLimitEntry(
  store: RateLimitStore,
  key: string,
  windowMs: number
): RateLimitEntry {
  const now = Date.now();

  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  return store[key];
}

/**
 * IP-based rate limiter
 * For production, use Redis-based rate limiting
 */
export function rateLimitByIP(options: {
  windowMs: number;
  maxRequests: number;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();

    // Periodic cleanup
    if (Math.random() < 0.01) {
      cleanupStore(ipStore);
    }

    const entry = getRateLimitEntry(ipStore, key, options.windowMs);
    entry.count++;

    // Check if limit exceeded
    if (entry.count > options.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      res.setHeader('X-RateLimit-Limit', options.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', entry.resetTime.toString());

      const error = ErrorFactory.rateLimitExceeded(retryAfter);
      res.status(error.statusCode).json({
        code: error.code,
        message: error.message,
        retryAfter,
      });
      return;
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', options.maxRequests.toString());
    res.setHeader(
      'X-RateLimit-Remaining',
      (options.maxRequests - entry.count).toString()
    );
    res.setHeader('X-RateLimit-Reset', entry.resetTime.toString());

    next();
  };
}

/**
 * User-based rate limiter (requires authentication)
 */
export function rateLimitByUser(options: {
  windowMs: number;
  maxRequests: number;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userId = (req as any).user?.id;

    if (!userId) {
      // If no user, skip user-based rate limiting
      return next();
    }

    const key = `user:${userId}`;
    const now = Date.now();

    // Periodic cleanup
    if (Math.random() < 0.01) {
      cleanupStore(userStore);
    }

    const entry = getRateLimitEntry(userStore, key, options.windowMs);
    entry.count++;

    // Check if limit exceeded
    if (entry.count > options.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      res.setHeader('X-RateLimit-Limit', options.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', entry.resetTime.toString());

      const error = ErrorFactory.rateLimitExceeded(retryAfter);
      res.status(error.statusCode).json({
        code: error.code,
        message: error.message,
        retryAfter,
      });
      return;
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', options.maxRequests.toString());
    res.setHeader(
      'X-RateLimit-Remaining',
      (options.maxRequests - entry.count).toString()
    );
    res.setHeader('X-RateLimit-Reset', entry.resetTime.toString());

    next();
  };
}

/**
 * Combined rate limiter (both IP and user)
 */
export function rateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  byUser?: boolean;
}) {
  const ipLimiter = rateLimitByIP(options);
  const userLimiter = options.byUser
    ? rateLimitByUser(options)
    : (req: Request, res: Response, next: NextFunction) => next();

  return (req: Request, res: Response, next: NextFunction): void => {
    ipLimiter(req, res, (err?: any) => {
      if (err || res.headersSent) return;
      userLimiter(req, res, next);
    });
  };
}

import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode, ErrorResponse, ErrorLogger } from '../utils/errors';

/**
 * Centralized error handling middleware
 * Catches all errors and formats them consistently
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error with context
  ErrorLogger.logError(err, {
    method: req.method,
    path: req.path,
    userId: (req as any).user?.id,
    ip: req.ip,
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    const errorResponse: ErrorResponse = {
      code: err.code,
      message: err.message,
      details: err.details,
      fallback: err.fallback,
      timestamp: new Date().toISOString(),
      path: req.path,
    };

    // Add retry-after header for rate limit errors
    if (err.code === ErrorCode.RATE_LIMIT_EXCEEDED && err.details?.retryAfter) {
      res.setHeader('Retry-After', err.details.retryAfter);
    }

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle validation errors from express-validator or similar
  if (err.name === 'ValidationError') {
    const errorResponse: ErrorResponse = {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Validation failed',
      details: err.message,
      timestamp: new Date().toISOString(),
      path: req.path,
    };
    res.status(400).json(errorResponse);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    const errorResponse: ErrorResponse = {
      code: ErrorCode.UNAUTHORIZED,
      message: 'Invalid token',
      timestamp: new Date().toISOString(),
      path: req.path,
    };
    res.status(401).json(errorResponse);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    const errorResponse: ErrorResponse = {
      code: ErrorCode.TOKEN_EXPIRED,
      message: 'Token has expired',
      timestamp: new Date().toISOString(),
      path: req.path,
    };
    res.status(401).json(errorResponse);
    return;
  }

  // Handle database errors
  if (err.message?.includes('database') || err.message?.includes('query')) {
    const errorResponse: ErrorResponse = {
      code: ErrorCode.DATABASE_ERROR,
      message: 'Database operation failed',
      timestamp: new Date().toISOString(),
      path: req.path,
    };
    res.status(500).json(errorResponse);
    return;
  }

  // Handle unexpected errors
  const errorResponse: ErrorResponse = {
    code: ErrorCode.INTERNAL_ERROR,
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  res.status(500).json(errorResponse);
}

/**
 * Async error wrapper to catch errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const errorResponse: ErrorResponse = {
    code: ErrorCode.NOT_FOUND,
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
    path: req.path,
  };
  res.status(404).json(errorResponse);
}

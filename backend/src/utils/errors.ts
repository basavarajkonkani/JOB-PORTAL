/**
 * Error handling utilities for the AI Job Portal
 * Provides centralized error types, factory functions, and logging
 */

export enum ErrorCode {
  // Auth errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // External service errors
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',

  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: any;
  fallback?: any; // cached result or alternative action
  timestamp?: string;
  path?: string;
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly fallback?: any;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: any,
    fallback?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.fallback = fallback;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error factory functions for common error types
 */
export const ErrorFactory = {
  unauthorized(message: string = 'Authentication required'): AppError {
    return new AppError(ErrorCode.UNAUTHORIZED, message, 401);
  },

  forbidden(message: string = 'Access denied'): AppError {
    return new AppError(ErrorCode.FORBIDDEN, message, 403);
  },

  invalidCredentials(message: string = 'Invalid email or password'): AppError {
    return new AppError(ErrorCode.INVALID_CREDENTIALS, message, 401);
  },

  tokenExpired(message: string = 'Token has expired'): AppError {
    return new AppError(ErrorCode.TOKEN_EXPIRED, message, 401);
  },

  validationError(message: string, details?: any): AppError {
    return new AppError(ErrorCode.VALIDATION_ERROR, message, 400, details);
  },

  invalidInput(message: string, details?: any): AppError {
    return new AppError(ErrorCode.INVALID_INPUT, message, 400, details);
  },

  notFound(resource: string = 'Resource'): AppError {
    return new AppError(ErrorCode.NOT_FOUND, `${resource} not found`, 404);
  },

  alreadyExists(resource: string = 'Resource'): AppError {
    return new AppError(ErrorCode.ALREADY_EXISTS, `${resource} already exists`, 409);
  },

  aiServiceError(message: string = 'AI service unavailable', fallback?: any): AppError {
    return new AppError(ErrorCode.AI_SERVICE_ERROR, message, 503, undefined, fallback);
  },

  storageError(message: string = 'Storage service error'): AppError {
    return new AppError(ErrorCode.STORAGE_ERROR, message, 503);
  },

  databaseError(message: string = 'Database error', details?: any): AppError {
    return new AppError(ErrorCode.DATABASE_ERROR, message, 500, details);
  },

  rateLimitExceeded(retryAfter?: number): AppError {
    const message = retryAfter
      ? `Too many requests. Please try again in ${retryAfter} seconds`
      : 'Too many requests. Please try again later';
    return new AppError(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429, { retryAfter });
  },

  internalError(message: string = 'An unexpected error occurred', details?: any): AppError {
    return new AppError(
      ErrorCode.INTERNAL_ERROR,
      message,
      500,
      details,
      undefined,
      false // Not operational - indicates a programming error
    );
  },
};

/**
 * Error logger with context
 */
export class ErrorLogger {
  private static formatContext(context?: Record<string, any>): string {
    if (!context) return '';
    return Object.entries(context)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(' ');
  }

  static logError(error: Error | AppError, context?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const contextStr = this.formatContext(context);

    if (error instanceof AppError) {
      const logLevel = error.isOperational ? 'WARN' : 'ERROR';
      console.error(
        `[${timestamp}] [${logLevel}] ${error.code}: ${error.message}`,
        contextStr,
        error.details ? `\nDetails: ${JSON.stringify(error.details)}` : '',
        error.fallback ? `\nFallback available: true` : '',
        !error.isOperational ? `\nStack: ${error.stack}` : ''
      );
    } else {
      console.error(
        `[${timestamp}] [ERROR] Unexpected error: ${error.message}`,
        contextStr,
        `\nStack: ${error.stack}`
      );
    }
  }

  static logWarning(message: string, context?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const contextStr = this.formatContext(context);
    console.warn(`[${timestamp}] [WARN] ${message}`, contextStr);
  }

  static logInfo(message: string, context?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const contextStr = this.formatContext(context);
    console.info(`[${timestamp}] [INFO] ${message}`, contextStr);
  }
}

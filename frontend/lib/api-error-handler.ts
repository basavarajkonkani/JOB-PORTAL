/**
 * API Error Handler
 * Provides utilities for handling API errors consistently across the frontend
 */

export interface APIError {
  code: string;
  message: string;
  details?: any;
  fallback?: any;
  timestamp?: string;
  path?: string;
}

export interface APIErrorResponse {
  error?: string;
  code?: string;
  message?: string;
  details?: any;
  fallback?: any;
  retryAfter?: number;
}

/**
 * Parse error response from API
 */
export function parseAPIError(error: any): APIError {
  // Handle network errors
  if (!error.response) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to the server. Please check your internet connection.',
    };
  }

  const response = error.response;
  const data: APIErrorResponse = response.data || {};

  // Handle rate limiting
  if (response.status === 429) {
    const retryAfter = data.retryAfter || 60;
    return {
      code: data.code || 'RATE_LIMIT_EXCEEDED',
      message: data.message || `Too many requests. Please try again in ${retryAfter} seconds.`,
      details: { retryAfter },
    };
  }

  // Handle authentication errors
  if (response.status === 401) {
    return {
      code: data.code || 'UNAUTHORIZED',
      message: data.message || 'Please sign in to continue.',
    };
  }

  // Handle forbidden errors
  if (response.status === 403) {
    return {
      code: data.code || 'FORBIDDEN',
      message: data.message || 'You do not have permission to perform this action.',
    };
  }

  // Handle not found errors
  if (response.status === 404) {
    return {
      code: data.code || 'NOT_FOUND',
      message: data.message || 'The requested resource was not found.',
    };
  }

  // Handle validation errors
  if (response.status === 400) {
    return {
      code: data.code || 'VALIDATION_ERROR',
      message: data.message || 'Invalid input. Please check your data and try again.',
      details: data.details,
    };
  }

  // Handle AI service errors with fallback
  if (response.status === 503 && data.code === 'AI_SERVICE_ERROR') {
    return {
      code: data.code,
      message: data.message || 'AI service is temporarily unavailable.',
      fallback: data.fallback,
    };
  }

  // Handle server errors
  if (response.status >= 500) {
    return {
      code: data.code || 'INTERNAL_ERROR',
      message: data.message || 'An unexpected error occurred. Please try again later.',
    };
  }

  // Default error
  return {
    code: data.code || 'UNKNOWN_ERROR',
    message: data.message || error.message || 'An unexpected error occurred.',
    details: data.details,
  };
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: APIError): string {
  const messages: Record<string, string> = {
    NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
    UNAUTHORIZED: 'Please sign in to continue.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please slow down.',
    AI_SERVICE_ERROR: 'AI service is temporarily unavailable.',
    INTERNAL_ERROR: 'Something went wrong. Please try again.',
  };

  return messages[error.code] || error.message;
}

/**
 * Check if error has a fallback value
 */
export function hasFallback(error: APIError): boolean {
  return error.fallback !== undefined && error.fallback !== null;
}

/**
 * Get fallback value from error
 */
export function getFallback<T>(error: APIError, defaultValue?: T): T | undefined {
  return error.fallback !== undefined ? error.fallback : defaultValue;
}

/**
 * Check if error is retryable
 */
export function isRetryable(error: APIError): boolean {
  const retryableCodes = ['NETWORK_ERROR', 'INTERNAL_ERROR', 'AI_SERVICE_ERROR'];
  return retryableCodes.includes(error.code);
}

/**
 * Get retry delay in milliseconds
 */
export function getRetryDelay(error: APIError, attempt: number = 1): number {
  // Rate limit errors have specific retry-after
  if (error.code === 'RATE_LIMIT_EXCEEDED' && error.details?.retryAfter) {
    return error.details.retryAfter * 1000;
  }

  // Exponential backoff for other errors
  return Math.min(1000 * Math.pow(2, attempt - 1), 30000);
}

/**
 * Handle API error with toast notification
 */
export function handleAPIError(
  error: any,
  showToast?: (type: string, title: string, message?: string) => void
): APIError {
  const apiError = parseAPIError(error);
  const message = getUserFriendlyMessage(apiError);

  // Show toast notification if handler provided
  if (showToast) {
    if (apiError.code === 'AI_SERVICE_ERROR' && hasFallback(apiError)) {
      showToast('warning', 'Using Cached Result', message);
    } else if (apiError.code === 'RATE_LIMIT_EXCEEDED') {
      showToast('warning', 'Rate Limit Exceeded', message);
    } else {
      showToast('error', 'Error', message);
    }
  }

  return apiError;
}

export default {
  parseAPIError,
  getUserFriendlyMessage,
  hasFallback,
  getFallback,
  isRetryable,
  getRetryDelay,
  handleAPIError,
};

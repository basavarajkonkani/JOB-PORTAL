import { Request, Response, NextFunction } from 'express';
import { monitoringService } from '../services/monitoringService';
import logger from '../utils/logger';

/**
 * Middleware to track API response times
 */
export function responseTimeMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Capture response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const endpoint = req.route?.path || req.path;
    const method = req.method;
    const statusCode = res.statusCode;

    // Record metric
    monitoringService.recordResponseTime(endpoint, method, duration, statusCode);

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method,
        endpoint,
        duration,
        statusCode,
      });
    }
  });

  next();
}

/**
 * Middleware to log HTTP requests
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
}

/**
 * Middleware to track errors
 */
export function errorTrackingMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Record error
  monitoringService.recordError(error, {
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
    userId: (req as any).user?.id,
  });

  // Pass to next error handler
  next(error);
}

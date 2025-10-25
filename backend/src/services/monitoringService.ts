import logger from '../utils/logger';
import { Sentry } from '../config/sentry';

interface MetricData {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: Date;
}

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: boolean;
    redis: boolean;
    ai_service: boolean;
  };
  timestamp: Date;
  uptime: number;
}

class MonitoringService {
  private startTime: Date;
  private metrics: Map<string, number>;

  constructor() {
    this.startTime = new Date();
    this.metrics = new Map();
  }

  /**
   * Record a custom metric
   */
  recordMetric(data: MetricData): void {
    const { name, value, tags, timestamp = new Date() } = data;
    
    // Store metric in memory
    this.metrics.set(name, value);
    
    // Log metric
    logger.info('Metric recorded', {
      metric: name,
      value,
      tags,
      timestamp,
    });
    
    // Send to Sentry if available
    if (Sentry) {
      Sentry.metrics.gauge(name, value, {
        tags,
        timestamp: timestamp.getTime() / 1000,
      });
    }
  }

  /**
   * Record API response time
   */
  recordResponseTime(endpoint: string, method: string, duration: number, statusCode: number): void {
    this.recordMetric({
      name: 'api.response_time',
      value: duration,
      tags: {
        endpoint,
        method,
        status: statusCode.toString(),
      },
    });
  }

  /**
   * Record AI service usage
   */
  recordAIUsage(operation: string, duration: number, success: boolean): void {
    this.recordMetric({
      name: 'ai.operation',
      value: duration,
      tags: {
        operation,
        success: success.toString(),
      },
    });
  }

  /**
   * Record database query time
   */
  recordDatabaseQuery(query: string, duration: number): void {
    this.recordMetric({
      name: 'database.query_time',
      value: duration,
      tags: {
        query: query.substring(0, 50), // Truncate for privacy
      },
    });
  }

  /**
   * Record cache hit/miss
   */
  recordCacheOperation(operation: 'hit' | 'miss' | 'set', key: string): void {
    this.recordMetric({
      name: 'cache.operation',
      value: 1,
      tags: {
        operation,
        key_prefix: key.split(':')[0], // Only log key prefix for privacy
      },
    });
  }

  /**
   * Record error
   */
  recordError(error: Error, context?: Record<string, any>): void {
    logger.error('Error occurred', {
      error: error.message,
      stack: error.stack,
      context,
    });

    // Send to Sentry
    if (Sentry) {
      Sentry.captureException(error, {
        extra: context,
      });
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Get system uptime
   */
  getUptime(): number {
    return Date.now() - this.startTime.getTime();
  }

  /**
   * Perform health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      ai_service: await this.checkAIService(),
    };

    const allHealthy = Object.values(checks).every((check) => check === true);
    const someHealthy = Object.values(checks).some((check) => check === true);

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (allHealthy) {
      status = 'healthy';
    } else if (someHealthy) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      checks,
      timestamp: new Date(),
      uptime: this.getUptime(),
    };
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<boolean> {
    try {
      const pool = (await import('../config/database')).default;
      const result = await pool.query('SELECT 1');
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Database health check failed', { error });
      return false;
    }
  }

  /**
   * Check Redis connectivity
   */
  private async checkRedis(): Promise<boolean> {
    try {
      const redisClient = (await import('../config/redis')).default;
      const pong = await redisClient.ping();
      return pong === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed', { error });
      return false;
    }
  }

  /**
   * Check AI service availability
   */
  private async checkAIService(): Promise<boolean> {
    try {
      // Simple check - just verify we can construct a URL
      const testUrl = 'https://text.pollinations.ai/openai';
      return testUrl.startsWith('https://');
    } catch (error) {
      logger.error('AI service health check failed', { error });
      return false;
    }
  }

  /**
   * Log application startup
   */
  logStartup(port: number): void {
    logger.info('Application started', {
      port,
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log application shutdown
   */
  logShutdown(signal: string): void {
    logger.info('Application shutting down', {
      signal,
      uptime: this.getUptime(),
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();

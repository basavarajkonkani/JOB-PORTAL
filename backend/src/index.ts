import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import resumeRoutes from './routes/resume';
import aiRoutes from './routes/ai';
import jobRoutes from './routes/jobs';
import applicationRoutes from './routes/applications';
import recruiterRoutes from './routes/recruiter';
import analyticsRoutes from './routes/analytics';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { initSentry, getSentryMiddleware } from './config/sentry';
import { responseTimeMiddleware, requestLoggerMiddleware, errorTrackingMiddleware } from './middleware/monitoring';
import { monitoringService } from './services/monitoringService';
import logger from './utils/logger';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Initialize Sentry (must be first)
initSentry(app);
const sentryMiddleware = getSentryMiddleware();

// Sentry request handler (must be first middleware)
app.use(sentryMiddleware.requestHandler);
app.use(sentryMiddleware.tracingHandler);

// Monitoring middleware
app.use(responseTimeMiddleware);
if (process.env.NODE_ENV !== 'test') {
  app.use(requestLoggerMiddleware);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    const healthCheck = await monitoringService.performHealthCheck();
    const statusCode = healthCheck.status === 'healthy' ? 200 : healthCheck.status === 'degraded' ? 200 : 503;
    res.status(statusCode).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'AI Job Portal API' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Profile routes
app.use('/api', profileRoutes);

// Resume routes
app.use('/api', resumeRoutes);

// AI routes
app.use('/api/ai', aiRoutes);

// Job routes
app.use('/api/jobs', jobRoutes);

// Application routes
app.use('/api/applications', applicationRoutes);

// Recruiter routes
app.use('/api/recruiter', recruiterRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Sentry error handler (must be before other error handlers)
app.use(sentryMiddleware.errorHandler);

// Error tracking middleware
app.use(errorTrackingMiddleware);

// Error handler - must be last
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received, starting graceful shutdown`);
  monitoringService.logShutdown(signal);
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
app.listen(port, () => {
  monitoringService.logStartup(Number(port));
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

import express, { Response } from 'express';
import {
  authenticateFirebase,
  authenticateFirebaseOptional,
  AuthRequest,
} from '../middleware/firebaseAuth';
import { AnalyticsService, EventType } from '../services/analyticsService';

const router = express.Router();

/**
 * POST /api/analytics/event
 * Track an analytics event
 */
router.post('/event', authenticateFirebaseOptional, async (req: AuthRequest, res: Response) => {
  try {
    const { eventType, properties = {} } = req.body;

    if (!eventType) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Event type is required',
      });
    }

    // Validate event type
    const validEventTypes = Object.values(EventType);
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid event type',
      });
    }

    // Track the event
    await AnalyticsService.trackEvent({
      userId: req.user?.userId,
      eventType,
      properties,
    });

    res.status(201).json({
      success: true,
      message: 'Event tracked successfully',
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to track event',
    });
  }
});

/**
 * GET /api/analytics/metrics
 * Get aggregated metrics (admin only)
 */
router.get('/metrics', authenticateFirebase, async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Admin access required',
      });
    }

    // Parse date range from query params
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days

    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date(); // Default: now

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid date format',
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Start date must be before end date',
      });
    }

    // Get all metrics
    const metrics = await AnalyticsService.getAllMetrics(startDate, endDate);

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch metrics',
    });
  }
});

/**
 * GET /api/analytics/metrics/:metricName
 * Get a specific cached metric (admin only)
 */
router.get(
  '/metrics/:metricName',
  authenticateFirebase,
  async (req: AuthRequest, res: Response) => {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      const { metricName } = req.params;

      // Parse date range from query params
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;

      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      // Get cached metric
      const cachedMetric = await AnalyticsService.getCachedMetrics(
        metricName,
        startDate!,
        endDate!
      );

      if (!cachedMetric) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Metric not found',
        });
      }

      res.json(cachedMetric);
    } catch (error) {
      console.error('Error fetching metric:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Failed to fetch metric',
      });
    }
  }
);

export default router;

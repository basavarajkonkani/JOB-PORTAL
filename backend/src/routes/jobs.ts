import { Router, Request, Response } from 'express';
import { JobModel } from '../models/Job';
import { CandidateProfileModel } from '../models/CandidateProfile';
import { authenticateOptional } from '../middleware/auth';
import redisClient from '../config/redis';
import crypto from 'crypto';

const router = Router();

// Job search cache TTL: 5 minutes
const JOB_SEARCH_CACHE_TTL = 300;

/**
 * Generate cache key for job search
 */
function generateJobSearchCacheKey(filters: any, page: number, limit: number): string {
  const data = { filters, page, limit };
  const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  return `job:search:${hash}`;
}

/**
 * GET /api/jobs
 * Search and list jobs with filters (public endpoint, no auth required)
 * Implements caching with 5-minute TTL for performance
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      level,
      location,
      remote,
      page = '1',
      limit = '20',
    } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    // Validate pagination
    if (isNaN(pageNum) || pageNum < 1) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid page number',
      });
      return;
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid limit. Must be between 1 and 100',
      });
      return;
    }

    // Build filters
    const filters: any = {
      status: 'active', // Only show active jobs publicly
    };

    if (title) {
      filters.title = title as string;
    }

    if (level) {
      filters.level = level as string;
    }

    if (location) {
      filters.location = location as string;
    }

    if (remote !== undefined) {
      filters.remote = remote === 'true';
    }

    // Generate cache key
    const cacheKey = generateJobSearchCacheKey(filters, pageNum, limitNum);

    // Try to get from cache
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        console.log('Returning cached job search results');
        res.status(200).json(JSON.parse(cached));
        return;
      }
    } catch (cacheError) {
      console.error('Cache retrieval error:', cacheError);
      // Continue to database query if cache fails
    }

    // Search jobs from database
    const result = await JobModel.search({
      filters,
      page: pageNum,
      limit: limitNum,
    });

    // Cache the result
    try {
      await redisClient.setEx(cacheKey, JOB_SEARCH_CACHE_TTL, JSON.stringify(result));
    } catch (cacheError) {
      console.error('Cache storage error:', cacheError);
      // Continue even if caching fails
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Job search error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to search jobs',
    });
  }
});

/**
 * GET /api/jobs/:id
 * Get job detail with optional user context (public endpoint)
 */
router.get('/:id', authenticateOptional, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    // Get job
    const job = await JobModel.findById(id);

    if (!job) {
      res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Job not found',
      });
      return;
    }

    // Only show active jobs publicly (unless user is the creator)
    if (job.status !== 'active' && job.createdBy !== userId) {
      res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Job not found',
      });
      return;
    }

    // If user is authenticated and is a candidate, include profile context
    let candidateProfile = null;
    if (userId) {
      candidateProfile = await CandidateProfileModel.findByUserId(userId);
    }

    res.status(200).json({
      job,
      candidateProfile: candidateProfile || undefined,
    });
  } catch (error) {
    console.error('Get job detail error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to retrieve job',
    });
  }
});

export default router;

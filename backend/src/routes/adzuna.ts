import express, { Request, Response } from 'express';
import axios from 'axios';
import logger from '../utils/logger';

const router = express.Router();

// Adzuna API configuration
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID || '4c8fcee3';
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY || '1bde55fe7193f2afb4f0e4ab46534e2b';
const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs/in/search';

interface AdzunaSearchParams {
  what?: string;
  where?: string;
  results_per_page?: number;
  page?: number;
}

/**
 * GET /api/adzuna/search
 * Search for jobs using Adzuna API
 * Query params:
 * - what: job title or keywords (e.g., "developer", "designer")
 * - where: location (e.g., "bangalore", "mumbai")
 * - results_per_page: number of results (default: 10, max: 50)
 * - page: page number (default: 1)
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const {
      what = '',
      where = '',
      results_per_page = 10,
      page = 1,
    } = req.query as AdzunaSearchParams;

    // Validate parameters
    const resultsPerPage = Math.min(Number(results_per_page) || 10, 50);
    const pageNumber = Math.max(Number(page) || 1, 1);

    // Build Adzuna API URL
    const adzunaUrl = `${ADZUNA_BASE_URL}/${pageNumber}`;
    const params = {
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY,
      results_per_page: resultsPerPage,
      what: what || undefined,
      where: where || undefined,
    };

    logger.info('Fetching jobs from Adzuna', {
      what,
      where,
      page: pageNumber,
      results_per_page: resultsPerPage,
    });

    // Make request to Adzuna API
    const response = await axios.get(adzunaUrl, {
      params,
      timeout: 10000, // 10 second timeout
    });

    // Transform the response to match our frontend needs
    const transformedResults = response.data.results.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      salary_is_predicted: job.salary_is_predicted,
      description: job.description,
      created: job.created,
      redirect_url: job.redirect_url,
      category: job.category?.label || 'Other',
      contract_type: job.contract_type,
    }));

    res.json({
      success: true,
      count: response.data.count,
      results: transformedResults,
      page: pageNumber,
      results_per_page: resultsPerPage,
    });
  } catch (error: any) {
    logger.error('Error fetching jobs from Adzuna', {
      error: error.message,
      status: error.response?.status,
    });

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
      });
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(500).json({
        success: false,
        error: 'API authentication failed. Please contact support.',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs. Please try again later.',
    });
  }
});

/**
 * GET /api/adzuna/categories
 * Get available job categories
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const adzunaUrl = 'https://api.adzuna.com/v1/api/jobs/in/categories';
    const params = {
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY,
    };

    const response = await axios.get(adzunaUrl, {
      params,
      timeout: 10000,
    });

    res.json({
      success: true,
      categories: response.data.results,
    });
  } catch (error: any) {
    logger.error('Error fetching categories from Adzuna', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories.',
    });
  }
});

export default router;

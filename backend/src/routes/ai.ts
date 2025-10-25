import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { rateLimiter } from '../middleware/rateLimiter';
import { ErrorFactory, AppError } from '../utils/errors';
import {
  generateFitSummary,
  generateCoverLetter,
  improveResumeBullets,
  generateJD,
  rankCandidates,
  generateScreeningQuestions,
  generateImage,
} from '../services/aiService';
import { JobData, CandidateProfile, Application } from '../services/aiPrompts';

const router = express.Router();

// Rate limiter for AI endpoints: 100 requests per minute per user, 500 per IP
const aiRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  byUser: true,
});

/**
 * POST /api/ai/fit-summary
 * Generate fit summary for candidate-job match
 */
router.post('/fit-summary', authenticate, aiRateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { jobData, candidateProfile } = req.body as {
    jobData: JobData;
    candidateProfile: CandidateProfile;
  };

  if (!jobData || !candidateProfile) {
    throw ErrorFactory.validationError('Missing required fields: jobData and candidateProfile');
  }

  try {
    const summary = await generateFitSummary(jobData, candidateProfile);

    res.json({
      summary,
      items: null,
      actions: [
        {
          label: 'Generate Cover Letter',
          type: 'primary',
          handler: 'generateCoverLetter',
        },
      ],
    });
  } catch (error) {
    if (error instanceof AppError && error.fallback) {
      // Return cached result with warning
      return res.status(200).json({
        summary: error.fallback,
        items: null,
        warning: error.message,
        actions: [
          {
            label: 'Generate Cover Letter',
            type: 'primary',
            handler: 'generateCoverLetter',
          },
        ],
      });
    }
    throw error;
  }
}));

/**
 * POST /api/ai/cover-letter
 * Generate tailored cover letter
 */
router.post('/cover-letter', authenticate, aiRateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { jobData, candidateProfile } = req.body as {
    jobData: JobData;
    candidateProfile: CandidateProfile;
  };

  if (!jobData || !candidateProfile) {
    throw ErrorFactory.validationError('Missing required fields: jobData and candidateProfile');
  }

  try {
    const coverLetter = await generateCoverLetter(jobData, candidateProfile);

    res.json({
      summary: 'Cover letter generated successfully',
      items: [coverLetter],
      actions: [
        {
          label: 'Use This Cover Letter',
          type: 'primary',
          handler: 'useCoverLetter',
        },
        {
          label: 'Regenerate',
          type: 'secondary',
          handler: 'regenerateCoverLetter',
        },
      ],
    });
  } catch (error) {
    if (error instanceof AppError && error.fallback) {
      return res.status(200).json({
        summary: 'Using cached cover letter',
        items: [error.fallback],
        warning: error.message,
        actions: [
          {
            label: 'Use This Cover Letter',
            type: 'primary',
            handler: 'useCoverLetter',
          },
        ],
      });
    }
    throw error;
  }
}));

/**
 * POST /api/ai/resume-improve
 * Get resume improvement suggestions
 */
router.post('/resume-improve', authenticate, aiRateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { bullets } = req.body as { bullets: string[] };

  if (!bullets || !Array.isArray(bullets) || bullets.length === 0) {
    throw ErrorFactory.validationError('Missing or invalid bullets array');
  }

  try {
    const improvements = await improveResumeBullets(bullets);

    res.json({
      summary: 'Resume improvements generated',
      items: [improvements],
      actions: [
        {
          label: 'Apply Suggestions',
          type: 'primary',
          handler: 'applyImprovements',
        },
      ],
    });
  } catch (error) {
    if (error instanceof AppError && error.fallback) {
      return res.status(200).json({
        summary: 'Using cached suggestions',
        items: [error.fallback],
        warning: error.message,
        actions: [
          {
            label: 'Apply Suggestions',
            type: 'primary',
            handler: 'applyImprovements',
          },
        ],
      });
    }
    throw error;
  }
}));

/**
 * POST /api/ai/jd-generate
 * Generate job description from notes
 */
router.post('/jd-generate', authenticate, aiRateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { notes } = req.body as { notes: string };

  if (!notes || notes.trim().length === 0) {
    throw ErrorFactory.validationError('Missing or empty notes field');
  }

  try {
    const jd = await generateJD(notes);

    res.json({
      summary: 'Job description generated successfully',
      items: [jd],
      actions: [
        {
          label: 'Use This JD',
          type: 'primary',
          handler: 'useJD',
        },
        {
          label: 'Regenerate',
          type: 'secondary',
          handler: 'regenerateJD',
        },
      ],
    });
  } catch (error) {
    if (error instanceof AppError && error.fallback) {
      return res.status(200).json({
        summary: 'Using cached job description',
        items: [error.fallback],
        warning: error.message,
        actions: [
          {
            label: 'Use This JD',
            type: 'primary',
            handler: 'useJD',
          },
        ],
      });
    }
    throw error;
  }
}));

/**
 * POST /api/ai/shortlist
 * Rank candidates with rationale
 */
router.post('/shortlist', authenticate, aiRateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { jobData, applications } = req.body as {
    jobData: JobData;
    applications: Application[];
  };

  if (!jobData || !applications || !Array.isArray(applications)) {
    throw ErrorFactory.validationError('Missing required fields: jobData and applications array');
  }

  try {
    const ranking = await rankCandidates(jobData, applications);

    res.json({
      summary: 'Candidates ranked by fit score',
      items: [ranking],
      actions: [
        {
          label: 'View Top Candidates',
          type: 'primary',
          handler: 'viewShortlist',
        },
      ],
    });
  } catch (error) {
    if (error instanceof AppError && error.fallback) {
      return res.status(200).json({
        summary: 'Using cached ranking',
        items: [error.fallback],
        warning: error.message,
        actions: [
          {
            label: 'View Top Candidates',
            type: 'primary',
            handler: 'viewShortlist',
          },
        ],
      });
    }
    throw error;
  }
}));

/**
 * POST /api/ai/screening-questions
 * Generate screening questions for candidate
 */
router.post('/screening-questions', authenticate, aiRateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { jobData, candidateProfile } = req.body as {
    jobData: JobData;
    candidateProfile: CandidateProfile;
  };

  if (!jobData || !candidateProfile) {
    throw ErrorFactory.validationError('Missing required fields: jobData and candidateProfile');
  }

  try {
    const questions = await generateScreeningQuestions(jobData, candidateProfile);

    res.json({
      summary: 'Screening questions generated',
      items: [questions],
      actions: null,
    });
  } catch (error) {
    if (error instanceof AppError && error.fallback) {
      return res.status(200).json({
        summary: 'Using cached questions',
        items: [error.fallback],
        warning: error.message,
        actions: null,
      });
    }
    throw error;
  }
}));

/**
 * POST /api/ai/image
 * Generate image URL with Pollinations
 */
router.post('/image', authenticate, aiRateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { prompt, width, height, seed } = req.body as {
    prompt: string;
    width?: number;
    height?: number;
    seed?: number;
  };

  if (!prompt || prompt.trim().length === 0) {
    throw ErrorFactory.validationError('Missing or empty prompt field');
  }

  const imageUrl = await generateImage(prompt, { width, height, seed });

  res.json({
    summary: 'Image URL generated',
    imageUrl,
    actions: null,
  });
}));

export default router;

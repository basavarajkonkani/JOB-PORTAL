import { Router, Request, Response } from 'express';
import { CandidateProfileModel } from '../models/CandidateProfile';
import { RecruiterProfileModel } from '../models/RecruiterProfile';
import { OrgModel } from '../models/Org';
import { UserModel } from '../models/User';
import { authenticate } from '../middleware/auth';
import { validateCandidateProfileData, validateRecruiterProfileData } from '../utils/validation';

const router = Router();

/**
 * GET /api/candidate/profile
 * Get candidate profile for authenticated user
 */
router.get('/candidate/profile', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
      return;
    }

    // Check if user is a candidate
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'candidate') {
      res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Access denied. Candidate role required.',
      });
      return;
    }

    // Get profile
    const profile = await CandidateProfileModel.findByUserId(userId);

    if (!profile) {
      res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Profile not found',
      });
      return;
    }

    res.status(200).json({
      profile,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Get candidate profile error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to retrieve profile',
    });
  }
});

/**
 * PUT /api/candidate/profile
 * Update candidate profile for authenticated user
 */
router.put('/candidate/profile', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
      return;
    }

    // Check if user is a candidate
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'candidate') {
      res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Access denied. Candidate role required.',
      });
      return;
    }

    // Validate input
    const validationErrors = validateCandidateProfileData(req.body);
    if (validationErrors.length > 0) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        errors: validationErrors,
      });
      return;
    }

    // Check if profile exists
    const existingProfile = await CandidateProfileModel.findByUserId(userId);

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await CandidateProfileModel.update(userId, req.body);
    } else {
      // Create new profile
      profile = await CandidateProfileModel.create({
        userId,
        ...req.body,
      });
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error('Update candidate profile error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to update profile',
    });
  }
});

/**
 * GET /api/recruiter/profile
 * Get recruiter profile for authenticated user
 */
router.get('/recruiter/profile', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
      return;
    }

    // Check if user is a recruiter
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'recruiter') {
      res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Access denied. Recruiter role required.',
      });
      return;
    }

    // Get profile
    const profile = await RecruiterProfileModel.findByUserId(userId);

    if (!profile) {
      res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Profile not found',
      });
      return;
    }

    // Get organization if associated
    let org = null;
    if (profile.orgId) {
      org = await OrgModel.findById(profile.orgId);
    }

    res.status(200).json({
      profile,
      org,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Get recruiter profile error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to retrieve profile',
    });
  }
});

/**
 * PUT /api/recruiter/profile
 * Update recruiter profile for authenticated user
 */
router.put('/recruiter/profile', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
      return;
    }

    // Check if user is a recruiter
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'recruiter') {
      res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Access denied. Recruiter role required.',
      });
      return;
    }

    // Validate input
    const validationErrors = validateRecruiterProfileData(req.body);
    if (validationErrors.length > 0) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        errors: validationErrors,
      });
      return;
    }

    // If orgId is provided, verify it exists
    if (req.body.orgId) {
      const org = await OrgModel.findById(req.body.orgId);
      if (!org) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Organization not found',
        });
        return;
      }
    }

    // Check if profile exists
    const existingProfile = await RecruiterProfileModel.findByUserId(userId);

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await RecruiterProfileModel.update(userId, req.body);
    } else {
      // Create new profile
      profile = await RecruiterProfileModel.create({
        userId,
        ...req.body,
      });
    }

    // Get organization if associated
    let org = null;
    if (profile?.orgId) {
      org = await OrgModel.findById(profile.orgId);
    }

    res.status(200).json({ profile, org });
  } catch (error) {
    console.error('Update recruiter profile error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to update profile',
    });
  }
});

export default router;

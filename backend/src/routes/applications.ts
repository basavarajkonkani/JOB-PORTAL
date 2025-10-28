import express, { Response } from 'express';
import { authenticateFirebase, AuthRequest } from '../middleware/firebaseAuth';
import { ApplicationModel } from '../models/Application';
import { JobModel } from '../models/Job';
import { ResumeVersionModel } from '../models/Resume';
import RealtimeService from '../services/realtimeService';

const router = express.Router();

// POST /api/applications - Submit a job application
router.post('/', authenticateFirebase, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
      return;
    }

    const { jobId, resumeVersionId, coverLetter } = req.body;

    // Validate required fields
    if (!jobId) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Job ID is required',
      });
      return;
    }

    if (!resumeVersionId) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Resume version ID is required',
      });
      return;
    }

    // Check if job exists and is active
    const job = await JobModel.findById(jobId);
    if (!job) {
      res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Job not found',
      });
      return;
    }

    if (job.status !== 'active') {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'This job is not accepting applications',
      });
      return;
    }

    // Note: Resume version validation is skipped here as it requires both resumeId and versionId
    // The frontend should ensure valid resume versions are submitted

    // Check if user has already applied to this job
    const alreadyApplied = await ApplicationModel.existsByJobAndUser(jobId, userId);
    if (alreadyApplied) {
      res.status(400).json({
        code: 'ALREADY_EXISTS',
        message: 'You have already applied to this job',
      });
      return;
    }

    // Create application
    const application = await ApplicationModel.create({
      jobId,
      userId,
      resumeVersionId,
      coverLetter: coverLetter || '',
      status: 'submitted',
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application: {
        id: application.id,
        jobId: application.jobId,
        userId: application.userId,
        resumeVersionId: application.resumeVersionId,
        coverLetter: application.coverLetter,
        status: application.status,
        notes: application.notes,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to submit application',
    });
  }
});

// GET /api/applications - Get all applications for authenticated user
router.get('/', authenticateFirebase, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
      return;
    }

    const applications = await ApplicationModel.findByUserId(userId);
    const statusCounts = await ApplicationModel.getStatusCountsByUserId(userId);

    res.json({
      applications,
      statusCounts,
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch applications',
    });
  }
});

// PUT /api/applications/:id - Update application notes and status
router.put('/:id', authenticateFirebase, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
      return;
    }

    const { id } = req.params;
    const { notes, status } = req.body;

    // Fetch application
    const application = await ApplicationModel.findById(id);
    if (!application) {
      res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Application not found',
      });
      return;
    }

    // Authorization check
    // Candidates can only update their own applications (notes only)
    // Recruiters can update status and notes for applications to their jobs
    if (userRole === 'candidate') {
      if (application.userId !== userId) {
        res.status(403).json({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this application',
        });
        return;
      }

      // Candidates can only update notes, not status
      if (status !== undefined) {
        res.status(403).json({
          code: 'FORBIDDEN',
          message: 'Candidates cannot update application status',
        });
        return;
      }
    } else if (userRole === 'recruiter') {
      // Verify recruiter owns the job
      const job = await JobModel.findById(application.jobId);
      if (!job || job.createdBy !== userId) {
        res.status(403).json({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this application',
        });
        return;
      }
    }

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['submitted', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid status value',
        });
        return;
      }
    }

    // Update application
    const updateData: any = {};
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    const updatedApplication = await ApplicationModel.update(id, updateData);

    // Broadcast realtime update if status changed
    if (status !== undefined && updatedApplication) {
      try {
        const job = await JobModel.findById(application.jobId);
        if (job) {
          await RealtimeService.broadcastApplicationUpdate(application.userId, id, {
            status: updatedApplication.status,
            jobTitle: job.title,
            jobId: job.id,
          });
        }
      } catch (realtimeError) {
        // Log error but don't fail the request
        console.error('Failed to broadcast realtime update:', realtimeError);
      }
    }

    res.json({
      message: 'Application updated successfully',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to update application',
    });
  }
});

export default router;

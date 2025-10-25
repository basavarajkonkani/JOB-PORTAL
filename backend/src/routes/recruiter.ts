import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { JobModel, CreateJobData } from '../models/Job';
import { RecruiterProfileModel } from '../models/RecruiterProfile';
import { generateJD, generateImage } from '../services/aiService';

const router = Router();

// All routes require authentication and recruiter role
router.use(authenticate);
router.use(authorize('recruiter'));

/**
 * POST /api/recruiter/jobs
 * Create a new job posting with optional AI JD generation
 */
router.post('/jobs', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const {
      notes,
      generateWithAI,
      title,
      level,
      location,
      type,
      remote,
      description,
      requirements,
      compensation,
      benefits,
      status,
    } = req.body;

    // Get recruiter profile to get orgId
    const recruiterProfile = await RecruiterProfileModel.findByUserId(userId);
    
    if (!recruiterProfile) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Recruiter profile not found. Please complete your profile first.',
      });
      return;
    }

    if (!recruiterProfile.orgId) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Organization not set. Please associate with an organization first.',
      });
      return;
    }

    let jobData: CreateJobData;

    // If generateWithAI is true, use AI to generate JD from notes
    if (generateWithAI && notes) {
      try {
        const generatedJD = await generateJD(notes);
        
        // Parse the AI-generated JD (expecting JSON format)
        let parsedJD;
        try {
          parsedJD = JSON.parse(generatedJD);
        } catch (parseError) {
          console.error('Failed to parse AI-generated JD:', parseError);
          res.status(500).json({
            code: 'AI_SERVICE_ERROR',
            message: 'Failed to parse AI-generated job description',
            details: generatedJD,
          });
          return;
        }

        jobData = {
          orgId: recruiterProfile.orgId,
          createdBy: userId,
          title: parsedJD.title || 'Untitled Position',
          level: parsedJD.level || 'mid',
          location: parsedJD.location || 'Remote',
          type: parsedJD.type || 'full-time',
          remote: parsedJD.remote ?? true,
          description: parsedJD.description || '',
          requirements: parsedJD.requirements || [],
          compensation: parsedJD.compensation || { currency: 'USD' },
          benefits: parsedJD.benefits || [],
          status: status || 'draft',
        };
      } catch (aiError) {
        console.error('AI JD generation error:', aiError);
        res.status(503).json({
          code: 'AI_SERVICE_ERROR',
          message: 'AI service temporarily unavailable. Please try manual entry.',
          fallback: {
            action: 'manual_entry',
            notes: notes,
          },
        });
        return;
      }
    } else {
      // Manual job creation - validate required fields
      if (!title || !level || !location || !type || remote === undefined || !description) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: title, level, location, type, remote, description',
        });
        return;
      }

      jobData = {
        orgId: recruiterProfile.orgId,
        createdBy: userId,
        title,
        level,
        location,
        type,
        remote,
        description,
        requirements: requirements || [],
        compensation: compensation || { currency: 'USD' },
        benefits: benefits || [],
        status: status || 'draft',
      };
    }

    // Create the job
    const job = await JobModel.create(jobData);

    res.status(201).json({
      job,
      message: generateWithAI ? 'Job created with AI-generated description' : 'Job created successfully',
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to create job',
    });
  }
});

/**
 * PUT /api/recruiter/jobs/:id
 * Update an existing job posting
 */
router.put('/jobs/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const {
      title,
      level,
      location,
      type,
      remote,
      description,
      requirements,
      compensation,
      benefits,
      heroImageUrl,
      status,
      generateHeroImage,
    } = req.body;

    // Get the job to verify ownership
    const existingJob = await JobModel.findById(id);

    if (!existingJob) {
      res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Job not found',
      });
      return;
    }

    // Verify the user is the creator
    if (existingJob.createdBy !== userId) {
      res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You do not have permission to update this job',
      });
      return;
    }

    // Build update data
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (level !== undefined) updateData.level = level;
    if (location !== undefined) updateData.location = location;
    if (type !== undefined) updateData.type = type;
    if (remote !== undefined) updateData.remote = remote;
    if (description !== undefined) updateData.description = description;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (compensation !== undefined) updateData.compensation = compensation;
    if (benefits !== undefined) updateData.benefits = benefits;
    if (status !== undefined) updateData.status = status;

    // Generate hero image if requested
    if (generateHeroImage) {
      try {
        const imagePrompt = `Professional hero banner for ${existingJob.title} position at a modern tech company, clean and corporate style`;
        const imageUrl = await generateImage(imagePrompt, {
          width: 1200,
          height: 630,
          seed: parseInt(id.substring(0, 8), 16), // Use job ID as seed for consistency
        });
        updateData.heroImageUrl = imageUrl;
      } catch (imageError) {
        console.error('Hero image generation error:', imageError);
        // Continue without image - non-blocking error
      }
    } else if (heroImageUrl !== undefined) {
      updateData.heroImageUrl = heroImageUrl;
    }

    // Update the job
    const updatedJob = await JobModel.update(id, updateData);

    res.status(200).json({
      job: updatedJob,
      message: 'Job updated successfully',
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to update job',
    });
  }
});

/**
 * DELETE /api/recruiter/jobs/:id
 * Soft delete a job (set status to 'closed')
 */
router.delete('/jobs/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Get the job to verify ownership
    const existingJob = await JobModel.findById(id);

    if (!existingJob) {
      res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Job not found',
      });
      return;
    }

    // Verify the user is the creator
    if (existingJob.createdBy !== userId) {
      res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You do not have permission to delete this job',
      });
      return;
    }

    // Soft delete by setting status to 'closed'
    const closedJob = await JobModel.delete(id);

    res.status(200).json({
      job: closedJob,
      message: 'Job closed successfully',
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to close job',
    });
  }
});

/**
 * GET /api/recruiter/jobs
 * Get all jobs created by the recruiter
 */
router.get('/jobs', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const jobs = await JobModel.findByCreatedBy(userId);

    res.status(200).json({
      jobs,
      total: jobs.length,
    });
  } catch (error) {
    console.error('Get recruiter jobs error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to retrieve jobs',
    });
  }
});

/**
 * GET /api/recruiter/dashboard
 * Get dashboard statistics for recruiter
 */
router.get('/dashboard', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Get all jobs created by recruiter
    const jobs = await JobModel.findByCreatedBy(userId);

    // Calculate statistics
    const activeJobs = jobs.filter((job) => job.status === 'active').length;
    const draftJobs = jobs.filter((job) => job.status === 'draft').length;
    const closedJobs = jobs.filter((job) => job.status === 'closed').length;

    // Get application counts for active jobs
    const { ApplicationModel } = await import('../models/Application');
    
    let totalApplications = 0;
    let submittedCount = 0;
    let reviewedCount = 0;
    let shortlistedCount = 0;

    for (const job of jobs.filter((j) => j.status === 'active')) {
      const applications = await ApplicationModel.findByJobId(job.id);
      totalApplications += applications.length;
      
      applications.forEach((app) => {
        if (app.status === 'submitted') submittedCount++;
        if (app.status === 'reviewed') reviewedCount++;
        if (app.status === 'shortlisted') shortlistedCount++;
      });
    }

    res.status(200).json({
      jobs: {
        active: activeJobs,
        draft: draftJobs,
        closed: closedJobs,
        total: jobs.length,
      },
      applications: {
        total: totalApplications,
        submitted: submittedCount,
        reviewed: reviewedCount,
        shortlisted: shortlistedCount,
      },
      recentJobs: jobs.slice(0, 5), // Last 5 jobs
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to retrieve dashboard data',
    });
  }
});

/**
 * GET /api/recruiter/jobs/:id/candidates
 * Get candidates for a job with optional AI ranking
 */
router.get('/jobs/:id/candidates', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id: jobId } = req.params;
    const { rankWithAI, sortBy, filterByStatus } = req.query;

    // Get the job to verify ownership
    const job = await JobModel.findById(jobId);

    if (!job) {
      res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Job not found',
      });
      return;
    }

    // Verify the user is the creator
    if (job.createdBy !== userId) {
      res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You do not have permission to view candidates for this job',
      });
      return;
    }

    // Get all applications for this job
    const { ApplicationModel } = await import('../models/Application');
    let applications = await ApplicationModel.findByJobId(jobId);

    // Filter by status if requested
    if (filterByStatus && typeof filterByStatus === 'string') {
      applications = applications.filter((app) => app.status === filterByStatus);
    }

    // Get candidate profiles and resume data for each application
    const { CandidateProfileModel } = await import('../models/CandidateProfile');
    const { UserModel } = await import('../models/User');
    const { ResumeVersionModel } = await import('../models/Resume');
    const { generateScreeningQuestions, rankCandidates } = await import('../services/aiService');

    const candidatesWithDetails = await Promise.all(
      applications.map(async (app) => {
        const user = await UserModel.findById(app.userId);
        const profile = await CandidateProfileModel.findByUserId(app.userId);
        const resumeVersion = await ResumeVersionModel.findById(app.resumeVersionId);

        return {
          applicationId: app.id,
          userId: app.userId,
          name: user?.name || 'Unknown',
          email: user?.email || '',
          status: app.status,
          coverLetter: app.coverLetter,
          notes: app.notes,
          aiScore: app.aiScore,
          aiRationale: app.aiRationale,
          appliedAt: app.createdAt,
          profile: profile || null,
          resumeData: resumeVersion?.parsedData || null,
        };
      })
    );

    // If AI ranking is requested, generate rankings and screening questions
    if (rankWithAI === 'true' && candidatesWithDetails.length > 0) {
      try {
        // Prepare job data for AI
        const jobData = {
          title: job.title,
          level: job.level,
          location: job.location,
          type: job.type,
          remote: job.remote,
          description: job.description,
          requirements: job.requirements,
          compensation: job.compensation,
          benefits: job.benefits,
        };

        // Prepare applications data for AI ranking
        const applicationsForRanking = candidatesWithDetails.map((candidate) => ({
          candidateProfile: {
            name: candidate.name,
            location: candidate.profile?.location || '',
            skills: candidate.profile?.skills || [],
            experience: candidate.profile?.experience || [],
            education: candidate.profile?.education || [],
          },
          resumeData: candidate.resumeData,
          coverLetter: candidate.coverLetter,
        }));

        // Get AI rankings
        const rankingResult = await rankCandidates(jobData, applicationsForRanking);

        // Parse the AI ranking result
        let rankings: Array<{
          candidateIndex: number;
          score: number;
          rationale: string;
          strength: string;
          concern: string;
        }> = [];

        try {
          // Try to parse as JSON first
          rankings = JSON.parse(rankingResult);
        } catch (parseError) {
          // If not JSON, parse the text format
          const candidateBlocks = rankingResult.split(/CANDIDATE \d+:/i).filter(Boolean);
          
          rankings = candidateBlocks.map((block, index) => {
            const scoreMatch = block.match(/Score[:\s]+(\d+)\/100/i);
            const rationaleMatch = block.match(/Rationale[:\s]+(.+?)(?=Strength:|$)/is);
            const strengthMatch = block.match(/Strength[:\s]+(.+?)(?=Concern:|$)/is);
            const concernMatch = block.match(/Concern[:\s]+(.+?)$/is);

            return {
              candidateIndex: index,
              score: scoreMatch ? parseInt(scoreMatch[1], 10) : 50,
              rationale: rationaleMatch ? rationaleMatch[1].trim() : 'No rationale provided',
              strength: strengthMatch ? strengthMatch[1].trim() : 'N/A',
              concern: concernMatch ? concernMatch[1].trim() : 'None identified',
            };
          });
        }

        // Generate screening questions for each candidate
        const candidatesWithAI = await Promise.all(
          candidatesWithDetails.map(async (candidate, index) => {
            const ranking = rankings[index] || {
              score: 50,
              rationale: 'Unable to generate ranking',
              strength: 'N/A',
              concern: 'N/A',
            };

            let screeningQuestions: string[] = [];
            
            if (candidate.profile) {
              try {
                const questionsResult = await generateScreeningQuestions(jobData, {
                  name: candidate.name,
                  location: candidate.profile.location,
                  skills: candidate.profile.skills,
                  experience: candidate.profile.experience,
                  education: candidate.profile.education,
                });

                // Parse screening questions
                screeningQuestions = questionsResult
                  .split('\n')
                  .filter((line) => /^\d+\./.test(line.trim()))
                  .map((line) => line.replace(/^\d+\.\s*/, '').trim());
              } catch (error) {
                console.error('Error generating screening questions:', error);
                screeningQuestions = ['Unable to generate screening questions'];
              }
            }

            // Update application with AI score and rationale
            await ApplicationModel.update(candidate.applicationId, {
              aiScore: ranking.score,
              aiRationale: ranking.rationale,
            });

            return {
              ...candidate,
              aiScore: ranking.score,
              aiRationale: ranking.rationale,
              aiStrength: ranking.strength,
              aiConcern: ranking.concern,
              screeningQuestions,
            };
          })
        );

        // Sort by AI score (highest first)
        candidatesWithAI.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));

        res.status(200).json({
          job: {
            id: job.id,
            title: job.title,
            level: job.level,
          },
          candidates: candidatesWithAI,
          total: candidatesWithAI.length,
          rankedWithAI: true,
        });
        return;
      } catch (aiError) {
        console.error('AI ranking error:', aiError);
        // Fall through to return unranked candidates
      }
    }

    // Sort candidates if requested (without AI)
    if (sortBy === 'date') {
      candidatesWithDetails.sort((a, b) => 
        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      );
    } else if (sortBy === 'score' && candidatesWithDetails.some((c) => c.aiScore)) {
      candidatesWithDetails.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
    }

    res.status(200).json({
      job: {
        id: job.id,
        title: job.title,
        level: job.level,
      },
      candidates: candidatesWithDetails,
      total: candidatesWithDetails.length,
      rankedWithAI: false,
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to retrieve candidates',
    });
  }
});

export default router;

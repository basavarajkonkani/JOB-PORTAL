import request from 'supertest';
import express from 'express';
import authRouter from '../routes/auth';
import recruiterRouter from '../routes/recruiter';
import { OrgModel } from '../models/Org';
import { RecruiterProfileModel } from '../models/RecruiterProfile';
import { JobModel } from '../models/Job';
import { ResumeModel, ResumeVersionModel } from '../models/Resume';
import { ApplicationModel } from '../models/Application';
import { CandidateProfileModel } from '../models/CandidateProfile';
import * as aiService from '../services/aiService';
import './setup';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/recruiter', recruiterRouter);

// Mock AI service
jest.mock('../services/aiService');

describe('Recruiter JD Creation and Shortlist Integration Tests', () => {
  let recruiterToken: string;
  let recruiterUserId: string;
  let orgId: string;
  let candidateUserId: string;
  let candidateToken: string;

  beforeEach(async () => {
    // Create recruiter user
    const recruiterResponse = await request(app).post('/api/auth/signup').send({
      email: 'recruiter@example.com',
      password: 'SecurePass123!',
      name: 'Test Recruiter',
      role: 'recruiter',
    });

    recruiterToken = recruiterResponse.body.accessToken;
    recruiterUserId = recruiterResponse.body.user.id;

    // Create organization
    const org = await OrgModel.create({
      name: 'Test Company',
      website: 'https://testcompany.com',
    });
    orgId = org.id;

    // Create recruiter profile
    await RecruiterProfileModel.create({ userId: recruiterUserId, orgId });

    // Create candidate user
    const candidateResponse = await request(app).post('/api/auth/signup').send({
      email: 'candidate@example.com',
      password: 'SecurePass123!',
      name: 'Test Candidate',
      role: 'candidate',
    });

    candidateToken = candidateResponse.body.accessToken;
    candidateUserId = candidateResponse.body.user.id;

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('POST /api/recruiter/jobs - JD Creation', () => {
    it('should create job with AI-generated JD', async () => {
      const mockJD = JSON.stringify({
        title: 'Senior Software Engineer',
        level: 'senior',
        location: 'San Francisco, CA',
        type: 'full-time',
        remote: true,
        description: 'We are seeking a talented Senior Software Engineer to join our team...',
        requirements: ['5+ years experience', 'TypeScript', 'React', 'Node.js'],
        compensation: { min: 150000, max: 200000, currency: 'USD' },
        benefits: ['Health insurance', '401k', 'Remote work', 'Unlimited PTO'],
      });

      (aiService.generateJD as jest.Mock).mockResolvedValue(mockJD);

      const response = await request(app)
        .post('/api/recruiter/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          notes:
            'Need senior engineer with TypeScript and React. Remote OK. Salary 150-200k. Good benefits.',
          generateWithAI: true,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('job');
      expect(response.body.job.title).toBe('Senior Software Engineer');
      expect(response.body.job.level).toBe('senior');
      expect(response.body.job.remote).toBe(true);
      expect(response.body.job.requirements).toContain('TypeScript');
      expect(response.body.message).toContain('AI-generated');
      expect(aiService.generateJD).toHaveBeenCalledWith(
        'Need senior engineer with TypeScript and React. Remote OK. Salary 150-200k. Good benefits.'
      );
    });

    it('should create job manually without AI', async () => {
      const response = await request(app)
        .post('/api/recruiter/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          generateWithAI: false,
          title: 'Backend Developer',
          level: 'mid',
          location: 'New York, NY',
          type: 'full-time',
          remote: false,
          description: 'Looking for a backend developer...',
          requirements: ['3+ years experience', 'Python', 'Django'],
          compensation: { min: 100000, max: 130000, currency: 'USD' },
          benefits: ['Health insurance'],
          status: 'draft',
        });

      expect(response.status).toBe(201);
      expect(response.body.job.title).toBe('Backend Developer');
      expect(response.body.job.level).toBe('mid');
      expect(response.body.message).not.toContain('AI-generated');
      expect(aiService.generateJD).not.toHaveBeenCalled();
    });

    it('should reject job creation without recruiter role', async () => {
      const response = await request(app)
        .post('/api/recruiter/jobs')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          title: 'Test Job',
          level: 'mid',
          location: 'Remote',
          type: 'full-time',
          remote: true,
          description: 'Test',
          requirements: [],
          compensation: { currency: 'USD' },
          benefits: [],
        });

      expect(response.status).toBe(403);
    });

    it('should handle AI service failure gracefully', async () => {
      (aiService.generateJD as jest.Mock).mockRejectedValue(new Error('AI service unavailable'));

      const response = await request(app)
        .post('/api/recruiter/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          notes: 'Need engineer',
          generateWithAI: true,
        });

      expect(response.status).toBe(503);
      expect(response.body.code).toBe('AI_SERVICE_ERROR');
      expect(response.body.fallback).toHaveProperty('action', 'manual_entry');
    });

    it('should reject job creation with missing required fields', async () => {
      const response = await request(app)
        .post('/api/recruiter/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          generateWithAI: false,
          title: 'Test Job',
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/recruiter/jobs/:id - Update Job', () => {
    let jobId: string;

    beforeEach(async () => {
      const job = await JobModel.create({
        orgId,
        createdBy: recruiterUserId,
        title: 'Original Title',
        level: 'mid',
        location: 'Remote',
        type: 'full-time',
        remote: true,
        description: 'Original description',
        requirements: [],
        compensation: { currency: 'USD' },
        benefits: [],
        status: 'draft',
      });
      jobId = job.id;
    });

    it('should update job details', async () => {
      const response = await request(app)
        .put(`/api/recruiter/jobs/${jobId}`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated description',
          status: 'active',
        });

      expect(response.status).toBe(200);
      expect(response.body.job.title).toBe('Updated Title');
      expect(response.body.job.description).toBe('Updated description');
      expect(response.body.job.status).toBe('active');
    });

    it('should generate hero image when requested', async () => {
      const mockImageUrl = 'https://image.pollinations.ai/prompt/test?width=1200&height=630';
      (aiService.generateImage as jest.Mock).mockResolvedValue(mockImageUrl);

      const response = await request(app)
        .put(`/api/recruiter/jobs/${jobId}`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          generateHeroImage: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.job.heroImageUrl).toBe(mockImageUrl);
      expect(aiService.generateImage).toHaveBeenCalled();
    });

    it('should reject update from non-owner', async () => {
      // Create another recruiter
      const otherRecruiterResponse = await request(app).post('/api/auth/signup').send({
        email: 'other@example.com',
        password: 'SecurePass123!',
        name: 'Other Recruiter',
        role: 'recruiter',
      });

      const otherToken = otherRecruiterResponse.body.accessToken;

      const response = await request(app)
        .put(`/api/recruiter/jobs/${jobId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          title: 'Hacked Title',
        });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
    });
  });

  describe('DELETE /api/recruiter/jobs/:id - Close Job', () => {
    let jobId: string;

    beforeEach(async () => {
      const job = await JobModel.create({
        orgId,
        createdBy: recruiterUserId,
        title: 'Job to Close',
        level: 'mid',
        location: 'Remote',
        type: 'full-time',
        remote: true,
        description: 'Test job',
        requirements: [],
        compensation: { currency: 'USD' },
        benefits: [],
        status: 'active',
      });
      jobId = job.id;
    });

    it('should soft delete job by setting status to closed', async () => {
      const response = await request(app)
        .delete(`/api/recruiter/jobs/${jobId}`)
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(response.status).toBe(200);
      expect(response.body.job.status).toBe('closed');
      expect(response.body.message).toContain('closed');
    });

    it('should reject delete from non-owner', async () => {
      const response = await request(app)
        .delete(`/api/recruiter/jobs/${jobId}`)
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/recruiter/jobs - List Jobs', () => {
    beforeEach(async () => {
      // Create multiple jobs
      await JobModel.create({
        orgId,
        createdBy: recruiterUserId,
        title: 'Job 1',
        level: 'mid',
        location: 'Remote',
        type: 'full-time',
        remote: true,
        description: 'Job 1',
        requirements: [],
        compensation: { currency: 'USD' },
        benefits: [],
        status: 'active',
      });

      await JobModel.create({
        orgId,
        createdBy: recruiterUserId,
        title: 'Job 2',
        level: 'senior',
        location: 'Remote',
        type: 'full-time',
        remote: true,
        description: 'Job 2',
        requirements: [],
        compensation: { currency: 'USD' },
        benefits: [],
        status: 'draft',
      });
    });

    it('should get all jobs created by recruiter', async () => {
      const response = await request(app)
        .get('/api/recruiter/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(response.status).toBe(200);
      expect(response.body.jobs.length).toBe(2);
      expect(response.body.total).toBe(2);
    });
  });

  describe('GET /api/recruiter/dashboard', () => {
    beforeEach(async () => {
      // Create jobs with different statuses
      const activeJob = await JobModel.create({
        orgId,
        createdBy: recruiterUserId,
        title: 'Active Job',
        level: 'mid',
        location: 'Remote',
        type: 'full-time',
        remote: true,
        description: 'Active',
        requirements: [],
        compensation: { currency: 'USD' },
        benefits: [],
        status: 'active',
      });

      await JobModel.create({
        orgId,
        createdBy: recruiterUserId,
        title: 'Draft Job',
        level: 'mid',
        location: 'Remote',
        type: 'full-time',
        remote: true,
        description: 'Draft',
        requirements: [],
        compensation: { currency: 'USD' },
        benefits: [],
        status: 'draft',
      });

      // Create applications for active job
      const resume = await ResumeModel.create(candidateUserId, 'url', 'resume.pdf');
      const version = await ResumeVersionModel.create(resume.id, candidateUserId, 'text', {
        skills: [],
        experience: [],
        education: [],
      });

      await ApplicationModel.create({
        jobId: activeJob.id,
        userId: candidateUserId,
        resumeVersionId: version.id,
        coverLetter: 'Test',
        status: 'submitted',
      });
    });

    it('should get dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/recruiter/dashboard')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('jobs');
      expect(response.body.jobs.active).toBe(1);
      expect(response.body.jobs.draft).toBe(1);
      expect(response.body.jobs.total).toBe(2);
      expect(response.body).toHaveProperty('applications');
      expect(response.body.applications.total).toBe(1);
    });
  });

  describe('GET /api/recruiter/jobs/:id/candidates - Shortlist', () => {
    let jobId: string;
    let application1Id: string;
    let application2Id: string;

    beforeEach(async () => {
      // Create job
      const job = await JobModel.create({
        orgId,
        createdBy: recruiterUserId,
        title: 'Software Engineer',
        level: 'mid',
        location: 'Remote',
        type: 'full-time',
        remote: true,
        description: 'Looking for engineer',
        requirements: ['TypeScript', 'React'],
        compensation: { min: 100000, max: 150000, currency: 'USD' },
        benefits: [],
        status: 'active',
      });
      jobId = job.id;

      // Create two candidates with profiles
      const candidate1Response = await request(app).post('/api/auth/signup').send({
        email: 'alice@example.com',
        password: 'SecurePass123!',
        name: 'Alice',
        role: 'candidate',
      });

      const candidate2Response = await request(app).post('/api/auth/signup').send({
        email: 'bob@example.com',
        password: 'SecurePass123!',
        name: 'Bob',
        role: 'candidate',
      });

      const candidate1Id = candidate1Response.body.user.id;
      const candidate2Id = candidate2Response.body.user.id;

      // Create profiles
      await CandidateProfileModel.create(candidate1Id, {
        location: 'San Francisco',
        skills: ['TypeScript', 'React', 'Node.js'],
        experience: [
          {
            company: 'Tech Corp',
            title: 'Senior Engineer',
            startDate: new Date('2018-01-01'),
            description: 'Built web apps',
          },
        ],
        education: [],
        preferences: { roles: [], locations: [], remoteOnly: true },
      });

      await CandidateProfileModel.create(candidate2Id, {
        location: 'New York',
        skills: ['JavaScript', 'React'],
        experience: [
          {
            company: 'Startup',
            title: 'Junior Developer',
            startDate: new Date('2022-01-01'),
            description: 'Worked on frontend',
          },
        ],
        education: [],
        preferences: { roles: [], locations: [], remoteOnly: true },
      });

      // Create resumes and applications
      const resume1 = await ResumeModel.create(candidate1Id, 'url1', 'alice-resume.pdf');
      const version1 = await ResumeVersionModel.create(
        resume1.id,
        candidate1Id,
        'Alice resume text',
        {
          skills: ['TypeScript', 'React', 'Node.js'],
          experience: [],
          education: [],
        }
      );

      const resume2 = await ResumeModel.create(candidate2Id, 'url2', 'bob-resume.pdf');
      const version2 = await ResumeVersionModel.create(
        resume2.id,
        candidate2Id,
        'Bob resume text',
        {
          skills: ['JavaScript', 'React'],
          experience: [],
          education: [],
        }
      );

      const app1 = await ApplicationModel.create({
        jobId,
        userId: candidate1Id,
        resumeVersionId: version1.id,
        coverLetter: 'Alice cover letter',
        status: 'submitted',
      });

      const app2 = await ApplicationModel.create({
        jobId,
        userId: candidate2Id,
        resumeVersionId: version2.id,
        coverLetter: 'Bob cover letter',
        status: 'submitted',
      });

      application1Id = app1.id;
      application2Id = app2.id;
    });

    it('should get candidates without AI ranking', async () => {
      const response = await request(app)
        .get(`/api/recruiter/jobs/${jobId}/candidates`)
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(response.status).toBe(200);
      expect(response.body.candidates.length).toBe(2);
      expect(response.body.rankedWithAI).toBe(false);
      expect(response.body.candidates[0]).toHaveProperty('name');
      expect(response.body.candidates[0]).toHaveProperty('profile');
    });

    it('should get candidates with AI ranking', async () => {
      const mockRankings = JSON.stringify([
        {
          candidateIndex: 0,
          score: 92,
          rationale: 'Excellent match with strong TypeScript skills',
          strength: '7 years of experience',
          concern: 'May be overqualified',
        },
        {
          candidateIndex: 1,
          score: 75,
          rationale: 'Good potential with React experience',
          strength: 'Enthusiastic and quick learner',
          concern: 'Limited TypeScript experience',
        },
      ]);

      const mockQuestions1 =
        '1. Describe your TypeScript experience\n2. How do you handle state management?';
      const mockQuestions2 =
        '1. What React patterns do you use?\n2. How do you learn new technologies?';

      (aiService.rankCandidates as jest.Mock).mockResolvedValue(mockRankings);
      (aiService.generateScreeningQuestions as jest.Mock)
        .mockResolvedValueOnce(mockQuestions1)
        .mockResolvedValueOnce(mockQuestions2);

      const response = await request(app)
        .get(`/api/recruiter/jobs/${jobId}/candidates`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .query({ rankWithAI: 'true' });

      expect(response.status).toBe(200);
      expect(response.body.rankedWithAI).toBe(true);
      expect(response.body.candidates.length).toBe(2);

      // Check first candidate (highest score)
      expect(response.body.candidates[0].aiScore).toBe(92);
      expect(response.body.candidates[0].aiRationale).toContain('Excellent match');
      expect(response.body.candidates[0].screeningQuestions).toBeDefined();
      expect(response.body.candidates[0].screeningQuestions.length).toBeGreaterThan(0);

      // Check second candidate
      expect(response.body.candidates[1].aiScore).toBe(75);

      // Verify AI services were called
      expect(aiService.rankCandidates).toHaveBeenCalledTimes(1);
      expect(aiService.generateScreeningQuestions).toHaveBeenCalledTimes(2);
    });

    it('should filter candidates by status', async () => {
      // Update one application status
      await ApplicationModel.update(application1Id, { status: 'reviewed' });

      const response = await request(app)
        .get(`/api/recruiter/jobs/${jobId}/candidates`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .query({ filterByStatus: 'reviewed' });

      expect(response.status).toBe(200);
      expect(response.body.candidates.length).toBe(1);
      expect(response.body.candidates[0].status).toBe('reviewed');
    });

    it('should reject access from non-owner recruiter', async () => {
      // Create another recruiter
      const otherRecruiterResponse = await request(app).post('/api/auth/signup').send({
        email: 'other-recruiter@example.com',
        password: 'SecurePass123!',
        name: 'Other Recruiter',
        role: 'recruiter',
      });

      const otherToken = otherRecruiterResponse.body.accessToken;

      const response = await request(app)
        .get(`/api/recruiter/jobs/${jobId}/candidates`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
    });
  });

  describe('Complete Recruiter Flow', () => {
    it('should complete full flow: create JD with AI -> publish -> view candidates -> rank with AI', async () => {
      // Step 1: Create job with AI
      const mockJD = JSON.stringify({
        title: 'Full Stack Engineer',
        level: 'mid',
        location: 'Remote',
        type: 'full-time',
        remote: true,
        description: 'We need a full stack engineer...',
        requirements: ['TypeScript', 'React', 'Node.js'],
        compensation: { min: 120000, max: 160000, currency: 'USD' },
        benefits: ['Health', '401k'],
      });

      (aiService.generateJD as jest.Mock).mockResolvedValue(mockJD);

      const createResponse = await request(app)
        .post('/api/recruiter/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          notes: 'Need full stack engineer with TypeScript',
          generateWithAI: true,
          status: 'draft',
        });

      expect(createResponse.status).toBe(201);
      const jobId = createResponse.body.job.id;

      // Step 2: Publish job
      const publishResponse = await request(app)
        .put(`/api/recruiter/jobs/${jobId}`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          status: 'active',
          generateHeroImage: true,
        });

      expect(publishResponse.status).toBe(200);
      expect(publishResponse.body.job.status).toBe('active');

      // Step 3: Create candidate and application
      const candidateResp = await request(app).post('/api/auth/signup').send({
        email: 'applicant@example.com',
        password: 'SecurePass123!',
        name: 'Applicant',
        role: 'candidate',
      });

      const candidateId = candidateResp.body.user.id;

      await CandidateProfileModel.create(candidateId, {
        location: 'Remote',
        skills: ['TypeScript', 'React'],
        experience: [],
        education: [],
        preferences: { roles: [], locations: [], remoteOnly: true },
      });

      const resume = await ResumeModel.create(candidateId, 'url', 'resume.pdf');
      const version = await ResumeVersionModel.create(resume.id, candidateId, 'text', {
        skills: ['TypeScript'],
        experience: [],
        education: [],
      });

      await ApplicationModel.create({
        jobId,
        userId: candidateId,
        resumeVersionId: version.id,
        coverLetter: 'I am interested',
        status: 'submitted',
      });

      // Step 4: View candidates
      const candidatesResponse = await request(app)
        .get(`/api/recruiter/jobs/${jobId}/candidates`)
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(candidatesResponse.status).toBe(200);
      expect(candidatesResponse.body.candidates.length).toBe(1);

      // Step 5: Rank with AI
      const mockRankings = JSON.stringify([
        {
          candidateIndex: 0,
          score: 85,
          rationale: 'Good fit',
          strength: 'TypeScript skills',
          concern: 'None',
        },
      ]);

      (aiService.rankCandidates as jest.Mock).mockResolvedValue(mockRankings);
      (aiService.generateScreeningQuestions as jest.Mock).mockResolvedValue(
        '1. Question 1\n2. Question 2'
      );

      const rankedResponse = await request(app)
        .get(`/api/recruiter/jobs/${jobId}/candidates`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .query({ rankWithAI: 'true' });

      expect(rankedResponse.status).toBe(200);
      expect(rankedResponse.body.rankedWithAI).toBe(true);
      expect(rankedResponse.body.candidates[0].aiScore).toBe(85);
    });
  });
});

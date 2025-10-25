import request from 'supertest';
import express from 'express';
import authRouter from '../routes/auth';
import jobsRouter from '../routes/jobs';
import applicationsRouter from '../routes/applications';
import resumeRouter from '../routes/resume';
import profileRouter from '../routes/profile';
import { JobModel } from '../models/Job';
import { OrgModel } from '../models/Org';
import { RecruiterProfileModel } from '../models/RecruiterProfile';
import './setup';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api', resumeRouter);
app.use('/api', profileRouter);

describe('Job Search and Application Flow Integration Tests', () => {
  let candidateToken: string;
  let candidateUserId: string;
  let recruiterToken: string;
  let recruiterUserId: string;
  let orgId: string;
  let jobId: string;

  beforeEach(async () => {
    // Create candidate user
    const candidateResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'candidate@example.com',
        password: 'SecurePass123!',
        name: 'Test Candidate',
        role: 'candidate',
      });

    candidateToken = candidateResponse.body.accessToken;
    candidateUserId = candidateResponse.body.user.id;

    // Create recruiter user
    const recruiterResponse = await request(app)
      .post('/api/auth/signup')
      .send({
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

    // Create a test job
    const job = await JobModel.create({
      orgId,
      createdBy: recruiterUserId,
      title: 'Senior Software Engineer',
      level: 'senior',
      location: 'San Francisco, CA',
      type: 'full-time',
      remote: true,
      description: 'We are looking for a senior software engineer...',
      requirements: ['5+ years experience', 'TypeScript', 'React'],
      compensation: { min: 150000, max: 200000, currency: 'USD' },
      benefits: ['Health insurance', '401k'],
      status: 'active',
    });
    jobId = job.id;
  });

  describe('Job Search Flow', () => {
    it('should search jobs without authentication', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('jobs');
      expect(response.body).toHaveProperty('total');
      expect(response.body.jobs.length).toBeGreaterThan(0);
    });

    it('should filter jobs by title', async () => {
      // Create another job with different title
      await JobModel.create({
        orgId,
        createdBy: recruiterUserId,
        title: 'Junior Developer',
        level: 'entry',
        location: 'Remote',
        type: 'full-time',
        remote: true,
        description: 'Entry level position',
        requirements: ['1+ years experience'],
        compensation: { min: 60000, max: 80000, currency: 'USD' },
        benefits: [],
        status: 'active',
      });

      const response = await request(app)
        .get('/api/jobs')
        .query({ title: 'Senior', page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.jobs.length).toBe(1);
      expect(response.body.jobs[0].title).toContain('Senior');
    });

    it('should filter jobs by level', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .query({ level: 'senior', page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.jobs.every((job: any) => job.level === 'senior')).toBe(true);
    });

    it('should filter jobs by remote status', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .query({ remote: 'true', page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.jobs.every((job: any) => job.remote === true)).toBe(true);
    });

    it('should paginate job results', async () => {
      // Create multiple jobs
      for (let i = 0; i < 25; i++) {
        await JobModel.create({
          orgId,
          createdBy: recruiterUserId,
          title: `Job ${i}`,
          level: 'mid',
          location: 'Remote',
          type: 'full-time',
          remote: true,
          description: `Description ${i}`,
          requirements: [],
          compensation: { currency: 'USD' },
          benefits: [],
          status: 'active',
        });
      }

      const page1Response = await request(app)
        .get('/api/jobs')
        .query({ page: 1, limit: 20 });

      expect(page1Response.status).toBe(200);
      expect(page1Response.body.jobs.length).toBe(20);

      const page2Response = await request(app)
        .get('/api/jobs')
        .query({ page: 2, limit: 20 });

      expect(page2Response.status).toBe(200);
      expect(page2Response.body.jobs.length).toBeGreaterThan(0);
    });
  });

  describe('Job Detail Flow', () => {
    it('should get job detail without authentication', async () => {
      const response = await request(app)
        .get(`/api/jobs/${jobId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('job');
      expect(response.body.job.id).toBe(jobId);
      expect(response.body.job.title).toBe('Senior Software Engineer');
    });

    it('should get job detail with candidate context', async () => {
      // Create candidate profile
      await request(app)
        .put('/api/candidate/profile')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          location: 'San Francisco, CA',
          skills: ['TypeScript', 'React', 'Node.js'],
          experience: [],
          education: [],
          preferences: {
            roles: ['Software Engineer'],
            locations: ['San Francisco'],
            remoteOnly: true,
          },
        });

      const response = await request(app)
        .get(`/api/jobs/${jobId}`)
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('job');
      expect(response.body).toHaveProperty('candidateProfile');
      expect(response.body.candidateProfile).not.toBeNull();
    });

    it('should return 404 for non-existent job', async () => {
      const response = await request(app)
        .get('/api/jobs/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
    });

    it('should not show draft jobs to public', async () => {
      const draftJob = await JobModel.create({
        orgId,
        createdBy: recruiterUserId,
        title: 'Draft Position',
        level: 'mid',
        location: 'Remote',
        type: 'full-time',
        remote: true,
        description: 'Draft job',
        requirements: [],
        compensation: { currency: 'USD' },
        benefits: [],
        status: 'draft',
      });

      const response = await request(app)
        .get(`/api/jobs/${draftJob.id}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Application Submission Flow', () => {
    let resumeVersionId: string;

    beforeEach(async () => {
      // Create candidate profile
      await request(app)
        .put('/api/candidate/profile')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          location: 'San Francisco, CA',
          skills: ['TypeScript', 'React'],
          experience: [{
            company: 'Previous Company',
            title: 'Software Engineer',
            startDate: '2020-01-01',
            description: 'Worked on web applications',
          }],
          education: [],
          preferences: {
            roles: ['Software Engineer'],
            locations: ['San Francisco'],
            remoteOnly: true,
          },
        });

      // Create resume version (simplified - normally would upload file)
      const { ResumeModel, ResumeVersionModel } = await import('../models/Resume');
      const resume = await ResumeModel.create(
        candidateUserId,
        'https://example.com/resume.pdf',
        'resume.pdf'
      );
      const version = await ResumeVersionModel.create(
        resume.id,
        candidateUserId,
        'Resume text content',
        {
          skills: ['TypeScript', 'React'],
          experience: [],
          education: [],
        }
      );
      resumeVersionId = version.id;
    });

    it('should submit job application', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jobId,
          resumeVersionId,
          coverLetter: 'I am very interested in this position...',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('application');
      expect(response.body.application.jobId).toBe(jobId);
      expect(response.body.application.userId).toBe(candidateUserId);
      expect(response.body.application.status).toBe('submitted');
    });

    it('should reject application without authentication', async () => {
      const response = await request(app)
        .post('/api/applications')
        .send({
          jobId,
          resumeVersionId,
          coverLetter: 'Cover letter',
        });

      expect(response.status).toBe(401);
    });

    it('should reject application with missing fields', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jobId,
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject duplicate application', async () => {
      // Submit first application
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jobId,
          resumeVersionId,
          coverLetter: 'First application',
        });

      // Try to submit second application
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jobId,
          resumeVersionId,
          coverLetter: 'Second application',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('ALREADY_EXISTS');
    });

    it('should reject application to non-existent job', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jobId: '00000000-0000-0000-0000-000000000000',
          resumeVersionId,
          coverLetter: 'Cover letter',
        });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
    });

    it('should reject application to closed job', async () => {
      // Close the job
      await JobModel.update(jobId, { status: 'closed' });

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jobId,
          resumeVersionId,
          coverLetter: 'Cover letter',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Application Tracking Flow', () => {
    let applicationId: string;
    let resumeVersionId: string;

    beforeEach(async () => {
      // Create resume version
      const { ResumeModel, ResumeVersionModel } = await import('../models/Resume');
      const resume = await ResumeModel.create(
        candidateUserId,
        'https://example.com/resume.pdf',
        'resume.pdf'
      );
      const version = await ResumeVersionModel.create(
        resume.id,
        candidateUserId,
        'Resume text',
        { skills: [], experience: [], education: [] }
      );
      resumeVersionId = version.id;

      // Submit application
      const appResponse = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jobId,
          resumeVersionId,
          coverLetter: 'Test cover letter',
        });

      applicationId = appResponse.body.application.id;
    });

    it('should get all applications for candidate', async () => {
      const response = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('applications');
      expect(response.body.applications.length).toBe(1);
      expect(response.body.applications[0].id).toBe(applicationId);
    });

    it('should update application notes as candidate', async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          notes: 'Follow up next week',
        });

      expect(response.status).toBe(200);
      expect(response.body.application.notes).toBe('Follow up next week');
    });

    it('should not allow candidate to update application status', async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          status: 'accepted',
        });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
    });

    it('should reject update without authentication', async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .send({
          notes: 'Test notes',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Complete Job Search and Application Flow', () => {
    it('should complete full flow: search -> view detail -> apply -> track', async () => {
      // Step 1: Search for jobs
      const searchResponse = await request(app)
        .get('/api/jobs')
        .query({ title: 'Senior', page: 1, limit: 20 });

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.jobs.length).toBeGreaterThan(0);
      const foundJobId = searchResponse.body.jobs[0].id;

      // Step 2: View job detail
      const detailResponse = await request(app)
        .get(`/api/jobs/${foundJobId}`)
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(detailResponse.status).toBe(200);
      expect(detailResponse.body.job.id).toBe(foundJobId);

      // Step 3: Create resume
      const { ResumeModel, ResumeVersionModel } = await import('../models/Resume');
      const resume = await ResumeModel.create(
        candidateUserId,
        'https://example.com/resume.pdf',
        'resume.pdf'
      );
      const version = await ResumeVersionModel.create(
        resume.id,
        candidateUserId,
        'Resume content',
        { skills: ['TypeScript'], experience: [], education: [] }
      );

      // Step 4: Submit application
      const applyResponse = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jobId: foundJobId,
          resumeVersionId: version.id,
          coverLetter: 'I am excited about this opportunity',
        });

      expect(applyResponse.status).toBe(201);
      const appId = applyResponse.body.application.id;

      // Step 5: Track applications
      const trackResponse = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(trackResponse.status).toBe(200);
      expect(trackResponse.body.applications.length).toBe(1);
      expect(trackResponse.body.applications[0].id).toBe(appId);

      // Step 6: Update application notes
      const updateResponse = await request(app)
        .put(`/api/applications/${appId}`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          notes: 'Submitted on ' + new Date().toISOString(),
        });

      expect(updateResponse.status).toBe(200);
    });
  });
});

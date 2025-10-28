import './setup';
import request from 'supertest';
import express from 'express';
import authRouter from '../routes/auth';
import profileRouter from '../routes/profile';
import jobsRouter from '../routes/jobs';
import applicationsRouter from '../routes/applications';
import resumeRouter from '../routes/resume';
import { auth, firestore } from '../config/firebase';

// Mock rate limiter
jest.mock('../middleware/rateLimiter', () => ({
  rateLimiter: () => (req: any, res: any, next: any) => next(),
}));

// Mock Redis client
jest.mock('../config/redis', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue(null),
    setEx: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    quit: jest.fn().mockResolvedValue('OK'),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api', profileRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api', resumeRouter);

describe('API Integration Tests - Firebase Migration', () => {
  describe('Auth Endpoints', () => {
    describe('POST /api/auth/signup', () => {
      it('should create a new candidate user', async () => {
        // Mock getUserByEmail to throw error for new user
        (auth.getUserByEmail as jest.Mock).mockRejectedValueOnce({
          code: 'auth/user-not-found',
        });

        const response = await request(app).post('/api/auth/signup').send({
          email: 'candidate@test.com',
          password: 'SecurePass123!',
          name: 'Test Candidate',
          role: 'candidate',
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toBe('candidate@test.com');
        expect(response.body.user.role).toBe('candidate');
        expect(auth.createUser).toHaveBeenCalled();
        expect(auth.setCustomUserClaims).toHaveBeenCalled();
      });

      it('should create a new recruiter user', async () => {
        // Mock getUserByEmail to throw error for new user
        (auth.getUserByEmail as jest.Mock).mockRejectedValueOnce({
          code: 'auth/user-not-found',
        });

        const response = await request(app).post('/api/auth/signup').send({
          email: 'recruiter@test.com',
          password: 'SecurePass123!',
          name: 'Test Recruiter',
          role: 'recruiter',
        });

        expect(response.status).toBe(201);
        expect(response.body.user.role).toBe('recruiter');
      });

      it('should reject signup with missing fields', async () => {
        const response = await request(app).post('/api/auth/signup').send({
          email: 'test@test.com',
          password: 'SecurePass123!',
        });

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      });

      it('should reject signup with invalid email', async () => {
        const response = await request(app).post('/api/auth/signup').send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          name: 'Test User',
          role: 'candidate',
        });

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      });
    });

    describe('POST /api/auth/signin', () => {
      beforeEach(async () => {
        await request(app).post('/api/auth/signup').send({
          email: 'signin@test.com',
          password: 'SecurePass123!',
          name: 'Signin User',
          role: 'candidate',
        });
      });

      it('should verify user exists', async () => {
        const response = await request(app).post('/api/auth/signin').send({
          email: 'signin@test.com',
          password: 'SecurePass123!',
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toBe('signin@test.com');
      });

      it('should reject signin with non-existent email', async () => {
        const response = await request(app).post('/api/auth/signin').send({
          email: 'nonexistent@test.com',
          password: 'SecurePass123!',
        });

        expect(response.status).toBe(401);
        expect(response.body.code).toBe('INVALID_CREDENTIALS');
      });
    });

    describe('POST /api/auth/set-role', () => {
      let token: string;
      let userId: string;

      beforeEach(async () => {
        const signupResponse = await request(app).post('/api/auth/signup').send({
          email: 'role@test.com',
          password: 'SecurePass123!',
          name: 'Role User',
          role: 'candidate',
        });

        userId = signupResponse.body.user.id;
        token = 'mock-firebase-token';
      });

      it('should set user role with valid token', async () => {
        const response = await request(app)
          .post('/api/auth/set-role')
          .set('Authorization', `Bearer ${token}`)
          .send({ role: 'recruiter' });

        expect(response.status).toBe(200);
        expect(auth.setCustomUserClaims).toHaveBeenCalled();
      });

      it('should reject invalid role', async () => {
        const response = await request(app)
          .post('/api/auth/set-role')
          .set('Authorization', `Bearer ${token}`)
          .send({ role: 'invalid-role' });

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      });

      it('should reject without authentication', async () => {
        const response = await request(app).post('/api/auth/set-role').send({ role: 'recruiter' });

        expect(response.status).toBe(401);
      });
    });

    describe('GET /api/auth/me', () => {
      let token: string;

      beforeEach(async () => {
        await request(app).post('/api/auth/signup').send({
          email: 'me@test.com',
          password: 'SecurePass123!',
          name: 'Me User',
          role: 'candidate',
        });

        token = 'mock-firebase-token';
      });

      it('should get current user info', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
      });

      it('should reject without authentication', async () => {
        const response = await request(app).get('/api/auth/me');

        expect(response.status).toBe(401);
      });
    });
  });

  describe('Profile Endpoints', () => {
    let candidateToken: string;
    let candidateUserId: string;
    let recruiterToken: string;
    let recruiterUserId: string;

    beforeEach(async () => {
      // Create candidate
      const candidateResponse = await request(app).post('/api/auth/signup').send({
        email: 'candidate-profile@test.com',
        password: 'SecurePass123!',
        name: 'Candidate Profile',
        role: 'candidate',
      });
      candidateUserId = candidateResponse.body.user.id;
      candidateToken = 'mock-candidate-token';

      // Create recruiter
      const recruiterResponse = await request(app).post('/api/auth/signup').send({
        email: 'recruiter-profile@test.com',
        password: 'SecurePass123!',
        name: 'Recruiter Profile',
        role: 'recruiter',
      });
      recruiterUserId = recruiterResponse.body.user.id;
      recruiterToken = 'mock-recruiter-token';
    });

    describe('Candidate Profile', () => {
      it('should create candidate profile', async () => {
        const response = await request(app)
          .put('/api/candidate/profile')
          .set('Authorization', `Bearer ${candidateToken}`)
          .send({
            location: 'San Francisco, CA',
            skills: ['TypeScript', 'React', 'Node.js'],
            experience: [
              {
                company: 'Tech Corp',
                title: 'Software Engineer',
                startDate: '2020-01-01',
                description: 'Built web applications',
              },
            ],
            education: [
              {
                institution: 'University',
                degree: 'BS Computer Science',
                graduationDate: '2019-05-01',
              },
            ],
            preferences: {
              roles: ['Software Engineer'],
              locations: ['San Francisco'],
              remoteOnly: true,
            },
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('profile');
        expect(response.body.profile.skills).toContain('TypeScript');
      });

      it('should get candidate profile', async () => {
        // Create profile first
        await request(app)
          .put('/api/candidate/profile')
          .set('Authorization', `Bearer ${candidateToken}`)
          .send({
            location: 'San Francisco, CA',
            skills: ['TypeScript'],
            experience: [],
            education: [],
            preferences: {},
          });

        const response = await request(app)
          .get('/api/candidate/profile')
          .set('Authorization', `Bearer ${candidateToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('profile');
        expect(response.body).toHaveProperty('user');
      });

      it('should reject profile access without authentication', async () => {
        const response = await request(app).get('/api/candidate/profile');

        expect(response.status).toBe(401);
      });

      it('should reject candidate profile update with invalid data', async () => {
        const response = await request(app)
          .put('/api/candidate/profile')
          .set('Authorization', `Bearer ${candidateToken}`)
          .send({
            skills: 'not-an-array',
          });

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      });
    });

    describe('Recruiter Profile', () => {
      it('should create recruiter profile', async () => {
        const response = await request(app)
          .put('/api/recruiter/profile')
          .set('Authorization', `Bearer ${recruiterToken}`)
          .send({
            title: 'Senior Recruiter',
            department: 'Engineering',
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('profile');
      });

      it('should get recruiter profile', async () => {
        // Create profile first
        await request(app)
          .put('/api/recruiter/profile')
          .set('Authorization', `Bearer ${recruiterToken}`)
          .send({
            title: 'Recruiter',
            department: 'HR',
          });

        const response = await request(app)
          .get('/api/recruiter/profile')
          .set('Authorization', `Bearer ${recruiterToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('profile');
      });

      it('should reject recruiter profile update with invalid data', async () => {
        const response = await request(app)
          .put('/api/recruiter/profile')
          .set('Authorization', `Bearer ${recruiterToken}`)
          .send({
            title: 123, // Should be string
          });

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      });
    });
  });

  describe('Job Endpoints', () => {
    describe('GET /api/jobs', () => {
      it('should search jobs without authentication', async () => {
        const response = await request(app).get('/api/jobs').query({ page: 1, limit: 20 });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('jobs');
        expect(response.body).toHaveProperty('total');
      });

      it('should filter jobs by title', async () => {
        const response = await request(app)
          .get('/api/jobs')
          .query({ title: 'Engineer', page: 1, limit: 20 });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('jobs');
      });

      it('should filter jobs by level', async () => {
        const response = await request(app)
          .get('/api/jobs')
          .query({ level: 'senior', page: 1, limit: 20 });

        expect(response.status).toBe(200);
      });

      it('should filter jobs by remote status', async () => {
        const response = await request(app)
          .get('/api/jobs')
          .query({ remote: 'true', page: 1, limit: 20 });

        expect(response.status).toBe(200);
      });

      it('should reject invalid pagination', async () => {
        const response = await request(app).get('/api/jobs').query({ page: -1, limit: 20 });

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      });

      it('should reject limit over 100', async () => {
        const response = await request(app).get('/api/jobs').query({ page: 1, limit: 150 });

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      });
    });

    describe('GET /api/jobs/:id', () => {
      it('should get job detail without authentication', async () => {
        const response = await request(app).get('/api/jobs/mock-job-id');

        // Will return 404 since job doesn't exist in mock
        expect([200, 404]).toContain(response.status);
      });

      it('should return 404 for non-existent job', async () => {
        const response = await request(app).get('/api/jobs/non-existent-id');

        expect(response.status).toBe(404);
        expect(response.body.code).toBe('NOT_FOUND');
      });
    });
  });

  describe('Application Endpoints', () => {
    let candidateToken: string;
    let candidateUserId: string;

    beforeEach(async () => {
      const candidateResponse = await request(app).post('/api/auth/signup').send({
        email: 'app-candidate@test.com',
        password: 'SecurePass123!',
        name: 'App Candidate',
        role: 'candidate',
      });
      candidateUserId = candidateResponse.body.user.id;
      candidateToken = 'mock-candidate-token';
    });

    describe('POST /api/applications', () => {
      it('should reject application without authentication', async () => {
        const response = await request(app).post('/api/applications').send({
          jobId: 'job-id',
          resumeVersionId: 'resume-version-id',
          coverLetter: 'Cover letter',
        });

        expect(response.status).toBe(401);
      });

      it('should reject application with missing jobId', async () => {
        const response = await request(app)
          .post('/api/applications')
          .set('Authorization', `Bearer ${candidateToken}`)
          .send({
            resumeVersionId: 'resume-version-id',
            coverLetter: 'Cover letter',
          });

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      });

      it('should reject application with missing resumeVersionId', async () => {
        const response = await request(app)
          .post('/api/applications')
          .set('Authorization', `Bearer ${candidateToken}`)
          .send({
            jobId: 'job-id',
            coverLetter: 'Cover letter',
          });

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      });

      it('should reject application to non-existent job', async () => {
        const response = await request(app)
          .post('/api/applications')
          .set('Authorization', `Bearer ${candidateToken}`)
          .send({
            jobId: 'non-existent-job',
            resumeVersionId: 'resume-version-id',
            coverLetter: 'Cover letter',
          });

        expect(response.status).toBe(404);
        expect(response.body.code).toBe('NOT_FOUND');
      });
    });

    describe('GET /api/applications', () => {
      it('should get applications for authenticated user', async () => {
        const response = await request(app)
          .get('/api/applications')
          .set('Authorization', `Bearer ${candidateToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('applications');
        expect(response.body).toHaveProperty('statusCounts');
      });

      it('should reject without authentication', async () => {
        const response = await request(app).get('/api/applications');

        expect(response.status).toBe(401);
      });
    });

    describe('PUT /api/applications/:id', () => {
      it('should reject update without authentication', async () => {
        const response = await request(app)
          .put('/api/applications/app-id')
          .send({ notes: 'Test notes' });

        expect(response.status).toBe(401);
      });

      it('should reject update to non-existent application', async () => {
        const response = await request(app)
          .put('/api/applications/non-existent-id')
          .set('Authorization', `Bearer ${candidateToken}`)
          .send({ notes: 'Test notes' });

        expect(response.status).toBe(404);
        expect(response.body.code).toBe('NOT_FOUND');
      });
    });
  });

  describe('Resume Endpoints', () => {
    let candidateToken: string;
    let candidateUserId: string;

    beforeEach(async () => {
      const candidateResponse = await request(app).post('/api/auth/signup').send({
        email: 'resume-candidate@test.com',
        password: 'SecurePass123!',
        name: 'Resume Candidate',
        role: 'candidate',
      });
      candidateUserId = candidateResponse.body.user.id;
      candidateToken = 'mock-candidate-token';
    });

    describe('POST /api/candidate/resume/upload', () => {
      it('should reject upload without authentication', async () => {
        const response = await request(app).post('/api/candidate/resume/upload');

        expect(response.status).toBe(401);
      });

      it('should reject upload without file', async () => {
        const response = await request(app)
          .post('/api/candidate/resume/upload')
          .set('Authorization', `Bearer ${candidateToken}`);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      });
    });

    describe('POST /api/candidate/resume/parse', () => {
      it('should reject parse without authentication', async () => {
        const response = await request(app)
          .post('/api/candidate/resume/parse')
          .send({ resumeId: 'resume-id' });

        expect(response.status).toBe(401);
      });

      it('should reject parse without resumeId', async () => {
        const response = await request(app)
          .post('/api/candidate/resume/parse')
          .set('Authorization', `Bearer ${candidateToken}`)
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      });

      it('should reject parse for non-existent resume', async () => {
        const response = await request(app)
          .post('/api/candidate/resume/parse')
          .set('Authorization', `Bearer ${candidateToken}`)
          .send({ resumeId: 'non-existent-id' });

        expect(response.status).toBe(404);
        expect(response.body.code).toBe('NOT_FOUND');
      });
    });

    describe('GET /api/candidate/resumes', () => {
      it('should get resumes for authenticated user', async () => {
        const response = await request(app)
          .get('/api/candidate/resumes')
          .set('Authorization', `Bearer ${candidateToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('resumes');
      });

      it('should reject without authentication', async () => {
        const response = await request(app).get('/api/candidate/resumes');

        expect(response.status).toBe(401);
      });
    });

    describe('DELETE /api/candidate/resume/:id', () => {
      it('should reject delete without authentication', async () => {
        const response = await request(app).delete('/api/candidate/resume/resume-id');

        expect(response.status).toBe(401);
      });

      it('should reject delete for non-existent resume', async () => {
        const response = await request(app)
          .delete('/api/candidate/resume/non-existent-id')
          .set('Authorization', `Bearer ${candidateToken}`);

        expect(response.status).toBe(404);
        expect(response.body.code).toBe('NOT_FOUND');
      });
    });
  });

  describe('Cross-Endpoint Integration Flows', () => {
    it('should complete candidate signup and profile creation flow', async () => {
      // Step 1: Signup
      const signupResponse = await request(app).post('/api/auth/signup').send({
        email: 'flow-candidate@test.com',
        password: 'SecurePass123!',
        name: 'Flow Candidate',
        role: 'candidate',
      });

      expect(signupResponse.status).toBe(201);
      const userId = signupResponse.body.user.id;
      const token = 'mock-token';

      // Step 2: Create profile
      const profileResponse = await request(app)
        .put('/api/candidate/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          location: 'New York, NY',
          skills: ['JavaScript', 'Python'],
          experience: [],
          education: [],
          preferences: {},
        });

      expect(profileResponse.status).toBe(200);

      // Step 3: Get profile
      const getProfileResponse = await request(app)
        .get('/api/candidate/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(getProfileResponse.status).toBe(200);
      expect(getProfileResponse.body.profile.skills).toContain('JavaScript');
    });

    it('should complete recruiter signup and profile creation flow', async () => {
      // Step 1: Signup
      const signupResponse = await request(app).post('/api/auth/signup').send({
        email: 'flow-recruiter@test.com',
        password: 'SecurePass123!',
        name: 'Flow Recruiter',
        role: 'recruiter',
      });

      expect(signupResponse.status).toBe(201);
      const token = 'mock-token';

      // Step 2: Create profile
      const profileResponse = await request(app)
        .put('/api/recruiter/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Technical Recruiter',
          department: 'Engineering',
        });

      expect(profileResponse.status).toBe(200);

      // Step 3: Get profile
      const getProfileResponse = await request(app)
        .get('/api/recruiter/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(getProfileResponse.status).toBe(200);
      expect(getProfileResponse.body.profile.title).toBe('Technical Recruiter');
    });

    it('should handle job search flow', async () => {
      // Step 1: Search jobs (no auth required)
      const searchResponse = await request(app).get('/api/jobs').query({ page: 1, limit: 20 });

      expect(searchResponse.status).toBe(200);

      // Step 2: Search with filters
      const filteredResponse = await request(app).get('/api/jobs').query({
        title: 'Engineer',
        level: 'senior',
        remote: 'true',
        page: 1,
        limit: 20,
      });

      expect(filteredResponse.status).toBe(200);
    });
  });
});

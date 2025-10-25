import request from 'supertest';
import express from 'express';
import authRouter from '../routes/auth';
import resumeRouter from '../routes/resume';
import { ResumeModel, ResumeVersionModel } from '../models/Resume';
import './setup';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api', resumeRouter);

// Mock S3 upload for testing
jest.mock('../config/s3', () => ({
  __esModule: true,
  default: {
    send: jest.fn().mockResolvedValue({}),
  },
  S3_BUCKET_NAME: 'test-bucket',
}));

// Mock resume parser
jest.mock('../utils/resumeParser', () => ({
  parseResume: jest.fn().mockResolvedValue({
    rawText: 'John Doe\nSoftware Engineer\nSkills: TypeScript, React, Node.js',
    parsedData: {
      skills: ['TypeScript', 'React', 'Node.js'],
      experience: [
        {
          company: 'Tech Corp',
          title: 'Software Engineer',
          startDate: new Date('2020-01-01'),
          description: 'Developed web applications',
        },
      ],
      education: [
        {
          institution: 'University',
          degree: 'BS',
          field: 'Computer Science',
          graduationDate: new Date('2019-05-01'),
        },
      ],
    },
  }),
}));

describe('Resume Upload and Parsing Integration Tests', () => {
  let candidateToken: string;
  let candidateUserId: string;

  beforeEach(async () => {
    // Create candidate user
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'candidate@example.com',
        password: 'SecurePass123!',
        name: 'Test Candidate',
        role: 'candidate',
      });

    candidateToken = response.body.accessToken;
    candidateUserId = response.body.user.id;
  });

  describe('POST /api/candidate/resume/upload', () => {
    it('should upload resume file', async () => {
      const response = await request(app)
        .post('/api/candidate/resume/upload')
        .set('Authorization', `Bearer ${candidateToken}`)
        .attach('resume', Buffer.from('fake pdf content'), 'resume.pdf');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('resume');
      expect(response.body.resume).toHaveProperty('id');
      expect(response.body.resume).toHaveProperty('fileUrl');
      expect(response.body.resume.fileName).toBe('resume.pdf');
    });

    it('should reject upload without authentication', async () => {
      const response = await request(app)
        .post('/api/candidate/resume/upload')
        .attach('resume', Buffer.from('fake pdf content'), 'resume.pdf');

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
    let resumeId: string;

    beforeEach(async () => {
      // Upload a resume first
      const uploadResponse = await request(app)
        .post('/api/candidate/resume/upload')
        .set('Authorization', `Bearer ${candidateToken}`)
        .attach('resume', Buffer.from('fake pdf content'), 'resume.pdf');

      resumeId = uploadResponse.body.resume.id;
    });

    it('should parse uploaded resume', async () => {
      const response = await request(app)
        .post('/api/candidate/resume/parse')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          resumeId,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('version');
      expect(response.body.version).toHaveProperty('id');
      expect(response.body.version).toHaveProperty('rawText');
      expect(response.body.version).toHaveProperty('parsedData');
      expect(response.body.version.parsedData).toHaveProperty('skills');
      expect(response.body.version.parsedData).toHaveProperty('experience');
      expect(response.body.version.parsedData).toHaveProperty('education');
    });

    it('should reject parse without authentication', async () => {
      const response = await request(app)
        .post('/api/candidate/resume/parse')
        .send({
          resumeId,
        });

      expect(response.status).toBe(401);
    });

    it('should reject parse with missing resumeId', async () => {
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
        .send({
          resumeId: '00000000-0000-0000-0000-000000000000',
        });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
    });

    it('should reject parse for resume owned by another user', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'other@example.com',
          password: 'SecurePass123!',
          name: 'Other User',
          role: 'candidate',
        });

      const otherToken = otherUserResponse.body.accessToken;

      // Try to parse first user's resume
      const response = await request(app)
        .post('/api/candidate/resume/parse')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          resumeId,
        });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/candidate/resumes', () => {
    it('should get all resumes for user', async () => {
      // Upload multiple resumes
      await request(app)
        .post('/api/candidate/resume/upload')
        .set('Authorization', `Bearer ${candidateToken}`)
        .attach('resume', Buffer.from('resume 1'), 'resume1.pdf');

      await request(app)
        .post('/api/candidate/resume/upload')
        .set('Authorization', `Bearer ${candidateToken}`)
        .attach('resume', Buffer.from('resume 2'), 'resume2.pdf');

      const response = await request(app)
        .get('/api/candidate/resumes')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('resumes');
      expect(response.body.resumes.length).toBe(2);
    });

    it('should include versions with resumes', async () => {
      // Upload and parse resume
      const uploadResponse = await request(app)
        .post('/api/candidate/resume/upload')
        .set('Authorization', `Bearer ${candidateToken}`)
        .attach('resume', Buffer.from('resume'), 'resume.pdf');

      const resumeId = uploadResponse.body.resume.id;

      await request(app)
        .post('/api/candidate/resume/parse')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ resumeId });

      const response = await request(app)
        .get('/api/candidate/resumes')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(200);
      expect(response.body.resumes[0]).toHaveProperty('versions');
      expect(response.body.resumes[0].versions.length).toBe(1);
    });

    it('should reject get resumes without authentication', async () => {
      const response = await request(app)
        .get('/api/candidate/resumes');

      expect(response.status).toBe(401);
    });

    it('should return empty array for user with no resumes', async () => {
      const response = await request(app)
        .get('/api/candidate/resumes')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(200);
      expect(response.body.resumes).toEqual([]);
    });
  });

  describe('Complete Resume Upload and Parse Flow', () => {
    it('should complete full flow: upload -> parse -> retrieve', async () => {
      // Step 1: Upload resume
      const uploadResponse = await request(app)
        .post('/api/candidate/resume/upload')
        .set('Authorization', `Bearer ${candidateToken}`)
        .attach('resume', Buffer.from('John Doe Resume'), 'john-resume.pdf');

      expect(uploadResponse.status).toBe(201);
      const resumeId = uploadResponse.body.resume.id;

      // Step 2: Parse resume
      const parseResponse = await request(app)
        .post('/api/candidate/resume/parse')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ resumeId });

      expect(parseResponse.status).toBe(201);
      expect(parseResponse.body.version.parsedData.skills).toContain('TypeScript');
      expect(parseResponse.body.version.parsedData.experience.length).toBeGreaterThan(0);

      // Step 3: Retrieve all resumes
      const retrieveResponse = await request(app)
        .get('/api/candidate/resumes')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(retrieveResponse.status).toBe(200);
      expect(retrieveResponse.body.resumes.length).toBe(1);
      expect(retrieveResponse.body.resumes[0].id).toBe(resumeId);
      expect(retrieveResponse.body.resumes[0].versions.length).toBe(1);
    });

    it('should support multiple resume versions', async () => {
      // Upload resume
      const uploadResponse = await request(app)
        .post('/api/candidate/resume/upload')
        .set('Authorization', `Bearer ${candidateToken}`)
        .attach('resume', Buffer.from('resume'), 'resume.pdf');

      const resumeId = uploadResponse.body.resume.id;

      // Parse multiple times (simulating edits)
      await request(app)
        .post('/api/candidate/resume/parse')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ resumeId });

      await request(app)
        .post('/api/candidate/resume/parse')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ resumeId });

      // Retrieve resumes
      const response = await request(app)
        .get('/api/candidate/resumes')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(200);
      expect(response.body.resumes[0].versions.length).toBe(2);
    });
  });
});

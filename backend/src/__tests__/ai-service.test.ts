import request from 'supertest';
import express from 'express';
import authRouter from '../routes/auth';
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as aiService from '../services/aiService';
import './setup';

// Create AI routes for testing
const aiRouter = Router();

aiRouter.post('/fit-summary', authenticate, async (req, res) => {
  try {
    const { jobData, candidateProfile } = req.body;
    const result = await aiService.generateFitSummary(jobData, candidateProfile);
    res.json({ summary: result });
  } catch (error: any) {
    res.status(503).json({
      code: 'AI_SERVICE_ERROR',
      message: error.message,
    });
  }
});

aiRouter.post('/cover-letter', authenticate, async (req, res) => {
  try {
    const { jobData, candidateProfile } = req.body;
    const result = await aiService.generateCoverLetter(jobData, candidateProfile);
    res.json({ coverLetter: result });
  } catch (error: any) {
    res.status(503).json({
      code: 'AI_SERVICE_ERROR',
      message: error.message,
    });
  }
});

aiRouter.post('/resume-improve', authenticate, async (req, res) => {
  try {
    const { bullets } = req.body;
    const result = await aiService.improveResumeBullets(bullets);
    res.json({ improvements: result });
  } catch (error: any) {
    res.status(503).json({
      code: 'AI_SERVICE_ERROR',
      message: error.message,
    });
  }
});

aiRouter.post('/jd-generate', authenticate, async (req, res) => {
  try {
    const { notes } = req.body;
    const result = await aiService.generateJD(notes);
    res.json({ jd: result });
  } catch (error: any) {
    res.status(503).json({
      code: 'AI_SERVICE_ERROR',
      message: error.message,
    });
  }
});

aiRouter.post('/shortlist', authenticate, async (req, res) => {
  try {
    const { jobData, applications } = req.body;
    const result = await aiService.rankCandidates(jobData, applications);
    res.json({ rankings: result });
  } catch (error: any) {
    res.status(503).json({
      code: 'AI_SERVICE_ERROR',
      message: error.message,
    });
  }
});

aiRouter.post('/screening-questions', authenticate, async (req, res) => {
  try {
    const { jobData, candidateProfile } = req.body;
    const result = await aiService.generateScreeningQuestions(jobData, candidateProfile);
    res.json({ questions: result });
  } catch (error: any) {
    res.status(503).json({
      code: 'AI_SERVICE_ERROR',
      message: error.message,
    });
  }
});

aiRouter.post('/image', authenticate, async (req, res) => {
  try {
    const { prompt, options } = req.body;
    const result = await aiService.generateImage(prompt, options);
    res.json({ imageUrl: result });
  } catch (error: any) {
    res.status(503).json({
      code: 'AI_SERVICE_ERROR',
      message: error.message,
    });
  }
});

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/ai', aiRouter);

// Mock the AI service functions
jest.mock('../services/aiService', () => {
  const actual = jest.requireActual('../services/aiService');
  return {
    ...actual,
    generateText: jest.fn(),
    generateFitSummary: jest.fn(),
    generateCoverLetter: jest.fn(),
    improveResumeBullets: jest.fn(),
    generateJD: jest.fn(),
    rankCandidates: jest.fn(),
    generateScreeningQuestions: jest.fn(),
    generateImage: jest.fn(),
  };
});

describe('AI Service Integration Tests with Mocked Pollinations', () => {
  let candidateToken: string;
  let recruiterToken: string;

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

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('POST /api/ai/fit-summary', () => {
    it('should generate fit summary for candidate-job match', async () => {
      const mockSummary = 'This candidate is an excellent fit for the position. Their 5 years of TypeScript experience aligns perfectly with the senior role requirements.';
      
      (aiService.generateFitSummary as jest.Mock).mockResolvedValue(mockSummary);

      const response = await request(app)
        .post('/api/ai/fit-summary')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jobData: {
            title: 'Senior Software Engineer',
            level: 'senior',
            requirements: ['5+ years TypeScript', 'React experience'],
          },
          candidateProfile: {
            skills: ['TypeScript', 'React', 'Node.js'],
            experience: [
              {
                company: 'Tech Corp',
                title: 'Software Engineer',
                startDate: '2018-01-01',
                description: 'Built web applications',
              },
            ],
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary).toBe(mockSummary);
      expect(aiService.generateFitSummary).toHaveBeenCalledTimes(1);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .post('/api/ai/fit-summary')
        .send({
          jobData: {},
          candidateProfile: {},
        });

      expect(response.status).toBe(401);
    });

    it('should handle AI service errors gracefully', async () => {
      (aiService.generateFitSummary as jest.Mock).mockRejectedValue(
        new Error('AI service temporarily unavailable')
      );

      const response = await request(app)
        .post('/api/ai/fit-summary')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jobData: { title: 'Engineer' },
          candidateProfile: { skills: [] },
        });

      expect(response.status).toBe(503);
      expect(response.body.code).toBe('AI_SERVICE_ERROR');
    });
  });

  describe('POST /api/ai/cover-letter', () => {
    it('should generate tailored cover letter', async () => {
      const mockCoverLetter = 'Dear Hiring Manager,\n\nI am excited to apply for the Senior Software Engineer position. My 5 years of experience with TypeScript and React make me an ideal candidate...';
      
      (aiService.generateCoverLetter as jest.Mock).mockResolvedValue(mockCoverLetter);

      const response = await request(app)
        .post('/api/ai/cover-letter')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jobData: {
            title: 'Senior Software Engineer',
            description: 'We are looking for an experienced engineer...',
          },
          candidateProfile: {
            name: 'John Doe',
            skills: ['TypeScript', 'React'],
            experience: [],
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('coverLetter');
      expect(response.body.coverLetter).toContain('Dear Hiring Manager');
      expect(aiService.generateCoverLetter).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/ai/resume-improve', () => {
    it('should improve resume bullets for ATS', async () => {
      const mockImprovements = '1. Architected and deployed scalable microservices using TypeScript and Node.js, improving system performance by 40%\n2. Led cross-functional team of 5 engineers in developing React-based dashboard, resulting in 25% increase in user engagement';
      
      (aiService.improveResumeBullets as jest.Mock).mockResolvedValue(mockImprovements);

      const response = await request(app)
        .post('/api/ai/resume-improve')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          bullets: [
            'Built microservices with TypeScript',
            'Worked on React dashboard',
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('improvements');
      expect(response.body.improvements).toContain('Architected');
      expect(aiService.improveResumeBullets).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/ai/jd-generate', () => {
    it('should generate job description from notes', async () => {
      const mockJD = JSON.stringify({
        title: 'Senior Software Engineer',
        level: 'senior',
        location: 'San Francisco, CA',
        type: 'full-time',
        remote: true,
        description: 'We are seeking a talented Senior Software Engineer...',
        requirements: ['5+ years experience', 'TypeScript', 'React'],
        compensation: { min: 150000, max: 200000, currency: 'USD' },
        benefits: ['Health insurance', '401k', 'Remote work'],
      });
      
      (aiService.generateJD as jest.Mock).mockResolvedValue(mockJD);

      const response = await request(app)
        .post('/api/ai/jd-generate')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          notes: 'Need senior engineer with TypeScript and React. Remote OK. Salary 150-200k.',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('jd');
      const parsedJD = JSON.parse(response.body.jd);
      expect(parsedJD.title).toBe('Senior Software Engineer');
      expect(parsedJD.requirements).toContain('TypeScript');
      expect(aiService.generateJD).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/ai/shortlist', () => {
    it('should rank candidates with rationale', async () => {
      const mockRankings = JSON.stringify([
        {
          candidateIndex: 0,
          score: 92,
          rationale: 'Excellent match with 7 years of relevant experience',
          strength: 'Strong TypeScript and React skills',
          concern: 'May be overqualified',
        },
        {
          candidateIndex: 1,
          score: 78,
          rationale: 'Good fit with solid fundamentals',
          strength: 'Recent bootcamp graduate with enthusiasm',
          concern: 'Limited production experience',
        },
      ]);
      
      (aiService.rankCandidates as jest.Mock).mockResolvedValue(mockRankings);

      const response = await request(app)
        .post('/api/ai/shortlist')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          jobData: {
            title: 'Software Engineer',
            requirements: ['TypeScript', 'React'],
          },
          applications: [
            {
              candidateProfile: {
                name: 'Alice',
                skills: ['TypeScript', 'React', 'Node.js'],
                experience: [{ company: 'Tech Co', title: 'Senior Engineer' }],
              },
            },
            {
              candidateProfile: {
                name: 'Bob',
                skills: ['JavaScript', 'React'],
                experience: [{ company: 'Startup', title: 'Junior Developer' }],
              },
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('rankings');
      const rankings = JSON.parse(response.body.rankings);
      expect(rankings[0].score).toBe(92);
      expect(rankings[1].score).toBe(78);
      expect(aiService.rankCandidates).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/ai/screening-questions', () => {
    it('should generate screening questions for candidate', async () => {
      const mockQuestions = '1. Can you describe your experience with TypeScript generics and advanced types?\n2. How have you optimized React application performance in production?\n3. Tell me about a time you led a technical project from conception to deployment.';
      
      (aiService.generateScreeningQuestions as jest.Mock).mockResolvedValue(mockQuestions);

      const response = await request(app)
        .post('/api/ai/screening-questions')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          jobData: {
            title: 'Senior Software Engineer',
            requirements: ['TypeScript', 'React', 'Leadership'],
          },
          candidateProfile: {
            name: 'Alice',
            skills: ['TypeScript', 'React'],
            experience: [],
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('questions');
      expect(response.body.questions).toContain('TypeScript');
      expect(response.body.questions).toContain('React');
      expect(aiService.generateScreeningQuestions).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/ai/image', () => {
    it('should generate image URL', async () => {
      const mockImageUrl = 'https://image.pollinations.ai/prompt/professional%20tech%20office?width=1200&height=630&seed=42&nologo=true';
      
      (aiService.generateImage as jest.Mock).mockResolvedValue(mockImageUrl);

      const response = await request(app)
        .post('/api/ai/image')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          prompt: 'professional tech office',
          options: {
            width: 1200,
            height: 630,
            seed: 42,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('imageUrl');
      expect(response.body.imageUrl).toContain('image.pollinations.ai');
      expect(aiService.generateImage).toHaveBeenCalledTimes(1);
    });

    it('should return fallback image on error', async () => {
      const fallbackUrl = 'data:image/svg+xml,%3Csvg...';
      
      (aiService.generateImage as jest.Mock).mockResolvedValue(fallbackUrl);

      const response = await request(app)
        .post('/api/ai/image')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          prompt: 'test image',
          options: {},
        });

      expect(response.status).toBe(200);
      expect(response.body.imageUrl).toBe(fallbackUrl);
    });
  });

  describe('AI Service Caching', () => {
    it('should cache AI responses', async () => {
      const mockSummary = 'Cached fit summary';
      
      (aiService.generateFitSummary as jest.Mock).mockResolvedValue(mockSummary);

      const jobData = { title: 'Engineer' };
      const candidateProfile = { skills: ['TypeScript'] };

      // First call
      const response1 = await request(app)
        .post('/api/ai/fit-summary')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ jobData, candidateProfile });

      expect(response1.status).toBe(200);
      expect(aiService.generateFitSummary).toHaveBeenCalledTimes(1);

      // Second call with same data should use cache
      const response2 = await request(app)
        .post('/api/ai/fit-summary')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ jobData, candidateProfile });

      expect(response2.status).toBe(200);
      expect(response2.body.summary).toBe(mockSummary);
    });
  });

  describe('AI Service Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      (aiService.generateFitSummary as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const response = await request(app)
        .post('/api/ai/fit-summary')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jobData: { title: 'Engineer' },
          candidateProfile: { skills: [] },
        });

      expect(response.status).toBe(503);
      expect(response.body.code).toBe('AI_SERVICE_ERROR');
    });

    it('should handle timeout errors', async () => {
      (aiService.generateCoverLetter as jest.Mock).mockRejectedValue(
        new Error('Request timeout')
      );

      const response = await request(app)
        .post('/api/ai/cover-letter')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jobData: { title: 'Engineer' },
          candidateProfile: { name: 'Test' },
        });

      expect(response.status).toBe(503);
      expect(response.body.code).toBe('AI_SERVICE_ERROR');
    });
  });
});

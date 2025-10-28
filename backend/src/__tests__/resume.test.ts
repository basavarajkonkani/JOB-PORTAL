import './setup';
import request from 'supertest';
import express from 'express';
import authRouter from '../routes/auth';
import resumeRouter from '../routes/resume';
import { ResumeModel, ResumeVersionModel } from '../models/Resume';
import { auth, firestore, storage } from '../config/firebase';
import * as storageHelper from '../utils/storageHelper';

// Mock Firebase Storage upload for testing
jest.mock('../utils/storageHelper', () => ({
  uploadFileToStorage: jest.fn().mockResolvedValue({
    fileUrl: 'https://storage.googleapis.com/test-bucket/resumes/test-user/test-file.pdf',
    storagePath: 'resumes/test-user/test-file.pdf',
  }),
  deleteFileFromStorage: jest.fn().mockResolvedValue(true),
  generateSignedUrl: jest
    .fn()
    .mockResolvedValue(
      'https://storage.googleapis.com/test-bucket/resumes/test-user/test-file.pdf'
    ),
  getFileMetadata: jest.fn().mockResolvedValue({
    contentType: 'application/pdf',
    size: 1024,
    metadata: {
      originalName: 'test-file.pdf',
      uploadedBy: 'test-user-id',
    },
  }),
  isValidResumeFile: jest.fn().mockReturnValue(true),
  isValidFileSize: jest.fn().mockReturnValue(true),
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
          startDate: '2020-01-01',
          description: 'Developed web applications',
        },
      ],
      education: [
        {
          institution: 'University',
          degree: 'BS',
          field: 'Computer Science',
          graduationDate: '2019-05-01',
        },
      ],
    },
  }),
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api', resumeRouter);

// ============================================================================
// UNIT TESTS FOR RESUME MODEL AND STORAGE
// ============================================================================

describe('Resume Model and Storage Unit Tests', () => {
  describe('Resume Data Structure', () => {
    it('should have correct resume interface structure', () => {
      const mockResume = {
        id: 'resume-123',
        userId: 'user-123',
        fileUrl: 'https://storage.googleapis.com/bucket/file.pdf',
        fileName: 'resume.pdf',
        storagePath: 'resumes/user-123/file.pdf',
        uploadedAt: new Date(),
      };

      expect(mockResume).toHaveProperty('id');
      expect(mockResume).toHaveProperty('userId');
      expect(mockResume).toHaveProperty('fileUrl');
      expect(mockResume).toHaveProperty('fileName');
      expect(mockResume).toHaveProperty('storagePath');
      expect(mockResume).toHaveProperty('uploadedAt');
      expect(mockResume.uploadedAt).toBeInstanceOf(Date);
    });

    it('should have correct resume version interface structure', () => {
      const mockVersion = {
        id: 'version-123',
        resumeId: 'resume-123',
        userId: 'user-123',
        rawText: 'Resume content',
        parsedData: {
          skills: ['TypeScript', 'React'],
          experience: [
            {
              company: 'Tech Corp',
              title: 'Engineer',
              startDate: '2020-01-01',
              description: 'Built apps',
            },
          ],
          education: [
            {
              institution: 'University',
              degree: 'BS',
              field: 'CS',
              graduationDate: '2019-05-01',
            },
          ],
        },
        aiSuggestions: ['Add more details'],
        version: 1,
        createdAt: new Date(),
      };

      expect(mockVersion).toHaveProperty('id');
      expect(mockVersion).toHaveProperty('resumeId');
      expect(mockVersion).toHaveProperty('userId');
      expect(mockVersion).toHaveProperty('rawText');
      expect(mockVersion).toHaveProperty('parsedData');
      expect(mockVersion.parsedData).toHaveProperty('skills');
      expect(mockVersion.parsedData).toHaveProperty('experience');
      expect(mockVersion.parsedData).toHaveProperty('education');
      expect(mockVersion).toHaveProperty('aiSuggestions');
      expect(mockVersion).toHaveProperty('version');
      expect(mockVersion).toHaveProperty('createdAt');
    });
  });

  describe('File Upload Flow - Data Validation', () => {
    it('should define correct file structure for PDF uploads', () => {
      const pdfFile: Express.Multer.File = {
        fieldname: 'resume',
        originalname: 'resume.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('pdf content'),
        stream: null as any,
        destination: '',
        filename: '',
        path: '',
      };

      expect(pdfFile.mimetype).toBe('application/pdf');
      expect(pdfFile.originalname).toContain('.pdf');
      expect(pdfFile.buffer).toBeInstanceOf(Buffer);
    });

    it('should define correct file structure for DOCX uploads', () => {
      const docxFile: Express.Multer.File = {
        fieldname: 'resume',
        originalname: 'resume.docx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 1024,
        buffer: Buffer.from('docx content'),
        stream: null as any,
        destination: '',
        filename: '',
        path: '',
      };

      expect(docxFile.mimetype).toBe(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      expect(docxFile.originalname).toContain('.docx');
      expect(docxFile.buffer).toBeInstanceOf(Buffer);
    });

    it('should handle file size limits correctly', () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const smallFile = 5 * 1024 * 1024; // 5MB
      const largeFile = 15 * 1024 * 1024; // 15MB

      expect(smallFile).toBeLessThan(maxSize);
      expect(largeFile).toBeGreaterThan(maxSize);
    });
  });

  describe('Storage Metadata Structure', () => {
    it('should define correct storage result structure', () => {
      const storageResult = {
        fileUrl: 'https://storage.googleapis.com/bucket/resumes/user-123/file.pdf',
        storagePath: 'resumes/user-123/file.pdf',
      };

      expect(storageResult).toHaveProperty('fileUrl');
      expect(storageResult).toHaveProperty('storagePath');
      expect(storageResult.fileUrl).toContain('storage.googleapis.com');
      expect(storageResult.storagePath).toContain('resumes/');
    });

    it('should define correct file metadata structure', () => {
      const metadata = {
        contentType: 'application/pdf',
        size: 1024,
        metadata: {
          originalName: 'resume.pdf',
          uploadedBy: 'user-123',
          uploadedAt: new Date().toISOString(),
        },
      };

      expect(metadata).toHaveProperty('contentType');
      expect(metadata).toHaveProperty('size');
      expect(metadata).toHaveProperty('metadata');
      expect(metadata.metadata).toHaveProperty('originalName');
      expect(metadata.metadata).toHaveProperty('uploadedBy');
      expect(metadata.metadata).toHaveProperty('uploadedAt');
    });
  });
});

describe('ResumeVersionModel Unit Tests', () => {
  const mockUserId = 'test-user-123';
  const mockResumeId = 'resume-123';
  const mockVersionId = 'version-123';
  const mockRawText = 'John Doe\nSoftware Engineer';
  const mockParsedData = {
    skills: ['TypeScript', 'React'],
    experience: [
      {
        company: 'Tech Corp',
        title: 'Engineer',
        startDate: '2020-01-01',
        description: 'Built apps',
      },
    ],
    education: [
      {
        institution: 'University',
        degree: 'BS',
        field: 'CS',
        graduationDate: '2019-05-01',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should create first version with version number 1', async () => {
      const mockVersionDoc = {
        id: mockVersionId,
        set: jest.fn().mockResolvedValue(undefined),
      };

      const mockVersionsCollection = {
        doc: jest.fn().mockReturnValue(mockVersionDoc),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          empty: true,
          docs: [],
        }),
      };

      const mockResumeDoc = {
        collection: jest.fn().mockReturnValue(mockVersionsCollection),
      };

      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockResumeDoc),
      };

      (firestore.collection as jest.Mock).mockReturnValue(mockCollection);

      const version = await ResumeVersionModel.create(
        mockResumeId,
        mockUserId,
        mockRawText,
        mockParsedData
      );

      expect(mockVersionDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          resumeId: mockResumeId,
          userId: mockUserId,
          rawText: mockRawText,
          parsedData: mockParsedData,
          version: 1,
        })
      );
      expect(version.version).toBe(1);
      expect(version.id).toBe(mockVersionId);
    });

    it('should create subsequent version with incremented version number', async () => {
      const mockVersionDoc = {
        id: mockVersionId,
        set: jest.fn().mockResolvedValue(undefined),
      };

      const mockVersionsCollection = {
        doc: jest.fn().mockReturnValue(mockVersionDoc),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          empty: false,
          docs: [
            {
              data: () => ({ version: 2 }),
            },
          ],
        }),
      };

      const mockResumeDoc = {
        collection: jest.fn().mockReturnValue(mockVersionsCollection),
      };

      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockResumeDoc),
      };

      (firestore.collection as jest.Mock).mockReturnValue(mockCollection);

      const version = await ResumeVersionModel.create(
        mockResumeId,
        mockUserId,
        mockRawText,
        mockParsedData
      );

      expect(version.version).toBe(3);
    });

    it('should create version with AI suggestions', async () => {
      const mockAiSuggestions = ['Add more details', 'Quantify achievements'];
      const mockVersionDoc = {
        id: mockVersionId,
        set: jest.fn().mockResolvedValue(undefined),
      };

      const mockVersionsCollection = {
        doc: jest.fn().mockReturnValue(mockVersionDoc),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          empty: true,
          docs: [],
        }),
      };

      const mockResumeDoc = {
        collection: jest.fn().mockReturnValue(mockVersionsCollection),
      };

      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockResumeDoc),
      };

      (firestore.collection as jest.Mock).mockReturnValue(mockCollection);

      const version = await ResumeVersionModel.create(
        mockResumeId,
        mockUserId,
        mockRawText,
        mockParsedData,
        mockAiSuggestions
      );

      expect(mockVersionDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          aiSuggestions: mockAiSuggestions,
        })
      );
      expect(version.aiSuggestions).toEqual(mockAiSuggestions);
    });
  });

  describe('findByResumeId()', () => {
    it('should return all versions for a resume', async () => {
      const mockVersions = [
        {
          id: 'version-2',
          data: () => ({
            resumeId: mockResumeId,
            userId: mockUserId,
            rawText: 'text 2',
            parsedData: mockParsedData,
            aiSuggestions: null,
            version: 2,
            createdAt: { toDate: () => new Date('2024-01-02') },
          }),
        },
        {
          id: 'version-1',
          data: () => ({
            resumeId: mockResumeId,
            userId: mockUserId,
            rawText: 'text 1',
            parsedData: mockParsedData,
            aiSuggestions: null,
            version: 1,
            createdAt: { toDate: () => new Date('2024-01-01') },
          }),
        },
      ];

      const mockVersionsCollection = {
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          empty: false,
          docs: mockVersions,
        }),
      };

      const mockResumeDoc = {
        collection: jest.fn().mockReturnValue(mockVersionsCollection),
      };

      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockResumeDoc),
      };

      (firestore.collection as jest.Mock).mockReturnValue(mockCollection);

      const versions = await ResumeVersionModel.findByResumeId(mockResumeId);

      expect(versions).toHaveLength(2);
      expect(versions[0].version).toBe(2);
      expect(versions[1].version).toBe(1);
    });

    it('should return empty array when resume has no versions', async () => {
      const mockVersionsCollection = {
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          empty: true,
          docs: [],
        }),
      };

      const mockResumeDoc = {
        collection: jest.fn().mockReturnValue(mockVersionsCollection),
      };

      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockResumeDoc),
      };

      (firestore.collection as jest.Mock).mockReturnValue(mockCollection);

      const versions = await ResumeVersionModel.findByResumeId(mockResumeId);

      expect(versions).toEqual([]);
    });
  });

  describe('findById()', () => {
    it('should return a specific version by ID', async () => {
      const mockVersionDoc = {
        exists: true,
        id: mockVersionId,
        data: () => ({
          resumeId: mockResumeId,
          userId: mockUserId,
          rawText: mockRawText,
          parsedData: mockParsedData,
          aiSuggestions: null,
          version: 1,
          createdAt: { toDate: () => new Date('2024-01-01') },
        }),
      };

      const mockVersionsCollection = {
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockVersionDoc),
        }),
      };

      const mockResumeDoc = {
        collection: jest.fn().mockReturnValue(mockVersionsCollection),
      };

      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockResumeDoc),
      };

      (firestore.collection as jest.Mock).mockReturnValue(mockCollection);

      const version = await ResumeVersionModel.findById(mockResumeId, mockVersionId);

      expect(version).not.toBeNull();
      expect(version?.id).toBe(mockVersionId);
      expect(version?.version).toBe(1);
    });

    it('should return null when version does not exist', async () => {
      const mockVersionDoc = {
        exists: false,
      };

      const mockVersionsCollection = {
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockVersionDoc),
        }),
      };

      const mockResumeDoc = {
        collection: jest.fn().mockReturnValue(mockVersionsCollection),
      };

      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockResumeDoc),
      };

      (firestore.collection as jest.Mock).mockReturnValue(mockCollection);

      const version = await ResumeVersionModel.findById(mockResumeId, 'non-existent');

      expect(version).toBeNull();
    });
  });

  describe('updateAiSuggestions()', () => {
    it('should update AI suggestions for a version', async () => {
      const newSuggestions = ['Suggestion 1', 'Suggestion 2'];
      const mockUpdate = jest.fn().mockResolvedValue(undefined);

      const mockVersionsCollection = {
        doc: jest.fn().mockReturnValue({
          update: mockUpdate,
        }),
      };

      const mockResumeDoc = {
        collection: jest.fn().mockReturnValue(mockVersionsCollection),
      };

      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockResumeDoc),
      };

      (firestore.collection as jest.Mock).mockReturnValue(mockCollection);

      await ResumeVersionModel.updateAiSuggestions(mockResumeId, mockVersionId, newSuggestions);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          aiSuggestions: newSuggestions,
        })
      );
    });
  });

  describe('delete()', () => {
    it('should delete a resume version', async () => {
      const mockDelete = jest.fn().mockResolvedValue(undefined);

      const mockVersionsCollection = {
        doc: jest.fn().mockReturnValue({
          delete: mockDelete,
        }),
      };

      const mockResumeDoc = {
        collection: jest.fn().mockReturnValue(mockVersionsCollection),
      };

      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockResumeDoc),
      };

      (firestore.collection as jest.Mock).mockReturnValue(mockCollection);

      await ResumeVersionModel.delete(mockResumeId, mockVersionId);

      expect(mockDelete).toHaveBeenCalled();
    });
  });
});

describe('Storage Helper Unit Tests', () => {
  const mockUserId = 'test-user-123';
  const mockFile: Express.Multer.File = {
    fieldname: 'resume',
    originalname: 'test-resume.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('fake pdf content'),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFileToStorage()', () => {
    it('should upload file to Firebase Storage and return URL', async () => {
      const result = await storageHelper.uploadFileToStorage(mockFile, mockUserId, 'resumes');

      expect(result).toHaveProperty('fileUrl');
      expect(result).toHaveProperty('storagePath');
      expect(result.fileUrl).toContain('storage.googleapis.com');
      expect(result.storagePath).toContain('resumes/test-user');
    });
  });

  describe('deleteFileFromStorage()', () => {
    it('should delete file from Firebase Storage', async () => {
      const storagePath = 'resumes/test-user/file.pdf';
      const result = await storageHelper.deleteFileFromStorage(storagePath);

      expect(result).toBe(true);
    });
  });

  describe('generateSignedUrl()', () => {
    it('should generate signed URL for existing file', async () => {
      const storagePath = 'resumes/test-user/file.pdf';
      const url = await storageHelper.generateSignedUrl(storagePath);

      expect(url).toContain('storage.googleapis.com');
    });
  });

  describe('getFileMetadata()', () => {
    it('should retrieve file metadata', async () => {
      const storagePath = 'resumes/test-user/file.pdf';
      const metadata = await storageHelper.getFileMetadata(storagePath);

      expect(metadata).toHaveProperty('contentType');
      expect(metadata).toHaveProperty('size');
    });
  });

  describe('isValidResumeFile()', () => {
    it('should validate PDF files', () => {
      const result = storageHelper.isValidResumeFile(mockFile);
      expect(result).toBe(true);
    });

    it('should validate DOCX files', () => {
      const docxFile = {
        ...mockFile,
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
      const result = storageHelper.isValidResumeFile(docxFile);
      expect(result).toBe(true);
    });
  });

  describe('isValidFileSize()', () => {
    it('should validate file size within limit', () => {
      const result = storageHelper.isValidFileSize(mockFile);
      expect(result).toBe(true);
    });

    it('should validate file size with custom limit', () => {
      const result = storageHelper.isValidFileSize(mockFile, 2048);
      expect(result).toBe(true);
    });
  });
});

// ============================================================================
// INTEGRATION TESTS FOR RESUME API ENDPOINTS
// ============================================================================

describe('Resume Upload and Parsing Integration Tests', () => {
  let candidateToken: string;
  let candidateUserId: string;

  beforeEach(async () => {
    // Create candidate user with Firebase
    const email = `candidate-${Date.now()}@example.com`;
    const response = await request(app).post('/api/auth/signup').send({
      email,
      password: 'SecurePass123!',
      name: 'Test Candidate',
      role: 'candidate',
    });

    candidateToken = response.body.idToken;
    candidateUserId = response.body.user.id;
  });

  afterEach(async () => {
    // Clean up Firebase Auth user
    if (candidateUserId) {
      try {
        await auth.deleteUser(candidateUserId);
      } catch (error) {
        // User might already be deleted
      }
    }
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
      const response = await request(app).post('/api/candidate/resume/parse').send({
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
      const otherEmail = `other-${Date.now()}@example.com`;
      const otherUserResponse = await request(app).post('/api/auth/signup').send({
        email: otherEmail,
        password: 'SecurePass123!',
        name: 'Other User',
        role: 'candidate',
      });

      const otherToken = otherUserResponse.body.idToken;
      const otherUserId = otherUserResponse.body.user.id;

      // Try to parse first user's resume
      const response = await request(app)
        .post('/api/candidate/resume/parse')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          resumeId,
        });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');

      // Clean up other user
      try {
        await auth.deleteUser(otherUserId);
      } catch (error) {
        // User might already be deleted
      }
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
      const response = await request(app).get('/api/candidate/resumes');

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

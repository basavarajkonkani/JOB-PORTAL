import express, { Request, Response } from 'express';
import multer from 'multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { authenticate } from '../middleware/auth';
import s3Client, { S3_BUCKET_NAME } from '../config/s3';
import { ResumeModel, ResumeVersionModel } from '../models/Resume';
import { parseResume } from '../utils/resumeParser';
import crypto from 'crypto';
import path from 'path';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
    }
  },
});

// POST /api/candidate/resume/upload - Upload resume file
router.post(
  '/candidate/resume/upload',
  authenticate,
  upload.single('resume'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'No file uploaded',
        });
        return;
      }

      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
        return;
      }

      // Generate unique file name
      const fileExtension = path.extname(req.file.originalname);
      const uniqueFileName = `${userId}/${crypto.randomUUID()}${fileExtension}`;

      // Upload to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: uniqueFileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        Metadata: {
          originalName: req.file.originalname,
          userId: userId,
        },
      });

      await s3Client.send(uploadCommand);

      // Construct file URL
      const fileUrl = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${uniqueFileName}`;

      // Create resume record in database
      const resume = await ResumeModel.create(
        userId,
        fileUrl,
        req.file.originalname
      );

      res.status(201).json({
        message: 'Resume uploaded successfully',
        resume: {
          id: resume.id,
          fileUrl: resume.fileUrl,
          fileName: resume.fileName,
          uploadedAt: resume.uploadedAt,
        },
      });
    } catch (error) {
      console.error('Error uploading resume:', error);
      
      if (error instanceof Error && error.message.includes('Invalid file type')) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        code: 'STORAGE_ERROR',
        message: 'Failed to upload resume',
      });
    }
  }
);

// POST /api/candidate/resume/parse - Parse uploaded resume
router.post(
  '/candidate/resume/parse',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
        return;
      }

      const { resumeId } = req.body;
      if (!resumeId) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Resume ID is required',
        });
        return;
      }

      // Fetch resume
      const resume = await ResumeModel.findById(resumeId);
      if (!resume) {
        res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Resume not found',
        });
        return;
      }

      // Verify ownership
      if (resume.userId !== userId) {
        res.status(403).json({
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resume',
        });
        return;
      }

      // Determine mime type from file name
      const fileExtension = path.extname(resume.fileName).toLowerCase();
      let mimeType: string;
      if (fileExtension === '.pdf') {
        mimeType = 'application/pdf';
      } else if (fileExtension === '.docx') {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Unsupported file type',
        });
        return;
      }

      // Parse resume
      const { rawText, parsedData } = await parseResume(resume.fileUrl, mimeType);

      // Create resume version
      const version = await ResumeVersionModel.create(
        resumeId,
        userId,
        rawText,
        parsedData
      );

      res.status(201).json({
        message: 'Resume parsed successfully',
        version: {
          id: version.id,
          resumeId: version.resumeId,
          rawText: version.rawText,
          parsedData: version.parsedData,
          version: version.version,
          createdAt: version.createdAt,
        },
      });
    } catch (error) {
      console.error('Error parsing resume:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to parse resume',
      });
    }
  }
);

// GET /api/candidate/resumes - Get all resumes for authenticated user
router.get(
  '/candidate/resumes',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
        return;
      }

      const resumes = await ResumeModel.findByUserId(userId);
      
      // Get versions for each resume
      const resumesWithVersions = await Promise.all(
        resumes.map(async (resume) => {
          const versions = await ResumeVersionModel.findByResumeId(resume.id);
          return {
            ...resume,
            versions,
          };
        })
      );

      res.json({
        resumes: resumesWithVersions,
      });
    } catch (error) {
      console.error('Error fetching resumes:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch resumes',
      });
    }
  }
);

export default router;

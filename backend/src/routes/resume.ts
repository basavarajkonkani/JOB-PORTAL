import express, { Response } from 'express';
import multer from 'multer';
import { authenticateFirebase, AuthRequest } from '../middleware/firebaseAuth';
import { ResumeModel, ResumeVersionModel } from '../models/Resume';
import { parseResume } from '../utils/resumeParser';
import {
  uploadFileToStorage,
  deleteFileFromStorage,
  isValidResumeFile,
  isValidFileSize,
} from '../utils/storageHelper';
import path from 'path';
import logger from '../utils/logger';

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
  authenticateFirebase,
  upload.single('resume'),
  async (req: AuthRequest, res: Response): Promise<void> => {
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

      // Validate file type
      if (!isValidResumeFile(req.file)) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid file type. Only PDF and DOCX files are allowed.',
        });
        return;
      }

      // Validate file size
      if (!isValidFileSize(req.file)) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'File size exceeds 10MB limit',
        });
        return;
      }

      // Upload to Firebase Cloud Storage
      const { fileUrl, storagePath } = await uploadFileToStorage(req.file, userId, 'resumes');

      // Create resume record in Firestore
      const resume = await ResumeModel.create(userId, fileUrl, req.file.originalname, storagePath);

      logger.info('Resume uploaded successfully', {
        resumeId: resume.id,
        userId,
        fileName: resume.fileName,
      });

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
      logger.error('Error uploading resume', { error });

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
  authenticateFirebase,
  async (req: AuthRequest, res: Response): Promise<void> => {
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
      const version = await ResumeVersionModel.create(resumeId, userId, rawText, parsedData);

      logger.info('Resume parsed successfully', {
        resumeId,
        versionId: version.id,
        version: version.version,
      });

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
      logger.error('Error parsing resume', { error });
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
  authenticateFirebase,
  async (req: AuthRequest, res: Response): Promise<void> => {
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
      logger.error('Error fetching resumes', { error });
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch resumes',
      });
    }
  }
);

// DELETE /api/candidate/resume/:id - Delete a resume
router.delete(
  '/candidate/resume/:id',
  authenticateFirebase,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
        return;
      }

      const { id } = req.params;

      // Fetch resume
      const resume = await ResumeModel.findById(id);
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
          message: 'You do not have permission to delete this resume',
        });
        return;
      }

      // Delete file from storage
      await deleteFileFromStorage(resume.storagePath);

      // Delete all versions (subcollection will be deleted with parent in Firestore)
      const versions = await ResumeVersionModel.findByResumeId(id);
      for (const version of versions) {
        await ResumeVersionModel.delete(id, version.id);
      }

      // Delete resume document
      await ResumeModel.delete(id);

      logger.info('Resume deleted successfully', {
        resumeId: id,
        userId,
      });

      res.json({
        message: 'Resume deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting resume', { error });
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete resume',
      });
    }
  }
);

export default router;

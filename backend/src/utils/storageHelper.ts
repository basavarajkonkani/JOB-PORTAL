import { storage } from '../config/firebase';
import { Request } from 'express';
import crypto from 'crypto';
import path from 'path';
import logger from './logger';

/**
 * Upload a file to Firebase Cloud Storage
 * @param file - The file buffer and metadata from multer
 * @param userId - The user ID for organizing files
 * @param folder - The folder name (e.g., 'resumes', 'avatars')
 * @returns Object containing file URL and storage path
 */
export async function uploadFileToStorage(
  file: Express.Multer.File,
  userId: string,
  folder: string = 'resumes'
): Promise<{ fileUrl: string; storagePath: string }> {
  try {
    const bucket = storage.bucket();

    // Generate unique file name
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${crypto.randomUUID()}${fileExtension}`;
    const storagePath = `${folder}/${userId}/${uniqueFileName}`;

    // Create file reference
    const fileUpload = bucket.file(storagePath);

    // Upload file with metadata
    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    logger.info('File uploaded to Firebase Storage', {
      storagePath,
      userId,
      originalName: file.originalname,
    });

    // Generate signed URL (valid for 1 year)
    const [url] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
    });

    return {
      fileUrl: url,
      storagePath,
    };
  } catch (error) {
    logger.error('Failed to upload file to Firebase Storage', {
      error,
      userId,
      folder,
    });
    throw new Error(
      `File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Delete a file from Firebase Cloud Storage
 * @param storagePath - The path to the file in storage
 * @returns True if deletion was successful
 */
export async function deleteFileFromStorage(storagePath: string): Promise<boolean> {
  try {
    const bucket = storage.bucket();
    const file = bucket.file(storagePath);

    // Check if file exists
    const [exists] = await file.exists();

    if (!exists) {
      logger.warn('File not found in storage', { storagePath });
      return false;
    }

    // Delete the file
    await file.delete();

    logger.info('File deleted from Firebase Storage', { storagePath });
    return true;
  } catch (error) {
    logger.error('Failed to delete file from Firebase Storage', {
      error,
      storagePath,
    });
    throw new Error(
      `File deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate a new signed URL for an existing file
 * @param storagePath - The path to the file in storage
 * @param expirationMs - Expiration time in milliseconds (default: 1 year)
 * @returns The signed URL
 */
export async function generateSignedUrl(
  storagePath: string,
  expirationMs: number = 365 * 24 * 60 * 60 * 1000
): Promise<string> {
  try {
    const bucket = storage.bucket();
    const file = bucket.file(storagePath);

    // Check if file exists
    const [exists] = await file.exists();

    if (!exists) {
      throw new Error('File not found in storage');
    }

    // Generate signed URL
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expirationMs,
    });

    return url;
  } catch (error) {
    logger.error('Failed to generate signed URL', {
      error,
      storagePath,
    });
    throw new Error(
      `Signed URL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get file metadata from Firebase Cloud Storage
 * @param storagePath - The path to the file in storage
 * @returns File metadata
 */
export async function getFileMetadata(storagePath: string): Promise<any> {
  try {
    const bucket = storage.bucket();
    const file = bucket.file(storagePath);

    const [metadata] = await file.getMetadata();

    return metadata;
  } catch (error) {
    logger.error('Failed to get file metadata', {
      error,
      storagePath,
    });
    throw new Error(
      `Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validate file type for resume uploads
 * @param file - The file from multer
 * @returns True if file type is valid
 */
export function isValidResumeFile(file: Express.Multer.File): boolean {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  return allowedMimeTypes.includes(file.mimetype);
}

/**
 * Validate file size
 * @param file - The file from multer
 * @param maxSizeBytes - Maximum file size in bytes (default: 10MB)
 * @returns True if file size is valid
 */
export function isValidFileSize(
  file: Express.Multer.File,
  maxSizeBytes: number = 10 * 1024 * 1024
): boolean {
  return file.size <= maxSizeBytes;
}

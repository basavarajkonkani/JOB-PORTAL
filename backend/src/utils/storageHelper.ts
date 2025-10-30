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
    logger.info('Starting file upload (Firestore-based storage)', {
      userId,
      folder,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    });

    // Generate unique file ID
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${crypto.randomUUID()}${fileExtension}`;
    const storagePath = `${folder}/${userId}/${uniqueFileName}`;

    // Convert file to base64
    const base64Content = file.buffer.toString('base64');
    
    // Store file metadata and content in Firestore
    const { firestore } = await import('../config/firebase');
    const fileDoc = {
      userId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storagePath,
      content: base64Content,
      uploadedAt: new Date().toISOString(),
    };

    // Save to Firestore collection 'file_storage'
    await firestore.collection('file_storage').doc(uniqueFileName).set(fileDoc);

    logger.info('File stored in Firestore successfully', {
      storagePath,
      userId,
      originalName: file.originalname,
    });

    // Return a data URL that can be used to access the file
    const fileUrl = `data:${file.mimetype};base64,${base64Content}`;

    return {
      fileUrl,
      storagePath,
    };
  } catch (error) {
    logger.error('Failed to upload file to Firestore', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
      userId,
      folder,
      fileName: file?.originalname,
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
    // Extract file ID from storage path (e.g., "resumes/userId/uuid.pdf" -> "uuid")
    const fileName = storagePath.split('/').pop();
    if (!fileName) {
      logger.warn('Invalid storage path', { storagePath });
      return false;
    }
    
    // Remove file extension to get the document ID
    const fileId = fileName.replace(/\.[^/.]+$/, '');

    const { firestore } = await import('../config/firebase');
    
    // Delete from Firestore
    await firestore.collection('file_storage').doc(fileId).delete();

    logger.info('File deleted from Firestore', { storagePath, fileId });
    return true;
  } catch (error) {
    logger.error('Failed to delete file from Firestore', {
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

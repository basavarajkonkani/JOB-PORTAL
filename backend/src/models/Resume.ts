import { firestore } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import logger from '../utils/logger';

export interface Resume {
  id: string;
  userId: string;
  fileUrl: string;
  fileName: string;
  storagePath: string;
  uploadedAt: Date;
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  userId: string;
  rawText: string | null;
  parsedData: {
    skills?: string[];
    experience?: Array<{
      company: string;
      title: string;
      startDate: string;
      endDate?: string;
      description: string;
    }>;
    education?: Array<{
      institution: string;
      degree: string;
      field: string;
      graduationDate: string;
    }>;
  };
  aiSuggestions: string[] | null;
  version: number;
  createdAt: Date;
}

export class ResumeModel {
  private static collection = firestore.collection('resumes');

  /**
   * Create a new resume record in Firestore
   */
  static async create(
    userId: string,
    fileUrl: string,
    fileName: string,
    storagePath: string
  ): Promise<Resume> {
    try {
      const resumeRef = this.collection.doc();

      const resumeData = {
        userId,
        fileUrl,
        fileName,
        storagePath,
        uploadedAt: Timestamp.now(),
      };

      await resumeRef.set(resumeData);

      logger.info('Resume created in Firestore', {
        resumeId: resumeRef.id,
        userId,
      });

      return {
        id: resumeRef.id,
        userId,
        fileUrl,
        fileName,
        storagePath,
        uploadedAt: resumeData.uploadedAt.toDate(),
      };
    } catch (error) {
      logger.error('Failed to create resume in Firestore', { error, userId });
      throw error;
    }
  }

  /**
   * Find all resumes for a user
   */
  static async findByUserId(userId: string): Promise<Resume[]> {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .orderBy('uploadedAt', 'desc')
        .get();

      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          storagePath: data.storagePath,
          uploadedAt: data.uploadedAt.toDate(),
        };
      });
    } catch (error) {
      logger.error('Failed to find resumes by userId', { error, userId });
      throw error;
    }
  }

  /**
   * Find a resume by ID
   */
  static async findById(id: string): Promise<Resume | null> {
    try {
      const doc = await this.collection.doc(id).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data()!;
      return {
        id: doc.id,
        userId: data.userId,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        storagePath: data.storagePath,
        uploadedAt: data.uploadedAt.toDate(),
      };
    } catch (error) {
      logger.error('Failed to find resume by id', { error, id });
      throw error;
    }
  }

  /**
   * Update resume file URL (e.g., when regenerating signed URL)
   */
  static async updateFileUrl(id: string, fileUrl: string): Promise<void> {
    try {
      await this.collection.doc(id).update({
        fileUrl,
        updatedAt: Timestamp.now(),
      });

      logger.info('Resume file URL updated', { resumeId: id });
    } catch (error) {
      logger.error('Failed to update resume file URL', { error, id });
      throw error;
    }
  }

  /**
   * Delete a resume record
   */
  static async delete(id: string): Promise<void> {
    try {
      await this.collection.doc(id).delete();
      logger.info('Resume deleted from Firestore', { resumeId: id });
    } catch (error) {
      logger.error('Failed to delete resume', { error, id });
      throw error;
    }
  }
}

export class ResumeVersionModel {
  /**
   * Get the versions subcollection for a resume
   */
  private static getVersionsCollection(resumeId: string) {
    return firestore.collection('resumes').doc(resumeId).collection('versions');
  }

  /**
   * Create a new resume version
   */
  static async create(
    resumeId: string,
    userId: string,
    rawText: string | null,
    parsedData: ResumeVersion['parsedData'],
    aiSuggestions: string[] | null = null
  ): Promise<ResumeVersion> {
    try {
      const versionsCollection = this.getVersionsCollection(resumeId);

      // Get the next version number
      const snapshot = await versionsCollection.orderBy('version', 'desc').limit(1).get();

      const version = snapshot.empty ? 1 : snapshot.docs[0].data().version + 1;

      const versionRef = versionsCollection.doc();

      const versionData = {
        resumeId,
        userId,
        rawText,
        parsedData,
        aiSuggestions,
        version,
        createdAt: Timestamp.now(),
      };

      await versionRef.set(versionData);

      logger.info('Resume version created', {
        versionId: versionRef.id,
        resumeId,
        version,
      });

      return {
        id: versionRef.id,
        resumeId,
        userId,
        rawText,
        parsedData,
        aiSuggestions,
        version,
        createdAt: versionData.createdAt.toDate(),
      };
    } catch (error) {
      logger.error('Failed to create resume version', { error, resumeId });
      throw error;
    }
  }

  /**
   * Find all versions for a resume
   */
  static async findByResumeId(resumeId: string): Promise<ResumeVersion[]> {
    try {
      const snapshot = await this.getVersionsCollection(resumeId).orderBy('version', 'desc').get();

      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          resumeId: data.resumeId,
          userId: data.userId,
          rawText: data.rawText,
          parsedData: data.parsedData,
          aiSuggestions: data.aiSuggestions,
          version: data.version,
          createdAt: data.createdAt.toDate(),
        };
      });
    } catch (error) {
      logger.error('Failed to find resume versions', { error, resumeId });
      throw error;
    }
  }

  /**
   * Find a specific version by ID
   */
  static async findById(resumeId: string, versionId: string): Promise<ResumeVersion | null> {
    try {
      const doc = await this.getVersionsCollection(resumeId).doc(versionId).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data()!;
      return {
        id: doc.id,
        resumeId: data.resumeId,
        userId: data.userId,
        rawText: data.rawText,
        parsedData: data.parsedData,
        aiSuggestions: data.aiSuggestions,
        version: data.version,
        createdAt: data.createdAt.toDate(),
      };
    } catch (error) {
      logger.error('Failed to find resume version by id', { error, resumeId, versionId });
      throw error;
    }
  }

  /**
   * Find all versions for a user across all resumes
   */
  static async findByUserId(userId: string): Promise<ResumeVersion[]> {
    try {
      // First get all resumes for the user
      const resumes = await ResumeModel.findByUserId(userId);

      // Then get all versions for each resume
      const allVersions: ResumeVersion[] = [];

      for (const resume of resumes) {
        const versions = await this.findByResumeId(resume.id);
        allVersions.push(...versions);
      }

      // Sort by creation date descending
      allVersions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return allVersions;
    } catch (error) {
      logger.error('Failed to find resume versions by userId', { error, userId });
      throw error;
    }
  }

  /**
   * Update AI suggestions for a version
   */
  static async updateAiSuggestions(
    resumeId: string,
    versionId: string,
    aiSuggestions: string[]
  ): Promise<void> {
    try {
      await this.getVersionsCollection(resumeId).doc(versionId).update({
        aiSuggestions,
        updatedAt: Timestamp.now(),
      });

      logger.info('Resume version AI suggestions updated', { resumeId, versionId });
    } catch (error) {
      logger.error('Failed to update AI suggestions', { error, resumeId, versionId });
      throw error;
    }
  }

  /**
   * Delete a resume version
   */
  static async delete(resumeId: string, versionId: string): Promise<void> {
    try {
      await this.getVersionsCollection(resumeId).doc(versionId).delete();
      logger.info('Resume version deleted', { resumeId, versionId });
    } catch (error) {
      logger.error('Failed to delete resume version', { error, resumeId, versionId });
      throw error;
    }
  }
}

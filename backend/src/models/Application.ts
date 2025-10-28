import { firestore } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  resumeVersionId: string;
  coverLetter: string;
  status: 'submitted' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  notes: string;
  aiScore?: number;
  aiRationale?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApplicationData {
  jobId: string;
  userId: string;
  resumeVersionId: string;
  coverLetter?: string;
  status?: 'submitted' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  notes?: string;
  aiScore?: number;
  aiRationale?: string;
}

export interface UpdateApplicationData {
  coverLetter?: string;
  status?: 'submitted' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  notes?: string;
  aiScore?: number;
  aiRationale?: string;
}

export interface ApplicationWithDetails extends Application {
  jobTitle?: string;
  jobLocation?: string;
  jobType?: string;
  orgName?: string;
}

export class ApplicationModel {
  private static collection = firestore.collection('applications');

  /**
   * Create a new application
   */
  static async create(applicationData: CreateApplicationData): Promise<Application> {
    const now = Timestamp.now();

    const applicationDoc = {
      jobId: applicationData.jobId,
      userId: applicationData.userId,
      resumeVersionId: applicationData.resumeVersionId,
      coverLetter: applicationData.coverLetter || '',
      status: applicationData.status || 'submitted',
      notes: applicationData.notes || '',
      aiScore: applicationData.aiScore !== undefined ? applicationData.aiScore : null,
      aiRationale: applicationData.aiRationale !== undefined ? applicationData.aiRationale : null,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await this.collection.add(applicationDoc);

    return {
      id: docRef.id,
      jobId: applicationDoc.jobId,
      userId: applicationDoc.userId,
      resumeVersionId: applicationDoc.resumeVersionId,
      coverLetter: applicationDoc.coverLetter,
      status: applicationDoc.status as Application['status'],
      notes: applicationDoc.notes,
      aiScore: applicationDoc.aiScore !== null ? applicationDoc.aiScore : undefined,
      aiRationale: applicationDoc.aiRationale !== null ? applicationDoc.aiRationale : undefined,
      createdAt: applicationDoc.createdAt.toDate(),
      updatedAt: applicationDoc.updatedAt.toDate(),
    };
  }

  /**
   * Find an application by ID
   */
  static async findById(id: string): Promise<Application | null> {
    const doc = await this.collection.doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;
    return {
      id: doc.id,
      jobId: data.jobId,
      userId: data.userId,
      resumeVersionId: data.resumeVersionId,
      coverLetter: data.coverLetter,
      status: data.status,
      notes: data.notes,
      aiScore: data.aiScore !== null ? data.aiScore : undefined,
      aiRationale: data.aiRationale !== null ? data.aiRationale : undefined,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }

  /**
   * Find applications by user ID with optimized query
   * Uses composite index on (userId, createdAt) for better performance
   */
  static async findByUserId(userId: string): Promise<ApplicationWithDetails[]> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    if (snapshot.empty) {
      return [];
    }

    // Fetch job details for each application
    const applications: ApplicationWithDetails[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const application: ApplicationWithDetails = {
        id: doc.id,
        jobId: data.jobId,
        userId: data.userId,
        resumeVersionId: data.resumeVersionId,
        coverLetter: data.coverLetter,
        status: data.status,
        notes: data.notes,
        aiScore: data.aiScore !== null ? data.aiScore : undefined,
        aiRationale: data.aiRationale !== null ? data.aiRationale : undefined,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };

      // Fetch job details
      try {
        const jobDoc = await firestore.collection('jobs').doc(data.jobId).get();
        if (jobDoc.exists) {
          const jobData = jobDoc.data()!;
          application.jobTitle = jobData.title;
          application.jobLocation = jobData.location;
          application.jobType = jobData.type;

          // Fetch organization details
          if (jobData.orgId) {
            const orgDoc = await firestore.collection('organizations').doc(jobData.orgId).get();
            if (orgDoc.exists) {
              application.orgName = orgDoc.data()!.name;
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching job details for application ${doc.id}:`, error);
      }

      applications.push(application);
    }

    return applications;
  }

  /**
   * Find applications by job ID
   */
  static async findByJobId(jobId: string): Promise<Application[]> {
    const snapshot = await this.collection
      .where('jobId', '==', jobId)
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        jobId: data.jobId,
        userId: data.userId,
        resumeVersionId: data.resumeVersionId,
        coverLetter: data.coverLetter,
        status: data.status,
        notes: data.notes,
        aiScore: data.aiScore !== null ? data.aiScore : undefined,
        aiRationale: data.aiRationale !== null ? data.aiRationale : undefined,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
  }

  /**
   * Check if user has already applied to a job
   */
  static async existsByJobAndUser(jobId: string, userId: string): Promise<boolean> {
    const snapshot = await this.collection
      .where('jobId', '==', jobId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    return !snapshot.empty;
  }

  /**
   * Update an application
   */
  static async update(
    id: string,
    applicationData: UpdateApplicationData
  ): Promise<Application | null> {
    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    if (applicationData.coverLetter !== undefined) {
      updateData.coverLetter = applicationData.coverLetter;
    }

    if (applicationData.status !== undefined) {
      updateData.status = applicationData.status;
    }

    if (applicationData.notes !== undefined) {
      updateData.notes = applicationData.notes;
    }

    if (applicationData.aiScore !== undefined) {
      updateData.aiScore = applicationData.aiScore;
    }

    if (applicationData.aiRationale !== undefined) {
      updateData.aiRationale = applicationData.aiRationale;
    }

    // If only updatedAt is being set, return current document
    if (Object.keys(updateData).length === 1) {
      return this.findById(id);
    }

    await this.collection.doc(id).update(updateData);
    return this.findById(id);
  }

  /**
   * Delete an application
   */
  static async delete(id: string): Promise<boolean> {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch (error) {
      console.error(`Error deleting application ${id}:`, error);
      return false;
    }
  }

  /**
   * Get application count by status for a user
   */
  static async getStatusCountsByUserId(userId: string): Promise<Record<string, number>> {
    const snapshot = await this.collection.where('userId', '==', userId).get();

    const counts: Record<string, number> = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const status = data.status;
      counts[status] = (counts[status] || 0) + 1;
    });

    return counts;
  }
}

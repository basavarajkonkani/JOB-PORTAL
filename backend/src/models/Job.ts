import { getFirestore } from '../config/firebase';
import admin from 'firebase-admin';

export interface Job {
  id: string;
  orgId: string;
  createdBy: string;
  title: string;
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote: boolean;
  description: string;
  requirements: string[];
  compensation: {
    min?: number;
    max?: number;
    currency: string;
    equity?: string;
  };
  benefits: string[];
  heroImageUrl?: string;
  status: 'draft' | 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface CreateJobData {
  orgId: string;
  createdBy: string;
  title: string;
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote: boolean;
  description: string;
  requirements?: string[];
  compensation?: {
    min?: number;
    max?: number;
    currency: string;
    equity?: string;
  };
  benefits?: string[];
  heroImageUrl?: string;
  status?: 'draft' | 'active' | 'closed';
}

export interface UpdateJobData {
  title?: string;
  level?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  location?: string;
  type?: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote?: boolean;
  description?: string;
  requirements?: string[];
  compensation?: {
    min?: number;
    max?: number;
    currency: string;
    equity?: string;
  };
  benefits?: string[];
  heroImageUrl?: string;
  status?: 'draft' | 'active' | 'closed';
}

export interface JobSearchFilters {
  title?: string;
  level?: string;
  location?: string;
  remote?: boolean;
  status?: 'draft' | 'active' | 'closed';
  orgId?: string;
  createdBy?: string;
  minSalary?: number;
  maxSalary?: number;
  skills?: string[];
}

export interface JobSearchOptions {
  filters?: JobSearchFilters;
  page?: number;
  limit?: number;
}

export interface JobSearchResult {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const JOBS_COLLECTION = 'jobs';

export class JobModel {
  /**
   * Create a new job in Firestore
   */
  static async create(jobData: CreateJobData): Promise<Job> {
    const firestore = getFirestore();

    try {
      const now = new Date();
      const jobDoc = {
        orgId: jobData.orgId,
        createdBy: jobData.createdBy,
        title: jobData.title,
        level: jobData.level,
        location: jobData.location,
        type: jobData.type,
        remote: jobData.remote,
        description: jobData.description,
        requirements: jobData.requirements || [],
        compensation: jobData.compensation || { currency: 'USD' },
        benefits: jobData.benefits || [],
        heroImageUrl: jobData.heroImageUrl || null,
        status: jobData.status || 'draft',
        createdAt: admin.firestore.Timestamp.fromDate(now),
        updatedAt: admin.firestore.Timestamp.fromDate(now),
        publishedAt: jobData.status === 'active' ? admin.firestore.Timestamp.fromDate(now) : null,
      };

      const docRef = await firestore.collection(JOBS_COLLECTION).add(jobDoc);

      return {
        id: docRef.id,
        orgId: jobDoc.orgId,
        createdBy: jobDoc.createdBy,
        title: jobDoc.title,
        level: jobDoc.level,
        location: jobDoc.location,
        type: jobDoc.type,
        remote: jobDoc.remote,
        description: jobDoc.description,
        requirements: jobDoc.requirements,
        compensation: jobDoc.compensation,
        benefits: jobDoc.benefits,
        heroImageUrl: jobDoc.heroImageUrl || undefined,
        status: jobDoc.status,
        createdAt: now,
        updatedAt: now,
        publishedAt: jobDoc.publishedAt ? jobDoc.publishedAt.toDate() : undefined,
      };
    } catch (error) {
      throw new Error(
        `Failed to create job: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Find a job by ID from Firestore
   */
  static async findById(id: string): Promise<Job | null> {
    const firestore = getFirestore();

    try {
      const docRef = firestore.collection(JOBS_COLLECTION).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      if (!data) {
        return null;
      }

      return {
        id: doc.id,
        orgId: data.orgId,
        createdBy: data.createdBy,
        title: data.title,
        level: data.level,
        location: data.location,
        type: data.type,
        remote: data.remote,
        description: data.description,
        requirements: data.requirements || [],
        compensation: data.compensation || { currency: 'USD' },
        benefits: data.benefits || [],
        heroImageUrl: data.heroImageUrl || undefined,
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        publishedAt: data.publishedAt?.toDate() || undefined,
      };
    } catch (error) {
      throw new Error(
        `Failed to find job by ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update a job in Firestore
   */
  static async update(id: string, jobData: UpdateJobData): Promise<Job | null> {
    const firestore = getFirestore();

    try {
      const docRef = firestore.collection(JOBS_COLLECTION).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (jobData.title !== undefined) {
        updateData.title = jobData.title;
      }

      if (jobData.level !== undefined) {
        updateData.level = jobData.level;
      }

      if (jobData.location !== undefined) {
        updateData.location = jobData.location;
      }

      if (jobData.type !== undefined) {
        updateData.type = jobData.type;
      }

      if (jobData.remote !== undefined) {
        updateData.remote = jobData.remote;
      }

      if (jobData.description !== undefined) {
        updateData.description = jobData.description;
      }

      if (jobData.requirements !== undefined) {
        updateData.requirements = jobData.requirements;
      }

      if (jobData.compensation !== undefined) {
        updateData.compensation = jobData.compensation;
      }

      if (jobData.benefits !== undefined) {
        updateData.benefits = jobData.benefits;
      }

      if (jobData.heroImageUrl !== undefined) {
        updateData.heroImageUrl = jobData.heroImageUrl;
      }

      if (jobData.status !== undefined) {
        updateData.status = jobData.status;

        // Set publishedAt when status changes to 'active'
        if (jobData.status === 'active') {
          const currentData = doc.data();
          if (!currentData?.publishedAt) {
            updateData.publishedAt = admin.firestore.FieldValue.serverTimestamp();
          }
        }
      }

      // Update Firestore document
      await docRef.update(updateData);

      // Fetch and return updated job
      return this.findById(id);
    } catch (error) {
      throw new Error(
        `Failed to update job: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete a job (soft delete by setting status to 'closed')
   */
  static async delete(id: string): Promise<Job | null> {
    return this.update(id, { status: 'closed' });
  }

  /**
   * Hard delete a job from Firestore (for testing purposes)
   */
  static async hardDelete(id: string): Promise<boolean> {
    const firestore = getFirestore();

    try {
      await firestore.collection(JOBS_COLLECTION).doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(
        `Failed to delete job: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Search jobs with filters and pagination using Firestore
   */
  static async search(options: JobSearchOptions = {}): Promise<JobSearchResult> {
    const firestore = getFirestore();
    const { filters = {}, page = 1, limit = 20 } = options;

    try {
      let query: admin.firestore.Query = firestore.collection(JOBS_COLLECTION);

      // Apply filters
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }

      if (filters.level) {
        query = query.where('level', '==', filters.level);
      }

      if (filters.remote !== undefined) {
        query = query.where('remote', '==', filters.remote);
      }

      if (filters.orgId) {
        query = query.where('orgId', '==', filters.orgId);
      }

      if (filters.createdBy) {
        query = query.where('createdBy', '==', filters.createdBy);
      }

      // Note: Firestore doesn't support ILIKE or complex text search
      // For title and location filtering, we'll need to fetch all and filter in memory
      // Or use a dedicated search service like Algolia

      // Get all matching documents for count
      const allDocs = await query.get();
      let jobs = allDocs.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          orgId: data.orgId,
          createdBy: data.createdBy,
          title: data.title,
          level: data.level,
          location: data.location,
          type: data.type,
          remote: data.remote,
          description: data.description,
          requirements: data.requirements || [],
          compensation: data.compensation || { currency: 'USD' },
          benefits: data.benefits || [],
          heroImageUrl: data.heroImageUrl || undefined,
          status: data.status,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          publishedAt: data.publishedAt?.toDate() || undefined,
        };
      });

      // Apply in-memory filters for text search
      if (filters.title) {
        const titleLower = filters.title.toLowerCase();
        jobs = jobs.filter((job) => job.title.toLowerCase().includes(titleLower));
      }

      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        jobs = jobs.filter((job) => job.location.toLowerCase().includes(locationLower));
      }

      // Filter by salary range
      if (filters.minSalary !== undefined) {
        jobs = jobs.filter((job) => {
          const min = job.compensation.min;
          return min !== undefined && min >= filters.minSalary!;
        });
      }

      if (filters.maxSalary !== undefined) {
        jobs = jobs.filter((job) => {
          const max = job.compensation.max;
          return max !== undefined && max <= filters.maxSalary!;
        });
      }

      // Filter by skills (check if job requirements contain any of the specified skills)
      if (filters.skills && filters.skills.length > 0) {
        jobs = jobs.filter((job) => {
          const requirementsLower = job.requirements.map((r: string) => r.toLowerCase());
          return filters.skills!.some((skill) =>
            requirementsLower.some((req: string) => req.includes(skill.toLowerCase()))
          );
        });
      }

      // Sort by publishedAt DESC, then createdAt DESC
      jobs.sort((a, b) => {
        const aDate = a.publishedAt || a.createdAt;
        const bDate = b.publishedAt || b.createdAt;
        return bDate.getTime() - aDate.getTime();
      });

      const total = jobs.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedJobs = jobs.slice(offset, offset + limit);

      return {
        jobs: paginatedJobs,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new Error(
        `Failed to search jobs: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get jobs by organization
   */
  static async findByOrgId(orgId: string): Promise<Job[]> {
    const firestore = getFirestore();

    try {
      const querySnapshot = await firestore
        .collection(JOBS_COLLECTION)
        .where('orgId', '==', orgId)
        .orderBy('createdAt', 'desc')
        .get();

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          orgId: data.orgId,
          createdBy: data.createdBy,
          title: data.title,
          level: data.level,
          location: data.location,
          type: data.type,
          remote: data.remote,
          description: data.description,
          requirements: data.requirements || [],
          compensation: data.compensation || { currency: 'USD' },
          benefits: data.benefits || [],
          heroImageUrl: data.heroImageUrl || undefined,
          status: data.status,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          publishedAt: data.publishedAt?.toDate() || undefined,
        };
      });
    } catch (error) {
      throw new Error(
        `Failed to find jobs by orgId: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get jobs by recruiter
   */
  static async findByCreatedBy(userId: string): Promise<Job[]> {
    const firestore = getFirestore();

    try {
      const querySnapshot = await firestore
        .collection(JOBS_COLLECTION)
        .where('createdBy', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          orgId: data.orgId,
          createdBy: data.createdBy,
          title: data.title,
          level: data.level,
          location: data.location,
          type: data.type,
          remote: data.remote,
          description: data.description,
          requirements: data.requirements || [],
          compensation: data.compensation || { currency: 'USD' },
          benefits: data.benefits || [],
          heroImageUrl: data.heroImageUrl || undefined,
          status: data.status,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          publishedAt: data.publishedAt?.toDate() || undefined,
        };
      });
    } catch (error) {
      throw new Error(
        `Failed to find jobs by createdBy: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

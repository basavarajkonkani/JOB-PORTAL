import pool from '../config/database';

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
  /**
   * Create a new application
   */
  static async create(applicationData: CreateApplicationData): Promise<Application> {
    const query = `
      INSERT INTO applications (
        job_id, user_id, resume_version_id, cover_letter, status, notes, ai_score, ai_rationale
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING 
        id, job_id as "jobId", user_id as "userId", 
        resume_version_id as "resumeVersionId", cover_letter as "coverLetter",
        status, notes, ai_score as "aiScore", ai_rationale as "aiRationale",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const values = [
      applicationData.jobId,
      applicationData.userId,
      applicationData.resumeVersionId,
      applicationData.coverLetter || '',
      applicationData.status || 'submitted',
      applicationData.notes || '',
      applicationData.aiScore || null,
      applicationData.aiRationale || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find an application by ID
   */
  static async findById(id: string): Promise<Application | null> {
    const query = `
      SELECT 
        id, job_id as "jobId", user_id as "userId", 
        resume_version_id as "resumeVersionId", cover_letter as "coverLetter",
        status, notes, ai_score as "aiScore", ai_rationale as "aiRationale",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM applications
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find applications by user ID with optimized JOIN query
   * Uses composite index on (user_id, created_at) for better performance
   */
  static async findByUserId(userId: string): Promise<ApplicationWithDetails[]> {
    const query = `
      SELECT 
        a.id, a.job_id as "jobId", a.user_id as "userId", 
        a.resume_version_id as "resumeVersionId", a.cover_letter as "coverLetter",
        a.status, a.notes, a.ai_score as "aiScore", a.ai_rationale as "aiRationale",
        a.created_at as "createdAt", a.updated_at as "updatedAt",
        j.title as "jobTitle", j.location as "jobLocation", j.type as "jobType",
        o.name as "orgName"
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      INNER JOIN orgs o ON j.org_id = o.id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
      LIMIT 100
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Find applications by job ID
   */
  static async findByJobId(jobId: string): Promise<Application[]> {
    const query = `
      SELECT 
        id, job_id as "jobId", user_id as "userId", 
        resume_version_id as "resumeVersionId", cover_letter as "coverLetter",
        status, notes, ai_score as "aiScore", ai_rationale as "aiRationale",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM applications
      WHERE job_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [jobId]);
    return result.rows;
  }

  /**
   * Check if user has already applied to a job
   */
  static async existsByJobAndUser(jobId: string, userId: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM applications
      WHERE job_id = $1 AND user_id = $2
    `;

    const result = await pool.query(query, [jobId, userId]);
    return result.rows.length > 0;
  }

  /**
   * Update an application
   */
  static async update(id: string, applicationData: UpdateApplicationData): Promise<Application | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (applicationData.coverLetter !== undefined) {
      updates.push(`cover_letter = $${paramCount}`);
      values.push(applicationData.coverLetter);
      paramCount++;
    }

    if (applicationData.status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(applicationData.status);
      paramCount++;
    }

    if (applicationData.notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      values.push(applicationData.notes);
      paramCount++;
    }

    if (applicationData.aiScore !== undefined) {
      updates.push(`ai_score = $${paramCount}`);
      values.push(applicationData.aiScore);
      paramCount++;
    }

    if (applicationData.aiRationale !== undefined) {
      updates.push(`ai_rationale = $${paramCount}`);
      values.push(applicationData.aiRationale);
      paramCount++;
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE applications
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id, job_id as "jobId", user_id as "userId", 
        resume_version_id as "resumeVersionId", cover_letter as "coverLetter",
        status, notes, ai_score as "aiScore", ai_rationale as "aiRationale",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete an application
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM applications WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Get application count by status for a user
   */
  static async getStatusCountsByUserId(userId: string): Promise<Record<string, number>> {
    const query = `
      SELECT status, COUNT(*) as count
      FROM applications
      WHERE user_id = $1
      GROUP BY status
    `;

    const result = await pool.query(query, [userId]);
    const counts: Record<string, number> = {};
    
    result.rows.forEach((row) => {
      counts[row.status] = parseInt(row.count, 10);
    });

    return counts;
  }
}

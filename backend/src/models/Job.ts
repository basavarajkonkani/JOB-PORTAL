import pool from '../config/database';

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

export class JobModel {
  /**
   * Create a new job
   */
  static async create(jobData: CreateJobData): Promise<Job> {
    const query = `
      INSERT INTO jobs (
        org_id, created_by, title, level, location, type, remote,
        description, requirements, compensation, benefits, hero_image_url, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING 
        id, org_id as "orgId", created_by as "createdBy", title, level, 
        location, type, remote, description, requirements, compensation, 
        benefits, hero_image_url as "heroImageUrl", status,
        created_at as "createdAt", updated_at as "updatedAt", 
        published_at as "publishedAt"
    `;

    const values = [
      jobData.orgId,
      jobData.createdBy,
      jobData.title,
      jobData.level,
      jobData.location,
      jobData.type,
      jobData.remote,
      jobData.description,
      jobData.requirements || [],
      JSON.stringify(jobData.compensation || { currency: 'USD' }),
      jobData.benefits || [],
      jobData.heroImageUrl || null,
      jobData.status || 'draft',
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find a job by ID
   */
  static async findById(id: string): Promise<Job | null> {
    const query = `
      SELECT 
        id, org_id as "orgId", created_by as "createdBy", title, level, 
        location, type, remote, description, requirements, compensation, 
        benefits, hero_image_url as "heroImageUrl", status,
        created_at as "createdAt", updated_at as "updatedAt", 
        published_at as "publishedAt"
      FROM jobs
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Update a job
   */
  static async update(id: string, jobData: UpdateJobData): Promise<Job | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (jobData.title !== undefined) {
      updates.push(`title = $${paramCount}`);
      values.push(jobData.title);
      paramCount++;
    }

    if (jobData.level !== undefined) {
      updates.push(`level = $${paramCount}`);
      values.push(jobData.level);
      paramCount++;
    }

    if (jobData.location !== undefined) {
      updates.push(`location = $${paramCount}`);
      values.push(jobData.location);
      paramCount++;
    }

    if (jobData.type !== undefined) {
      updates.push(`type = $${paramCount}`);
      values.push(jobData.type);
      paramCount++;
    }

    if (jobData.remote !== undefined) {
      updates.push(`remote = $${paramCount}`);
      values.push(jobData.remote);
      paramCount++;
    }

    if (jobData.description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(jobData.description);
      paramCount++;
    }

    if (jobData.requirements !== undefined) {
      updates.push(`requirements = $${paramCount}`);
      values.push(jobData.requirements);
      paramCount++;
    }

    if (jobData.compensation !== undefined) {
      updates.push(`compensation = $${paramCount}`);
      values.push(JSON.stringify(jobData.compensation));
      paramCount++;
    }

    if (jobData.benefits !== undefined) {
      updates.push(`benefits = $${paramCount}`);
      values.push(jobData.benefits);
      paramCount++;
    }

    if (jobData.heroImageUrl !== undefined) {
      updates.push(`hero_image_url = $${paramCount}`);
      values.push(jobData.heroImageUrl);
      paramCount++;
    }

    if (jobData.status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(jobData.status);
      paramCount++;
      
      // Set published_at when status changes to 'active'
      if (jobData.status === 'active') {
        updates.push(`published_at = CURRENT_TIMESTAMP`);
      }
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE jobs
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id, org_id as "orgId", created_by as "createdBy", title, level, 
        location, type, remote, description, requirements, compensation, 
        benefits, hero_image_url as "heroImageUrl", status,
        created_at as "createdAt", updated_at as "updatedAt", 
        published_at as "publishedAt"
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete a job (soft delete by setting status to 'closed')
   */
  static async delete(id: string): Promise<Job | null> {
    return this.update(id, { status: 'closed' });
  }

  /**
   * Hard delete a job (for testing purposes)
   */
  static async hardDelete(id: string): Promise<boolean> {
    const query = 'DELETE FROM jobs WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Search jobs with filters and pagination
   */
  static async search(options: JobSearchOptions = {}): Promise<JobSearchResult> {
    const { filters = {}, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build WHERE clause
    if (filters.title) {
      conditions.push(`title ILIKE $${paramCount}`);
      values.push(`%${filters.title}%`);
      paramCount++;
    }

    if (filters.level) {
      conditions.push(`level = $${paramCount}`);
      values.push(filters.level);
      paramCount++;
    }

    if (filters.location) {
      conditions.push(`location ILIKE $${paramCount}`);
      values.push(`%${filters.location}%`);
      paramCount++;
    }

    if (filters.remote !== undefined) {
      conditions.push(`remote = $${paramCount}`);
      values.push(filters.remote);
      paramCount++;
    }

    if (filters.status) {
      conditions.push(`status = $${paramCount}`);
      values.push(filters.status);
      paramCount++;
    }

    if (filters.orgId) {
      conditions.push(`org_id = $${paramCount}`);
      values.push(filters.orgId);
      paramCount++;
    }

    if (filters.createdBy) {
      conditions.push(`created_by = $${paramCount}`);
      values.push(filters.createdBy);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM jobs ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated results
    const query = `
      SELECT 
        id, org_id as "orgId", created_by as "createdBy", title, level, 
        location, type, remote, description, requirements, compensation, 
        benefits, hero_image_url as "heroImageUrl", status,
        created_at as "createdAt", updated_at as "updatedAt", 
        published_at as "publishedAt"
      FROM jobs
      ${whereClause}
      ORDER BY published_at DESC NULLS LAST, created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    values.push(limit, offset);
    const result = await pool.query(query, values);

    return {
      jobs: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get jobs by organization
   */
  static async findByOrgId(orgId: string): Promise<Job[]> {
    const query = `
      SELECT 
        id, org_id as "orgId", created_by as "createdBy", title, level, 
        location, type, remote, description, requirements, compensation, 
        benefits, hero_image_url as "heroImageUrl", status,
        created_at as "createdAt", updated_at as "updatedAt", 
        published_at as "publishedAt"
      FROM jobs
      WHERE org_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [orgId]);
    return result.rows;
  }

  /**
   * Get jobs by recruiter
   */
  static async findByCreatedBy(userId: string): Promise<Job[]> {
    const query = `
      SELECT 
        id, org_id as "orgId", created_by as "createdBy", title, level, 
        location, type, remote, description, requirements, compensation, 
        benefits, hero_image_url as "heroImageUrl", status,
        created_at as "createdAt", updated_at as "updatedAt", 
        published_at as "publishedAt"
      FROM jobs
      WHERE created_by = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}

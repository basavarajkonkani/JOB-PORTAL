import pool from '../config/database';

export interface RecruiterProfile {
  userId: string;
  orgId?: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRecruiterProfileData {
  userId: string;
  orgId?: string;
  title?: string;
}

export interface UpdateRecruiterProfileData {
  orgId?: string | null;
  title?: string;
}

export class RecruiterProfileModel {
  /**
   * Create a new recruiter profile
   */
  static async create(profileData: CreateRecruiterProfileData): Promise<RecruiterProfile> {
    const query = `
      INSERT INTO recruiter_profiles (user_id, org_id, title)
      VALUES ($1, $2, $3)
      RETURNING 
        user_id as "userId",
        org_id as "orgId",
        title,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const values = [
      profileData.userId,
      profileData.orgId || null,
      profileData.title || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find a recruiter profile by user ID
   */
  static async findByUserId(userId: string): Promise<RecruiterProfile | null> {
    const query = `
      SELECT 
        user_id as "userId",
        org_id as "orgId",
        title,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM recruiter_profiles
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Find all recruiters for an organization
   */
  static async findByOrgId(orgId: string): Promise<RecruiterProfile[]> {
    const query = `
      SELECT 
        user_id as "userId",
        org_id as "orgId",
        title,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM recruiter_profiles
      WHERE org_id = $1
    `;

    const result = await pool.query(query, [orgId]);
    return result.rows;
  }

  /**
   * Update a recruiter profile
   */
  static async update(
    userId: string,
    profileData: UpdateRecruiterProfileData
  ): Promise<RecruiterProfile | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (profileData.orgId !== undefined) {
      updates.push(`org_id = $${paramCount}`);
      values.push(profileData.orgId);
      paramCount++;
    }

    if (profileData.title !== undefined) {
      updates.push(`title = $${paramCount}`);
      values.push(profileData.title);
      paramCount++;
    }

    if (updates.length === 0) {
      return this.findByUserId(userId);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE recruiter_profiles
      SET ${updates.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING 
        user_id as "userId",
        org_id as "orgId",
        title,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete a recruiter profile
   */
  static async delete(userId: string): Promise<boolean> {
    const query = 'DELETE FROM recruiter_profiles WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Check if profile exists for user
   */
  static async exists(userId: string): Promise<boolean> {
    const query = 'SELECT 1 FROM recruiter_profiles WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows.length > 0;
  }

  /**
   * Associate recruiter with organization
   */
  static async setOrganization(userId: string, orgId: string): Promise<RecruiterProfile | null> {
    return this.update(userId, { orgId });
  }

  /**
   * Remove recruiter from organization
   */
  static async removeFromOrganization(userId: string): Promise<RecruiterProfile | null> {
    return this.update(userId, { orgId: null });
  }
}

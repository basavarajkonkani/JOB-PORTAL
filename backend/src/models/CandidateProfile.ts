import pool from '../config/database';

export interface Experience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
}

export interface Preferences {
  roles?: string[];
  locations?: string[];
  remoteOnly?: boolean;
  minCompensation?: number;
}

export interface CandidateProfile {
  userId: string;
  location: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  preferences: Preferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCandidateProfileData {
  userId: string;
  location?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  preferences?: Preferences;
}

export interface UpdateCandidateProfileData {
  location?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  preferences?: Preferences;
}

export class CandidateProfileModel {
  /**
   * Create a new candidate profile
   */
  static async create(profileData: CreateCandidateProfileData): Promise<CandidateProfile> {
    const query = `
      INSERT INTO candidate_profiles (
        user_id, location, skills, experience, education, preferences
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        user_id as "userId",
        location,
        skills,
        experience,
        education,
        preferences,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const values = [
      profileData.userId,
      profileData.location || '',
      profileData.skills || [],
      JSON.stringify(profileData.experience || []),
      JSON.stringify(profileData.education || []),
      JSON.stringify(profileData.preferences || {}),
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find a candidate profile by user ID
   */
  static async findByUserId(userId: string): Promise<CandidateProfile | null> {
    const query = `
      SELECT 
        user_id as "userId",
        location,
        skills,
        experience,
        education,
        preferences,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM candidate_profiles
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Update a candidate profile
   */
  static async update(
    userId: string,
    profileData: UpdateCandidateProfileData
  ): Promise<CandidateProfile | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (profileData.location !== undefined) {
      updates.push(`location = $${paramCount}`);
      values.push(profileData.location);
      paramCount++;
    }

    if (profileData.skills !== undefined) {
      updates.push(`skills = $${paramCount}`);
      values.push(profileData.skills);
      paramCount++;
    }

    if (profileData.experience !== undefined) {
      updates.push(`experience = $${paramCount}`);
      values.push(JSON.stringify(profileData.experience));
      paramCount++;
    }

    if (profileData.education !== undefined) {
      updates.push(`education = $${paramCount}`);
      values.push(JSON.stringify(profileData.education));
      paramCount++;
    }

    if (profileData.preferences !== undefined) {
      updates.push(`preferences = $${paramCount}`);
      values.push(JSON.stringify(profileData.preferences));
      paramCount++;
    }

    if (updates.length === 0) {
      return this.findByUserId(userId);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE candidate_profiles
      SET ${updates.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING 
        user_id as "userId",
        location,
        skills,
        experience,
        education,
        preferences,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete a candidate profile
   */
  static async delete(userId: string): Promise<boolean> {
    const query = 'DELETE FROM candidate_profiles WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Check if profile exists for user
   */
  static async exists(userId: string): Promise<boolean> {
    const query = 'SELECT 1 FROM candidate_profiles WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows.length > 0;
  }
}

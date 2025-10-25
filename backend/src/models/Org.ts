import pool from '../config/database';

export interface Org {
  id: string;
  name: string;
  website?: string;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrgData {
  name: string;
  website?: string;
  logoUrl?: string;
}

export interface UpdateOrgData {
  name?: string;
  website?: string;
  logoUrl?: string;
}

export class OrgModel {
  /**
   * Create a new organization
   */
  static async create(orgData: CreateOrgData): Promise<Org> {
    const query = `
      INSERT INTO orgs (name, website, logo_url)
      VALUES ($1, $2, $3)
      RETURNING 
        id,
        name,
        website,
        logo_url as "logoUrl",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const values = [
      orgData.name,
      orgData.website || null,
      orgData.logoUrl || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find an organization by ID
   */
  static async findById(id: string): Promise<Org | null> {
    const query = `
      SELECT 
        id,
        name,
        website,
        logo_url as "logoUrl",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM orgs
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find an organization by name
   */
  static async findByName(name: string): Promise<Org | null> {
    const query = `
      SELECT 
        id,
        name,
        website,
        logo_url as "logoUrl",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM orgs
      WHERE name = $1
    `;

    const result = await pool.query(query, [name]);
    return result.rows[0] || null;
  }

  /**
   * Update an organization
   */
  static async update(id: string, orgData: UpdateOrgData): Promise<Org | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (orgData.name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(orgData.name);
      paramCount++;
    }

    if (orgData.website !== undefined) {
      updates.push(`website = $${paramCount}`);
      values.push(orgData.website);
      paramCount++;
    }

    if (orgData.logoUrl !== undefined) {
      updates.push(`logo_url = $${paramCount}`);
      values.push(orgData.logoUrl);
      paramCount++;
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE orgs
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id,
        name,
        website,
        logo_url as "logoUrl",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete an organization
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM orgs WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Get all recruiters for an organization
   */
  static async getRecruiters(orgId: string): Promise<string[]> {
    const query = `
      SELECT user_id
      FROM recruiter_profiles
      WHERE org_id = $1
    `;

    const result = await pool.query(query, [orgId]);
    return result.rows.map(row => row.user_id);
  }
}

import pool from '../config/database';
import bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'candidate' | 'recruiter' | 'admin';
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  role: 'candidate' | 'recruiter' | 'admin';
  name: string;
  avatarUrl?: string;
}

export interface UpdateUserData {
  name?: string;
  avatarUrl?: string;
}

const SALT_ROUNDS = 12;

export class UserModel {
  /**
   * Hash a plain text password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Compare a plain text password with a hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Create a new user
   */
  static async create(userData: CreateUserData): Promise<User> {
    const passwordHash = await this.hashPassword(userData.password);
    
    const query = `
      INSERT INTO users (email, password_hash, role, name, avatar_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, password_hash as "passwordHash", role, name, 
                avatar_url as "avatarUrl", created_at as "createdAt", 
                updated_at as "updatedAt"
    `;
    
    const values = [
      userData.email,
      passwordHash,
      userData.role,
      userData.name,
      userData.avatarUrl || null,
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find a user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash as "passwordHash", role, name, 
             avatar_url as "avatarUrl", created_at as "createdAt", 
             updated_at as "updatedAt"
      FROM users
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find a user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash as "passwordHash", role, name, 
             avatar_url as "avatarUrl", created_at as "createdAt", 
             updated_at as "updatedAt"
      FROM users
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Update a user
   */
  static async update(id: string, userData: UpdateUserData): Promise<User | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (userData.name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(userData.name);
      paramCount++;
    }

    if (userData.avatarUrl !== undefined) {
      updates.push(`avatar_url = $${paramCount}`);
      values.push(userData.avatarUrl);
      paramCount++;
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, password_hash as "passwordHash", role, name, 
                avatar_url as "avatarUrl", created_at as "createdAt", 
                updated_at as "updatedAt"
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete a user
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows.length > 0;
  }
}

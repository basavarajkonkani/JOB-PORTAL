import pool from '../config/database';

export interface Resume {
  id: string;
  userId: string;
  fileUrl: string;
  fileName: string;
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
  static async create(
    userId: string,
    fileUrl: string,
    fileName: string
  ): Promise<Resume> {
    const result = await pool.query(
      `INSERT INTO resumes (user_id, file_url, file_name)
       VALUES ($1, $2, $3)
       RETURNING id, user_id as "userId", file_url as "fileUrl", 
                 file_name as "fileName", uploaded_at as "uploadedAt"`,
      [userId, fileUrl, fileName]
    );
    return result.rows[0];
  }

  static async findByUserId(userId: string): Promise<Resume[]> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", file_url as "fileUrl", 
              file_name as "fileName", uploaded_at as "uploadedAt"
       FROM resumes
       WHERE user_id = $1
       ORDER BY uploaded_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async findById(id: string): Promise<Resume | null> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", file_url as "fileUrl", 
              file_name as "fileName", uploaded_at as "uploadedAt"
       FROM resumes
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }
}

export class ResumeVersionModel {
  static async create(
    resumeId: string,
    userId: string,
    rawText: string | null,
    parsedData: ResumeVersion['parsedData'],
    aiSuggestions: string[] | null = null
  ): Promise<ResumeVersion> {
    // Get the next version number
    const versionResult = await pool.query(
      `SELECT COALESCE(MAX(version), 0) + 1 as next_version
       FROM resume_versions
       WHERE resume_id = $1`,
      [resumeId]
    );
    const version = versionResult.rows[0].next_version;

    const result = await pool.query(
      `INSERT INTO resume_versions (resume_id, user_id, raw_text, parsed_data, ai_suggestions, version)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, resume_id as "resumeId", user_id as "userId", 
                 raw_text as "rawText", parsed_data as "parsedData", 
                 ai_suggestions as "aiSuggestions", version, created_at as "createdAt"`,
      [resumeId, userId, rawText, JSON.stringify(parsedData), aiSuggestions, version]
    );
    return result.rows[0];
  }

  static async findByResumeId(resumeId: string): Promise<ResumeVersion[]> {
    const result = await pool.query(
      `SELECT id, resume_id as "resumeId", user_id as "userId", 
              raw_text as "rawText", parsed_data as "parsedData", 
              ai_suggestions as "aiSuggestions", version, created_at as "createdAt"
       FROM resume_versions
       WHERE resume_id = $1
       ORDER BY version DESC`,
      [resumeId]
    );
    return result.rows;
  }

  static async findById(id: string): Promise<ResumeVersion | null> {
    const result = await pool.query(
      `SELECT id, resume_id as "resumeId", user_id as "userId", 
              raw_text as "rawText", parsed_data as "parsedData", 
              ai_suggestions as "aiSuggestions", version, created_at as "createdAt"
       FROM resume_versions
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string): Promise<ResumeVersion[]> {
    const result = await pool.query(
      `SELECT rv.id, rv.resume_id as "resumeId", rv.user_id as "userId", 
              rv.raw_text as "rawText", rv.parsed_data as "parsedData", 
              rv.ai_suggestions as "aiSuggestions", rv.version, rv.created_at as "createdAt"
       FROM resume_versions rv
       WHERE rv.user_id = $1
       ORDER BY rv.created_at DESC`,
      [userId]
    );
    return result.rows;
  }
}

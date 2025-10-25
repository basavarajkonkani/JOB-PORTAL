import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      resume_version_id UUID NOT NULL REFERENCES resume_versions(id) ON DELETE RESTRICT,
      cover_letter TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'shortlisted', 'rejected', 'accepted')),
      notes TEXT,
      ai_score DECIMAL(5,2),
      ai_rationale TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_applications_job_id ON applications(job_id);
    CREATE INDEX idx_applications_user_id ON applications(user_id);
    CREATE INDEX idx_applications_resume_version_id ON applications(resume_version_id);
    CREATE INDEX idx_applications_status ON applications(status);
    CREATE UNIQUE INDEX idx_applications_job_id_user_id ON applications(job_id, user_id);
    CREATE INDEX idx_applications_ai_score ON applications(ai_score);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql('DROP TABLE IF EXISTS applications CASCADE;');
}

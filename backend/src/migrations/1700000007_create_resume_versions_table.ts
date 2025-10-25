import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE resume_versions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      raw_text TEXT,
      parsed_data JSONB DEFAULT '{}',
      ai_suggestions TEXT[],
      version INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_resume_versions_resume_id ON resume_versions(resume_id);
    CREATE INDEX idx_resume_versions_user_id ON resume_versions(user_id);
    CREATE UNIQUE INDEX idx_resume_versions_resume_id_version ON resume_versions(resume_id, version);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql('DROP TABLE IF EXISTS resume_versions CASCADE;');
}

import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
      created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      level VARCHAR(50) NOT NULL CHECK (level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
      location VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL CHECK (type IN ('full-time', 'part-time', 'contract', 'internship')),
      remote BOOLEAN NOT NULL DEFAULT false,
      description TEXT NOT NULL,
      requirements TEXT[] DEFAULT '{}',
      compensation JSONB DEFAULT '{}',
      benefits TEXT[] DEFAULT '{}',
      hero_image_url TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      published_at TIMESTAMP
    );

    CREATE INDEX idx_jobs_org_id ON jobs(org_id);
    CREATE INDEX idx_jobs_created_by ON jobs(created_by);
    CREATE INDEX idx_jobs_title ON jobs(title);
    CREATE INDEX idx_jobs_location ON jobs(location);
    CREATE INDEX idx_jobs_level ON jobs(level);
    CREATE INDEX idx_jobs_type ON jobs(type);
    CREATE INDEX idx_jobs_remote ON jobs(remote);
    CREATE INDEX idx_jobs_status ON jobs(status);
    CREATE INDEX idx_jobs_status_published_at ON jobs(status, published_at);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql('DROP TABLE IF EXISTS jobs CASCADE;');
}

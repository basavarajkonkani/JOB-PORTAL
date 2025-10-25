import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    -- Composite index for job search queries (most common filter combinations)
    CREATE INDEX IF NOT EXISTS idx_jobs_status_level_location ON jobs(status, level, location);
    CREATE INDEX IF NOT EXISTS idx_jobs_status_remote ON jobs(status, remote);
    
    -- Composite index for application queries with joins
    CREATE INDEX IF NOT EXISTS idx_applications_user_created ON applications(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_applications_job_status ON applications(job_id, status);
    
    -- Index for candidate profile skills search (GIN index for array operations)
    CREATE INDEX IF NOT EXISTS idx_candidate_profiles_skills ON candidate_profiles USING GIN(skills);
    
    -- Index for job requirements search (GIN index for array operations)
    CREATE INDEX IF NOT EXISTS idx_jobs_requirements ON jobs USING GIN(requirements);
    
    -- Composite index for recruiter dashboard queries
    CREATE INDEX IF NOT EXISTS idx_jobs_created_by_status ON jobs(created_by, status);
    
    -- Index for resume versions by user
    CREATE INDEX IF NOT EXISTS idx_resume_versions_user_created ON resume_versions(user_id, created_at DESC);
    
    -- Index for events analytics queries
    CREATE INDEX IF NOT EXISTS idx_events_user_type_created ON events(user_id, event_type, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_events_type_created ON events(event_type, created_at DESC);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_jobs_status_level_location;
    DROP INDEX IF EXISTS idx_jobs_status_remote;
    DROP INDEX IF EXISTS idx_applications_user_created;
    DROP INDEX IF EXISTS idx_applications_job_status;
    DROP INDEX IF EXISTS idx_candidate_profiles_skills;
    DROP INDEX IF EXISTS idx_jobs_requirements;
    DROP INDEX IF EXISTS idx_jobs_created_by_status;
    DROP INDEX IF EXISTS idx_resume_versions_user_created;
    DROP INDEX IF EXISTS idx_events_user_type_created;
    DROP INDEX IF EXISTS idx_events_type_created;
  `);
}

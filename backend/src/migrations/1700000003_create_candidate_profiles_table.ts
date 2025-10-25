import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE candidate_profiles (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      location VARCHAR(255),
      skills TEXT[] DEFAULT '{}',
      experience JSONB DEFAULT '[]',
      education JSONB DEFAULT '[]',
      preferences JSONB DEFAULT '{}',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_candidate_profiles_skills ON candidate_profiles USING GIN(skills);
    CREATE INDEX idx_candidate_profiles_location ON candidate_profiles(location);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql('DROP TABLE IF EXISTS candidate_profiles CASCADE;');
}

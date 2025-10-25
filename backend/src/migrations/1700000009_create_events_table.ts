import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      event_type VARCHAR(100) NOT NULL,
      properties JSONB DEFAULT '{}',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_events_user_id ON events(user_id);
    CREATE INDEX idx_events_event_type ON events(event_type);
    CREATE INDEX idx_events_created_at ON events(created_at);
    CREATE INDEX idx_events_event_type_created_at ON events(event_type, created_at);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql('DROP TABLE IF EXISTS events CASCADE;');
}

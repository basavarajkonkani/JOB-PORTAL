import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE metrics_cache (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      metric_name VARCHAR(100) NOT NULL,
      metric_value JSONB NOT NULL,
      period_start TIMESTAMP NOT NULL,
      period_end TIMESTAMP NOT NULL,
      calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_metrics_cache_metric_name ON metrics_cache(metric_name);
    CREATE UNIQUE INDEX idx_metrics_cache_metric_name_period ON metrics_cache(metric_name, period_start, period_end);
    CREATE INDEX idx_metrics_cache_calculated_at ON metrics_cache(calculated_at);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql('DROP TABLE IF EXISTS metrics_cache CASCADE;');
}

import pool from '../config/database';

export interface MetricsCache {
  id: string;
  metricName: string;
  metricValue: Record<string, any>;
  periodStart: Date;
  periodEnd: Date;
  calculatedAt: Date;
}

export interface MetricsCacheInput {
  metricName: string;
  metricValue: Record<string, any>;
  periodStart: Date;
  periodEnd: Date;
}

export class MetricsCacheModel {
  static async upsert(data: MetricsCacheInput): Promise<MetricsCache> {
    const { metricName, metricValue, periodStart, periodEnd } = data;

    const result = await pool.query(
      `INSERT INTO metrics_cache (metric_name, metric_value, period_start, period_end)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (metric_name, period_start, period_end)
       DO UPDATE SET
         metric_value = EXCLUDED.metric_value,
         calculated_at = CURRENT_TIMESTAMP
       RETURNING id, metric_name as "metricName", metric_value as "metricValue",
                 period_start as "periodStart", period_end as "periodEnd",
                 calculated_at as "calculatedAt"`,
      [metricName, JSON.stringify(metricValue), periodStart, periodEnd]
    );

    return result.rows[0];
  }

  static async findByName(
    metricName: string,
    periodStart?: Date,
    periodEnd?: Date
  ): Promise<MetricsCache | null> {
    let query = `
      SELECT id, metric_name as "metricName", metric_value as "metricValue",
             period_start as "periodStart", period_end as "periodEnd",
             calculated_at as "calculatedAt"
      FROM metrics_cache
      WHERE metric_name = $1
    `;
    const params: any[] = [metricName];

    if (periodStart) {
      params.push(periodStart);
      query += ` AND period_start = $${params.length}`;
    }

    if (periodEnd) {
      params.push(periodEnd);
      query += ` AND period_end = $${params.length}`;
    }

    query += ' ORDER BY calculated_at DESC LIMIT 1';

    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  static async findAll(): Promise<MetricsCache[]> {
    const result = await pool.query(
      `SELECT id, metric_name as "metricName", metric_value as "metricValue",
              period_start as "periodStart", period_end as "periodEnd",
              calculated_at as "calculatedAt"
       FROM metrics_cache
       ORDER BY calculated_at DESC`
    );

    return result.rows;
  }

  static async deleteOlderThan(date: Date): Promise<number> {
    const result = await pool.query(
      'DELETE FROM metrics_cache WHERE calculated_at < $1',
      [date]
    );

    return result.rowCount || 0;
  }
}

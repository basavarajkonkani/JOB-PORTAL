import pool from '../config/database';

export interface Event {
  id: string;
  userId?: string;
  eventType: string;
  properties: Record<string, any>;
  createdAt: Date;
}

export interface EventInput {
  userId?: string;
  eventType: string;
  properties?: Record<string, any>;
}

export class EventModel {
  static async create(eventData: EventInput): Promise<Event> {
    const { userId, eventType, properties = {} } = eventData;

    const result = await pool.query(
      `INSERT INTO events (user_id, event_type, properties)
       VALUES ($1, $2, $3)
       RETURNING id, user_id as "userId", event_type as "eventType", properties, created_at as "createdAt"`,
      [userId || null, eventType, JSON.stringify(properties)]
    );

    return result.rows[0];
  }

  static async findByType(
    eventType: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Event[]> {
    let query = `
      SELECT id, user_id as "userId", event_type as "eventType", properties, created_at as "createdAt"
      FROM events
      WHERE event_type = $1
    `;
    const params: any[] = [eventType];

    if (startDate) {
      params.push(startDate);
      query += ` AND created_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND created_at <= $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findByUserId(
    userId: string,
    limit: number = 100
  ): Promise<Event[]> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", event_type as "eventType", properties, created_at as "createdAt"
       FROM events
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }

  static async countByType(
    eventType: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    let query = 'SELECT COUNT(*) FROM events WHERE event_type = $1';
    const params: any[] = [eventType];

    if (startDate) {
      params.push(startDate);
      query += ` AND created_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND created_at <= $${params.length}`;
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  static async countUniqueUsers(
    eventType: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    let query =
      'SELECT COUNT(DISTINCT user_id) FROM events WHERE event_type = $1 AND user_id IS NOT NULL';
    const params: any[] = [eventType];

    if (startDate) {
      params.push(startDate);
      query += ` AND created_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND created_at <= $${params.length}`;
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }
}

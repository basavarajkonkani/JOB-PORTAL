import { EventModel, EventInput } from '../models/Event';
import { MetricsCacheModel } from '../models/MetricsCache';
import pool from '../config/database';

// Event types
export enum EventType {
  // Page visits
  PAGE_VIEW = 'page_view',
  JOB_VIEW = 'job_view',
  PROFILE_VIEW = 'profile_view',

  // Job actions
  JOB_SEARCH = 'job_search',
  JOB_SAVE = 'job_save',
  JOB_SHARE = 'job_share',

  // Application actions
  APPLICATION_STARTED = 'application_started',
  APPLICATION_SUBMITTED = 'application_submitted',

  // Resume actions
  RESUME_UPLOADED = 'resume_uploaded',
  RESUME_PARSED = 'resume_parsed',

  // AI Copilot usage
  AI_SESSION_STARTED = 'ai_session_started',
  AI_ARTIFACT_GENERATED = 'ai_artifact_generated',
  AI_SUGGESTION_ACCEPTED = 'ai_suggestion_accepted',
  AI_SUGGESTION_REJECTED = 'ai_suggestion_rejected',

  // Recruiter actions
  JD_DRAFT_CREATED = 'jd_draft_created',
  JD_AI_GENERATED = 'jd_ai_generated',
  JD_PUBLISHED = 'jd_published',
  SHORTLIST_REQUESTED = 'shortlist_requested',

  // User lifecycle
  USER_SIGNED_UP = 'user_signed_up',
  USER_SIGNED_IN = 'user_signed_in',
  PROFILE_COMPLETED = 'profile_completed',
  ONBOARDING_COMPLETED = 'onboarding_completed',
}

export class AnalyticsService {
  /**
   * Track an event
   */
  static async trackEvent(eventData: EventInput): Promise<void> {
    try {
      await EventModel.create(eventData);
    } catch (error) {
      console.error('Failed to track event:', error);
      // Don't throw - analytics failures shouldn't break user flows
    }
  }

  /**
   * Calculate D1 activation rate
   * D1 activation = new users who viewed 3+ jobs within 24 hours of signup
   */
  static async calculateD1ActivationRate(
    startDate: Date,
    endDate: Date
  ): Promise<{ rate: number; activated: number; total: number }> {
    const query = `
      WITH new_users AS (
        SELECT user_id, MIN(created_at) as signup_time
        FROM events
        WHERE event_type = $1
          AND created_at >= $2
          AND created_at <= $3
          AND user_id IS NOT NULL
        GROUP BY user_id
      ),
      activated_users AS (
        SELECT DISTINCT nu.user_id
        FROM new_users nu
        JOIN events e ON e.user_id = nu.user_id
        WHERE e.event_type = $4
          AND e.created_at >= nu.signup_time
          AND e.created_at <= nu.signup_time + INTERVAL '24 hours'
        GROUP BY nu.user_id
        HAVING COUNT(*) >= 3
      )
      SELECT
        COUNT(DISTINCT nu.user_id) as total,
        COUNT(DISTINCT au.user_id) as activated
      FROM new_users nu
      LEFT JOIN activated_users au ON au.user_id = nu.user_id
    `;

    const result = await pool.query(query, [
      EventType.USER_SIGNED_UP,
      startDate,
      endDate,
      EventType.JOB_VIEW,
    ]);

    const { total, activated } = result.rows[0];
    const totalNum = parseInt(total) || 0;
    const activatedNum = parseInt(activated) || 0;
    const rate = totalNum > 0 ? activatedNum / totalNum : 0;

    // Cache the result
    await MetricsCacheModel.upsert({
      metricName: 'd1_activation_rate',
      metricValue: { rate, activated: activatedNum, total: totalNum },
      periodStart: startDate,
      periodEnd: endDate,
    });

    return { rate, activated: activatedNum, total: totalNum };
  }

  /**
   * Calculate apply conversion rate
   * Conversion rate = applications submitted / job views
   */
  static async calculateApplyConversionRate(
    startDate: Date,
    endDate: Date
  ): Promise<{ rate: number; applications: number; views: number }> {
    const viewsCount = await EventModel.countByType(
      EventType.JOB_VIEW,
      startDate,
      endDate
    );

    const applicationsCount = await EventModel.countByType(
      EventType.APPLICATION_SUBMITTED,
      startDate,
      endDate
    );

    const rate = viewsCount > 0 ? applicationsCount / viewsCount : 0;

    // Cache the result
    await MetricsCacheModel.upsert({
      metricName: 'apply_conversion_rate',
      metricValue: {
        rate,
        applications: applicationsCount,
        views: viewsCount,
      },
      periodStart: startDate,
      periodEnd: endDate,
    });

    return { rate, applications: applicationsCount, views: viewsCount };
  }

  /**
   * Calculate recruiter time-to-publish
   * Average time from JD draft creation to publication
   */
  static async calculateRecruiterTimeToPublish(
    startDate: Date,
    endDate: Date
  ): Promise<{
    averageMinutes: number;
    count: number;
    median: number;
  }> {
    const query = `
      WITH draft_events AS (
        SELECT
          user_id,
          properties->>'jobId' as job_id,
          created_at as draft_time
        FROM events
        WHERE event_type = $1
          AND created_at >= $2
          AND created_at <= $3
          AND properties->>'jobId' IS NOT NULL
      ),
      publish_events AS (
        SELECT
          user_id,
          properties->>'jobId' as job_id,
          created_at as publish_time
        FROM events
        WHERE event_type = $4
          AND created_at >= $2
          AND created_at <= $3
          AND properties->>'jobId' IS NOT NULL
      ),
      time_diffs AS (
        SELECT
          EXTRACT(EPOCH FROM (pe.publish_time - de.draft_time)) / 60 as minutes
        FROM draft_events de
        JOIN publish_events pe ON de.job_id = pe.job_id AND de.user_id = pe.user_id
        WHERE pe.publish_time > de.draft_time
      )
      SELECT
        AVG(minutes) as avg_minutes,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY minutes) as median_minutes,
        COUNT(*) as count
      FROM time_diffs
    `;

    const result = await pool.query(query, [
      EventType.JD_DRAFT_CREATED,
      startDate,
      endDate,
      EventType.JD_PUBLISHED,
    ]);

    const row = result.rows[0];
    const averageMinutes = parseFloat(row.avg_minutes) || 0;
    const median = parseFloat(row.median_minutes) || 0;
    const count = parseInt(row.count) || 0;

    // Cache the result
    await MetricsCacheModel.upsert({
      metricName: 'recruiter_time_to_publish',
      metricValue: { averageMinutes, median, count },
      periodStart: startDate,
      periodEnd: endDate,
    });

    return { averageMinutes, median, count };
  }

  /**
   * Calculate AI copilot usage metrics
   */
  static async calculateAICopilotMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<{
    sessions: number;
    artifactsGenerated: number;
    acceptanceRate: number;
  }> {
    const sessions = await EventModel.countUniqueUsers(
      EventType.AI_SESSION_STARTED,
      startDate,
      endDate
    );

    const artifactsGenerated = await EventModel.countByType(
      EventType.AI_ARTIFACT_GENERATED,
      startDate,
      endDate
    );

    const accepted = await EventModel.countByType(
      EventType.AI_SUGGESTION_ACCEPTED,
      startDate,
      endDate
    );

    const rejected = await EventModel.countByType(
      EventType.AI_SUGGESTION_REJECTED,
      startDate,
      endDate
    );

    const total = accepted + rejected;
    const acceptanceRate = total > 0 ? accepted / total : 0;

    // Cache the result
    await MetricsCacheModel.upsert({
      metricName: 'ai_copilot_metrics',
      metricValue: { sessions, artifactsGenerated, acceptanceRate },
      periodStart: startDate,
      periodEnd: endDate,
    });

    return { sessions, artifactsGenerated, acceptanceRate };
  }

  /**
   * Get all metrics for a time period
   */
  static async getAllMetrics(startDate: Date, endDate: Date) {
    const [
      d1Activation,
      applyConversion,
      timeToPublish,
      aiMetrics,
    ] = await Promise.all([
      this.calculateD1ActivationRate(startDate, endDate),
      this.calculateApplyConversionRate(startDate, endDate),
      this.calculateRecruiterTimeToPublish(startDate, endDate),
      this.calculateAICopilotMetrics(startDate, endDate),
    ]);

    return {
      d1ActivationRate: d1Activation,
      applyConversionRate: applyConversion,
      recruiterTimeToPublish: timeToPublish,
      aiCopilotMetrics: aiMetrics,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }

  /**
   * Get cached metrics if available
   */
  static async getCachedMetrics(metricName: string, startDate: Date, endDate: Date) {
    return await MetricsCacheModel.findByName(metricName, startDate, endDate);
  }
}

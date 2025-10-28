import { EventModel, EventInput } from '../models/Event';
import { MetricsCacheModel } from '../models/MetricsCache';

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
    // Get all signup events in the period
    const signupEvents = await EventModel.findByType(EventType.USER_SIGNED_UP, startDate, endDate);

    const newUsers = new Map<string, Date>();
    signupEvents.forEach((event) => {
      if (
        event.userId &&
        (!newUsers.has(event.userId) || event.createdAt < newUsers.get(event.userId)!)
      ) {
        newUsers.set(event.userId, event.createdAt);
      }
    });

    // Check activation for each user
    let activatedCount = 0;
    for (const [userId, signupTime] of newUsers.entries()) {
      const oneDayLater = new Date(signupTime.getTime() + 24 * 60 * 60 * 1000);
      const jobViews = await EventModel.findByType(EventType.JOB_VIEW, signupTime, oneDayLater);

      const userJobViews = jobViews.filter((e) => e.userId === userId);
      if (userJobViews.length >= 3) {
        activatedCount++;
      }
    }

    const totalNum = newUsers.size;
    const rate = totalNum > 0 ? activatedCount / totalNum : 0;

    // Cache the result
    await MetricsCacheModel.upsert({
      metricName: 'd1_activation_rate',
      metricValue: { rate, activated: activatedCount, total: totalNum },
      periodStart: startDate,
      periodEnd: endDate,
    });

    return { rate, activated: activatedCount, total: totalNum };
  }

  /**
   * Calculate apply conversion rate
   * Conversion rate = applications submitted / job views
   */
  static async calculateApplyConversionRate(
    startDate: Date,
    endDate: Date
  ): Promise<{ rate: number; applications: number; views: number }> {
    const viewsCount = await EventModel.countByType(EventType.JOB_VIEW, startDate, endDate);

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
    // Get draft and publish events
    const draftEvents = await EventModel.findByType(EventType.JD_DRAFT_CREATED, startDate, endDate);

    const publishEvents = await EventModel.findByType(EventType.JD_PUBLISHED, startDate, endDate);

    // Match drafts to publishes
    const timeDiffs: number[] = [];
    for (const draft of draftEvents) {
      const jobId = draft.properties?.jobId;
      if (!jobId || !draft.userId) continue;

      const matchingPublish = publishEvents.find(
        (p) =>
          p.properties?.jobId === jobId &&
          p.userId === draft.userId &&
          p.createdAt > draft.createdAt
      );

      if (matchingPublish) {
        const diffMs = matchingPublish.createdAt.getTime() - draft.createdAt.getTime();
        timeDiffs.push(diffMs / (1000 * 60)); // Convert to minutes
      }
    }

    const count = timeDiffs.length;
    const averageMinutes = count > 0 ? timeDiffs.reduce((a, b) => a + b, 0) / count : 0;

    // Calculate median
    let median = 0;
    if (count > 0) {
      timeDiffs.sort((a, b) => a - b);
      median =
        count % 2 === 0
          ? (timeDiffs[count / 2 - 1] + timeDiffs[count / 2]) / 2
          : timeDiffs[Math.floor(count / 2)];
    }

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
    const [d1Activation, applyConversion, timeToPublish, aiMetrics] = await Promise.all([
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

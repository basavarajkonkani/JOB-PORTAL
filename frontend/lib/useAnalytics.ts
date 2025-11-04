import { useCallback } from 'react';

// Event types matching backend
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

interface TrackEventOptions {
  eventType: EventType;
  properties?: Record<string, any>;
}

/**
 * Hook for tracking analytics events
 */
export function useAnalytics() {
  const trackEvent = useCallback(async ({ eventType, properties = {} }: TrackEventOptions) => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add auth token if available (optional for analytics)
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/event`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          eventType,
          properties,
        }),
      });

      // Don't throw errors - analytics failures shouldn't break user flows
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, []);

  const trackPageView = useCallback(
    (pagePath: string) => {
      trackEvent({
        eventType: EventType.PAGE_VIEW,
        properties: { path: pagePath },
      });
    },
    [trackEvent]
  );

  const trackJobView = useCallback(
    (jobId: string, jobTitle?: string) => {
      trackEvent({
        eventType: EventType.JOB_VIEW,
        properties: { jobId, jobTitle },
      });
    },
    [trackEvent]
  );

  const trackJobSearch = useCallback(
    (filters: Record<string, any>) => {
      trackEvent({
        eventType: EventType.JOB_SEARCH,
        properties: { filters },
      });
    },
    [trackEvent]
  );

  const trackApplicationStarted = useCallback(
    (jobId: string) => {
      trackEvent({
        eventType: EventType.APPLICATION_STARTED,
        properties: { jobId },
      });
    },
    [trackEvent]
  );

  const trackApplicationSubmitted = useCallback(
    (jobId: string, applicationId: string) => {
      trackEvent({
        eventType: EventType.APPLICATION_SUBMITTED,
        properties: { jobId, applicationId },
      });
    },
    [trackEvent]
  );

  const trackResumeUploaded = useCallback(
    (fileName: string, fileSize: number) => {
      trackEvent({
        eventType: EventType.RESUME_UPLOADED,
        properties: { fileName, fileSize },
      });
    },
    [trackEvent]
  );

  const trackAISessionStarted = useCallback(
    (context: string) => {
      trackEvent({
        eventType: EventType.AI_SESSION_STARTED,
        properties: { context },
      });
    },
    [trackEvent]
  );

  const trackAIArtifactGenerated = useCallback(
    (artifactType: string, context: string) => {
      trackEvent({
        eventType: EventType.AI_ARTIFACT_GENERATED,
        properties: { artifactType, context },
      });
    },
    [trackEvent]
  );

  const trackAISuggestionAccepted = useCallback(
    (suggestionType: string, context: string) => {
      trackEvent({
        eventType: EventType.AI_SUGGESTION_ACCEPTED,
        properties: { suggestionType, context },
      });
    },
    [trackEvent]
  );

  const trackAISuggestionRejected = useCallback(
    (suggestionType: string, context: string) => {
      trackEvent({
        eventType: EventType.AI_SUGGESTION_REJECTED,
        properties: { suggestionType, context },
      });
    },
    [trackEvent]
  );

  const trackJDDraftCreated = useCallback(
    (jobId: string) => {
      trackEvent({
        eventType: EventType.JD_DRAFT_CREATED,
        properties: { jobId },
      });
    },
    [trackEvent]
  );

  const trackJDAIGenerated = useCallback(
    (jobId: string) => {
      trackEvent({
        eventType: EventType.JD_AI_GENERATED,
        properties: { jobId },
      });
    },
    [trackEvent]
  );

  const trackJDPublished = useCallback(
    (jobId: string) => {
      trackEvent({
        eventType: EventType.JD_PUBLISHED,
        properties: { jobId },
      });
    },
    [trackEvent]
  );

  const trackShortlistRequested = useCallback(
    (jobId: string, candidateCount: number) => {
      trackEvent({
        eventType: EventType.SHORTLIST_REQUESTED,
        properties: { jobId, candidateCount },
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackPageView,
    trackJobView,
    trackJobSearch,
    trackApplicationStarted,
    trackApplicationSubmitted,
    trackResumeUploaded,
    trackAISessionStarted,
    trackAIArtifactGenerated,
    trackAISuggestionAccepted,
    trackAISuggestionRejected,
    trackJDDraftCreated,
    trackJDAIGenerated,
    trackJDPublished,
    trackShortlistRequested,
  };
}

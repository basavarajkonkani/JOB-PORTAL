import * as Sentry from '@sentry/node';
import { Express } from 'express';

export function initSentry(app: Express): void {
  // Only initialize Sentry if DSN is provided
  if (!process.env.SENTRY_DSN) {
    console.log('Sentry DSN not provided, skipping Sentry initialization');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',

    // Set sample rate for performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Set sample rate for profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    integrations: [
      // Enable HTTP calls tracing
      Sentry.httpIntegration(),

      // Enable Express.js middleware tracing
      Sentry.expressIntegration(),
    ],

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }

      // Remove sensitive data from extra context
      if (event.extra) {
        delete event.extra.password;
        delete event.extra.passwordHash;
        delete event.extra.token;
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Browser errors
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',

      // Network errors
      'NetworkError',
      'Network request failed',

      // Common user errors
      'Invalid credentials',
      'Unauthorized',
    ],
  });

  console.log('Sentry initialized successfully');
}

export function getSentryMiddleware() {
  return {
    requestHandler: Sentry.expressErrorHandler(),
    tracingHandler: (req: any, res: any, next: any) => next(), // Tracing is handled by integration
    errorHandler: Sentry.expressErrorHandler(),
  };
}

export { Sentry };

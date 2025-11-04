'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Error page for 500 Internal Server Error
 * This is a Next.js error boundary that catches errors in the app
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-center">
            <svg
              className="h-24 w-24 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-gray-900">Something went wrong</h1>
          <p className="mb-6 text-gray-600">
            We encountered an unexpected error. Our team has been notified.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-left">
              <p className="mb-2 text-sm font-semibold text-red-800">Error Details:</p>
              <pre className="overflow-x-auto text-xs text-red-700">{error.message}</pre>
              {error.digest && (
                <p className="mt-2 text-xs text-red-600">Error ID: {error.digest}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={reset}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

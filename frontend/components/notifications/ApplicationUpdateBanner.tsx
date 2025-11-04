'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useApplicationUpdates } from '@/lib/useApplicationUpdates';
import { apiRequest } from '@/lib/api-client';

export function ApplicationUpdateBanner() {
  const { user } = useAuth();
  const { updates, loading } = useApplicationUpdates(user?.id || null);
  const [dismissedUpdates, setDismissedUpdates] = useState<Set<string>>(new Set());

  const handleDismiss = async (applicationId: string) => {
    try {
      await apiRequest(`/notifications/application-updates/${applicationId}`, { method: 'DELETE' });
      setDismissedUpdates((prev) => new Set(prev).add(applicationId));
    } catch (error) {
      console.error('Failed to dismiss application update:', error);
    }
  };

  // Filter out dismissed updates
  const visibleUpdates = updates.filter((update) => !dismissedUpdates.has(update.applicationId));

  if (!user || loading || visibleUpdates.length === 0) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'shortlisted':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'reviewed':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'shortlisted':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case 'reviewed':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-2">
      {visibleUpdates.map((update) => (
        <div
          key={update.applicationId}
          className={`border rounded-lg p-4 ${getStatusColor(update.status)}`}
          role="alert"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">{getStatusIcon(update.status)}</div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium">Application Update</h3>
              <div className="mt-1 text-sm">
                <p>
                  Your application for <strong>{update.jobTitle}</strong> has been{' '}
                  <strong>{update.status}</strong>
                </p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(update.updatedAt).toLocaleString()}
                </p>
              </div>
              {update.jobId && (
                <div className="mt-2">
                  <a
                    href={`/jobs/${update.jobId}`}
                    className="text-sm font-medium underline hover:no-underline"
                  >
                    View Job Details
                  </a>
                </div>
              )}
            </div>
            <div className="ml-3 flex-shrink-0">
              <button
                onClick={() => handleDismiss(update.applicationId)}
                className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
                aria-label="Dismiss"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

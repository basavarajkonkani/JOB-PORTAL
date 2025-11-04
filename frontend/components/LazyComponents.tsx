'use client';

import dynamic from 'next/dynamic';
import { ApplicationCardSkeleton, DashboardSkeleton } from './LoadingSkeletons';

/**
 * Lazy-loaded components for code splitting and performance optimization
 * Components are loaded only when needed, reducing initial bundle size
 */

// AI Copilot Panel - loaded on demand
export const AICopilotPanel = dynamic(() => import('./ai/AICopilotPanel'), {
  loading: () => (
    <div className="w-80 bg-white border-l border-gray-200 p-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  ),
  ssr: false, // Don't render on server
});

// Resume Editor - heavy component, load on demand
export const ResumeEditor = dynamic(() => import('./resume/ResumeEditor'), {
  loading: () => (
    <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  ),
  ssr: false,
});

// Resume Upload - load on demand
export const ResumeUpload = dynamic(() => import('./resume/ResumeUpload'), {
  loading: () => (
    <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 animate-pulse">
      <div className="h-40 bg-gray-200 rounded mb-4"></div>
      <div className="h-10 bg-gray-200 rounded w-32"></div>
    </div>
  ),
  ssr: false,
});

// JD Wizard - complex form, load on demand
export const JDWizard = dynamic(() => import('./recruiter/JDWizard'), {
  loading: () => (
    <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  ),
  ssr: false,
});

// Candidate Shortlist - load on demand
export const CandidateShortlist = dynamic(() => import('./recruiter/CandidateShortlist'), {
  loading: () => (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
  ssr: false,
});

// Applications Tracker - load on demand
export const ApplicationsTracker = dynamic(() => import('./applications/ApplicationsTracker'), {
  loading: () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <ApplicationCardSkeleton key={i} />
      ))}
    </div>
  ),
  ssr: false,
});

// Candidate Dashboard - load on demand
export const CandidateDashboard = dynamic(() => import('./dashboard/CandidateDashboard'), {
  loading: () => <DashboardSkeleton />,
  ssr: false,
});

// Recruiter Dashboard - load on demand
export const RecruiterDashboard = dynamic(() => import('./recruiter/RecruiterDashboard'), {
  loading: () => <DashboardSkeleton />,
  ssr: false,
});

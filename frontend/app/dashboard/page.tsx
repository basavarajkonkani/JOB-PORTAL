'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CandidateDashboard from '@/components/dashboard/CandidateDashboard';
import RecruiterDashboard from '@/components/recruiter/RecruiterDashboard';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {user?.role === 'candidate' ? (
        <CandidateDashboard />
      ) : user?.role === 'recruiter' ? (
        <RecruiterDashboard />
      ) : (
        <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-8">
          <div className="bg-[#16161f] rounded-xl border border-white/5 p-10 max-w-md">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-16 h-16 bg-[#9b5de5] rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Welcome, {user?.name}!
                </h2>
                <p className="text-white/50 mt-1 text-sm">Setting up your dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

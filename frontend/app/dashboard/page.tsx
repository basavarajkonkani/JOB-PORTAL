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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center p-8">
          <div className="bg-white rounded-3xl shadow-2xl p-12 border-2 border-gray-100 max-w-md">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Welcome, {user?.name}!
                </h2>
                <p className="text-gray-600 mt-2">Setting up your dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

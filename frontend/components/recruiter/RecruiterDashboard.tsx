'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface DashboardData {
  jobs: {
    active: number;
    draft: number;
    closed: number;
    total: number;
  };
  applications: {
    total: number;
    submitted: number;
    reviewed: number;
    shortlisted: number;
  };
  recentJobs: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    publishedAt?: string;
  }>;
}

interface RecruiterDashboardProps {
  onCreateJob?: () => void;
}

export default function RecruiterDashboard({ onCreateJob }: RecruiterDashboardProps) {
  const { accessToken, user, signOut } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState('dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/recruiter/dashboard`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewJob = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  const handleViewApplicants = (jobId: string) => {
    router.push(`/recruiter/jobs/${jobId}/applicants`);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', path: '/dashboard' },
    { id: 'jobs', label: 'Jobs', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', path: '/recruiter/jobs' },
    { id: 'applicants', label: 'Applicants', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', path: '/recruiter/applicants' },
    { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', path: '/profile' },
  ];

  const handleSignOut = () => {
    signOut();
    router.push('/signin');
  };

  const getTodayDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#9b5de5]/20 border-t-[#9b5de5]"></div>
          <p className="text-white/70 font-medium text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-5 max-w-md">
          <p className="text-red-400 mb-3">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex">
      {/* Compact Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-60 bg-[#16161f] border-r border-white/5 z-50 flex flex-col">
        {/* Logo Section */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#9b5de5] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">AI Job Portal</h1>
              <p className="text-xs text-white/40">Recruiter</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveNav(item.id);
                if (item.path !== '/dashboard') router.push(item.path);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium transition-all text-sm ${
                activeNav === item.id
                  ? 'bg-[#9b5de5]/10 text-white border border-[#9b5de5]/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2.5 mb-2.5 p-2.5 bg-white/5 rounded-lg">
            <div className="w-9 h-9 bg-[#9b5de5] rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white text-sm truncate">{user?.name}</p>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full px-3 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-red-500/10 rounded-lg transition-all flex items-center justify-center gap-2 border border-white/5 hover:border-red-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-60">
        {/* Top Bar */}
        <header className="bg-[#16161f] border-b border-white/5 px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white mb-0.5">
                Welcome Back, {user?.name?.split(' ')[0]}
              </h1>
              <p className="text-white/50 text-sm">Manage your job postings and applicants</p>
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5">
              <p className="text-xs text-white/40">Today</p>
              <p className="text-sm text-white font-medium">{getTodayDate()}</p>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Quick Actions */}
          <section className="bg-[#16161f] rounded-xl p-5 border border-white/5">
            <h2 className="text-base font-semibold text-white mb-3">Quick Actions</h2>
            <div className="flex gap-3">
              <button
                onClick={onCreateJob}
                className="px-5 py-2.5 bg-[#9b5de5] hover:bg-[#8b4dd5] text-white rounded-lg font-medium transition-all text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Job
              </button>
              <button
                onClick={() => router.push('/recruiter/jobs')}
                className="px-5 py-2.5 border border-white/10 hover:bg-white/5 text-white rounded-lg font-medium transition-all text-sm"
              >
                View All Jobs
              </button>
            </div>
          </section>

          {/* Statistics Cards */}
          <section className="grid grid-cols-4 gap-4">
            <div className="bg-[#16161f] rounded-xl p-5 border border-white/5 hover:border-[#9b5de5]/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded">
                  Active
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-0.5">{dashboardData.jobs.active}</p>
                <p className="text-white/50 text-sm">Active Jobs</p>
              </div>
            </div>

            <div className="bg-[#16161f] rounded-xl p-5 border border-white/5 hover:border-[#9b5de5]/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-xs font-medium rounded">
                  Draft
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-0.5">{dashboardData.jobs.draft}</p>
                <p className="text-white/50 text-sm">Draft Jobs</p>
              </div>
            </div>

            <div className="bg-[#16161f] rounded-xl p-5 border border-white/5 hover:border-[#9b5de5]/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-medium rounded">
                  Total
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-0.5">{dashboardData.applications.total}</p>
                <p className="text-white/50 text-sm">Applications</p>
              </div>
            </div>

            <div className="bg-[#16161f] rounded-xl p-5 border border-white/5 hover:border-[#9b5de5]/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-[#9b5de5]/10 rounded-lg">
                  <svg className="w-5 h-5 text-[#9b5de5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <span className="px-2 py-0.5 bg-[#9b5de5]/10 text-[#9b5de5] text-xs font-medium rounded">
                  Top
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-0.5">{dashboardData.applications.shortlisted}</p>
                <p className="text-white/50 text-sm">Shortlisted</p>
              </div>
            </div>
          </section>

          {/* Pipeline Statistics */}
          <section className="bg-[#16161f] rounded-xl p-5 border border-white/5">
            <h2 className="text-base font-semibold text-white mb-4">Application Pipeline</h2>
            <div className="grid grid-cols-3 gap-5">
              <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                <p className="text-sm text-white/50 mb-1">New Submissions</p>
                <p className="text-2xl font-bold text-blue-400">
                  {dashboardData.applications.submitted}
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                <p className="text-sm text-white/50 mb-1">Under Review</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {dashboardData.applications.reviewed}
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                <p className="text-sm text-white/50 mb-1">Shortlisted</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {dashboardData.applications.shortlisted}
                </p>
              </div>
            </div>
          </section>

          {/* Recent Jobs */}
          <section className="bg-[#16161f] rounded-xl p-5 border border-white/5">
            <h2 className="text-base font-semibold text-white mb-4">Recent Job Postings</h2>
            {dashboardData.recentJobs.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-[#9b5de5]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-[#9b5de5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-white/50 mb-3 text-sm">No jobs posted yet</p>
                <button
                  onClick={onCreateJob}
                  className="px-5 py-2 bg-[#9b5de5] hover:bg-[#8b4dd5] text-white rounded-lg transition-all text-sm font-medium"
                >
                  Create Your First Job
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border border-white/5 rounded-lg hover:bg-white/5 transition-all"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{job.title}</h3>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                            job.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : job.status === 'draft'
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : 'bg-white/10 text-white/60'
                          }`}
                        >
                          {job.status}
                        </span>
                        <span className="text-sm text-white/50">
                          {job.publishedAt
                            ? `Published ${new Date(job.publishedAt).toLocaleDateString()}`
                            : `Created ${new Date(job.createdAt).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewJob(job.id)}
                        className="px-4 py-2 text-[#9b5de5] hover:bg-[#9b5de5]/10 rounded-lg transition-all text-sm font-medium"
                      >
                        View
                      </button>
                      {job.status === 'active' && (
                        <button
                          onClick={() => handleViewApplicants(job.id)}
                          className="px-4 py-2 bg-[#9b5de5] hover:bg-[#8b4dd5] text-white rounded-lg transition-all text-sm font-medium"
                        >
                          View Applicants
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

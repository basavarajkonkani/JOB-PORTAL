'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import JobCard from '@/components/jobs/JobCard';
import { useRealtimeJobs } from '@/lib/useRealtimeJobs';
import { useRealtimeCandidateProfile } from '@/lib/useRealtimeProfile';

interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface CandidateProfile {
  userId: string;
  location: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  preferences: {
    roles: string[];
    locations: string[];
    remoteOnly: boolean;
    minCompensation?: number;
  };
}

interface Activity {
  id: string;
  type: 'application' | 'profile_update' | 'resume_upload';
  title: string;
  description: string;
  timestamp: string;
}

export default function CandidateDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('dashboard');

  // Use real-time Firestore hooks for profile and jobs
  const { profile, loading: profileLoading } = useRealtimeCandidateProfile(user?.id || null);
  const { jobs: recommendedJobs, loading: jobsLoading } = useRealtimeJobs({
    limitCount: 6,
    location: profile?.preferences?.locations?.[0],
    remote: profile?.preferences?.remoteOnly ? true : null,
  });

  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate profile completion when profile changes
  useEffect(() => {
    if (profile) {
      setProfileCompletion(calculateProfileCompletion(profile));
    }
  }, [profile]);

  useEffect(() => {
    setIsLoading(profileLoading || jobsLoading);
  }, [profileLoading, jobsLoading]);

  const calculateProfileCompletion = (profileData: CandidateProfile | null): number => {
    if (!profileData) return 0;

    let completed = 0;
    const total = 6;

    if (profileData.location) completed++;
    if (profileData.skills && profileData.skills.length > 0) completed++;
    if (profileData.experience && profileData.experience.length > 0) completed++;
    if (profileData.education && profileData.education.length > 0) completed++;
    if (profileData.preferences?.roles && profileData.preferences.roles.length > 0) completed++;
    if (profileData.preferences?.locations && profileData.preferences.locations.length > 0)
      completed++;

    return Math.round((completed / total) * 100);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleSignOut = () => {
    signOut();
    router.push('/signin');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', path: '/dashboard' },
    { id: 'jobs', label: 'Jobs', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', path: '/jobs' },
    { id: 'applications', label: 'Applications', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', path: '/applications' },
    { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', path: '/profile' },
    { id: 'resume', label: 'Resume', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', path: '/resume' },
  ];

  const getTodayDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 flex">
      {/* Fixed Sidebar with Gradient */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-blue-50/50 via-white to-indigo-50/30 backdrop-blur-sm border-r border-gray-200/60 shadow-xl z-50 flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Job Portal
              </h1>
              <p className="text-xs text-gray-600 font-medium">Career Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveNav(item.id);
                if (item.path !== '/dashboard') router.push(item.path);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 ${
                activeNav === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 border-2 border-blue-400/30'
                  : 'text-gray-700 hover:bg-white hover:shadow-md border-2 border-transparent'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200/60">
          <div className="flex items-center gap-3 mb-3 p-3 bg-white/60 rounded-xl">
            <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 truncate text-sm">{user?.name}</p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2.5 text-sm font-bold text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-500 rounded-xl bg-red-50 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-72 bg-gradient-to-br from-blue-50/20 via-white to-purple-50/20">
        {/* Top Header with Gradient Continuity */}
        <header className="bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30 backdrop-blur-sm border-b border-gray-200/60 px-12 py-6 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-display">
                AI Job Portal
              </h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 font-medium">{getTodayDate()}</p>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="px-12 py-8 space-y-8">
          {/* Welcome Hero Section with 3 Key Metrics */}
          <section className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 rounded-2xl p-6 shadow-lg border border-gray-200/60 backdrop-blur-sm animate-fade-in">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900 font-display">
                Welcome Back, {user?.name?.split(' ')[0]}! 👋
              </h2>
              <p className="text-gray-600 mt-1 font-medium">Here's your job search overview</p>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{recommendedJobs.length}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600">Jobs Recommended</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{recentActivity.length}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600">Applications Submitted</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{profileCompletion}%</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600">Profile Strength</p>
              </div>
            </div>
          </section>

          {/* Profile Completion Banner - Reduced Height */}
          {profileCompletion < 100 && (
            <section className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-lg backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-5 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/30">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 font-display">Boost Your Profile</h3>
                    <p className="text-sm text-gray-600 mb-3">Complete your profile to unlock better job matches</p>
                    <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-2.5 overflow-hidden relative">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-600 h-2.5 rounded-full transition-all duration-1000 shadow-sm"
                        style={{ width: `${profileCompletion}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1.5 font-semibold">{profileCompletion}% Complete</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/profile')}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 font-bold shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all hover:-translate-y-0.5 text-sm"
                >
                  Complete Profile
                </button>
              </div>
            </section>
          )}

          {/* Two Column Layout - 50/50 Split */}
          <div className="grid grid-cols-2 gap-6">
            {/* Recommended Jobs - Equal Height */}
            <section className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 font-display">Recommended For You</h2>
                      <p className="text-xs text-gray-600">AI-powered matches</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/jobs')}
                    className="px-4 py-2 text-sm text-blue-600 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                  >
                    View All
                  </button>
                </div>

                {recommendedJobs.length === 0 ? (
                  <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-xl p-12 text-center border border-gray-200/60">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">No jobs available yet</h3>
                    <p className="text-sm text-gray-600 mb-4">Check back later for new opportunities</p>
                    <button
                      onClick={() => router.push('/jobs')}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-bold shadow-md transition-all text-sm"
                    >
                      Browse All Jobs
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {recommendedJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Recent Activity - Equal Height */}
            <aside className="space-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/30">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 font-display">Recent Activity</h2>
                    <p className="text-xs text-gray-600">Your latest actions</p>
                  </div>
                </div>

                {recentActivity.length === 0 ? (
                  <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/30 rounded-xl p-12 text-center border border-gray-200/60 min-h-[300px] flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                      <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-base font-bold text-gray-900 mb-2">No recent activity</p>
                    <p className="text-sm text-gray-600">Your activity will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 hover:shadow-md transition-all border border-gray-200/60 hover:-translate-y-0.5">
                        <p className="text-sm font-bold text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-2 font-medium">{getTimeAgo(activity.timestamp)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* Footer */}
          <footer className="mt-12 py-6 border-t border-gray-200/60 bg-gradient-to-r from-blue-50/30 via-white to-purple-50/30 rounded-2xl">
            <p className="text-center text-sm text-gray-600 font-medium">
              © 2025 Nighan2 Labs | Built by Basavaraj Konkani
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

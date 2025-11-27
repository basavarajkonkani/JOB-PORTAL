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
          <p className="text-white/70 font-medium text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
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
              <p className="text-xs text-white/40">Career Platform</p>
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
              <p className="text-white/50 text-sm">Here's what's happening with your job search</p>
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5">
              <p className="text-xs text-white/40">Today</p>
              <p className="text-sm text-white font-medium">{getTodayDate()}</p>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Stats Grid */}
          <section className="grid grid-cols-3 gap-4">
            {/* Jobs Recommended Card */}
            <div className="bg-[#16161f] rounded-xl p-5 border border-white/5 hover:border-[#9b5de5]/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-[#9b5de5]/10 rounded-lg">
                  <svg className="w-5 h-5 text-[#9b5de5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded">
                  +12%
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-0.5">{recommendedJobs.length}</p>
                <p className="text-white/50 text-sm">Jobs Recommended</p>
              </div>
            </div>

            {/* Applications Card */}
            <div className="bg-[#16161f] rounded-xl p-5 border border-white/5 hover:border-[#9b5de5]/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-medium rounded">
                  Active
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-0.5">0</p>
                <p className="text-white/50 text-sm">Applications</p>
              </div>
            </div>

            {/* Profile Strength Card */}
            <div className="bg-[#16161f] rounded-xl p-5 border border-white/5 hover:border-[#9b5de5]/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-[#9b5de5]/10 rounded-lg">
                  <svg className="w-5 h-5 text-[#9b5de5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="px-2 py-0.5 bg-[#9b5de5]/10 text-[#9b5de5] text-xs font-medium rounded">
                  {profileCompletion >= 80 ? 'Strong' : 'Good'}
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-0.5">{profileCompletion}%</p>
                <p className="text-white/50 text-sm mb-2">Profile Strength</p>
                <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                  <div 
                    className="h-full bg-[#9b5de5] rounded-full transition-all duration-1000"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Profile Completion Banner */}
          {profileCompletion < 100 && (
            <section className="bg-[#16161f] rounded-xl p-5 border border-[#9b5de5]/20">
              <div className="flex items-center justify-between gap-5">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-[#9b5de5]/10 rounded-lg">
                    <svg className="w-5 h-5 text-[#9b5de5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white mb-0.5">Complete Your Profile</h3>
                    <p className="text-white/50 text-sm mb-2">Unlock AI-powered job recommendations</p>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#9b5de5] h-1.5 rounded-full transition-all duration-1000"
                        style={{ width: `${profileCompletion}%` }}
                      />
                    </div>
                    <p className="text-white/40 mt-1.5 text-xs">{profileCompletion}% Complete</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/profile')}
                  className="px-5 py-2.5 bg-[#9b5de5] hover:bg-[#8b4dd5] text-white rounded-lg font-medium transition-all flex items-center gap-2 text-sm"
                >
                  <span>Complete Now</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </section>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Recommended Jobs Section */}
            <section className="space-y-4">
              <div className="bg-[#16161f] rounded-xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-0.5">Recommended Jobs</h2>
                    <p className="text-white/50 text-sm">AI-matched opportunities for you</p>
                  </div>
                  <button
                    onClick={() => router.push('/jobs')}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-all border border-white/5 flex items-center gap-1.5"
                  >
                    <span>View All</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>

                {recommendedJobs.length === 0 ? (
                  <div className="bg-white/5 rounded-lg p-10 text-center border border-white/5">
                    <div className="w-14 h-14 bg-[#9b5de5]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg className="h-7 w-7 text-[#9b5de5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1">No Jobs Yet</h3>
                    <p className="text-white/50 text-sm mb-3">We're finding perfect opportunities for you</p>
                    <button
                      onClick={() => router.push('/jobs')}
                      className="px-5 py-2 bg-[#9b5de5] hover:bg-[#8b4dd5] text-white text-sm font-medium rounded-lg transition-all"
                    >
                      Explore All Jobs
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {recommendedJobs.map((job) => (
                      <div key={job.id}>
                        <JobCard job={job} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Quick Actions & AI Insights */}
            <aside className="space-y-4">
              {/* Quick Actions */}
              <div className="bg-[#16161f] rounded-xl p-5 border border-white/5">
                <h3 className="text-base font-semibold text-white mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/jobs')}
                    className="group w-full flex items-center gap-2.5 p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5"
                  >
                    <div className="p-1.5 bg-[#9b5de5]/10 rounded-lg">
                      <svg className="w-4 h-4 text-[#9b5de5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <span className="text-white font-medium flex-1 text-left text-sm">Search Jobs</span>
                    <svg className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => router.push('/resume')}
                    className="group w-full flex items-center gap-2.5 p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5"
                  >
                    <div className="p-1.5 bg-blue-500/10 rounded-lg">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-white font-medium flex-1 text-left text-sm">Update Resume</span>
                    <svg className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => router.push('/profile')}
                    className="group w-full flex items-center gap-2.5 p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5"
                  >
                    <div className="p-1.5 bg-[#9b5de5]/10 rounded-lg">
                      <svg className="w-4 h-4 text-[#9b5de5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-white font-medium flex-1 text-left text-sm">Edit Profile</span>
                    <svg className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-[#16161f] rounded-xl p-5 border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-[#9b5de5]/10 rounded-lg">
                    <svg className="w-4 h-4 text-[#9b5de5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-white">AI Insights</h3>
                </div>
                
                <div className="space-y-3">
                  {/* Insight 1 */}
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium mb-0.5">Profile Views</p>
                        <p className="text-white/50 text-xs">Your profile was viewed 24 times this week</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 bg-white/10 rounded-full h-1">
                            <div className="bg-emerald-400 h-1 rounded-full" style={{ width: '75%' }} />
                          </div>
                          <span className="text-emerald-400 text-xs font-medium">+15%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Insight 2 */}
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium mb-0.5">Skill Match</p>
                        <p className="text-white/50 text-xs">85% match with trending job requirements</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 bg-white/10 rounded-full h-1">
                            <div className="bg-blue-400 h-1 rounded-full" style={{ width: '85%' }} />
                          </div>
                          <span className="text-blue-400 text-xs font-medium">85%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Insight 3 */}
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 bg-[#9b5de5] rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium mb-0.5">Response Rate</p>
                        <p className="text-white/50 text-xs">Companies respond within 3 days on average</p>
                        <div className="mt-1.5">
                          <span className="text-[#9b5de5] text-xs font-medium">3 days avg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

        </div>
      </main>
    </div>
  );
}

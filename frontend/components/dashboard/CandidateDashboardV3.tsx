'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useRealtimeJobs } from '@/lib/useRealtimeJobs';
import { useRealtimeCandidateProfile } from '@/lib/useRealtimeProfile';
import {
  Briefcase,
  FileText,
  TrendingUp,
  Sparkles,
  Search,
  User,
  LogOut,
  ChevronRight,
  Target,
  Zap,
  Award,
  Clock,
  MapPin,
  DollarSign,
  ArrowRight,
  Bell,
  Settings,
} from 'lucide-react';

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

export default function CandidateDashboardV3() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const { profile, loading: profileLoading } = useRealtimeCandidateProfile(user?.id || null);
  const { jobs: recommendedJobs, loading: jobsLoading } = useRealtimeJobs({
    limitCount: 6,
    location: profile?.preferences?.locations?.[0],
    remote: profile?.preferences?.remoteOnly ? true : null,
  });

  const [profileCompletion, setProfileCompletion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const calculateProfileCompletion = (profileData: CandidateProfile | null): number => {
    if (!profileData) return 0;
    let completed = 0;
    const total = 6;
    if (profileData.location) completed++;
    if (profileData.skills && profileData.skills.length > 0) completed++;
    if (profileData.experience && profileData.experience.length > 0) completed++;
    if (profileData.education && profileData.education.length > 0) completed++;
    if (profileData.preferences?.roles && profileData.preferences.roles.length > 0) completed++;
    if (profileData.preferences?.locations && profileData.preferences.locations.length > 0) completed++;
    return Math.round((completed / total) * 100);
  };

  useEffect(() => {
    if (profile) {
      setProfileCompletion(calculateProfileCompletion(profile));
    }
  }, [profile]);

  useEffect(() => {
    setIsLoading(profileLoading || jobsLoading);
  }, [profileLoading, jobsLoading]);

  useEffect(() => {
    if (profile) {
      setProfileCompletion(calculateProfileCompletion(profile));
    }
  }, [profile]);

  useEffect(() => {
    setIsLoading(profileLoading || jobsLoading);
  }, [profileLoading, jobsLoading]);

  const handleSignOut = () => {
    signOut();
    router.push('/signin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#1A1F29] to-[#0D1117] flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-[#A259FF]/20 blur-3xl rounded-full"></div>
          <div className="relative flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#A259FF]/20 border-t-[#A259FF] rounded-full animate-spin"></div>
            <p className="text-white/70 font-semibold text-sm">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#1A1F29] to-[#0D1117] relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#A259FF]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#0FF0FC]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-[#007BFF]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-8 py-8">
        {/* Top Navigation Bar */}
        <nav className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A259FF] to-[#007BFF] flex items-center justify-center shadow-lg shadow-[#A259FF]/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Job Portal</h1>
              <p className="text-xs text-white/40">Powered by Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-11 h-11 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#A259FF]/30 transition-all duration-200 group">
              <Bell className="w-5 h-5 text-white/60 group-hover:text-[#A259FF] transition-colors" />
            </button>
            <button className="w-11 h-11 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#A259FF]/30 transition-all duration-200 group">
              <Settings className="w-5 h-5 text-white/60 group-hover:text-[#A259FF] transition-colors" />
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 h-11 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-2 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 group"
            >
              <LogOut className="w-4 h-4 text-white/60 group-hover:text-red-400 transition-colors" />
              <span className="text-sm font-medium text-white/60 group-hover:text-red-400 transition-colors">Sign Out</span>
            </button>
          </div>
        </nav>

        {/* Hero Welcome Banner */}
        <div className="mb-8 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF]/20 via-[#007BFF]/20 to-[#0FF0FC]/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#A259FF]/10 rounded-full blur-3xl"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#A259FF] to-[#007BFF] rounded-2xl blur-lg opacity-50"></div>
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#A259FF] to-[#007BFF] flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Welcome Back, <span className="bg-gradient-to-r from-[#A259FF] to-[#0FF0FC] bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>
                  </h2>
                  <p className="text-white/60 text-base">Ready to find your dream job? Let's make it happen today.</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-sm mb-1">Profile Completion</p>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#A259FF] to-[#0FF0FC] rounded-full transition-all duration-1000"
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                  <span className="text-2xl font-bold text-white">{profileCompletion}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - 3 Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Jobs Recommended Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#A259FF]/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-8 hover:scale-[1.02] hover:border-[#A259FF]/40 transition-all duration-200">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A259FF]/20 to-[#A259FF]/5 backdrop-blur-xl border border-[#A259FF]/30 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-[#A259FF]/20 transition-all duration-200">
                  <Briefcase className="w-7 h-7 text-[#A259FF]" strokeWidth={2.5} />
                </div>
                <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-emerald-400 text-xs font-bold">+12%</span>
                </div>
              </div>
              <div>
                <p className="text-5xl font-bold text-white mb-2 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                  {recommendedJobs.length}
                </p>
                <p className="text-white/50 text-base font-medium">Jobs Recommended</p>
                <p className="text-white/30 text-sm mt-1">AI-matched for you</p>
              </div>
            </div>
          </div>

          {/* Applications Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0FF0FC]/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-8 hover:scale-[1.02] hover:border-[#0FF0FC]/40 transition-all duration-200">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0FF0FC]/20 to-[#0FF0FC]/5 backdrop-blur-xl border border-[#0FF0FC]/30 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-[#0FF0FC]/20 transition-all duration-200">
                  <FileText className="w-7 h-7 text-[#0FF0FC]" strokeWidth={2.5} />
                </div>
                <div className="px-3 py-1.5 rounded-full bg-[#0FF0FC]/10 border border-[#0FF0FC]/20">
                  <span className="text-[#0FF0FC] text-xs font-bold">Active</span>
                </div>
              </div>
              <div>
                <p className="text-5xl font-bold text-white mb-2 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                  0
                </p>
                <p className="text-white/50 text-base font-medium">Applications</p>
                <p className="text-white/30 text-sm mt-1">Submitted this month</p>
              </div>
            </div>
          </div>

          {/* Profile Strength Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#007BFF]/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-8 hover:scale-[1.02] hover:border-[#007BFF]/40 transition-all duration-200">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#007BFF]/20 to-[#007BFF]/5 backdrop-blur-xl border border-[#007BFF]/30 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-[#007BFF]/20 transition-all duration-200">
                  <Award className="w-7 h-7 text-[#007BFF]" strokeWidth={2.5} />
                </div>
                <div className="px-3 py-1.5 rounded-full bg-[#007BFF]/10 border border-[#007BFF]/20">
                  <span className="text-[#007BFF] text-xs font-bold">{profileCompletion >= 80 ? 'Strong' : 'Good'}</span>
                </div>
              </div>
              <div>
                <p className="text-5xl font-bold text-white mb-2 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                  {profileCompletion}%
                </p>
                <p className="text-white/50 text-base font-medium">Profile Strength</p>
                <div className="mt-3 w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#007BFF] to-[#0FF0FC] rounded-full transition-all duration-1000"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Modern Cards */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#A259FF]" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/jobs')}
              className="group relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-6 hover:scale-[1.02] hover:border-[#A259FF]/40 transition-all duration-200 text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A259FF]/20 to-[#A259FF]/5 flex items-center justify-center">
                  <Search className="w-6 h-6 text-[#A259FF]" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-[#A259FF] group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-white font-bold text-lg mb-1">Search Jobs</h4>
              <p className="text-white/40 text-sm">Find your perfect role</p>
            </button>

            <button
              onClick={() => router.push('/resume')}
              className="group relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-6 hover:scale-[1.02] hover:border-[#0FF0FC]/40 transition-all duration-200 text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0FF0FC]/20 to-[#0FF0FC]/5 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#0FF0FC]" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-[#0FF0FC] group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-white font-bold text-lg mb-1">Update Resume</h4>
              <p className="text-white/40 text-sm">AI-powered builder</p>
            </button>

            <button
              onClick={() => router.push('/profile')}
              className="group relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-6 hover:scale-[1.02] hover:border-[#007BFF]/40 transition-all duration-200 text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#007BFF]/20 to-[#007BFF]/5 flex items-center justify-center">
                  <User className="w-6 h-6 text-[#007BFF]" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-[#007BFF] group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-white font-bold text-lg mb-1">Edit Profile</h4>
              <p className="text-white/40 text-sm">Complete your profile</p>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Recommended Jobs - Takes 2 columns */}
          <div className="col-span-2">
            <div className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                    <Target className="w-6 h-6 text-[#A259FF]" />
                    Recommended Jobs
                  </h3>
                  <p className="text-white/50">AI-matched opportunities for you</p>
                </div>
                <button
                  onClick={() => router.push('/jobs')}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#A259FF]/30 text-white font-medium transition-all duration-200 flex items-center gap-2 group"
                >
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {recommendedJobs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#A259FF]/20 to-[#A259FF]/5 flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-10 h-10 text-[#A259FF]" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">No Jobs Yet</h4>
                  <p className="text-white/50 mb-6">We're finding perfect opportunities for you</p>
                  <button
                    onClick={() => router.push('/jobs')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#A259FF] to-[#007BFF] text-white font-bold hover:shadow-lg hover:shadow-[#A259FF]/20 transition-all duration-200"
                  >
                    Explore All Jobs
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {recommendedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="group relative rounded-2xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-white/10 p-6 hover:border-[#A259FF]/30 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white mb-2 group-hover:text-[#A259FF] transition-colors">
                            {job.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-white/50">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </span>
                            {job.remote && (
                              <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                                Remote
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#A259FF] group-hover:translate-x-1 transition-all" />
                      </div>
                      {job.compensation && (job.compensation.min || job.compensation.max) && (
                        <div className="flex items-center gap-2 text-[#0FF0FC] font-bold">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            {job.compensation.min && job.compensation.max
                              ? `${job.compensation.currency} ${job.compensation.min.toLocaleString()} - ${job.compensation.max.toLocaleString()}`
                              : job.compensation.min
                              ? `From ${job.compensation.currency} ${job.compensation.min.toLocaleString()}`
                              : `Up to ${job.compensation.currency} ${job.compensation.max?.toLocaleString()}`}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Insights Sidebar */}
          <div className="space-y-6">
            {/* AI Insights Card */}
            <div className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#A259FF]" />
                AI Insights
              </h3>

              <div className="space-y-4">
                {/* Insight 1 */}
                <div className="relative rounded-xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-white/10 p-4">
                  <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <div className="pl-5">
                    <p className="text-white font-bold text-sm mb-1">Profile Views</p>
                    <p className="text-white/50 text-xs mb-3">24 views this week</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-emerald-400 text-xs font-bold">+15%</span>
                    </div>
                  </div>
                </div>

                {/* Insight 2 */}
                <div className="relative rounded-xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-white/10 p-4">
                  <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-[#0FF0FC] animate-pulse"></div>
                  <div className="pl-5">
                    <p className="text-white font-bold text-sm mb-1">Skill Match</p>
                    <p className="text-white/50 text-xs mb-3">85% match rate</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#0FF0FC] to-[#007BFF] rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-[#0FF0FC] text-xs font-bold">85%</span>
                    </div>
                  </div>
                </div>

                {/* Insight 3 */}
                <div className="relative rounded-xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-white/10 p-4">
                  <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-[#A259FF] animate-pulse"></div>
                  <div className="pl-5">
                    <p className="text-white font-bold text-sm mb-1">Response Rate</p>
                    <p className="text-white/50 text-xs mb-2">3 days average</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#A259FF]" />
                      <span className="text-[#A259FF] text-xs font-bold">Fast Response</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Card */}
            <div className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#007BFF]" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#A259FF]/10 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-[#A259FF]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">New job match</p>
                    <p className="text-white/40 text-xs">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#0FF0FC]/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#0FF0FC]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Profile viewed</p>
                    <p className="text-white/40 text-xs">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#007BFF]/10 flex items-center justify-center">
                    <Award className="w-4 h-4 text-[#007BFF]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Skill verified</p>
                    <p className="text-white/40 text-xs">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

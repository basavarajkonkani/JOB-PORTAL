'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useRealtimeJobs } from '@/lib/useRealtimeJobs';
import { useRealtimeCandidateProfile } from '@/lib/useRealtimeProfile';
import {
  Briefcase,
  FileText,
  Award,
  Search,
  User,
  LogOut,
  ChevronRight,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp,
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

export default function CandidateDashboard() {
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
    if (profileData.preferences?.locations && profileData.preferences.locations.length > 0) completed++;
    return Math.round((completed / total) * 100);
  };

  const handleSignOut = () => {
    signOut();
    router.push('/signin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">AI Job Portal</h1>
                <p className="text-xs text-gray-500">Your Career Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 h-10 rounded-lg border border-gray-200 flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-gray-600">Here's what's happening with your job search today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Jobs Recommended */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" strokeWidth={2} />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{recommendedJobs.length}</p>
            <p className="text-gray-600 font-medium">Jobs Recommended</p>
            <p className="text-sm text-gray-500 mt-1">AI-matched for you</p>
          </div>

          {/* Applications */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" strokeWidth={2} />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">0</p>
            <p className="text-gray-600 font-medium">Applications</p>
            <p className="text-sm text-gray-500 mt-1">Submitted this month</p>
          </div>

          {/* Profile Strength */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Award className="w-6 h-6 text-blue-600" strokeWidth={2} />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{profileCompletion}%</p>
            <p className="text-gray-600 font-medium">Profile Strength</p>
            <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Profile Completion Banner */}
        {profileCompletion < 100 && (
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 mb-8">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Complete Your Profile</h3>
                <p className="text-gray-600 mb-3">Unlock AI-powered job recommendations and increase your visibility</p>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{profileCompletion}% Complete</p>
              </div>
              <button
                onClick={() => router.push('/profile')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>Complete Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/jobs')}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Search className="w-6 h-6 text-blue-600" strokeWidth={2} />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Search Jobs</h4>
              <p className="text-sm text-gray-600">Find your perfect role</p>
            </button>

            <button
              onClick={() => router.push('/resume')}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <FileText className="w-6 h-6 text-blue-600" strokeWidth={2} />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Update Resume</h4>
              <p className="text-sm text-gray-600">AI-powered builder</p>
            </button>

            <button
              onClick={() => router.push('/profile')}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <User className="w-6 h-6 text-blue-600" strokeWidth={2} />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Edit Profile</h4>
              <p className="text-sm text-gray-600">Complete your profile</p>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recommended Jobs - 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Recommended Jobs</h3>
                  <p className="text-gray-600">AI-matched opportunities for you</p>
                </div>
                <button
                  onClick={() => router.push('/jobs')}
                  className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium transition-colors flex items-center gap-2"
                >
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {recommendedJobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">No Jobs Yet</h4>
                  <p className="text-gray-600 mb-6">We're finding perfect opportunities for you</p>
                  <button
                    onClick={() => router.push('/jobs')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Explore All Jobs
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {recommendedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-5 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </span>
                            {job.remote && (
                              <span className="px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                                Remote
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      {job.compensation && (job.compensation.min || job.compensation.max) && (
                        <div className="flex items-center gap-2 text-blue-600 font-semibold">
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

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Profile Insights */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Insights</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900">Profile Views</p>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">24</p>
                  <p className="text-xs text-gray-600">This week</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-xs font-semibold text-green-600">+15%</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900">Skill Match</p>
                    <Award className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">85%</p>
                  <p className="text-xs text-gray-600">Match with trending jobs</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-xs font-semibold text-blue-600">85%</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900">Response Rate</p>
                    <Clock className="w-4 h-4 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">3 days</p>
                  <p className="text-xs text-gray-600">Average response time</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">New job match</p>
                    <p className="text-xs text-gray-600">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Profile viewed</p>
                    <p className="text-xs text-gray-600">5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Skill verified</p>
                    <p className="text-xs text-gray-600">1 day ago</p>
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

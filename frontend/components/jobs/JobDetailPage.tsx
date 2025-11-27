'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import OptimizedImage from './OptimizedImage';
import ApplyModal from './ApplyModal';
import { useAnalytics } from '@/lib/useAnalytics';

interface Job {
  id: string;
  title: string;
  level: string;
  location: string;
  type: string;
  remote: boolean;
  description: string;
  requirements: string[];
  compensation: {
    min?: number;
    max?: number;
    currency: string;
    equity?: string;
  };
  benefits: string[];
  heroImageUrl?: string;
  orgId: string;
  publishedAt: string;
}

interface CandidateProfile {
  userId: string;
  location: string;
  skills: string[];
  experience: any[];
  education: any[];
}

interface JobDetailData {
  job: Job;
  candidateProfile?: CandidateProfile;
}

interface JobDetailPageProps {
  jobId: string;
  initialData?: JobDetailData | null;
}

export default function JobDetailPage({ jobId, initialData }: JobDetailPageProps) {
  const { user, accessToken } = useAuth();
  const [jobData, setJobData] = useState<JobDetailData | null>(initialData || null);
  const [fitSummary, setFitSummary] = useState<string | null>(null);
  const [isLoadingFit, setIsLoadingFit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { trackJobView } = useAnalytics();

  useEffect(() => {
    // Only fetch if we don't have initial data or if auth token changes
    if (!initialData || accessToken) {
      fetchJobDetail();
    } else {
      setIsLoading(false);
    }
  }, [jobId, accessToken]);

  useEffect(() => {
    if (jobData?.job && jobData?.candidateProfile && user?.role === 'candidate') {
      generateFitSummary();
    }
  }, [jobData]);

  const fetchJobDetail = async () => {
    setIsLoading(true);
    setError('');

    try {
      const headers: HeadersInit = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch job details');
      }

      const data = await response.json();
      setJobData(data);

      // Track job view
      if (data.job) {
        trackJobView(data.job.id, data.job.title);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job');
    } finally {
      setIsLoading(false);
    }
  };

  const generateFitSummary = async () => {
    if (!jobData?.job || !jobData?.candidateProfile || !accessToken) return;

    setIsLoadingFit(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/fit-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          jobData: jobData.job,
          candidateProfile: jobData.candidateProfile,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFitSummary(data.summary || data.fitSummary);
      }
    } catch (err) {
      console.error('Failed to generate fit summary:', err);
    } finally {
      setIsLoadingFit(false);
    }
  };

  const handleSave = async () => {
    setIsSaved(!isSaved);
    // Save functionality will be implemented with backend API
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: jobData?.job.title,
          text: `Check out this job: ${jobData?.job.title}`,
          url,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const formatLevel = (level: string) => {
    const levelMap: Record<string, string> = {
      entry: 'Entry Level',
      mid: 'Mid Level',
      senior: 'Senior',
      lead: 'Lead',
      executive: 'Executive',
    };
    return levelMap[level] || level;
  };

  const formatCompensation = () => {
    if (!jobData?.job.compensation) return null;
    const { min, max, currency, equity } = jobData.job.compensation;

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    let comp = '';
    if (min && max) {
      comp = `${formatter.format(min)} - ${formatter.format(max)}`;
    } else if (min) {
      comp = `From ${formatter.format(min)}`;
    } else if (max) {
      comp = `Up to ${formatter.format(max)}`;
    }

    if (equity) {
      comp += ` + ${equity}`;
    }

    return comp || null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Job not found'}</p>
          <a href="/jobs" className="text-blue-600 hover:text-blue-700">
            ← Back to jobs
          </a>
        </div>
      </div>
    );
  }

  const { job } = jobData;
  const compensation = formatCompensation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Image */}
      <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600" role="banner">
        {job.heroImageUrl && (
          <OptimizedImage
            src={job.heroImageUrl}
            alt={`Hero image for ${job.title} position at ${job.location}. AI-generated illustration.`}
            width={1200}
            height={630}
            className="w-full h-full object-cover"
            priority={true}
            sizes="100vw"
          />
        )}
        {!job.heroImageUrl && (
          <div className="w-full h-full flex items-center justify-center">
            <span className="sr-only">Decorative gradient background for {job.title} position</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-10 mb-6 border border-gray-100">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#003366] mb-4 leading-tight tracking-tight">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-[#667085] mb-5">
              <span className="flex items-center font-medium text-base">
                <svg className="w-5 h-5 mr-2 text-[#667085]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {formatLevel(job.level)}
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center font-medium text-base">
                <svg className="w-5 h-5 mr-2 text-[#667085]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {job.location}
              </span>
              {job.remote && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
                    Remote
                  </span>
                </>
              )}
              <span className="text-gray-300">•</span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-[#E6F0FF] text-[#0066FF] border border-[#0066FF]/20">
                {job.type}
              </span>
            </div>

            {compensation && (
              <div className="flex items-center text-2xl font-bold text-[#16A34A] mb-6">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {compensation}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              {user?.role === 'candidate' && (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="px-8 py-3.5 bg-[#0066FF] text-white rounded-xl hover:bg-[#4EA8FF] focus:outline-none focus:ring-2 focus:ring-[#4EA8FF] focus:ring-offset-2 font-bold text-base shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Apply Now
                </button>
              )}
              <button
                onClick={handleSave}
                className="px-5 py-3.5 border-2 border-gray-300 rounded-xl hover:bg-[#E6F0FF] hover:border-[#0066FF] focus:outline-none focus:ring-2 focus:ring-[#4EA8FF] flex items-center gap-2 font-semibold transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill={isSaved ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={handleShare}
                className="px-5 py-3.5 border-2 border-gray-300 rounded-xl hover:bg-[#E6F0FF] hover:border-[#0066FF] focus:outline-none focus:ring-2 focus:ring-[#4EA8FF] flex items-center gap-2 font-semibold transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share
              </button>
            </div>
          </div>

          {/* AI Fit Summary */}
          {user?.role === 'candidate' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                AI Fit Analysis
              </h2>
              {isLoadingFit ? (
                <div className="flex items-center text-gray-600">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing your fit for this role...
                </div>
              ) : fitSummary ? (
                <p className="text-gray-700">{fitSummary}</p>
              ) : (
                <p className="text-gray-600">
                  Complete your profile to see how well you match this role.
                </p>
              )}
            </div>
          )}

          {/* AI Fit Summary */}
          {user?.role === 'candidate' && (
            <div className="mb-8 p-6 bg-gradient-to-r from-[#E6F0FF] to-blue-50 border-2 border-[#0066FF]/30 rounded-2xl shadow-sm">
              <h2 className="text-xl font-bold text-[#003366] mb-3 flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-[#0066FF]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                AI Fit Analysis
              </h2>
              {isLoadingFit ? (
                <div className="flex items-center text-[#667085] font-medium">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing your fit for this role...
                </div>
              ) : fitSummary ? (
                <p className="text-[#003366] leading-relaxed text-[15px]">{fitSummary}</p>
              ) : (
                <p className="text-[#667085] leading-relaxed text-[15px]">
                  Complete your profile to see how well you match this role.
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#003366] mb-4 border-b-2 border-[#E6F0FF] pb-3">About the Role</h2>
            <div className="prose prose-base max-w-none text-[#667085] whitespace-pre-wrap leading-relaxed text-[15px]">
              {job.description}
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#003366] mb-4 border-b-2 border-[#E6F0FF] pb-3">Requirements</h2>
              <ul className="space-y-3 text-[#667085]">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start text-[15px] leading-relaxed">
                    <svg className="w-5 h-5 mr-3 mt-0.5 text-[#0066FF] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#003366] mb-4 border-b-2 border-[#E6F0FF] pb-3">Benefits</h2>
              <ul className="space-y-3 text-[#667085]">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start text-[15px] leading-relaxed">
                    <svg className="w-5 h-5 mr-3 mt-0.5 text-[#16A34A] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          job={job}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            setShowApplyModal(false);
            alert('Application submitted successfully!');
          }}
        />
      )}
    </div>
  );
}

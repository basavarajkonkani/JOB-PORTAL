'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useAnalytics } from '@/lib/useAnalytics';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Experience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
}

interface CandidateProfile {
  location: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
}

interface Candidate {
  applicationId: string;
  userId: string;
  name: string;
  email: string;
  status: 'submitted' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  coverLetter: string;
  notes: string;
  aiScore?: number;
  aiRationale?: string;
  aiStrength?: string;
  aiConcern?: string;
  appliedAt: string;
  profile: CandidateProfile | null;
  resumeData: any;
  screeningQuestions?: string[];
}

interface CandidateShortlistProps {
  jobId: string;
}

export default function CandidateShortlist({ jobId }: CandidateShortlistProps) {
  const { accessToken } = useAuth();
  const { trackShortlistRequested } = useAnalytics();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRanking, setIsRanking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rankedWithAI, setRankedWithAI] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'date'>('date');

  useEffect(() => {
    fetchCandidates();
  }, [jobId, filterStatus, sortBy]);

  const fetchCandidates = async (withAI: boolean = false) => {
    if (withAI) {
      setIsRanking(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams();
      if (withAI) {
        params.append('rankWithAI', 'true');
      }
      if (filterStatus !== 'all') {
        params.append('filterByStatus', filterStatus);
      }
      if (sortBy) {
        params.append('sortBy', sortBy);
      }

      const response = await fetch(
        `${API_URL}/api/recruiter/jobs/${jobId}/candidates?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }

      const data = await response.json();
      setCandidates(data.candidates);
      setJobTitle(data.job.title);
      setRankedWithAI(data.rankedWithAI);
    } catch (err) {
      console.error('Fetch candidates error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
    } finally {
      setIsLoading(false);
      setIsRanking(false);
    }
  };

  const handleRankWithAI = () => {
    // Track shortlist request
    trackShortlistRequested(jobId, candidates.length);
    fetchCandidates(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'accepted':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => fetchCandidates()}
            className="mt-2 text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Candidates for {jobTitle}</h1>
        <p className="text-gray-600">
          {candidates.length} {candidates.length === 1 ? 'candidate' : 'candidates'} found
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Filter by Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Accepted</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'date')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Application Date</option>
                <option value="score">AI Score</option>
              </select>
            </div>
          </div>

          {/* AI Ranking Button */}
          <button
            onClick={handleRankWithAI}
            disabled={isRanking || candidates.length === 0}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isRanking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Ranking with AI...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                {rankedWithAI ? 'Re-rank with AI' : 'Rank with AI'}
              </>
            )}
          </button>
        </div>

        {rankedWithAI && (
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              ✨ Candidates have been ranked using AI analysis. Scores and rationale are displayed
              below.
            </p>
          </div>
        )}
      </div>

      {/* Candidates List */}
      {candidates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No candidates yet</h3>
          <p className="text-gray-600">
            Applications will appear here once candidates start applying to this job.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((candidate) => (
            <div
              key={candidate.applicationId}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Candidate Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{candidate.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(candidate.status)}`}
                      >
                        {candidate.status}
                      </span>
                      {candidate.aiScore !== undefined && (
                        <span className={`text-lg font-bold ${getScoreColor(candidate.aiScore)}`}>
                          {candidate.aiScore}/100
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{candidate.email}</p>
                    <p className="text-gray-500 text-sm">
                      Applied {new Date(candidate.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCandidate(candidate)}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    View Details
                  </button>
                </div>

                {/* AI Insights */}
                {candidate.aiRationale && (
                  <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">AI Analysis</h4>
                    <p className="text-sm text-purple-800 mb-3">{candidate.aiRationale}</p>
                    {candidate.aiStrength && (
                      <div className="mb-2">
                        <span className="text-xs font-medium text-green-700">Strength: </span>
                        <span className="text-sm text-gray-700">{candidate.aiStrength}</span>
                      </div>
                    )}
                    {candidate.aiConcern && candidate.aiConcern !== 'None identified' && (
                      <div>
                        <span className="text-xs font-medium text-orange-700">Concern: </span>
                        <span className="text-sm text-gray-700">{candidate.aiConcern}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Skills */}
                {candidate.profile && candidate.profile.skills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.profile.skills.slice(0, 8).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.profile.skills.length > 8 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                          +{candidate.profile.skills.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Screening Questions */}
                {candidate.screeningQuestions && candidate.screeningQuestions.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Suggested Screening Questions
                    </h4>
                    <ol className="list-decimal list-inside space-y-1">
                      {candidate.screeningQuestions.map((question, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          {question}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{selectedCandidate.name}</h2>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                <p className="text-gray-700">{selectedCandidate.email}</p>
                {selectedCandidate.profile?.location && (
                  <p className="text-gray-600">{selectedCandidate.profile.location}</p>
                )}
              </div>

              {/* AI Score */}
              {selectedCandidate.aiScore !== undefined && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">AI Fit Score</h3>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-3xl font-bold ${getScoreColor(selectedCandidate.aiScore)}`}
                    >
                      {selectedCandidate.aiScore}/100
                    </span>
                    {selectedCandidate.aiRationale && (
                      <p className="text-gray-700 flex-1">{selectedCandidate.aiRationale}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Experience */}
              {selectedCandidate.profile && selectedCandidate.profile.experience.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Experience</h3>
                  <div className="space-y-4">
                    {selectedCandidate.profile.experience.map((exp, idx) => (
                      <div key={idx} className="border-l-2 border-blue-500 pl-4">
                        <h4 className="font-semibold">{exp.title}</h4>
                        <p className="text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-500">
                          {exp.startDate} - {exp.endDate || 'Present'}
                        </p>
                        <p className="text-gray-700 mt-2">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {selectedCandidate.profile && selectedCandidate.profile.education.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Education</h3>
                  <div className="space-y-3">
                    {selectedCandidate.profile.education.map((edu, idx) => (
                      <div key={idx}>
                        <h4 className="font-semibold">
                          {edu.degree} in {edu.field}
                        </h4>
                        <p className="text-gray-600">{edu.institution}</p>
                        <p className="text-sm text-gray-500">{edu.graduationDate}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              {selectedCandidate.coverLetter && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Cover Letter</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedCandidate.coverLetter}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedCandidate.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Notes</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedCandidate.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Job {
  id: string;
  title: string;
  level: string;
  location: string;
  type: string;
  remote: boolean;
  status: 'draft' | 'active' | 'closed';
  createdAt: string;
  publishedAt?: string;
}

export default function RecruiterJobsPage() {
  const { user, accessToken, isLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'closed'>('all');

  // Redirect if not authenticated or not a recruiter
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'recruiter')) {
      router.push('/signin');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && user.role === 'recruiter') {
      fetchJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchJobs = async () => {
    setIsLoadingJobs(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/recruiter/jobs`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setJobs(data.jobs);
    } catch (err) {
      console.error('Fetch jobs error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to close this job?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/recruiter/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to close job');
      }

      // Refresh jobs list
      fetchJobs();
    } catch (err) {
      console.error('Delete job error:', err);
      alert(err instanceof Error ? err.message : 'Failed to close job');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredJobs = filter === 'all' ? jobs : jobs.filter((job) => job.status === filter);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">My Job Postings</h1>
          <button
            onClick={() => router.push('/recruiter')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Create New Job
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium ${
              filter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({jobs.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 font-medium ${
              filter === 'active'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active ({jobs.filter((j) => j.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 font-medium ${
              filter === 'draft'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Draft ({jobs.filter((j) => j.status === 'draft').length})
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`px-4 py-2 font-medium ${
              filter === 'closed'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Closed ({jobs.filter((j) => j.status === 'closed').length})
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {isLoadingJobs ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            {filter === 'all' ? 'No jobs posted yet' : `No ${filter} jobs`}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => router.push('/recruiter')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Job
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                    <span>{job.level}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                    {job.remote && (
                      <>
                        <span>•</span>
                        <span>Remote</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded ${
                        job.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : job.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {job.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      {job.publishedAt
                        ? `Published ${new Date(job.publishedAt).toLocaleDateString()}`
                        : `Created ${new Date(job.createdAt).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    View
                  </button>
                  {job.status !== 'closed' && (
                    <>
                      <button
                        onClick={() => router.push(`/recruiter/jobs/${job.id}/edit`)}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Close
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

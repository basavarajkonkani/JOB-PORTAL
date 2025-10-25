'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface Application {
  id: string;
  jobId: string;
  userId: string;
  resumeVersionId: string;
  coverLetter: string;
  status: 'submitted' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  notes: string;
  aiScore?: number;
  aiRationale?: string;
  createdAt: string;
  updatedAt: string;
  jobTitle?: string;
  jobLocation?: string;
  jobType?: string;
  orgName?: string;
}

interface StatusCounts {
  submitted?: number;
  reviewed?: number;
  shortlisted?: number;
  rejected?: number;
  accepted?: number;
}

const statusColors = {
  submitted: 'bg-blue-100 text-blue-800',
  reviewed: 'bg-yellow-100 text-yellow-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
  accepted: 'bg-green-100 text-green-800',
};

const statusLabels = {
  submitted: 'Submitted',
  reviewed: 'Under Review',
  shortlisted: 'Shortlisted',
  rejected: 'Not Selected',
  accepted: 'Accepted',
};

export default function ApplicationsTracker() {
  const { accessToken } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/applications`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data.applications || []);
      setStatusCounts(data.statusCounts || {});
    } catch (err) {
      setError('Failed to load applications. Please try again.');
      console.error('Error fetching applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApplication) return;

    setIsSavingNotes(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/applications/${selectedApplication.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            notes: editingNotes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update notes');
      }

      const data = await response.json();
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, notes: editingNotes, updatedAt: data.application.updatedAt }
          : app
      ));
      
      setSelectedApplication({ ...selectedApplication, notes: editingNotes });
    } catch (err) {
      setError('Failed to save notes. Please try again.');
      console.error('Error saving notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const openApplicationDetail = (application: Application) => {
    setSelectedApplication(application);
    setEditingNotes(application.notes || '');
  };

  const closeApplicationDetail = () => {
    setSelectedApplication(null);
    setEditingNotes('');
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(statusLabels).map(([status, label]) => (
          <div key={status} className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">
              {statusCounts[status as keyof StatusCounts] || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Applications Timeline */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">My Applications</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track your job applications and their current status
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start applying to jobs to see them here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {applications.map((application) => (
              <div
                key={application.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => openApplicationDetail(application)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.jobTitle}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          statusColors[application.status]
                        }`}
                      >
                        {statusLabels[application.status]}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                      <span>{application.orgName}</span>
                      <span>•</span>
                      <span>{application.jobLocation}</span>
                      <span>•</span>
                      <span className="capitalize">{application.jobType}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Applied {getTimeAgo(application.createdAt)}
                    </div>
                    {application.notes && (
                      <div className="mt-2 text-sm text-gray-700 line-clamp-2">
                        <span className="font-medium">Notes:</span> {application.notes}
                      </div>
                    )}
                  </div>
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedApplication.jobTitle}
                  </h2>
                  <p className="text-gray-600 mt-1">{selectedApplication.orgName}</p>
                </div>
                <button
                  onClick={closeApplicationDetail}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
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

              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      statusColors[selectedApplication.status]
                    }`}
                  >
                    {statusLabels[selectedApplication.status]}
                  </span>
                </div>

                {/* Application Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Applied On
                  </label>
                  <p className="text-gray-900">
                    {new Date(selectedApplication.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Letter
                  </label>
                  <div className="bg-gray-50 rounded-md p-4 max-h-48 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedApplication.coverLetter || 'No cover letter provided'}
                    </p>
                  </div>
                </div>

                {/* Notes Editor */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    My Notes
                  </label>
                  <textarea
                    id="notes"
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add notes about this application, interview prep, follow-ups, etc."
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes || editingNotes === selectedApplication.notes}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {isSavingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>

                {/* AI Score (if available) */}
                {selectedApplication.aiScore && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      AI Match Score
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedApplication.aiScore.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">/ 100</div>
                    </div>
                    {selectedApplication.aiRationale && (
                      <p className="mt-2 text-sm text-gray-700">
                        {selectedApplication.aiRationale}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={closeApplicationDetail}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useAnalytics } from '@/lib/useAnalytics';
import { useFocusTrap, useEscapeKey } from '@/lib/useKeyboardNavigation';

interface Job {
  id: string;
  title: string;
  level: string;
  location: string;
  type: string;
  remote: boolean;
  description: string;
  requirements: string[];
}

interface ApplyModalProps {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
}

interface ResumeVersion {
  id: string;
  version: number;
  createdAt: string;
}

export default function ApplyModal({ job, onClose, onSuccess }: ApplyModalProps) {
  const { accessToken } = useAuth();
  const [resumeVersions, setResumeVersions] = useState<ResumeVersion[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { trackApplicationStarted, trackApplicationSubmitted } = useAnalytics();

  // Keyboard navigation hooks
  const modalRef = useFocusTrap(true);
  useEscapeKey(onClose, true);

  useEffect(() => {
    fetchResumeVersions();
    // Track that user started an application
    trackApplicationStarted(job.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.id, trackApplicationStarted]);

  const fetchResumeVersions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/candidate/resumes`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResumeVersions(data.versions || []);
        if (data.versions && data.versions.length > 0) {
          setSelectedResumeId(data.versions[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch resume versions:', err);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setIsGeneratingCoverLetter(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/cover-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          jobData: job,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCoverLetter(data.coverLetter || data.summary || '');
      } else {
        throw new Error('Failed to generate cover letter');
      }
    } catch {
      setError('Failed to generate cover letter. Please write one manually.');
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedResumeId) {
      setError('Please select a resume');
      return;
    }

    if (!coverLetter.trim()) {
      setError('Please provide a cover letter');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          jobId: job.id,
          resumeVersionId: selectedResumeId,
          coverLetter: coverLetter.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit application');
      }

      const data = await response.json();

      // Track successful application submission
      trackApplicationSubmitted(job.id, data.application?.id || '');

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
    >
      <div
        ref={modalRef as React.RefObject<HTMLDivElement>}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <header className="flex justify-between items-start mb-4">
            <div>
              <h2 id="apply-modal-title" className="text-2xl font-bold text-gray-900">
                Apply for Position
              </h2>
              <p className="text-gray-600 mt-1">{job.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close application modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </header>

          {error && (
            <div
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
              role="alert"
              aria-live="assertive"
            >
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Resume Selection */}
            <div>
              <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
                Select Resume
              </label>
              {resumeVersions.length > 0 ? (
                <select
                  id="resume"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {resumeVersions.map((version) => (
                    <option key={version.id} value={version.id}>
                      Resume Version {version.version} (
                      {new Date(version.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              ) : (
                <div
                  className="text-sm text-gray-600 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
                  role="status"
                  aria-live="polite"
                >
                  No resume found. Please upload a resume first.
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700">
                  Cover Letter
                </label>
                <button
                  type="button"
                  onClick={handleGenerateCoverLetter}
                  disabled={isGeneratingCoverLetter}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  aria-label="Generate cover letter with AI"
                >
                  {isGeneratingCoverLetter ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
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
                      <span aria-live="polite">Generating...</span>
                    </span>
                  ) : (
                    '✨ Generate with AI'
                  )}
                </button>
              </div>
              <textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write a compelling cover letter explaining why you're a great fit for this role..."
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Tip: Use the AI generator to create a tailored cover letter based on your profile
                and the job requirements.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !selectedResumeId}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

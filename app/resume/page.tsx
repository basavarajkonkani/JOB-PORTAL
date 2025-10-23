'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import ResumeUpload from '@/components/resume/ResumeUpload';
import ResumeEditor from '@/components/resume/ResumeEditor';

export default function ResumePage() {
  const { user } = useAuth();
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleUploadSuccess = (resume: any) => {
    setUploadedResumeId(resume.id);
    setShowEditor(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please sign in to upload your resume
          </h2>
          <a
            href="/signin"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Manager</h1>
          <p className="text-gray-600">
            Upload your resume and let AI help you create an ATS-friendly profile
          </p>
        </div>

        <div className="space-y-8">
          {/* Upload Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload Resume
            </h2>
            <ResumeUpload onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Editor Section */}
          {showEditor && uploadedResumeId && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Edit Parsed Resume
              </h2>
              <ResumeEditor resumeId={uploadedResumeId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

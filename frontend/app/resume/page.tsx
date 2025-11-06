'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import ResumeUpload from '@/components/resume/ResumeUpload';
import ResumeEditor from '@/components/resume/ResumeEditor';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ResumePage() {
  const { user, isLoading } = useAuth();
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleUploadSuccess = (resume: { id: string }) => {
    setUploadedResumeId(resume.id);
    setShowEditor(true);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please sign in to upload your resume
          </h2>
          <a href="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Resume</h2>
              <ResumeUpload onUploadSuccess={handleUploadSuccess} />
            </div>

            {/* Editor Section */}
            {showEditor && uploadedResumeId && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Parsed Resume</h2>
                <ResumeEditor resumeId={uploadedResumeId} />
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

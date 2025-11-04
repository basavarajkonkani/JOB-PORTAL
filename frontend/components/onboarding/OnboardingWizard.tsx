'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { apiRequest, apiRequestFormData } from '@/lib/api-client';

interface ParsedData {
  skills: string[];
  experience: any[];
  education: any[];
}

interface ProfileData {
  location: string;
  skills: string[];
  experience: any[];
  education: any[];
  preferences: {
    roles?: string[];
    locations?: string[];
    remoteOnly?: boolean;
    minCompensation?: number;
  };
}

interface AISuggestion {
  field: string;
  suggestion: string;
  reason: string;
}

export default function OnboardingWizard() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    location: '',
    skills: [],
    experience: [],
    education: [],
    preferences: {},
  });
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const totalSteps = 3;

  // Step 1: Resume Upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError('');

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only PDF and DOCX files are allowed');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleUploadAndParse = async () => {
    if (!file) return;

    setIsUploading(true);
    setError('');

    try {
      // Upload resume
      const formData = new FormData();
      formData.append('resume', file);

      const uploadData = await apiRequestFormData('/api/candidate/resume/upload', formData);

      // Parse resume
      setIsParsing(true);
      const parseData = await apiRequest('/api/candidate/resume/parse', {
        method: 'POST',
        body: JSON.stringify({
          fileUrl: uploadData.resume.fileUrl,
        }),
      });

      setParsedData(parseData.parsedData);

      // Pre-fill profile data with parsed information
      setProfileData({
        location: '',
        skills: parseData.parsedData.skills || [],
        experience: parseData.parsedData.experience || [],
        education: parseData.parsedData.education || [],
        preferences: {},
      });

      // Move to next step
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process resume');
    } finally {
      setIsUploading(false);
      setIsParsing(false);
    }
  };

  const handleSkipUpload = () => {
    setCurrentStep(2);
  };

  // Step 2: Confirm Profile with AI Suggestions
  useEffect(() => {
    if (currentStep === 2 && parsedData) {
      fetchAISuggestions();
    }
  }, [currentStep, parsedData]);

  const fetchAISuggestions = async () => {
    if (!parsedData) return;

    setIsLoadingSuggestions(true);

    try {
      const data = await apiRequest('/api/ai/resume-improve', {
        method: 'POST',
        body: JSON.stringify({
          bullets: profileData.experience.map((exp) => exp.description).filter(Boolean),
        }),
      });

      // Convert AI response to suggestions format
      if (data.suggestions && Array.isArray(data.suggestions)) {
        const suggestions: AISuggestion[] = data.suggestions
          .slice(0, 3)
          .map((s: string, i: number) => ({
            field: 'experience',
            suggestion: s,
            reason: 'AI-powered improvement for better ATS compatibility',
          }));
        setAiSuggestions(suggestions);
      }
    } catch (err) {
      console.error('Failed to fetch AI suggestions:', err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleUpdateProfile = (field: keyof ProfileData, value: any) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleAddSkill = (skill: string) => {
    if (skill && !profileData.skills.includes(skill)) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, skill],
      });
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter((s) => s !== skill),
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError('');

    try {
      await apiRequest('/api/candidate/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      // Move to completion step
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipProfile = () => {
    setCurrentStep(3);
  };

  const handleComplete = () => {
    router.push('/dashboard');
  };

  const renderProgressBar = () => (
    <nav aria-label="Onboarding progress" className="mb-8">
      <ol className="flex items-center justify-between mb-2">
        {[1, 2, 3].map((step) => (
          <li key={step} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
              aria-current={step === currentStep ? 'step' : undefined}
              aria-label={`Step ${step}${step === currentStep ? ' (current)' : step < currentStep ? ' (completed)' : ''}`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`flex-1 h-1 mx-2 ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
      <div className="flex justify-between text-sm text-gray-600">
        <span>Upload Resume</span>
        <span>Confirm Profile</span>
        <span>Complete</span>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <main id="main-content" className="bg-white rounded-lg shadow-lg p-8">
          <header>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to AI Job Portal!</h1>
            <p className="text-gray-600 mb-8">Let's set up your profile to get you started</p>
          </header>

          {renderProgressBar()}

          {error && (
            <div
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md"
              role="alert"
              aria-live="assertive"
            >
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Step 1: Upload Resume */}
          {currentStep === 1 && (
            <section className="space-y-6" aria-labelledby="step-1-title">
              <header>
                <h2 id="step-1-title" className="text-2xl font-bold text-gray-900 mb-2">
                  Upload Your Resume
                </h2>
                <p className="text-gray-600 mb-6">
                  We'll automatically extract your information to create your profile
                </p>
              </header>

              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!file ? (
                  <>
                    <svg
                      className="mx-auto h-16 w-16 text-gray-400 mb-4"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="mb-4">
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer text-blue-600 hover:text-blue-500 font-medium text-lg"
                      >
                        Upload a file
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.docx"
                        onChange={handleFileSelect}
                      />
                      <span className="text-gray-600 text-lg"> or drag and drop</span>
                    </div>
                    <p className="text-sm text-gray-500">PDF or DOCX up to 10MB</p>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <svg
                        className="h-10 w-10 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="text-left">
                        <p className="text-lg font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove file
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSkipUpload}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleUploadAndParse}
                  disabled={!file || isUploading || isParsing}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {isUploading ? 'Uploading...' : isParsing ? 'Parsing...' : 'Continue'}
                </button>
              </div>
            </section>
          )}

          {/* Step 2: Confirm Profile */}
          {currentStep === 2 && (
            <section className="space-y-6" aria-labelledby="step-2-title">
              <header>
                <h2 id="step-2-title" className="text-2xl font-bold text-gray-900 mb-2">
                  Confirm Your Profile
                </h2>
                <p className="text-gray-600 mb-6">
                  Review and edit the information we extracted from your resume
                </p>
              </header>

              {/* AI Suggestions */}
              {isLoadingSuggestions && (
                <div
                  className="p-4 bg-blue-50 border border-blue-200 rounded-md"
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-sm text-blue-700">
                    Loading AI suggestions to improve your profile...
                  </p>
                </div>
              )}

              {aiSuggestions.length > 0 && (
                <aside
                  className="p-4 bg-blue-50 border border-blue-200 rounded-md"
                  aria-label="AI suggestions"
                >
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">AI Suggestions</h3>
                  <ul className="space-y-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-blue-800">
                        • {suggestion.suggestion}
                      </li>
                    ))}
                  </ul>
                </aside>
              )}

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => handleUpdateProfile('location', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profileData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-blue-600 hover:text-blue-800 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600">{profileData.skills.length} skills added</p>
              </div>

              {/* Experience Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <div className="space-y-2">
                  {profileData.experience.length > 0 ? (
                    profileData.experience.map((exp, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                        <p className="font-medium text-gray-900">
                          {exp.title} at {exp.company}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{exp.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No experience added yet</p>
                  )}
                </div>
              </div>

              {/* Education Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                <div className="space-y-2">
                  {profileData.education.length > 0 ? (
                    profileData.education.map((edu, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                        <p className="font-medium text-gray-900">
                          {edu.degree} in {edu.field}
                        </p>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No education added yet</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSkipProfile}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {isSaving ? 'Saving...' : 'Save & Continue'}
                </button>
              </div>
            </section>
          )}

          {/* Step 3: Complete */}
          {currentStep === 3 && (
            <section className="text-center space-y-6 py-8" aria-labelledby="step-3-title">
              <div className="flex justify-center">
                <div
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
                  aria-hidden="true"
                >
                  <svg
                    className="w-12 h-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <header>
                <h2 id="step-3-title" className="text-3xl font-bold text-gray-900 mb-2">
                  You're all set!
                </h2>
                <p className="text-gray-600 text-lg">
                  Your profile is ready. Start exploring job opportunities now.
                </p>
              </header>

              <nav aria-label="Next steps" className="space-y-3 max-w-md mx-auto">
                <button
                  onClick={handleComplete}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-lg"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => router.push('/jobs')}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                >
                  Browse Jobs
                </button>
              </nav>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useAnalytics } from '@/lib/useAnalytics';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface JobFormData {
  title: string;
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
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
}

interface JDWizardProps {
  onJobCreated?: (jobId: string) => void;
  onCancel?: () => void;
}

export default function JDWizard({ onJobCreated, onCancel }: JDWizardProps) {
  const { accessToken } = useAuth();
  const { trackJDDraftCreated, trackJDAIGenerated, trackJDPublished } = useAnalytics();
  const [step, setStep] = useState<'notes' | 'edit' | 'preview'>('notes');
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [jobData, setJobData] = useState<JobFormData>({
    title: '',
    level: 'mid',
    location: '',
    type: 'full-time',
    remote: true,
    description: '',
    requirements: [],
    compensation: { currency: 'USD' },
    benefits: [],
  });

  const handleGenerateJD = async () => {
    if (!notes.trim()) {
      setError('Please enter some notes about the position');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/recruiter/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          notes,
          generateWithAI: true,
          status: 'draft',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate job description');
      }

      const data = await response.json();
      const job = data.job;

      // Update form with AI-generated data
      setJobData({
        title: job.title,
        level: job.level,
        location: job.location,
        type: job.type,
        remote: job.remote,
        description: job.description,
        requirements: job.requirements || [],
        compensation: job.compensation || { currency: 'USD' },
        benefits: job.benefits || [],
      });

      // Store job ID for later updates
      (window as any).__currentJobId = job.id;
      setCreatedJobId(job.id);

      // Track JD draft creation and AI generation
      trackJDDraftCreated(job.id);
      trackJDAIGenerated(job.id);

      setStep('edit');
    } catch (err) {
      console.error('Generate JD error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate job description');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateField = (field: keyof JobFormData, value: any) => {
    setJobData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddRequirement = () => {
    setJobData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ''],
    }));
  };

  const handleUpdateRequirement = (index: number, value: string) => {
    setJobData((prev) => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => (i === index ? value : req)),
    }));
  };

  const handleRemoveRequirement = (index: number) => {
    setJobData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const handleAddBenefit = () => {
    setJobData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, ''],
    }));
  };

  const handleUpdateBenefit = (index: number, value: string) => {
    setJobData((prev) => ({
      ...prev,
      benefits: prev.benefits.map((ben, i) => (i === index ? value : ben)),
    }));
  };

  const handleRemoveBenefit = (index: number) => {
    setJobData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const handleSaveDraft = async () => {
    const jobId = (window as any).__currentJobId;
    if (!jobId) return;

    try {
      const response = await fetch(`${API_URL}/api/recruiter/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...jobData,
          status: 'draft',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      setStep('preview');
    } catch (err) {
      console.error('Save draft error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    }
  };

  const handlePublish = async () => {
    const jobId = (window as any).__currentJobId;
    if (!jobId) return;

    setIsPublishing(true);
    setError(null);

    try {
      // Generate hero image and publish
      const response = await fetch(`${API_URL}/api/recruiter/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...jobData,
          status: 'active',
          generateHeroImage: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to publish job');
      }

      const data = await response.json();

      // Track JD publication
      if (createdJobId) {
        trackJDPublished(createdJobId);
      }

      if (onJobCreated) {
        onJobCreated(data.job.id);
      }
    } catch (err) {
      console.error('Publish error:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish job');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Create Job Posting</h1>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'notes' ? 'bg-blue-600 text-white' : 'bg-gray-300'
              }`}
            >
              1
            </div>
            <span className="ml-2 text-sm font-medium">Job Notes</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-300">
            <div
              className={`h-full bg-blue-600 transition-all ${step !== 'notes' ? 'w-full' : 'w-0'}`}
            />
          </div>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'edit' ? 'bg-blue-600 text-white' : 'bg-gray-300'
              }`}
            >
              2
            </div>
            <span className="ml-2 text-sm font-medium">Edit JD</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-300">
            <div
              className={`h-full bg-blue-600 transition-all ${
                step === 'preview' ? 'w-full' : 'w-0'
              }`}
            />
          </div>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-300'
              }`}
            >
              3
            </div>
            <span className="ml-2 text-sm font-medium">Preview & Publish</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Step 1: Job Notes */}
        {step === 'notes' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Tell us about the position</h2>
            <p className="text-gray-600 mb-4">
              Describe the role, requirements, and any other details. Our AI will generate a
              professional job description for you.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., We're looking for a senior software engineer with 5+ years of experience in React and Node.js. The role involves leading a team of 3 developers..."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-between mt-6">
              <button
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateJD}
                disabled={isGenerating || !notes.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Edit JD */}
        {step === 'edit' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Review and edit job description</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Job Title</label>
                <input
                  type="text"
                  value={jobData.title}
                  onChange={(e) => handleUpdateField('title', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Level</label>
                  <select
                    value={jobData.level}
                    onChange={(e) => handleUpdateField('level', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="entry">Entry</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={jobData.type}
                    onChange={(e) => handleUpdateField('type', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={jobData.location}
                    onChange={(e) => handleUpdateField('location', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Remote</label>
                  <select
                    value={jobData.remote ? 'yes' : 'no'}
                    onChange={(e) => handleUpdateField('remote', e.target.value === 'yes')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={jobData.description}
                  onChange={(e) => handleUpdateField('description', e.target.value)}
                  className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Requirements</label>
                {jobData.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleUpdateRequirement(index, e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleRemoveRequirement(index)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddRequirement}
                  className="mt-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  + Add Requirement
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Benefits</label>
                {jobData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => handleUpdateBenefit(index, e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleRemoveBenefit(index)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddBenefit}
                  className="mt-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  + Add Benefit
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Min Salary</label>
                  <input
                    type="number"
                    value={jobData.compensation.min || ''}
                    onChange={(e) =>
                      handleUpdateField('compensation', {
                        ...jobData.compensation,
                        min: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Max Salary</label>
                  <input
                    type="number"
                    value={jobData.compensation.max || ''}
                    onChange={(e) =>
                      handleUpdateField('compensation', {
                        ...jobData.compensation,
                        max: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <input
                    type="text"
                    value={jobData.compensation.currency}
                    onChange={(e) =>
                      handleUpdateField('compensation', {
                        ...jobData.compensation,
                        currency: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep('notes')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSaveDraft}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue to Preview
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Publish */}
        {step === 'preview' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Preview job posting</h2>

            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-2xl font-bold mb-2">{jobData.title}</h3>
              <div className="flex gap-4 text-sm text-gray-600 mb-4">
                <span>{jobData.level}</span>
                <span>•</span>
                <span>{jobData.type}</span>
                <span>•</span>
                <span>{jobData.location}</span>
                {jobData.remote && (
                  <>
                    <span>•</span>
                    <span>Remote</span>
                  </>
                )}
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{jobData.description}</p>
              </div>

              {jobData.requirements.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {jobData.requirements.map((req, index) => (
                      <li key={index} className="text-gray-700">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {jobData.benefits.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Benefits</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {jobData.benefits.map((benefit, index) => (
                      <li key={index} className="text-gray-700">
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(jobData.compensation.min || jobData.compensation.max) && (
                <div>
                  <h4 className="font-semibold mb-2">Compensation</h4>
                  <p className="text-gray-700">
                    {jobData.compensation.min && jobData.compensation.max
                      ? `${jobData.compensation.currency} ${jobData.compensation.min.toLocaleString()} - ${jobData.compensation.max.toLocaleString()}`
                      : jobData.compensation.min
                        ? `From ${jobData.compensation.currency} ${jobData.compensation.min.toLocaleString()}`
                        : `Up to ${jobData.compensation.currency} ${jobData.compensation.max?.toLocaleString()}`}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                When you publish, we'll generate a professional hero image for your job posting.
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep('edit')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back to Edit
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isPublishing ? 'Publishing...' : 'Publish Job'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

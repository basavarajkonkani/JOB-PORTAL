'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

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

interface Preferences {
  roles?: string[];
  locations?: string[];
  remoteOnly?: boolean;
  minCompensation?: number;
}

interface CandidateProfileData {
  location: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  preferences: Preferences;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function CandidateProfile() {
  const { accessToken, user } = useAuth();
  const [profile, setProfile] = useState<CandidateProfileData>({
    location: '',
    skills: [],
    experience: [],
    education: [],
    preferences: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/candidate/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      } else if (response.status === 404) {
        // Profile doesn't exist yet, use empty state
        setProfile({
          location: '',
          skills: [],
          experience: [],
          education: [],
          preferences: {},
        });
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/api/candidate/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
  };

  const addExperience = () => {
    setProfile({
      ...profile,
      experience: [
        ...profile.experience,
        { company: '', title: '', startDate: '', description: '' },
      ],
    });
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...profile.experience];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, experience: updated });
  };

  const removeExperience = (index: number) => {
    setProfile({
      ...profile,
      experience: profile.experience.filter((_, i) => i !== index),
    });
  };

  const addEducation = () => {
    setProfile({
      ...profile,
      education: [
        ...profile.education,
        { institution: '', degree: '', field: '', graduationDate: '' },
      ],
    });
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...profile.education];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, education: updated });
  };

  const removeEducation = (index: number) => {
    setProfile({
      ...profile,
      education: profile.education.filter((_, i) => i !== index),
    });
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 5;

    if (profile.location) completed++;
    if (profile.skills.length > 0) completed++;
    if (profile.experience.length > 0) completed++;
    if (profile.education.length > 0) completed++;
    if (Object.keys(profile.preferences).length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  const completion = calculateCompletion();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Candidate Profile</h1>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
          <span className="text-sm font-medium">{completion}% Complete</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          Profile saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <input
            type="text"
            value={profile.location}
            onChange={e => setProfile({ ...profile, location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., San Francisco, CA"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium mb-2">Skills</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a skill"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map(skill => (
              <span
                key={skill}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium">Experience</label>
            <button
              type="button"
              onClick={addExperience}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Add Experience
            </button>
          </div>
          <div className="space-y-4">
            {profile.experience.map((exp, index) => (
              <div key={index} className="p-4 border border-gray-300 rounded-md">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={exp.company}
                    onChange={e => updateExperience(index, 'company', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Company"
                  />
                  <input
                    type="text"
                    value={exp.title}
                    onChange={e => updateExperience(index, 'title', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Title"
                  />
                  <input
                    type="month"
                    value={exp.startDate}
                    onChange={e => updateExperience(index, 'startDate', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Start Date"
                  />
                  <input
                    type="month"
                    value={exp.endDate || ''}
                    onChange={e => updateExperience(index, 'endDate', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="End Date (optional)"
                  />
                </div>
                <textarea
                  value={exp.description}
                  onChange={e => updateExperience(index, 'description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="Description"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium">Education</label>
            <button
              type="button"
              onClick={addEducation}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Add Education
            </button>
          </div>
          <div className="space-y-4">
            {profile.education.map((edu, index) => (
              <div key={index} className="p-4 border border-gray-300 rounded-md">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={e => updateEducation(index, 'institution', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Institution"
                  />
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={e => updateEducation(index, 'degree', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Degree"
                  />
                  <input
                    type="text"
                    value={edu.field}
                    onChange={e => updateEducation(index, 'field', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Field of Study"
                  />
                  <input
                    type="month"
                    value={edu.graduationDate}
                    onChange={e => updateEducation(index, 'graduationDate', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Graduation Date"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div>
          <label className="block text-sm font-medium mb-4">Preferences</label>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Preferred Roles</label>
              <input
                type="text"
                value={profile.preferences.roles?.join(', ') || ''}
                onChange={e =>
                  setProfile({
                    ...profile,
                    preferences: {
                      ...profile.preferences,
                      roles: e.target.value.split(',').map(r => r.trim()).filter(Boolean),
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Software Engineer, Product Manager"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Preferred Locations</label>
              <input
                type="text"
                value={profile.preferences.locations?.join(', ') || ''}
                onChange={e =>
                  setProfile({
                    ...profile,
                    preferences: {
                      ...profile.preferences,
                      locations: e.target.value.split(',').map(l => l.trim()).filter(Boolean),
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., San Francisco, Remote"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={profile.preferences.remoteOnly || false}
                onChange={e =>
                  setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, remoteOnly: e.target.checked },
                  })
                }
                className="w-4 h-4"
              />
              <label className="text-sm">Remote only</label>
            </div>
            <div>
              <label className="block text-sm mb-2">Minimum Compensation ($)</label>
              <input
                type="number"
                value={profile.preferences.minCompensation || ''}
                onChange={e =>
                  setProfile({
                    ...profile,
                    preferences: {
                      ...profile.preferences,
                      minCompensation: e.target.value ? parseInt(e.target.value) : undefined,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., 100000"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}

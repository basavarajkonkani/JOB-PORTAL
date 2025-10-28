'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface RecruiterProfileData {
  orgId?: string;
  title?: string;
}

interface Org {
  id: string;
  name: string;
  website?: string;
  logoUrl?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function RecruiterProfile() {
  const { accessToken, user } = useAuth();
  const [profile, setProfile] = useState<RecruiterProfileData>({
    orgId: '',
    title: '',
  });
  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/recruiter/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setOrg(data.org);
      } else if (response.status === 404) {
        // Profile doesn't exist yet, use empty state
        setProfile({
          orgId: '',
          title: '',
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
      const response = await fetch(`${API_URL}/api/recruiter/profile`, {
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
      setOrg(data.org);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 2;

    if (profile.orgId) completed++;
    if (profile.title) completed++;

    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  const completion = calculateCompletion();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Recruiter Profile</h1>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Job Title</label>
          <input
            type="text"
            value={profile.title || ''}
            onChange={(e) => setProfile({ ...profile, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Senior Recruiter, Talent Acquisition Manager"
          />
        </div>

        {/* Organization ID */}
        <div>
          <label className="block text-sm font-medium mb-2">Organization ID</label>
          <input
            type="text"
            value={profile.orgId || ''}
            onChange={(e) => setProfile({ ...profile, orgId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter organization UUID"
          />
          <p className="mt-1 text-sm text-gray-500">
            Contact your administrator for your organization ID
          </p>
        </div>

        {/* Current Organization Info */}
        {org && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="font-medium mb-2">Current Organization</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Name:</span> {org.name}
              </p>
              {org.website && (
                <p>
                  <span className="font-medium">Website:</span>{' '}
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {org.website}
                  </a>
                </p>
              )}
              {org.logoUrl && (
                <div className="mt-2">
                  <img src={org.logoUrl} alt={org.name} className="h-12 w-auto object-contain" />
                </div>
              )}
            </div>
          </div>
        )}

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

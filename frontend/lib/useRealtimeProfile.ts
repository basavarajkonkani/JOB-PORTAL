/**
 * Hook for real-time user profile from Firestore
 * Provides live updates when profile is modified
 */

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from './firebase';

export interface CandidateProfile {
  userId: string;
  location: string;
  skills: string[];
  experience: any[];
  education: any[];
  preferences: {
    roles: string[];
    locations: string[];
    remoteOnly: boolean;
    minCompensation?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface RecruiterProfile {
  userId: string;
  orgId: string;
  title: string;
  department: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useRealtimeCandidateProfile(userId: string | null) {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profileRef = doc(firestore, 'candidateProfiles', userId);

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        profileRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setProfile({
              userId: snapshot.id,
              location: data.location || '',
              skills: data.skills || [],
              experience: data.experience || [],
              education: data.education || [],
              preferences: data.preferences || {
                roles: [],
                locations: [],
                remoteOnly: false,
              },
              createdAt: data.createdAt?.toDate?.()?.toISOString(),
              updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
            });
          } else {
            setProfile(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching real-time profile:', err);
          setError('Failed to load profile');
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up real-time profile listener:', err);
      setError('Failed to initialize profile listener');
      setLoading(false);
    }
  }, [userId]);

  return { profile, loading, error };
}

export function useRealtimeRecruiterProfile(userId: string | null) {
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profileRef = doc(firestore, 'recruiterProfiles', userId);

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        profileRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setProfile({
              userId: snapshot.id,
              orgId: data.orgId || '',
              title: data.title || '',
              department: data.department || '',
              createdAt: data.createdAt?.toDate?.()?.toISOString(),
              updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
            });
          } else {
            setProfile(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching real-time recruiter profile:', err);
          setError('Failed to load profile');
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up real-time profile listener:', err);
      setError('Failed to initialize profile listener');
      setLoading(false);
    }
  }, [userId]);

  return { profile, loading, error };
}

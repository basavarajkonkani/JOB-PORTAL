/**
 * Hook for real-time job listings from Firestore
 * Provides live updates when jobs are added, modified, or removed
 */

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { firestore } from './firebase';

export interface Job {
  id: string;
  title: string;
  level: string;
  location: string;
  type: string;
  remote: boolean;
  description: string;
  compensation: {
    min?: number;
    max?: number;
    currency: string;
  };
  orgId: string;
  heroImageUrl?: string;
  publishedAt: string;
  status: string;
}

interface UseRealtimeJobsOptions {
  limitCount?: number;
  location?: string;
  remote?: boolean | null;
  level?: string;
}

export function useRealtimeJobs(options: UseRealtimeJobsOptions = {}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Build query constraints
      const constraints: QueryConstraint[] = [
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
      ];

      if (options.location) {
        constraints.push(where('location', '==', options.location));
      }

      if (options.remote !== null && options.remote !== undefined) {
        constraints.push(where('remote', '==', options.remote));
      }

      if (options.level) {
        constraints.push(where('level', '==', options.level));
      }

      if (options.limitCount) {
        constraints.push(limit(options.limitCount));
      }

      // Create query
      const jobsQuery = query(collection(firestore, 'jobs'), ...constraints);

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        jobsQuery,
        (snapshot) => {
          const jobsList: Job[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            jobsList.push({
              id: doc.id,
              title: data.title,
              level: data.level,
              location: data.location,
              type: data.type,
              remote: data.remote,
              description: data.description,
              compensation: data.compensation || { currency: 'USD' },
              orgId: data.orgId,
              heroImageUrl: data.heroImageUrl,
              publishedAt: data.publishedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              status: data.status,
            });
          });
          setJobs(jobsList);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching real-time jobs:', err);
          setError('Failed to load jobs');
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up real-time jobs listener:', err);
      setError('Failed to initialize jobs listener');
      setLoading(false);
    }
  }, [options.limitCount, options.location, options.remote, options.level]);

  return { jobs, loading, error };
}

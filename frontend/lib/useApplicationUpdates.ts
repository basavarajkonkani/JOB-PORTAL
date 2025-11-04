'use client';

import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { realtimeDb } from './firebase';

/**
 * Application update data structure
 */
export interface ApplicationUpdate {
  status: 'submitted' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  updatedAt: number;
  jobTitle: string;
  jobId?: string;
}

/**
 * Application update with ID
 */
export interface ApplicationUpdateWithId extends ApplicationUpdate {
  applicationId: string;
}

/**
 * Hook to listen for real-time application status updates
 */
export function useApplicationUpdates(userId: string | null) {
  const [updates, setUpdates] = useState<ApplicationUpdateWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setUpdates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const updatesRef = ref(realtimeDb, `applicationUpdates/${userId}`);

    const unsubscribe = onValue(
      updatesRef,
      (snapshot) => {
        try {
          const data = snapshot.val();

          if (data) {
            // Convert object to array with IDs
            const updateArray: ApplicationUpdateWithId[] = Object.entries(data).map(
              ([applicationId, update]) => ({
                applicationId,
                ...(update as ApplicationUpdate),
              })
            );

            // Sort by timestamp (newest first)
            updateArray.sort((a, b) => b.updatedAt - a.updatedAt);

            setUpdates(updateArray);
          } else {
            setUpdates([]);
          }

          setLoading(false);
        } catch (err) {
          console.error('Error processing application updates:', err);
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to application updates:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      off(updatesRef);
    };
  }, [userId]);

  return {
    updates,
    loading,
    error,
  };
}

/**
 * Hook to listen for a specific application update
 */
export function useApplicationUpdate(userId: string | null, applicationId: string | null) {
  const [update, setUpdate] = useState<ApplicationUpdate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !applicationId) {
      setUpdate(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const updateRef = ref(realtimeDb, `applicationUpdates/${userId}/${applicationId}`);

    const unsubscribe = onValue(
      updateRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          setUpdate(data || null);
          setLoading(false);
        } catch (err) {
          console.error('Error processing application update:', err);
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to application update:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      off(updateRef);
    };
  }, [userId, applicationId]);

  return {
    update,
    loading,
    error,
  };
}

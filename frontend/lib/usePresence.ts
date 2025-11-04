'use client';

import { useEffect, useCallback } from 'react';
import { ref, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { realtimeDb } from './firebase';

/**
 * Presence data structure
 */
export interface Presence {
  online: boolean;
  lastSeen: number;
  currentPage?: string;
}

/**
 * Hook to manage user presence tracking
 */
export function usePresence(userId: string | null, enabled: boolean = true) {
  // Update presence when user navigates
  const updatePresence = useCallback(
    (currentPage?: string) => {
      if (!userId || !enabled) return;

      const presenceRef = ref(realtimeDb, `presence/${userId}`);

      const presenceData: Presence = {
        online: true,
        lastSeen: Date.now(),
        ...(currentPage && { currentPage }),
      };

      set(presenceRef, presenceData).catch((error) => {
        console.error('Failed to update presence:', error);
      });
    },
    [userId, enabled]
  );

  // Set up presence tracking
  useEffect(() => {
    if (!userId || !enabled) return;

    const presenceRef = ref(realtimeDb, `presence/${userId}`);

    // Set user as online
    const presenceData: Presence = {
      online: true,
      lastSeen: Date.now(),
      currentPage: typeof window !== 'undefined' ? window.location.pathname : undefined,
    };

    set(presenceRef, presenceData).catch((error) => {
      console.error('Failed to set presence:', error);
    });

    // Set up disconnect handler to mark user as offline
    onDisconnect(presenceRef)
      .update({
        online: false,
        lastSeen: Date.now(),
      })
      .catch((error) => {
        console.error('Failed to set onDisconnect handler:', error);
      });

    // Update presence periodically (every 5 minutes)
    const intervalId = setInterval(
      () => {
        updatePresence(typeof window !== 'undefined' ? window.location.pathname : undefined);
      },
      5 * 60 * 1000
    );

    // Update presence when page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence(typeof window !== 'undefined' ? window.location.pathname : undefined);
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Cleanup
    return () => {
      clearInterval(intervalId);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }

      // Set user as offline on unmount
      set(presenceRef, {
        online: false,
        lastSeen: Date.now(),
      }).catch((error) => {
        console.error('Failed to set offline status:', error);
      });
    };
  }, [userId, enabled, updatePresence]);

  return {
    updatePresence,
  };
}

/**
 * Hook to track presence for multiple users
 */
export function useMultiplePresence(userIds: string[]) {
  const [presenceMap, setPresenceMap] = useState<Record<string, Presence>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userIds.length === 0) {
      setPresenceMap({});
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribers: (() => void)[] = [];

    userIds.forEach((userId) => {
      const presenceRef = ref(realtimeDb, `presence/${userId}`);

      const unsubscribe = onValue(
        presenceRef,
        (snapshot) => {
          const data = snapshot.val();
          setPresenceMap((prev) => ({
            ...prev,
            [userId]: data || { online: false, lastSeen: Date.now() },
          }));
        },
        (error) => {
          console.error(`Error listening to presence for user ${userId}:`, error);
        }
      );

      unsubscribers.push(() => off(presenceRef));
    });

    setLoading(false);

    // Cleanup
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [userIds]);

  return {
    presenceMap,
    loading,
  };
}

// Import missing dependencies
import { useState } from 'react';
import { onValue, off } from 'firebase/database';

'use client';

import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { realtimeDb } from './firebase';

/**
 * Notification data structure
 */
export interface Notification {
  type: 'application_status' | 'new_job' | 'message' | 'system';
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  timestamp: number;
}

/**
 * Notifications with IDs
 */
export interface NotificationWithId extends Notification {
  id: string;
}

/**
 * Hook to listen for real-time notifications
 */
export function useRealtimeNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<NotificationWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const notificationsRef = ref(realtimeDb, `notifications/${userId}`);

    const unsubscribe = onValue(
      notificationsRef,
      (snapshot) => {
        try {
          const data = snapshot.val();

          if (data) {
            // Convert object to array with IDs
            const notificationArray: NotificationWithId[] = Object.entries(data).map(
              ([id, notification]) => ({
                id,
                ...(notification as Notification),
              })
            );

            // Sort by timestamp (newest first)
            notificationArray.sort((a, b) => b.timestamp - a.timestamp);

            setNotifications(notificationArray);
          } else {
            setNotifications([]);
          }

          setLoading(false);
        } catch (err) {
          console.error('Error processing notifications:', err);
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to notifications:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      off(notificationsRef);
    };
  }, [userId]);

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
  };
}

/**
 * Hook to get a single notification count (for badge display)
 */
export function useNotificationCount(userId: string | null) {
  const { unreadCount, loading } = useRealtimeNotifications(userId);

  return {
    count: unreadCount,
    loading,
  };
}

import { realtimeDb } from '../config/firebase';
import logger from '../utils/logger';

/**
 * Presence data structure
 */
export interface Presence {
  online: boolean;
  lastSeen: number;
  currentPage?: string;
}

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
 * Application update data structure
 */
export interface ApplicationUpdate {
  status: 'submitted' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  updatedAt: number;
  jobTitle: string;
  jobId?: string;
}

/**
 * Realtime Database Service
 * Provides helper functions for real-time features
 */
export class RealtimeService {
  /**
   * Update user presence data
   */
  static async updatePresence(
    userId: string,
    online: boolean,
    currentPage?: string
  ): Promise<void> {
    try {
      const presenceData: Presence = {
        online,
        lastSeen: Date.now(),
        ...(currentPage && { currentPage }),
      };

      await realtimeDb.ref(`presence/${userId}`).set(presenceData);

      logger.debug('Presence updated', { userId, online, currentPage });
    } catch (error) {
      logger.error('Failed to update presence', { userId, error });
      throw error;
    }
  }

  /**
   * Get user presence data
   */
  static async getPresence(userId: string): Promise<Presence | null> {
    try {
      const snapshot = await realtimeDb.ref(`presence/${userId}`).once('value');
      return snapshot.val();
    } catch (error) {
      logger.error('Failed to get presence', { userId, error });
      throw error;
    }
  }

  /**
   * Set user as offline (typically called on disconnect)
   */
  static async setUserOffline(userId: string): Promise<void> {
    try {
      await realtimeDb.ref(`presence/${userId}`).update({
        online: false,
        lastSeen: Date.now(),
      });

      logger.debug('User set to offline', { userId });
    } catch (error) {
      logger.error('Failed to set user offline', { userId, error });
      throw error;
    }
  }

  /**
   * Setup automatic offline status on disconnect
   * This should be called when a user connects
   */
  static setupPresenceOnDisconnect(userId: string): void {
    try {
      const presenceRef = realtimeDb.ref(`presence/${userId}`);

      // Set offline status when connection is lost
      presenceRef.onDisconnect().update({
        online: false,
        lastSeen: Date.now(),
      });

      logger.debug('Presence onDisconnect handler set', { userId });
    } catch (error) {
      logger.error('Failed to setup presence onDisconnect', { userId, error });
      throw error;
    }
  }

  /**
   * Send a notification to a user
   */
  static async sendNotification(
    userId: string,
    notification: Omit<Notification, 'timestamp'>
  ): Promise<string> {
    try {
      const notificationRef = realtimeDb.ref(`notifications/${userId}`).push();
      const notificationId = notificationRef.key;

      if (!notificationId) {
        throw new Error('Failed to generate notification ID');
      }

      const notificationData: Notification = {
        ...notification,
        timestamp: Date.now(),
      };

      await notificationRef.set(notificationData);

      logger.info('Notification sent', {
        userId,
        notificationId,
        type: notification.type,
        title: notification.title,
      });

      return notificationId;
    } catch (error) {
      logger.error('Failed to send notification', { userId, error });
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  static async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      await realtimeDb.ref(`notifications/${userId}/${notificationId}`).update({ read: true });

      logger.debug('Notification marked as read', { userId, notificationId });
    } catch (error) {
      logger.error('Failed to mark notification as read', { userId, notificationId, error });
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const snapshot = await realtimeDb.ref(`notifications/${userId}`).once('value');
      const notifications = snapshot.val();

      if (!notifications) {
        return;
      }

      const updates: Record<string, any> = {};
      Object.keys(notifications).forEach((notificationId) => {
        updates[`${notificationId}/read`] = true;
      });

      await realtimeDb.ref(`notifications/${userId}`).update(updates);

      logger.info('All notifications marked as read', { userId });
    } catch (error) {
      logger.error('Failed to mark all notifications as read', { userId, error });
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(userId: string, notificationId: string): Promise<void> {
    try {
      await realtimeDb.ref(`notifications/${userId}/${notificationId}`).remove();

      logger.debug('Notification deleted', { userId, notificationId });
    } catch (error) {
      logger.error('Failed to delete notification', { userId, notificationId, error });
      throw error;
    }
  }

  /**
   * Get all notifications for a user
   */
  static async getNotifications(userId: string): Promise<Record<string, Notification>> {
    try {
      const snapshot = await realtimeDb.ref(`notifications/${userId}`).once('value');
      return snapshot.val() || {};
    } catch (error) {
      logger.error('Failed to get notifications', { userId, error });
      throw error;
    }
  }

  /**
   * Clear old notifications (older than specified days)
   */
  static async clearOldNotifications(userId: string, daysOld: number = 30): Promise<void> {
    try {
      const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
      const snapshot = await realtimeDb.ref(`notifications/${userId}`).once('value');
      const notifications = snapshot.val();

      if (!notifications) {
        return;
      }

      const deletions: Promise<void>[] = [];
      Object.entries(notifications).forEach(([notificationId, notification]) => {
        if ((notification as Notification).timestamp < cutoffTime) {
          deletions.push(realtimeDb.ref(`notifications/${userId}/${notificationId}`).remove());
        }
      });

      await Promise.all(deletions);

      logger.info('Old notifications cleared', { userId, count: deletions.length });
    } catch (error) {
      logger.error('Failed to clear old notifications', { userId, error });
      throw error;
    }
  }

  /**
   * Broadcast an application status update to a user
   */
  static async broadcastApplicationUpdate(
    userId: string,
    applicationId: string,
    update: Omit<ApplicationUpdate, 'updatedAt'>
  ): Promise<void> {
    try {
      const updateData: ApplicationUpdate = {
        ...update,
        updatedAt: Date.now(),
      };

      await realtimeDb.ref(`applicationUpdates/${userId}/${applicationId}`).set(updateData);

      logger.info('Application update broadcasted', {
        userId,
        applicationId,
        status: update.status,
        jobTitle: update.jobTitle,
      });

      // Also send a notification
      await this.sendNotification(userId, {
        type: 'application_status',
        title: 'Application Update',
        message: `Your application for ${update.jobTitle} has been ${update.status}`,
        read: false,
        data: {
          applicationId,
          jobId: update.jobId,
          status: update.status,
        },
      });
    } catch (error) {
      logger.error('Failed to broadcast application update', { userId, applicationId, error });
      throw error;
    }
  }

  /**
   * Get application updates for a user
   */
  static async getApplicationUpdates(userId: string): Promise<Record<string, ApplicationUpdate>> {
    try {
      const snapshot = await realtimeDb.ref(`applicationUpdates/${userId}`).once('value');
      return snapshot.val() || {};
    } catch (error) {
      logger.error('Failed to get application updates', { userId, error });
      throw error;
    }
  }

  /**
   * Clear an application update
   */
  static async clearApplicationUpdate(userId: string, applicationId: string): Promise<void> {
    try {
      await realtimeDb.ref(`applicationUpdates/${userId}/${applicationId}`).remove();

      logger.debug('Application update cleared', { userId, applicationId });
    } catch (error) {
      logger.error('Failed to clear application update', { userId, applicationId, error });
      throw error;
    }
  }

  /**
   * Clear all application updates for a user
   */
  static async clearAllApplicationUpdates(userId: string): Promise<void> {
    try {
      await realtimeDb.ref(`applicationUpdates/${userId}`).remove();

      logger.info('All application updates cleared', { userId });
    } catch (error) {
      logger.error('Failed to clear all application updates', { userId, error });
      throw error;
    }
  }

  /**
   * Send a new job notification to candidates matching criteria
   * This would typically be called when a new job is posted
   */
  static async notifyNewJob(
    candidateUserIds: string[],
    jobTitle: string,
    jobId: string,
    companyName: string
  ): Promise<void> {
    try {
      const notifications = candidateUserIds.map((userId) =>
        this.sendNotification(userId, {
          type: 'new_job',
          title: 'New Job Match',
          message: `New job posted: ${jobTitle} at ${companyName}`,
          read: false,
          data: {
            jobId,
            jobTitle,
            companyName,
          },
        })
      );

      await Promise.all(notifications);

      logger.info('New job notifications sent', {
        jobId,
        jobTitle,
        recipientCount: candidateUserIds.length,
      });
    } catch (error) {
      logger.error('Failed to send new job notifications', { jobId, error });
      throw error;
    }
  }

  /**
   * Send a system notification to a user
   */
  static async sendSystemNotification(
    userId: string,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<string> {
    return this.sendNotification(userId, {
      type: 'system',
      title,
      message,
      read: false,
      data,
    });
  }

  /**
   * Broadcast system notification to all users
   * Use with caution - this can be expensive
   */
  static async broadcastSystemNotification(
    userIds: string[],
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      const notifications = userIds.map((userId) =>
        this.sendSystemNotification(userId, title, message, data)
      );

      await Promise.all(notifications);

      logger.info('System notification broadcasted', {
        recipientCount: userIds.length,
        title,
      });
    } catch (error) {
      logger.error('Failed to broadcast system notification', { error });
      throw error;
    }
  }
}

export default RealtimeService;

import express, { Response } from 'express';
import { authenticateFirebase, AuthRequest } from '../middleware/firebaseAuth';
import RealtimeService from '../services/realtimeService';

const router = express.Router();

// GET /api/notifications - Get all notifications for authenticated user
router.get('/', authenticateFirebase, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
      return;
    }

    const notifications = await RealtimeService.getNotifications(userId);

    res.json({
      notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch notifications',
    });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put(
  '/:id/read',
  authenticateFirebase,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
        return;
      }

      const { id } = req.params;

      await RealtimeService.markNotificationAsRead(userId, id);

      res.json({
        message: 'Notification marked as read',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to mark notification as read',
      });
    }
  }
);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put(
  '/read-all',
  authenticateFirebase,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
        return;
      }

      await RealtimeService.markAllNotificationsAsRead(userId);

      res.json({
        message: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to mark all notifications as read',
      });
    }
  }
);

// DELETE /api/notifications/:id - Delete a notification
router.delete(
  '/:id',
  authenticateFirebase,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
        return;
      }

      const { id } = req.params;

      await RealtimeService.deleteNotification(userId, id);

      res.json({
        message: 'Notification deleted',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete notification',
      });
    }
  }
);

// DELETE /api/notifications/old - Clear old notifications
router.delete(
  '/old',
  authenticateFirebase,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
        return;
      }

      const daysOld = parseInt(req.query.days as string) || 30;

      await RealtimeService.clearOldNotifications(userId, daysOld);

      res.json({
        message: `Notifications older than ${daysOld} days cleared`,
      });
    } catch (error) {
      console.error('Error clearing old notifications:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to clear old notifications',
      });
    }
  }
);

// GET /api/notifications/application-updates - Get application updates
router.get(
  '/application-updates',
  authenticateFirebase,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
        return;
      }

      const updates = await RealtimeService.getApplicationUpdates(userId);

      res.json({
        updates,
      });
    } catch (error) {
      console.error('Error fetching application updates:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch application updates',
      });
    }
  }
);

// DELETE /api/notifications/application-updates/:id - Clear application update
router.delete(
  '/application-updates/:id',
  authenticateFirebase,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
        return;
      }

      const { id } = req.params;

      await RealtimeService.clearApplicationUpdate(userId, id);

      res.json({
        message: 'Application update cleared',
      });
    } catch (error) {
      console.error('Error clearing application update:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to clear application update',
      });
    }
  }
);

export default router;

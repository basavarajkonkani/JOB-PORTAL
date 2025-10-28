import './setup';
import RealtimeService, {
  Presence,
  Notification,
  ApplicationUpdate,
} from '../services/realtimeService';
import { realtimeDb } from '../config/firebase';

// Mock the realtimeDb methods
jest.mock('../config/firebase');

describe('RealtimeService', () => {
  const mockUserId = 'test-user-123';
  const mockApplicationId = 'test-app-456';
  const mockJobId = 'test-job-789';

  // Mock data
  let mockPresenceData: Presence;
  let mockNotificationData: Omit<Notification, 'timestamp'>;
  let mockApplicationUpdateData: Omit<ApplicationUpdate, 'updatedAt'>;

  beforeEach(() => {
    // Reset mock data before each test
    mockPresenceData = {
      online: true,
      lastSeen: Date.now(),
      currentPage: '/dashboard',
    };

    mockNotificationData = {
      type: 'application_status',
      title: 'Test Notification',
      message: 'This is a test notification',
      read: false,
      data: { testKey: 'testValue' },
    };

    mockApplicationUpdateData = {
      status: 'reviewed',
      jobTitle: 'Software Engineer',
      jobId: mockJobId,
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Presence Management', () => {
    describe('updatePresence', () => {
      it('should update user presence with online status', async () => {
        const mockSet = jest.fn().mockResolvedValue(undefined);
        const mockRef = { set: mockSet };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await RealtimeService.updatePresence(mockUserId, true, '/dashboard');

        expect(realtimeDb.ref).toHaveBeenCalledWith(`presence/${mockUserId}`);
        expect(mockSet).toHaveBeenCalledWith(
          expect.objectContaining({
            online: true,
            lastSeen: expect.any(Number),
            currentPage: '/dashboard',
          })
        );
      });

      it('should update user presence with offline status', async () => {
        const mockSet = jest.fn().mockResolvedValue(undefined);
        const mockRef = { set: mockSet };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await RealtimeService.updatePresence(mockUserId, false);

        expect(realtimeDb.ref).toHaveBeenCalledWith(`presence/${mockUserId}`);
        expect(mockSet).toHaveBeenCalledWith(
          expect.objectContaining({
            online: false,
            lastSeen: expect.any(Number),
          })
        );
      });

      it('should update presence without currentPage when not provided', async () => {
        const mockSet = jest.fn().mockResolvedValue(undefined);
        const mockRef = { set: mockSet };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await RealtimeService.updatePresence(mockUserId, true);

        const callArgs = mockSet.mock.calls[0][0];
        expect(callArgs).toHaveProperty('online', true);
        expect(callArgs).toHaveProperty('lastSeen');
        expect(callArgs).not.toHaveProperty('currentPage');
      });

      it('should handle errors when updating presence', async () => {
        const mockError = new Error('Database error');
        const mockSet = jest.fn().mockRejectedValue(mockError);
        const mockRef = { set: mockSet };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await expect(RealtimeService.updatePresence(mockUserId, true)).rejects.toThrow(
          'Database error'
        );
      });
    });

    describe('getPresence', () => {
      it('should retrieve user presence data', async () => {
        const mockSnapshot = {
          val: jest.fn().mockReturnValue(mockPresenceData),
        };
        const mockRef = {
          once: jest.fn().mockResolvedValue(mockSnapshot),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        const result = await RealtimeService.getPresence(mockUserId);

        expect(realtimeDb.ref).toHaveBeenCalledWith(`presence/${mockUserId}`);
        expect(mockRef.once).toHaveBeenCalledWith('value');
        expect(result).toEqual(mockPresenceData);
      });

      it('should return null when presence data does not exist', async () => {
        const mockSnapshot = {
          val: jest.fn().mockReturnValue(null),
        };
        const mockRef = {
          once: jest.fn().mockResolvedValue(mockSnapshot),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        const result = await RealtimeService.getPresence(mockUserId);

        expect(result).toBeNull();
      });

      it('should handle errors when retrieving presence', async () => {
        const mockError = new Error('Database error');
        const mockRef = {
          once: jest.fn().mockRejectedValue(mockError),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await expect(RealtimeService.getPresence(mockUserId)).rejects.toThrow('Database error');
      });
    });

    describe('setUserOffline', () => {
      it('should set user status to offline', async () => {
        const mockRef = {
          update: jest.fn().mockResolvedValue(undefined),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await RealtimeService.setUserOffline(mockUserId);

        expect(realtimeDb.ref).toHaveBeenCalledWith(`presence/${mockUserId}`);
        expect(mockRef.update).toHaveBeenCalledWith(
          expect.objectContaining({
            online: false,
            lastSeen: expect.any(Number),
          })
        );
      });

      it('should handle errors when setting user offline', async () => {
        const mockError = new Error('Database error');
        const mockRef = {
          update: jest.fn().mockRejectedValue(mockError),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await expect(RealtimeService.setUserOffline(mockUserId)).rejects.toThrow('Database error');
      });
    });
  });

  describe('Notification Management', () => {
    describe('sendNotification', () => {
      it('should send a notification to a user', async () => {
        const mockNotificationId = 'notif-123';
        const mockPushRef = {
          key: mockNotificationId,
          set: jest.fn().mockResolvedValue(undefined),
        };
        const mockRef = {
          push: jest.fn().mockReturnValue(mockPushRef),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        const result = await RealtimeService.sendNotification(mockUserId, mockNotificationData);

        expect(realtimeDb.ref).toHaveBeenCalledWith(`notifications/${mockUserId}`);
        expect(mockRef.push).toHaveBeenCalled();
        expect(mockPushRef.set).toHaveBeenCalledWith(
          expect.objectContaining({
            ...mockNotificationData,
            timestamp: expect.any(Number),
          })
        );
        expect(result).toBe(mockNotificationId);
      });

      it('should throw error when notification ID generation fails', async () => {
        const mockPushRef = {
          key: null,
          set: jest.fn(),
        };
        const mockRef = {
          push: jest.fn().mockReturnValue(mockPushRef),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await expect(
          RealtimeService.sendNotification(mockUserId, mockNotificationData)
        ).rejects.toThrow('Failed to generate notification ID');
      });

      it('should handle errors when sending notification', async () => {
        const mockError = new Error('Database error');
        const mockPushRef = {
          key: 'notif-123',
          set: jest.fn().mockRejectedValue(mockError),
        };
        const mockRef = {
          push: jest.fn().mockReturnValue(mockPushRef),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await expect(
          RealtimeService.sendNotification(mockUserId, mockNotificationData)
        ).rejects.toThrow('Database error');
      });
    });

    describe('markNotificationAsRead', () => {
      it('should mark a notification as read', async () => {
        const mockNotificationId = 'notif-123';
        const mockRef = {
          update: jest.fn().mockResolvedValue(undefined),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await RealtimeService.markNotificationAsRead(mockUserId, mockNotificationId);

        expect(realtimeDb.ref).toHaveBeenCalledWith(
          `notifications/${mockUserId}/${mockNotificationId}`
        );
        expect(mockRef.update).toHaveBeenCalledWith({ read: true });
      });

      it('should handle errors when marking notification as read', async () => {
        const mockError = new Error('Database error');
        const mockNotificationId = 'notif-123';
        const mockRef = {
          update: jest.fn().mockRejectedValue(mockError),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await expect(
          RealtimeService.markNotificationAsRead(mockUserId, mockNotificationId)
        ).rejects.toThrow('Database error');
      });
    });

    describe('getNotifications', () => {
      it('should retrieve all notifications for a user', async () => {
        const mockNotifications = {
          'notif-1': { ...mockNotificationData, timestamp: Date.now() },
          'notif-2': { ...mockNotificationData, timestamp: Date.now() },
        };
        const mockSnapshot = {
          val: jest.fn().mockReturnValue(mockNotifications),
        };
        const mockRef = {
          once: jest.fn().mockResolvedValue(mockSnapshot),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        const result = await RealtimeService.getNotifications(mockUserId);

        expect(realtimeDb.ref).toHaveBeenCalledWith(`notifications/${mockUserId}`);
        expect(mockRef.once).toHaveBeenCalledWith('value');
        expect(result).toEqual(mockNotifications);
      });

      it('should return empty object when no notifications exist', async () => {
        const mockSnapshot = {
          val: jest.fn().mockReturnValue(null),
        };
        const mockRef = {
          once: jest.fn().mockResolvedValue(mockSnapshot),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        const result = await RealtimeService.getNotifications(mockUserId);

        expect(result).toEqual({});
      });

      it('should handle errors when retrieving notifications', async () => {
        const mockError = new Error('Database error');
        const mockRef = {
          once: jest.fn().mockRejectedValue(mockError),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await expect(RealtimeService.getNotifications(mockUserId)).rejects.toThrow(
          'Database error'
        );
      });
    });

    describe('deleteNotification', () => {
      it('should delete a notification', async () => {
        const mockNotificationId = 'notif-123';
        const mockRef = {
          remove: jest.fn().mockResolvedValue(undefined),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await RealtimeService.deleteNotification(mockUserId, mockNotificationId);

        expect(realtimeDb.ref).toHaveBeenCalledWith(
          `notifications/${mockUserId}/${mockNotificationId}`
        );
        expect(mockRef.remove).toHaveBeenCalled();
      });

      it('should handle errors when deleting notification', async () => {
        const mockError = new Error('Database error');
        const mockNotificationId = 'notif-123';
        const mockRef = {
          remove: jest.fn().mockRejectedValue(mockError),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await expect(
          RealtimeService.deleteNotification(mockUserId, mockNotificationId)
        ).rejects.toThrow('Database error');
      });
    });
  });

  describe('Application Update Broadcasting', () => {
    describe('broadcastApplicationUpdate', () => {
      it('should broadcast an application status update', async () => {
        // Mock for application update
        const mockUpdateRef = {
          set: jest.fn().mockResolvedValue(undefined),
        };

        // Mock for notification
        const mockNotificationId = 'notif-123';
        const mockPushRef = {
          key: mockNotificationId,
          set: jest.fn().mockResolvedValue(undefined),
        };
        const mockNotificationRef = {
          push: jest.fn().mockReturnValue(mockPushRef),
        };

        (realtimeDb.ref as jest.Mock)
          .mockReturnValueOnce(mockUpdateRef) // First call for application update
          .mockReturnValueOnce(mockNotificationRef); // Second call for notification

        await RealtimeService.broadcastApplicationUpdate(
          mockUserId,
          mockApplicationId,
          mockApplicationUpdateData
        );

        // Verify application update
        expect(realtimeDb.ref).toHaveBeenCalledWith(
          `applicationUpdates/${mockUserId}/${mockApplicationId}`
        );
        expect(mockUpdateRef.set).toHaveBeenCalledWith(
          expect.objectContaining({
            ...mockApplicationUpdateData,
            updatedAt: expect.any(Number),
          })
        );

        // Verify notification was sent
        expect(realtimeDb.ref).toHaveBeenCalledWith(`notifications/${mockUserId}`);
        expect(mockPushRef.set).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'application_status',
            title: 'Application Update',
            message: expect.stringContaining(mockApplicationUpdateData.jobTitle),
            read: false,
            data: expect.objectContaining({
              applicationId: mockApplicationId,
              jobId: mockJobId,
              status: mockApplicationUpdateData.status,
            }),
            timestamp: expect.any(Number),
          })
        );
      });

      it('should handle errors when broadcasting application update', async () => {
        const mockError = new Error('Database error');
        const mockRef = {
          set: jest.fn().mockRejectedValue(mockError),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await expect(
          RealtimeService.broadcastApplicationUpdate(
            mockUserId,
            mockApplicationId,
            mockApplicationUpdateData
          )
        ).rejects.toThrow('Database error');
      });
    });

    describe('getApplicationUpdates', () => {
      it('should retrieve all application updates for a user', async () => {
        const mockUpdates = {
          'app-1': { ...mockApplicationUpdateData, updatedAt: Date.now() },
          'app-2': { ...mockApplicationUpdateData, updatedAt: Date.now() },
        };
        const mockSnapshot = {
          val: jest.fn().mockReturnValue(mockUpdates),
        };
        const mockRef = {
          once: jest.fn().mockResolvedValue(mockSnapshot),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        const result = await RealtimeService.getApplicationUpdates(mockUserId);

        expect(realtimeDb.ref).toHaveBeenCalledWith(`applicationUpdates/${mockUserId}`);
        expect(mockRef.once).toHaveBeenCalledWith('value');
        expect(result).toEqual(mockUpdates);
      });

      it('should return empty object when no updates exist', async () => {
        const mockSnapshot = {
          val: jest.fn().mockReturnValue(null),
        };
        const mockRef = {
          once: jest.fn().mockResolvedValue(mockSnapshot),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        const result = await RealtimeService.getApplicationUpdates(mockUserId);

        expect(result).toEqual({});
      });

      it('should handle errors when retrieving application updates', async () => {
        const mockError = new Error('Database error');
        const mockRef = {
          once: jest.fn().mockRejectedValue(mockError),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await expect(RealtimeService.getApplicationUpdates(mockUserId)).rejects.toThrow(
          'Database error'
        );
      });
    });

    describe('clearApplicationUpdate', () => {
      it('should clear a specific application update', async () => {
        const mockRef = {
          remove: jest.fn().mockResolvedValue(undefined),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await RealtimeService.clearApplicationUpdate(mockUserId, mockApplicationId);

        expect(realtimeDb.ref).toHaveBeenCalledWith(
          `applicationUpdates/${mockUserId}/${mockApplicationId}`
        );
        expect(mockRef.remove).toHaveBeenCalled();
      });

      it('should handle errors when clearing application update', async () => {
        const mockError = new Error('Database error');
        const mockRef = {
          remove: jest.fn().mockRejectedValue(mockError),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await expect(
          RealtimeService.clearApplicationUpdate(mockUserId, mockApplicationId)
        ).rejects.toThrow('Database error');
      });
    });

    describe('clearAllApplicationUpdates', () => {
      it('should clear all application updates for a user', async () => {
        const mockRef = {
          remove: jest.fn().mockResolvedValue(undefined),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await RealtimeService.clearAllApplicationUpdates(mockUserId);

        expect(realtimeDb.ref).toHaveBeenCalledWith(`applicationUpdates/${mockUserId}`);
        expect(mockRef.remove).toHaveBeenCalled();
      });

      it('should handle errors when clearing all application updates', async () => {
        const mockError = new Error('Database error');
        const mockRef = {
          remove: jest.fn().mockRejectedValue(mockError),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await expect(RealtimeService.clearAllApplicationUpdates(mockUserId)).rejects.toThrow(
          'Database error'
        );
      });
    });
  });

  describe('Additional Notification Features', () => {
    describe('markAllNotificationsAsRead', () => {
      it('should mark all notifications as read', async () => {
        const mockNotifications = {
          'notif-1': { ...mockNotificationData, timestamp: Date.now(), read: false },
          'notif-2': { ...mockNotificationData, timestamp: Date.now(), read: false },
        };
        const mockSnapshot = {
          val: jest.fn().mockReturnValue(mockNotifications),
        };
        const mockRef = {
          once: jest.fn().mockResolvedValue(mockSnapshot),
          update: jest.fn().mockResolvedValue(undefined),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await RealtimeService.markAllNotificationsAsRead(mockUserId);

        expect(mockRef.update).toHaveBeenCalledWith({
          'notif-1/read': true,
          'notif-2/read': true,
        });
      });

      it('should handle case when no notifications exist', async () => {
        const mockSnapshot = {
          val: jest.fn().mockReturnValue(null),
        };
        const mockRef = {
          once: jest.fn().mockResolvedValue(mockSnapshot),
          update: jest.fn(),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await RealtimeService.markAllNotificationsAsRead(mockUserId);

        expect(mockRef.update).not.toHaveBeenCalled();
      });
    });

    describe('sendSystemNotification', () => {
      it('should send a system notification', async () => {
        const mockNotificationId = 'notif-123';
        const mockPushRef = {
          key: mockNotificationId,
          set: jest.fn().mockResolvedValue(undefined),
        };
        const mockRef = {
          push: jest.fn().mockReturnValue(mockPushRef),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        const result = await RealtimeService.sendSystemNotification(
          mockUserId,
          'System Update',
          'System maintenance scheduled',
          { maintenanceDate: '2024-01-01' }
        );

        expect(mockPushRef.set).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'system',
            title: 'System Update',
            message: 'System maintenance scheduled',
            read: false,
            data: { maintenanceDate: '2024-01-01' },
            timestamp: expect.any(Number),
          })
        );
        expect(result).toBe(mockNotificationId);
      });
    });

    describe('notifyNewJob', () => {
      it('should send new job notifications to multiple candidates', async () => {
        const candidateIds = ['user-1', 'user-2', 'user-3'];
        const jobTitle = 'Senior Developer';
        const companyName = 'Tech Corp';

        const mockNotificationId = 'notif-123';
        const mockPushRef = {
          key: mockNotificationId,
          set: jest.fn().mockResolvedValue(undefined),
        };
        const mockRef = {
          push: jest.fn().mockReturnValue(mockPushRef),
        };
        (realtimeDb.ref as jest.Mock).mockReturnValue(mockRef);

        await RealtimeService.notifyNewJob(candidateIds, jobTitle, mockJobId, companyName);

        // Should be called once for each candidate
        expect(realtimeDb.ref).toHaveBeenCalledTimes(candidateIds.length);
        expect(mockPushRef.set).toHaveBeenCalledTimes(candidateIds.length);

        // Verify notification content
        const lastCall = mockPushRef.set.mock.calls[mockPushRef.set.mock.calls.length - 1][0];
        expect(lastCall).toMatchObject({
          type: 'new_job',
          title: 'New Job Match',
          read: false,
          data: {
            jobId: mockJobId,
            jobTitle,
            companyName,
          },
        });
        expect(lastCall.message).toContain(jobTitle);
        expect(lastCall.message).toContain(companyName);
        expect(lastCall.timestamp).toEqual(expect.any(Number));
      });
    });
  });
});

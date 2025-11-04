# Realtime Features Documentation

This document describes how to use the Firebase Realtime Database features in the frontend application.

## Overview

The application uses Firebase Realtime Database for three main features:

1. **User Presence Tracking** - Track when users are online
2. **Real-time Notifications** - Instant notifications for important events
3. **Application Status Updates** - Live updates when application status changes

## Hooks

### usePresence

Automatically tracks user presence (online/offline status).

```typescript
import { usePresence } from '@/lib/usePresence';

function MyComponent() {
  const { user } = useAuth();

  // Automatically tracks presence when user is authenticated
  usePresence(user?.id || null, !!user);

  // Component code...
}
```

**Features:**

- Automatically sets user as online when authenticated
- Updates presence every 5 minutes
- Sets user as offline when they disconnect or close the tab
- Updates presence when page visibility changes

### useRealtimeNotifications

Listen for real-time notifications.

```typescript
import { useRealtimeNotifications } from '@/lib/useRealtimeNotifications';

function NotificationComponent() {
  const { user } = useAuth();
  const { notifications, unreadCount, loading, error } = useRealtimeNotifications(user?.id || null);

  return (
    <div>
      <h2>Notifications ({unreadCount} unread)</h2>
      {notifications.map(notification => (
        <div key={notification.id}>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
          <span>{new Date(notification.timestamp).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
```

**Notification Types:**

- `application_status` - Application status changed
- `new_job` - New job matching user's profile
- `message` - Direct message from recruiter
- `system` - System announcements

### useApplicationUpdates

Listen for real-time application status updates.

```typescript
import { useApplicationUpdates } from '@/lib/useApplicationUpdates';

function ApplicationsComponent() {
  const { user } = useAuth();
  const { updates, loading, error } = useApplicationUpdates(user?.id || null);

  return (
    <div>
      {updates.map(update => (
        <div key={update.applicationId}>
          <p>Your application for {update.jobTitle} is now {update.status}</p>
          <span>{new Date(update.updatedAt).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
```

**Application Statuses:**

- `pending` - Application submitted, awaiting review
- `reviewed` - Application has been reviewed
- `shortlisted` - Candidate shortlisted for interview
- `rejected` - Application rejected
- `accepted` - Application accepted

### useApplicationUpdate (Single)

Listen for updates to a specific application.

```typescript
import { useApplicationUpdate } from '@/lib/useApplicationUpdates';

function ApplicationDetailComponent({ applicationId }: { applicationId: string }) {
  const { user } = useAuth();
  const { update, loading, error } = useApplicationUpdate(user?.id || null, applicationId);

  if (update) {
    return <div>Status: {update.status}</div>;
  }

  return <div>No updates</div>;
}
```

## Components

### NotificationBell

A dropdown notification bell component with unread badge.

```typescript
import { NotificationBell } from '@/components/notifications';

function Navigation() {
  return (
    <nav>
      {/* Other nav items */}
      <NotificationBell />
    </nav>
  );
}
```

**Features:**

- Shows unread count badge
- Dropdown list of notifications
- Mark individual notifications as read
- Mark all notifications as read
- Delete notifications
- Auto-updates in real-time

### ApplicationUpdateBanner

A banner component that displays application status updates.

```typescript
import { ApplicationUpdateBanner } from '@/components/notifications';

function DashboardPage() {
  return (
    <div>
      <ApplicationUpdateBanner />
      {/* Rest of dashboard */}
    </div>
  );
}
```

**Features:**

- Shows recent application status changes
- Color-coded by status (green for accepted, red for rejected, etc.)
- Dismissible banners
- Links to job details
- Auto-updates in real-time

## API Integration

### Mark Notification as Read

```typescript
import { apiClient } from '@/lib/api-client';

await apiClient.put(`/notifications/${notificationId}/read`);
```

### Mark All Notifications as Read

```typescript
await apiClient.put('/notifications/read-all');
```

### Delete Notification

```typescript
await apiClient.delete(`/notifications/${notificationId}`);
```

### Clear Application Update

```typescript
await apiClient.delete(`/notifications/application-updates/${applicationId}`);
```

## Backend Integration

The backend automatically broadcasts updates when:

1. **Application Status Changes** - When a recruiter updates an application status
2. **New Job Posted** - When a job matching candidate criteria is posted (future feature)
3. **System Events** - When important system events occur

### Example: Broadcasting Application Update

```typescript
import RealtimeService from '../services/realtimeService';

// When application status is updated
await RealtimeService.broadcastApplicationUpdate(userId, applicationId, {
  status: 'shortlisted',
  jobTitle: 'Senior Software Engineer',
  jobId: 'job123',
});
```

This automatically:

- Updates the `applicationUpdates` node in Realtime Database
- Sends a notification to the user
- Triggers real-time updates in the frontend

## Best Practices

1. **Always check for null userId** - Hooks should handle null userId gracefully
2. **Cleanup listeners** - Hooks automatically cleanup on unmount
3. **Error handling** - Always handle errors from hooks
4. **Loading states** - Show loading indicators while data is being fetched
5. **Offline support** - Firebase handles offline scenarios automatically
6. **Performance** - Listeners are efficient and only update when data changes

## Security

All realtime data is protected by Firebase security rules:

- Users can only read their own notifications and application updates
- Only recruiters can write application updates
- Presence data is publicly readable but only writable by the user
- All operations require authentication

## Troubleshooting

### Notifications not appearing

1. Check if user is authenticated
2. Verify Firebase Realtime Database URL in environment variables
3. Check browser console for errors
4. Verify security rules are deployed

### Presence not updating

1. Check if `usePresence` hook is being called
2. Verify user ID is being passed correctly
3. Check network connectivity
4. Verify Firebase Realtime Database is enabled in Firebase Console

### Application updates not showing

1. Verify backend is broadcasting updates correctly
2. Check if application status is actually changing
3. Verify user ID matches the application owner
4. Check Firebase Realtime Database rules

## Environment Variables

Required environment variables for Realtime Database:

```env
# Frontend (.env.local)
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Backend (.env)
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

## Testing

To test realtime features:

1. **Presence**: Open app in two browser windows with same user
2. **Notifications**: Use backend API to send test notification
3. **Application Updates**: Update application status as recruiter

### Test Notification via API

```bash
# Get auth token
TOKEN="your-firebase-id-token"

# Send test notification (as admin)
curl -X POST http://localhost:3001/api/notifications/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "title": "Test Notification",
    "message": "This is a test notification"
  }'
```

## Future Enhancements

Potential future features:

- Push notifications (using Firebase Cloud Messaging)
- Email notifications for important events
- Notification preferences and filtering
- Notification history and search
- Real-time chat between recruiters and candidates
- Typing indicators
- Read receipts

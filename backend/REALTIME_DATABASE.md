# Firebase Realtime Database Structure

This document describes the structure and usage of Firebase Realtime Database for live features in the AI Job Portal.

## Overview

The Realtime Database is used for features that require instant updates and real-time synchronization:

- User presence tracking
- Real-time notifications
- Application status updates

## Database Structure

```
realtimeDb/
├── presence/
│   └── {userId}/
│       ├── online: boolean
│       ├── lastSeen: number (timestamp)
│       └── currentPage: string (optional)
│
├── notifications/
│   └── {userId}/
│       └── {notificationId}/
│           ├── type: string
│           ├── title: string
│           ├── message: string
│           ├── read: boolean
│           ├── data: object (optional)
│           └── timestamp: number
│
└── applicationUpdates/
    └── {userId}/
        └── {applicationId}/
            ├── status: string
            ├── updatedAt: number (timestamp)
            ├── jobTitle: string
            └── jobId: string (optional)
```

## Data Models

### Presence

Tracks whether users are currently online and when they were last seen.

```typescript
interface Presence {
  online: boolean;
  lastSeen: number; // Unix timestamp in milliseconds
  currentPage?: string; // Optional: current page path
}
```

**Example:**

```json
{
  "presence": {
    "user123": {
      "online": true,
      "lastSeen": 1698765432000,
      "currentPage": "/dashboard"
    }
  }
}
```

### Notifications

Real-time notifications for users about important events.

```typescript
interface Notification {
  type: 'application_status' | 'new_job' | 'message' | 'system';
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>; // Additional data specific to notification type
  timestamp: number; // Unix timestamp in milliseconds
}
```

**Example:**

```json
{
  "notifications": {
    "user123": {
      "notif_abc123": {
        "type": "application_status",
        "title": "Application Update",
        "message": "Your application for Software Engineer has been reviewed",
        "read": false,
        "data": {
          "applicationId": "app456",
          "jobId": "job789",
          "status": "reviewed"
        },
        "timestamp": 1698765432000
      }
    }
  }
}
```

### Application Updates

Real-time updates when application status changes.

```typescript
interface ApplicationUpdate {
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  updatedAt: number; // Unix timestamp in milliseconds
  jobTitle: string;
  jobId?: string; // Optional: for navigation
}
```

**Example:**

```json
{
  "applicationUpdates": {
    "user123": {
      "app456": {
        "status": "shortlisted",
        "updatedAt": 1698765432000,
        "jobTitle": "Senior Software Engineer",
        "jobId": "job789"
      }
    }
  }
}
```

## Security Rules

Security rules are defined in `database.rules.json`:

### Presence Rules

- **Read**: Public (anyone can see who's online)
- **Write**: Only the user can update their own presence
- **Validation**: Must have `online` (boolean) and `lastSeen` (number) fields

### Notifications Rules

- **Read**: Only the user can read their own notifications
- **Write**: Only the user or admins can write notifications
- **Validation**: Must have required fields with correct types

### Application Updates Rules

- **Read**: Only the user can read their own application updates
- **Write**: Only recruiters or admins can write application updates
- **Validation**: Must have `status`, `updatedAt`, and `jobTitle` fields

## Deployment

To deploy the security rules to Firebase:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in the backend directory (if not done)
cd backend
firebase init database

# Deploy rules
firebase deploy --only database
```

## Usage Examples

### Backend (Node.js with Admin SDK)

```typescript
import { realtimeDb } from '../config/firebase';

// Update presence
async function updatePresence(userId: string, online: boolean) {
  await realtimeDb.ref(`presence/${userId}`).set({
    online,
    lastSeen: Date.now(),
  });
}

// Send notification
async function sendNotification(userId: string, notification: Notification) {
  const notificationRef = realtimeDb.ref(`notifications/${userId}`).push();
  await notificationRef.set({
    ...notification,
    timestamp: Date.now(),
  });
}

// Broadcast application update
async function broadcastApplicationUpdate(
  userId: string,
  applicationId: string,
  update: ApplicationUpdate
) {
  await realtimeDb.ref(`applicationUpdates/${userId}/${applicationId}`).set({
    ...update,
    updatedAt: Date.now(),
  });
}
```

### Frontend (React with Firebase SDK)

```typescript
import { ref, onValue, set, push } from 'firebase/database';
import { realtimeDb } from './firebase';

// Listen for application updates
function useApplicationUpdates(userId: string) {
  const [updates, setUpdates] = useState({});

  useEffect(() => {
    const updatesRef = ref(realtimeDb, `applicationUpdates/${userId}`);

    const unsubscribe = onValue(updatesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUpdates(data);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return updates;
}

// Update presence
function updatePresence(userId: string, online: boolean) {
  const presenceRef = ref(realtimeDb, `presence/${userId}`);

  set(presenceRef, {
    online,
    lastSeen: Date.now(),
    currentPage: window.location.pathname,
  });
}
```

## Best Practices

1. **Cleanup**: Remove old data periodically to avoid database bloat
2. **Indexing**: Use `.indexOn` rules for frequently queried fields
3. **Offline Support**: Handle offline scenarios gracefully
4. **Error Handling**: Always wrap database operations in try-catch blocks
5. **Presence Management**: Use `onDisconnect()` to update presence when users go offline
6. **Notification Limits**: Implement pagination or limits for notifications
7. **Data Validation**: Always validate data before writing to the database

## Monitoring

Monitor Realtime Database usage in the Firebase Console:

- Database size and bandwidth usage
- Number of concurrent connections
- Read/write operations per second
- Security rule denials

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check security rules and ensure user is authenticated
2. **Connection Issues**: Verify `databaseURL` in Firebase configuration
3. **Data Not Updating**: Check if listeners are properly set up and not unsubscribed
4. **Offline Behavior**: Implement offline detection and retry logic

### Debug Mode

Enable debug logging in development:

```typescript
// Backend
import { setLogLevel } from 'firebase-admin/database';
setLogLevel('debug');

// Frontend
import { enableLogging } from 'firebase/database';
enableLogging(true);
```

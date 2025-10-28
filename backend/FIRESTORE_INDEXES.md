# Firestore Indexes Configuration

This document explains the Firestore composite indexes required for the Job model queries.

## Index Files

- `firestore.indexes.json` - Defines composite indexes for efficient querying
- `firestore.rules` - Defines security rules for Firestore collections

## Required Indexes

### 1. Status + PublishedAt

Used for: Filtering jobs by status and sorting by publication date

```
status (ASC) + publishedAt (DESC)
```

### 2. Status + Location + PublishedAt

Used for: Filtering jobs by status and location, sorted by publication date

```
status (ASC) + location (ASC) + publishedAt (DESC)
```

### 3. Status + Level + PublishedAt

Used for: Filtering jobs by status and experience level, sorted by publication date

```
status (ASC) + level (ASC) + publishedAt (DESC)
```

### 4. Status + Remote + PublishedAt

Used for: Filtering jobs by status and remote work option, sorted by publication date

```
status (ASC) + remote (ASC) + publishedAt (DESC)
```

### 5. OrgId + CreatedAt

Used for: Getting all jobs for an organization, sorted by creation date

```
orgId (ASC) + createdAt (DESC)
```

### 6. CreatedBy + CreatedAt

Used for: Getting all jobs created by a recruiter, sorted by creation date

```
createdBy (ASC) + createdAt (DESC)
```

### 7. Status + OrgId + PublishedAt

Used for: Filtering organization jobs by status, sorted by publication date

```
status (ASC) + orgId (ASC) + publishedAt (DESC)
```

### 8. Status + CreatedBy + PublishedAt

Used for: Filtering recruiter jobs by status, sorted by publication date

```
status (ASC) + createdBy (ASC) + publishedAt (DESC)
```

## Application Indexes

### 9. UserId + CreatedAt

Used for: Getting all applications for a user, sorted by creation date

```
userId (ASC) + createdAt (DESC)
```

### 10. JobId + Status + AiScore

Used for: Getting applications for a job filtered by status and sorted by AI score

```
jobId (ASC) + status (ASC) + aiScore (DESC)
```

### 11. JobId + CreatedAt

Used for: Getting all applications for a job, sorted by creation date

```
jobId (ASC) + createdAt (DESC)
```

### 12. JobId + UserId

Used for: Checking if a user has already applied to a job

```
jobId (ASC) + userId (ASC)
```

## Deployment

### Using Firebase CLI

1. Install Firebase CLI if not already installed:

```bash
npm install -g firebase-tools
```

2. Login to Firebase:

```bash
firebase login
```

3. Initialize Firebase in the backend directory (if not already done):

```bash
cd backend
firebase init firestore
```

4. Deploy indexes:

```bash
firebase deploy --only firestore:indexes
```

5. Deploy security rules:

```bash
firebase deploy --only firestore:rules
```

### Using Firebase Console

Alternatively, you can create indexes manually in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Firestore Database > Indexes
4. Click "Add Index" and configure each index as specified above

## Index Creation Time

- Indexes are created asynchronously by Firebase
- Simple indexes may take a few minutes
- Complex indexes on large datasets may take hours
- You can monitor index creation progress in the Firebase Console

## Notes

- Firestore automatically creates single-field indexes
- Composite indexes must be explicitly defined
- The search method in Job model uses in-memory filtering for text search (title, location) because Firestore doesn't support ILIKE queries
- For production-scale text search, consider integrating with Algolia or Elasticsearch

## Testing Indexes

After deploying indexes, test your queries:

```typescript
// This query requires the status + publishedAt index
const jobs = await firestore
  .collection('jobs')
  .where('status', '==', 'active')
  .orderBy('publishedAt', 'desc')
  .limit(20)
  .get();
```

If an index is missing, Firestore will throw an error with a link to create the required index.

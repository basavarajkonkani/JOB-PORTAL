# Resume Endpoints Fix

## Issues Fixed

### 1. Resume Parsing Endpoint
**Problem**: The resume parser was trying to download files from Firebase Cloud Storage, but files are currently stored in Firestore as base64 (temporary solution for Spark plan).

**Solution**: Updated `downloadFileFromStorage()` in `backend/src/utils/resumeParser.ts` to:
- Extract file ID from storage path correctly
- Retrieve file content from Firestore `file_storage` collection
- Convert base64 content back to Buffer for parsing
- Added better error logging with file ID tracking

### 2. Resume Listing Endpoint
**Problem**: The endpoint was returning raw data without proper structure and error handling.

**Solution**: Updated `/api/candidate/resumes` endpoint in `backend/src/routes/resume.ts` to:
- Return properly structured resume data with versions
- Add comprehensive error logging
- Include development-mode error details
- Log successful operations with counts

### 3. File Deletion
**Problem**: File ID extraction from storage path was inconsistent.

**Solution**: Updated `deleteFileFromStorage()` in `backend/src/utils/storageHelper.ts` to:
- Use consistent file ID extraction logic
- Better error handling and logging
- Match the same pattern used in download function

## Current Storage Architecture (Firestore-based)

### How It Works
1. **Upload**: Files are converted to base64 and stored in Firestore `file_storage` collection
2. **Storage Path**: `resumes/{userId}/{uuid}.{ext}` (logical path, not actual Cloud Storage)
3. **Document ID**: UUID extracted from filename (without extension)
4. **File URL**: Data URL with base64 content for immediate access

### Limitations
- **10MB file size limit** (Firestore document size limit)
- **Not cost-effective** for large files or high volume
- **Performance impact** on large files
- **No CDN benefits** for file delivery

## Upgrade Path: Firebase Blaze Plan

### Why Upgrade?
1. **Proper Cloud Storage**: Dedicated file storage with no document size limits
2. **Better Performance**: Optimized for file operations
3. **CDN Integration**: Faster file delivery globally
4. **Cost Efficiency**: Pay-as-you-go pricing, cheaper for file storage
5. **Scalability**: Handle larger files (up to 5TB per file)

### Migration Steps

#### Step 1: Upgrade Firebase Project
```bash
# Go to Firebase Console
# Navigate to: Project Settings > Usage and billing
# Click "Modify plan" and select "Blaze (Pay as you go)"
```

#### Step 2: Enable Cloud Storage
```bash
# In Firebase Console
# Go to: Build > Storage
# Click "Get started"
# Choose security rules (start in test mode, then secure)
```

#### Step 3: Update Storage Helper
Replace the Firestore-based storage in `backend/src/utils/storageHelper.ts`:

```typescript
export async function uploadFileToStorage(
  file: Express.Multer.File,
  userId: string,
  folder: string = 'resumes'
): Promise<{ fileUrl: string; storagePath: string }> {
  try {
    const bucket = storage.bucket();
    
    // Generate unique file name
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${crypto.randomUUID()}${fileExtension}`;
    const storagePath = `${folder}/${userId}/${uniqueFileName}`;
    
    // Upload to Cloud Storage
    const fileRef = bucket.file(storagePath);
    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedBy: userId,
        },
      },
    });
    
    // Generate signed URL (valid for 1 year)
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
    });
    
    return {
      fileUrl: url,
      storagePath,
    };
  } catch (error) {
    logger.error('Failed to upload file to Cloud Storage', { error });
    throw error;
  }
}
```

#### Step 4: Update Resume Parser
Replace the Firestore download in `backend/src/utils/resumeParser.ts`:

```typescript
async function downloadFileFromStorage(storagePath: string): Promise<Buffer> {
  try {
    const bucket = storage.bucket();
    const file = bucket.file(storagePath);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error(`File not found: ${storagePath}`);
    }
    
    // Download file
    const [buffer] = await file.download();
    
    logger.info('File downloaded from Cloud Storage', { storagePath });
    return buffer;
  } catch (error) {
    logger.error('Failed to download file', { error, storagePath });
    throw error;
  }
}
```

#### Step 5: Migrate Existing Files
Create a migration script `backend/src/scripts/migrate-to-cloud-storage.ts`:

```typescript
import { firestore, storage } from '../config/firebase';
import logger from '../utils/logger';

async function migrateFilesToCloudStorage() {
  const bucket = storage.bucket();
  const filesSnapshot = await firestore.collection('file_storage').get();
  
  let migrated = 0;
  let failed = 0;
  
  for (const doc of filesSnapshot.docs) {
    try {
      const fileData = doc.data();
      const buffer = Buffer.from(fileData.content, 'base64');
      
      // Upload to Cloud Storage
      const fileRef = bucket.file(fileData.storagePath);
      await fileRef.save(buffer, {
        metadata: {
          contentType: fileData.mimeType,
          metadata: {
            originalName: fileData.originalName,
            uploadedBy: fileData.userId,
            migratedFrom: 'firestore',
          },
        },
      });
      
      // Update resume record with new URL
      const [url] = await fileRef.getSignedUrl({
        action: 'read',
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
      });
      
      // Update resume document
      const resumesSnapshot = await firestore
        .collection('resumes')
        .where('storagePath', '==', fileData.storagePath)
        .get();
      
      for (const resumeDoc of resumesSnapshot.docs) {
        await resumeDoc.ref.update({ fileUrl: url });
      }
      
      // Delete from Firestore storage
      await doc.ref.delete();
      
      migrated++;
      logger.info(`Migrated file: ${fileData.storagePath}`);
    } catch (error) {
      failed++;
      logger.error(`Failed to migrate file: ${doc.id}`, { error });
    }
  }
  
  logger.info('Migration complete', { migrated, failed });
}

migrateFilesToCloudStorage().catch(console.error);
```

#### Step 6: Update Security Rules
Create `storage.rules` for Cloud Storage:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Resumes - only owner can read/write
    match /resumes/{userId}/{fileName} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Other folders can be added here
  }
}
```

Deploy rules:
```bash
firebase deploy --only storage
```

### Cost Comparison

#### Current (Spark Plan - Firestore)
- Free tier: 1 GiB stored, 10 GiB/month bandwidth
- After free tier: Not available (must upgrade)

#### After Upgrade (Blaze Plan - Cloud Storage)
- Storage: $0.026/GB/month
- Download: $0.12/GB
- Upload: Free
- Example: 100 resumes (5MB each) = 500MB = ~$0.013/month

### Testing After Migration

```bash
# Test file upload
curl -X POST http://localhost:5000/api/candidate/resume/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@test-resume.pdf"

# Test resume parsing
curl -X POST http://localhost:5000/api/candidate/resume/parse \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resumeId": "RESUME_ID"}'

# Test resume listing
curl http://localhost:5000/api/candidate/resumes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Current Status

✅ **Fixed**: Resume parsing endpoint now works with Firestore storage
✅ **Fixed**: Resume listing endpoint returns proper structure
✅ **Fixed**: File deletion works correctly
⚠️ **Limitation**: 10MB file size limit (Firestore document limit)
📋 **Next Step**: Upgrade to Blaze plan for proper Cloud Storage

## Testing Current Implementation

The endpoints should now work correctly with the Firestore-based storage:

1. **Upload Resume**: Works with files up to 10MB
2. **Parse Resume**: Successfully downloads from Firestore and parses
3. **List Resumes**: Returns all resumes with versions
4. **Delete Resume**: Properly removes file and metadata

Test with larger files once Cloud Storage is enabled after upgrading to Blaze plan.

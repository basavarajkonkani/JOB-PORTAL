# Temporary Firestore-Based File Storage

## What Changed

Since Firebase Storage requires a paid plan (Blaze), I've implemented a **temporary workaround** that stores files in Firestore instead.

## How It Works

1. **File Upload**: Files are converted to base64 and stored in Firestore collection `file_storage`
2. **File Access**: Files are returned as data URLs (`data:application/pdf;base64,...`)
3. **File Delete**: Files are deleted from the Firestore collection

## Limitations

⚠️ **This is NOT recommended for production!**

- **Firestore document size limit**: 1MB per document
- **Cost**: More expensive than Storage for large files
- **Performance**: Slower than dedicated file storage
- **Bandwidth**: Data URLs increase payload size

## Current Implementation

### Upload
```typescript
// Converts file to base64
const base64Content = file.buffer.toString('base64');

// Stores in Firestore
await firestore.collection('file_storage').doc(uniqueFileName).set({
  userId,
  originalName: file.originalname,
  mimeType: file.mimetype,
  size: file.size,
  content: base64Content,
  uploadedAt: new Date().toISOString(),
});

// Returns data URL
return {
  fileUrl: `data:${file.mimetype};base64,${base64Content}`,
  storagePath,
};
```

### Delete
```typescript
// Deletes from Firestore
await firestore.collection('file_storage').doc(fileId).delete();
```

## Testing

1. **Restart backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Try uploading a resume** (must be < 1MB)

3. **Check Firestore Console**:
   - Go to Firestore Database
   - Look for `file_storage` collection
   - You should see your uploaded files

## Upgrading to Firebase Storage (Recommended)

When ready to use proper file storage:

### Option 1: Upgrade to Blaze Plan
1. Go to Firebase Console
2. Click "Upgrade project"
3. Set up billing
4. Enable Firebase Storage

### Option 2: Use Alternative Storage
- AWS S3
- Google Cloud Storage (direct)
- Cloudinary
- UploadThing

### Migration Steps

Once you have proper storage:

1. **Revert `backend/src/utils/storageHelper.ts`** to use Firebase Storage
2. **Migrate existing files**:
   ```typescript
   // Get all files from Firestore
   const files = await firestore.collection('file_storage').get();
   
   // Upload each to Storage
   for (const doc of files.docs) {
     const data = doc.data();
     const buffer = Buffer.from(data.content, 'base64');
     // Upload to Storage...
   }
   
   // Delete from Firestore
   ```

3. **Update file URLs** in Resume documents

## File Size Limits

With this temporary solution:
- **Maximum file size**: ~750KB (to stay under 1MB Firestore limit with metadata)
- **Recommended**: Keep resumes under 500KB

If users try to upload larger files, they'll get an error.

## Monitoring

Check Firestore usage:
```bash
# Firebase Console > Firestore Database > Usage tab
```

Watch for:
- Document count
- Storage size
- Read/write operations

## Cost Estimate

Firestore pricing (free tier):
- 50K reads/day
- 20K writes/day
- 1GB storage

For 100 resume uploads/day:
- ~100 writes (within free tier)
- Storage: ~50MB (within free tier)

## Next Steps

1. ✅ Test resume upload with small files (< 500KB)
2. ✅ Verify files appear in Firestore
3. ✅ Test resume download/viewing
4. ⏳ Plan migration to proper storage solution
5. ⏳ Upgrade to Blaze plan or use alternative storage

## Reverting This Change

To go back to Firebase Storage (after upgrading):

```bash
git diff backend/src/utils/storageHelper.ts
# Review changes
git checkout backend/src/utils/storageHelper.ts
# Restore original Storage implementation
```

---

**Status**: Temporary workaround active
**Recommended Action**: Upgrade to Blaze plan for production use

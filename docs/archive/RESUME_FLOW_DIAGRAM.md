# Resume Processing Flow

## Current Implementation (Firestore-Based Storage)

```
┌─────────────────────────────────────────────────────────────────┐
│                         RESUME UPLOAD                            │
└─────────────────────────────────────────────────────────────────┘

Client                    Backend                    Firestore
  │                         │                           │
  │  POST /upload          │                           │
  │  (multipart/form-data) │                           │
  ├────────────────────────>│                           │
  │                         │                           │
  │                         │  1. Validate file         │
  │                         │     - Type (PDF/DOCX)     │
  │                         │     - Size (< 10MB)       │
  │                         │                           │
  │                         │  2. Convert to base64     │
  │                         │                           │
  │                         │  3. Store in Firestore    │
  │                         ├──────────────────────────>│
  │                         │   file_storage/{uuid}     │
  │                         │   {                       │
  │                         │     content: base64,      │
  │                         │     mimeType: ...,        │
  │                         │     userId: ...,          │
  │                         │     storagePath: ...      │
  │                         │   }                       │
  │                         │<──────────────────────────┤
  │                         │                           │
  │                         │  4. Create resume doc     │
  │                         ├──────────────────────────>│
  │                         │   resumes/{resumeId}      │
  │                         │   {                       │
  │                         │     userId: ...,          │
  │                         │     fileName: ...,        │
  │                         │     fileUrl: data:...,    │
  │                         │     storagePath: ...      │
  │                         │   }                       │
  │                         │<──────────────────────────┤
  │                         │                           │
  │  Response: resumeId     │                           │
  │<────────────────────────┤                           │
  │                         │                           │


┌─────────────────────────────────────────────────────────────────┐
│                         RESUME PARSING                           │
└─────────────────────────────────────────────────────────────────┘

Client                    Backend                    Firestore
  │                         │                           │
  │  POST /parse           │                           │
  │  { resumeId }          │                           │
  ├────────────────────────>│                           │
  │                         │                           │
  │                         │  1. Get resume doc        │
  │                         ├──────────────────────────>│
  │                         │   resumes/{resumeId}      │
  │                         │<──────────────────────────┤
  │                         │   { storagePath, ... }    │
  │                         │                           │
  │                         │  2. Extract file ID       │
  │                         │     from storagePath      │
  │                         │                           │
  │                         │  3. Get file content      │
  │                         ├──────────────────────────>│
  │                         │   file_storage/{uuid}     │
  │                         │<──────────────────────────┤
  │                         │   { content: base64 }     │
  │                         │                           │
  │                         │  4. Convert to Buffer     │
  │                         │     Buffer.from(base64)   │
  │                         │                           │
  │                         │  5. Parse file            │
  │                         │     - Extract text        │
  │                         │     - Parse structure     │
  │                         │     - Extract skills      │
  │                         │     - Extract experience  │
  │                         │     - Extract education   │
  │                         │                           │
  │                         │  6. Create version        │
  │                         ├──────────────────────────>│
  │                         │   resumes/{resumeId}/     │
  │                         │   versions/{versionId}    │
  │                         │   {                       │
  │                         │     rawText: ...,         │
  │                         │     parsedData: {...},    │
  │                         │     version: 1            │
  │                         │   }                       │
  │                         │<──────────────────────────┤
  │                         │                           │
  │  Response: version data │                           │
  │<────────────────────────┤                           │
  │                         │                           │


┌─────────────────────────────────────────────────────────────────┐
│                         RESUME LISTING                           │
└─────────────────────────────────────────────────────────────────┘

Client                    Backend                    Firestore
  │                         │                           │
  │  GET /resumes          │                           │
  ├────────────────────────>│                           │
  │                         │                           │
  │                         │  1. Query resumes         │
  │                         ├──────────────────────────>│
  │                         │   WHERE userId == ...     │
  │                         │   ORDER BY uploadedAt     │
  │                         │<──────────────────────────┤
  │                         │   [resume1, resume2, ...] │
  │                         │                           │
  │                         │  2. For each resume:      │
  │                         │     Get versions          │
  │                         ├──────────────────────────>│
  │                         │   resumes/{id}/versions   │
  │                         │<──────────────────────────┤
  │                         │   [version1, version2]    │
  │                         │                           │
  │                         │  3. Combine data          │
  │                         │                           │
  │  Response: resumes[]    │                           │
  │  with versions[]        │                           │
  │<────────────────────────┤                           │
  │                         │                           │


┌─────────────────────────────────────────────────────────────────┐
│                         RESUME DELETION                          │
└─────────────────────────────────────────────────────────────────┘

Client                    Backend                    Firestore
  │                         │                           │
  │  DELETE /resume/:id    │                           │
  ├────────────────────────>│                           │
  │                         │                           │
  │                         │  1. Get resume doc        │
  │                         ├──────────────────────────>│
  │                         │<──────────────────────────┤
  │                         │   { storagePath, ... }    │
  │                         │                           │
  │                         │  2. Extract file ID       │
  │                         │                           │
  │                         │  3. Delete file           │
  │                         ├──────────────────────────>│
  │                         │   file_storage/{uuid}     │
  │                         │<──────────────────────────┤
  │                         │                           │
  │                         │  4. Delete versions       │
  │                         ├──────────────────────────>│
  │                         │   resumes/{id}/versions/* │
  │                         │<──────────────────────────┤
  │                         │                           │
  │                         │  5. Delete resume doc     │
  │                         ├──────────────────────────>│
  │                         │   resumes/{id}            │
  │                         │<──────────────────────────┤
  │                         │                           │
  │  Response: success      │                           │
  │<────────────────────────┤                           │
  │                         │                           │
```

## Data Structure

### Firestore Collections

```
firestore/
├── resumes/
│   └── {resumeId}/
│       ├── userId: string
│       ├── fileName: string
│       ├── fileUrl: string (data URL)
│       ├── storagePath: string
│       ├── uploadedAt: timestamp
│       └── versions/ (subcollection)
│           └── {versionId}/
│               ├── resumeId: string
│               ├── userId: string
│               ├── rawText: string
│               ├── parsedData: object
│               │   ├── skills: string[]
│               │   ├── experience: array
│               │   └── education: array
│               ├── aiSuggestions: string[] | null
│               ├── version: number
│               └── createdAt: timestamp
│
└── file_storage/
    └── {uuid}/
        ├── userId: string
        ├── originalName: string
        ├── mimeType: string
        ├── size: number
        ├── storagePath: string
        ├── content: string (base64)
        └── uploadedAt: string
```

## Future Implementation (Cloud Storage)

```
┌─────────────────────────────────────────────────────────────────┐
│                    AFTER BLAZE PLAN UPGRADE                      │
└─────────────────────────────────────────────────────────────────┘

Client              Backend           Cloud Storage      Firestore
  │                   │                     │                │
  │  POST /upload    │                     │                │
  ├─────────────────>│                     │                │
  │                   │  1. Upload file    │                │
  │                   ├────────────────────>│                │
  │                   │  bucket.file()     │                │
  │                   │  .save(buffer)     │                │
  │                   │<────────────────────┤                │
  │                   │  signed URL        │                │
  │                   │                     │                │
  │                   │  2. Create doc     │                │
  │                   ├────────────────────────────────────>│
  │                   │  resumes/{id}      │                │
  │                   │  { fileUrl: url }  │                │
  │                   │<────────────────────────────────────┤
  │                   │                     │                │
  │  Response        │                     │                │
  │<─────────────────┤                     │                │
  │                   │                     │                │
  │                   │                     │                │
  │  POST /parse     │                     │                │
  ├─────────────────>│                     │                │
  │                   │  1. Download file  │                │
  │                   ├────────────────────>│                │
  │                   │  bucket.file()     │                │
  │                   │  .download()       │                │
  │                   │<────────────────────┤                │
  │                   │  buffer            │                │
  │                   │                     │                │
  │                   │  2. Parse & save   │                │
  │                   ├────────────────────────────────────>│
  │                   │<────────────────────────────────────┤
  │                   │                     │                │
  │  Response        │                     │                │
  │<─────────────────┤                     │                │
  │                   │                     │                │

Benefits:
✅ No file size limit (up to 5TB)
✅ Better performance
✅ CDN integration
✅ Lower costs at scale
✅ Proper file storage solution
```

## Key Differences

| Feature | Current (Firestore) | Future (Cloud Storage) |
|---------|---------------------|------------------------|
| Max File Size | 10MB | 5TB |
| Storage Method | Base64 in documents | Binary in buckets |
| Performance | Slower for large files | Optimized |
| Cost | Higher at scale | Lower at scale |
| CDN | No | Yes |
| Plan Required | Spark (Free) | Blaze (Pay-as-you-go) |

## Migration Impact

- **Zero downtime**: Can migrate files gradually
- **Backward compatible**: Old files work during migration
- **Transparent to users**: No API changes required
- **Improved performance**: Faster file operations after migration

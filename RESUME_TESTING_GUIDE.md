# Resume Endpoints Testing Guide

## Quick Start

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```

### 2. Get Authentication Token
You need a valid Firebase authentication token. You can get one by:

**Option A: Sign in through the frontend**
```bash
# In another terminal
cd frontend
npm run dev
# Go to http://localhost:3000 and sign in
# Open browser console and run:
# localStorage.getItem('firebase:authUser:...')
```

**Option B: Use the test auth script**
```bash
cd backend
node src/scripts/test-firebase-connection.ts
```

### 3. Run Automated Tests
```bash
cd backend
TEST_AUTH_TOKEN=your_token_here npm run test:resume-endpoints
```

## Manual Testing with cURL

### Upload Resume
```bash
curl -X POST http://localhost:5000/api/candidate/resume/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@path/to/your/resume.pdf"
```

Expected Response:
```json
{
  "message": "Resume uploaded successfully",
  "resume": {
    "id": "abc123",
    "fileUrl": "data:application/pdf;base64,...",
    "fileName": "resume.pdf",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Parse Resume
```bash
curl -X POST http://localhost:5000/api/candidate/resume/parse \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resumeId": "abc123"}'
```

Expected Response:
```json
{
  "message": "Resume parsed successfully",
  "version": {
    "id": "version123",
    "resumeId": "abc123",
    "rawText": "Full resume text...",
    "parsedData": {
      "skills": ["JavaScript", "TypeScript", "Node.js"],
      "experience": [
        {
          "company": "Tech Corp",
          "title": "Software Engineer",
          "startDate": "2020",
          "endDate": "Present",
          "description": "..."
        }
      ],
      "education": [
        {
          "institution": "University",
          "degree": "Bachelor",
          "field": "Computer Science",
          "graduationDate": "2020"
        }
      ]
    },
    "version": 1,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### List All Resumes
```bash
curl http://localhost:5000/api/candidate/resumes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected Response:
```json
{
  "resumes": [
    {
      "id": "abc123",
      "userId": "user123",
      "fileName": "resume.pdf",
      "fileUrl": "data:application/pdf;base64,...",
      "storagePath": "resumes/user123/uuid.pdf",
      "uploadedAt": "2024-01-01T00:00:00.000Z",
      "versions": [
        {
          "id": "version123",
          "version": 1,
          "rawText": "...",
          "parsedData": { ... },
          "aiSuggestions": null,
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

### Delete Resume
```bash
curl -X DELETE http://localhost:5000/api/candidate/resume/abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected Response:
```json
{
  "message": "Resume deleted successfully"
}
```

## Testing with Postman

### Setup
1. Create a new collection "Resume Endpoints"
2. Add environment variable `baseUrl` = `http://localhost:5000/api`
3. Add environment variable `authToken` = your Firebase token

### Requests

#### 1. Upload Resume
- Method: POST
- URL: `{{baseUrl}}/candidate/resume/upload`
- Headers:
  - `Authorization: Bearer {{authToken}}`
- Body: form-data
  - Key: `resume` (type: File)
  - Value: Select your PDF/DOCX file

#### 2. Parse Resume
- Method: POST
- URL: `{{baseUrl}}/candidate/resume/parse`
- Headers:
  - `Authorization: Bearer {{authToken}}`
  - `Content-Type: application/json`
- Body: raw (JSON)
```json
{
  "resumeId": "{{resumeId}}"
}
```

#### 3. List Resumes
- Method: GET
- URL: `{{baseUrl}}/candidate/resumes`
- Headers:
  - `Authorization: Bearer {{authToken}}`

#### 4. Delete Resume
- Method: DELETE
- URL: `{{baseUrl}}/candidate/resume/{{resumeId}}`
- Headers:
  - `Authorization: Bearer {{authToken}}`

## Common Issues & Solutions

### Issue: "User not authenticated"
**Solution**: Make sure your Firebase token is valid and not expired. Tokens typically expire after 1 hour.

### Issue: "File not found in storage"
**Solution**: 
1. Check that the file was uploaded successfully
2. Verify the `storagePath` in the resume document
3. Check Firestore `file_storage` collection for the file

### Issue: "Invalid file type"
**Solution**: Only PDF and DOCX files are supported. Check the file extension and MIME type.

### Issue: "File size exceeds 10MB limit"
**Solution**: Current Firestore-based storage has a 10MB limit. Upgrade to Firebase Blaze plan for larger files.

### Issue: Parsing returns empty data
**Solution**: 
1. Check that the resume has a standard format
2. Verify the file is not corrupted
3. Check backend logs for parsing errors

## Monitoring & Debugging

### Check Backend Logs
```bash
# In the backend terminal, you'll see logs like:
# [INFO] Resume uploaded successfully { resumeId: 'abc123', userId: 'user123', fileName: 'resume.pdf' }
# [INFO] File downloaded from Firestore storage { storagePath: 'resumes/user123/uuid.pdf', fileId: 'uuid', bufferSize: 12345 }
# [INFO] Resume parsed successfully { storagePath: '...', skillsCount: 5, experienceCount: 2, educationCount: 1 }
```

### Check Firestore Collections
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Check collections:
   - `resumes` - Resume metadata
   - `resumes/{resumeId}/versions` - Parsed versions
   - `file_storage` - File content (base64)

### Check File Storage
```bash
# Query Firestore for a specific file
curl -X GET "https://firestore.googleapis.com/v1/projects/YOUR_PROJECT/databases/(default)/documents/file_storage/FILE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Performance Testing

### Test with Different File Sizes
```bash
# Small file (< 1MB)
curl -X POST http://localhost:5000/api/candidate/resume/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@small-resume.pdf"

# Medium file (1-5MB)
curl -X POST http://localhost:5000/api/candidate/resume/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@medium-resume.pdf"

# Large file (5-10MB)
curl -X POST http://localhost:5000/api/candidate/resume/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@large-resume.pdf"
```

### Measure Response Times
```bash
# Upload with timing
time curl -X POST http://localhost:5000/api/candidate/resume/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@resume.pdf"

# Parse with timing
time curl -X POST http://localhost:5000/api/candidate/resume/parse \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resumeId": "abc123"}'
```

## Next Steps

1. ✅ Test all endpoints with sample resumes
2. ✅ Verify parsing accuracy with different resume formats
3. ⚠️ Note the 10MB file size limitation
4. 📋 Plan upgrade to Firebase Blaze plan for:
   - Larger file support
   - Better performance
   - Cost efficiency
   - Proper Cloud Storage

See `RESUME_ENDPOINTS_FIX.md` for upgrade instructions.

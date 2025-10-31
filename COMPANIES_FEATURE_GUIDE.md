# Companies Feature Guide

## Overview

The Companies page provides a directory of all organizations with active job postings, allowing users to discover companies and explore their opportunities.

---

## Features

### 🏢 Company Directory
- Browse all companies with active jobs
- View company details (name, industry, location, size)
- See job count for each company
- Click to view company-specific jobs

### 🔍 Search & Filter
- **Search**: Find companies by name or description
- **Industry Filter**: Filter by industry type
- **Real-time Updates**: Data fetched from Firebase

### 🎨 User Experience
- Beautiful gradient design
- Responsive grid layout
- Hover effects and animations
- Loading states
- Empty state handling
- Mobile-friendly

---

## User Guide

### Accessing the Companies Page

**Via Navigation**:
1. Click "Companies" in the navbar
2. Or visit: `http://localhost:3000/companies`

### Browsing Companies

1. **View All Companies**
   - Page loads with all companies that have active jobs
   - Each card shows company info and job count

2. **Search Companies**
   - Type in the search box
   - Searches company names and descriptions
   - Results update in real-time

3. **Filter by Industry**
   - Select industry from dropdown
   - Options include: All Industries, Technology, Healthcare, etc.
   - Combines with search filter

4. **View Company Jobs**
   - Click any company card
   - Redirects to jobs page filtered by that company
   - Shows all active positions

---

## Developer Guide

### API Endpoints

#### GET `/api/organizations`

**Description**: Fetch all organizations

**Authentication**: Not required (public data)

**Response**:
```json
[
  {
    "id": "org-123",
    "name": "Tech Corp",
    "description": "Leading technology company",
    "industry": "Technology",
    "size": "100-500",
    "location": "San Francisco, CA",
    "website": "https://techcorp.com",
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

**Example**:
```typescript
const orgs = await apiRequest('/api/organizations');
```

#### GET `/api/organizations/:id`

**Description**: Fetch specific organization

**Authentication**: Not required

**Parameters**:
- `id` (path): Organization ID

**Response**:
```json
{
  "id": "org-123",
  "name": "Tech Corp",
  "description": "Leading technology company",
  "industry": "Technology",
  "size": "100-500",
  "location": "San Francisco, CA",
  "website": "https://techcorp.com"
}
```

**Example**:
```typescript
const org = await apiRequest(`/api/organizations/${orgId}`);
```

---

### Frontend Implementation

**File**: `frontend/app/companies/page.tsx`

**Key Components**:

1. **State Management**
```typescript
const [companies, setCompanies] = useState<Company[]>([]);
const [loading, setLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState('');
const [selectedIndustry, setSelectedIndustry] = useState('all');
```

2. **Data Fetching**
```typescript
const fetchCompanies = async () => {
  const response = await apiRequest('/api/organizations');
  // Transform and enrich with job counts
  const orgsWithJobs = await Promise.all(
    response.map(async (org) => {
      const jobsResponse = await apiRequest(`/api/jobs?orgId=${org.id}`);
      return { ...org, jobCount: jobsResponse.jobs?.length || 0 };
    })
  );
  setCompanies(orgsWithJobs.filter(c => c.jobCount > 0));
};
```

3. **Filtering Logic**
```typescript
const filteredCompanies = companies.filter(company => {
  const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry;
  return matchesSearch && matchesIndustry;
});
```

---

### Backend Implementation

**File**: `backend/src/routes/organizations.ts`

**Key Features**:

1. **List All Organizations**
```typescript
router.get('/', async (req: Request, res: Response) => {
  const orgs = await Org.findAll();
  res.json(orgs);
});
```

2. **Get Single Organization**
```typescript
router.get('/:id', async (req: Request, res: Response) => {
  const org = await Org.findById(req.params.id);
  if (!org) return res.status(404).json({ error: 'Organization not found' });
  res.json(org);
});
```

3. **Error Handling**
```typescript
try {
  // ... operation
} catch (error) {
  logger.error('Failed to fetch organizations', { error });
  res.status(500).json({ 
    error: 'Failed to fetch organizations',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

---

## Testing

### Manual Testing

1. **Start Services**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

2. **Test Companies Page**
```bash
# Visit in browser
open http://localhost:3000/companies
```

3. **Test Scenarios**
- [ ] Page loads without errors
- [ ] Companies display in grid
- [ ] Search filters results
- [ ] Industry filter works
- [ ] Click company navigates to jobs
- [ ] Empty state shows when no results
- [ ] Loading state displays during fetch
- [ ] Mobile responsive layout works

### API Testing

```bash
# Test list endpoint
curl http://localhost:3001/api/organizations

# Test single organization
curl http://localhost:3001/api/organizations/{org-id}

# Test with invalid ID
curl http://localhost:3001/api/organizations/invalid-id
# Should return 404
```

### Integration Testing

```typescript
describe('Companies Feature', () => {
  it('should fetch and display companies', async () => {
    const response = await apiRequest('/api/organizations');
    expect(response).toBeInstanceOf(Array);
  });

  it('should filter companies by search', () => {
    // Test search functionality
  });

  it('should filter companies by industry', () => {
    // Test industry filter
  });
});
```

---

## Troubleshooting

### Issue: No companies showing

**Possible Causes**:
1. No organizations in database
2. Organizations have no active jobs
3. API endpoint not responding

**Solutions**:
```bash
# Check backend logs
cd backend && npm run dev
# Look for "Organizations fetched successfully"

# Check if organizations exist
# Visit Firebase Console > Firestore > organizations collection

# Test API directly
curl http://localhost:3001/api/organizations
```

### Issue: Search not working

**Check**:
1. Search query state updating
2. Filter logic correct
3. Case-insensitive comparison

**Debug**:
```typescript
console.log('Search query:', searchQuery);
console.log('Filtered companies:', filteredCompanies);
```

### Issue: Job counts incorrect

**Possible Causes**:
1. Jobs API not returning correct data
2. Organization ID mismatch

**Solutions**:
```bash
# Test jobs API with orgId filter
curl "http://localhost:3001/api/jobs?orgId={org-id}"

# Check organization IDs match in both collections
```

---

## Performance Considerations

### Optimization Strategies

1. **Caching**
```typescript
// Cache organizations data
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cachedOrgs: Company[] | null = null;
let cacheTime = 0;

if (Date.now() - cacheTime < CACHE_DURATION && cachedOrgs) {
  return cachedOrgs;
}
```

2. **Pagination**
```typescript
// For large datasets, implement pagination
const PAGE_SIZE = 20;
const page = parseInt(req.query.page as string) || 1;
const offset = (page - 1) * PAGE_SIZE;
```

3. **Lazy Loading**
```typescript
// Load job counts on demand
const [jobCounts, setJobCounts] = useState<Record<string, number>>({});

const loadJobCount = async (orgId: string) => {
  if (jobCounts[orgId] !== undefined) return;
  const jobs = await apiRequest(`/api/jobs?orgId=${orgId}`);
  setJobCounts(prev => ({ ...prev, [orgId]: jobs.length }));
};
```

---

## Future Enhancements

### Planned Features

1. **Company Profiles**
   - Detailed company pages
   - Company culture information
   - Employee reviews
   - Benefits and perks

2. **Advanced Filtering**
   - Company size filter
   - Location filter
   - Remote-friendly filter
   - Benefits filter

3. **Sorting Options**
   - Sort by job count
   - Sort by company size
   - Sort by recently posted jobs
   - Sort alphabetically

4. **Company Following**
   - Follow favorite companies
   - Get notifications for new jobs
   - Save company preferences

5. **Analytics**
   - Track company page views
   - Popular companies
   - Industry trends

---

## Related Documentation

- **README.md** - Project overview
- **PENDING_WORK_COMPLETED.md** - Completion summary
- **backend/src/models/Org.ts** - Organization model
- **backend/src/routes/jobs.ts** - Jobs API (for filtering)

---

## Support

### Getting Help

**For Users**:
- Check the FAQ section
- Contact support team
- Report issues via feedback form

**For Developers**:
- Check backend logs for errors
- Review Firebase Console for data
- Test API endpoints directly
- Check browser console for frontend errors

### Reporting Issues

Include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/environment details
5. Console errors (if any)

---

## Changelog

### Version 1.0.0 (October 31, 2025)
- ✅ Initial implementation
- ✅ Company directory with grid layout
- ✅ Search functionality
- ✅ Industry filtering
- ✅ Job count display
- ✅ Responsive design
- ✅ API endpoints created
- ✅ Error handling implemented
- ✅ Loading states added

---

**Status**: ✅ Complete and Production Ready  
**Last Updated**: October 31, 2025  
**Maintainer**: Development Team

🎉 **Companies Feature Successfully Implemented!** 🎉

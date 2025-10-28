# Adzuna Integration - Quick Start Guide

## 🚀 Get Started in 2 Ways

### Option 1: Integrated Search (Recommended)

1. Navigate to: `http://localhost:3000/jobs`
2. Enter a job title in the search filters (e.g., "developer")
3. Click the **"External Jobs (Adzuna)"** tab
4. Browse thousands of real jobs from across India!

### Option 2: Dedicated Page

## 🚀 Get Started in 3 Steps

### Step 1: Verify Environment Variables

The Adzuna API credentials are already configured in `backend/.env`:

```env
ADZUNA_APP_ID=4c8fcee3
ADZUNA_APP_KEY=1bde55fe7193f2afb4f0e4ab46534e2b
```

✅ No additional configuration needed!

### Step 2: Start the Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

Wait for both servers to start:
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`

### Step 3: Test the Integration

Open your browser and navigate to:
```
http://localhost:3000/adzuna
```

Or click **"Job Search"** in the navigation menu.

## 🔍 Try These Searches

1. **Search for Developers:**
   - Keyword: `developer`
   - Location: `bangalore`
   - Click "Search Jobs"

2. **Search for Designers:**
   - Keyword: `designer`
   - Location: `mumbai`
   - Click "Search Jobs"

3. **Search for Remote Jobs:**
   - Keyword: `remote software engineer`
   - Location: (leave empty)
   - Click "Search Jobs"

## ✨ What You'll See

Each job listing displays:
- ✅ Job title
- ✅ Company name
- ✅ Location
- ✅ Salary range (if available)
- ✅ Job description (first 200 characters)
- ✅ Job category and contract type
- ✅ Posted date
- ✅ "Apply Now" button (opens job in new tab)

## 🧪 Test the Backend API Directly

You can also test the backend proxy directly using curl:

```bash
# Search for jobs
curl "http://localhost:3001/api/adzuna/search?what=developer&where=bangalore&results_per_page=5"

# Get job categories
curl "http://localhost:3001/api/adzuna/categories"
```

## 📱 Features to Test

- ✅ **Search Functionality**: Enter keywords and locations
- ✅ **Pagination**: Navigate through multiple pages of results
- ✅ **Responsive Design**: Resize browser to test mobile view
- ✅ **Loading States**: Watch the spinner during searches
- ✅ **Error Handling**: Try searching without a keyword
- ✅ **External Links**: Click "Apply Now" to visit job postings

## 🎯 Navigation

The Adzuna search is accessible from:
1. Direct URL: `/adzuna`
2. Navigation menu: "Job Search" link
3. Mobile menu: "Job Search" option

## 🔧 Troubleshooting

**Backend not starting?**
```bash
cd backend
npm install
npm run dev
```

**Frontend not starting?**
```bash
cd frontend
npm install
npm run dev
```

**No results showing?**
- Check that both servers are running
- Open browser console (F12) for error messages
- Verify backend logs for API errors

**CORS errors?**
- Ensure `FRONTEND_URL=http://localhost:3000` in `backend/.env`
- Restart the backend server

## 📊 Expected Results

- **Search Speed**: Results appear within 1-2 seconds
- **Results Per Page**: 10 jobs per page
- **Total Results**: Varies by search (typically hundreds to thousands)
- **Pagination**: Smooth navigation between pages

## 🎨 UI Features

- Clean, professional card layout
- Proper spacing and typography
- Hover effects on cards and buttons
- Responsive design for all screen sizes
- Loading spinners during API calls
- Clear error messages

## 🔐 Security

- ✅ API credentials stored in backend only
- ✅ Frontend never exposes API keys
- ✅ CORS protection enabled
- ✅ Rate limiting on API requests
- ✅ Error messages don't expose sensitive data

## 📝 Next Steps

After testing the basic integration, you can:

1. **Customize the UI**: Modify `frontend/components/adzuna/AdzunaJobSearch.tsx`
2. **Add Filters**: Extend the search form with additional filters
3. **Integrate with Auth**: Require login to search jobs
4. **Save Searches**: Allow users to save favorite searches
5. **Track Applications**: Link Adzuna jobs to your application system

## 📚 Documentation

For more details, see:
- `ADZUNA_INTEGRATION.md` - Complete integration documentation
- Backend route: `backend/src/routes/adzuna.ts`
- Frontend component: `frontend/components/adzuna/AdzunaJobSearch.tsx`

## 🎉 Success!

If you can search for jobs and see results, the integration is working perfectly!

Enjoy your new job search feature powered by Adzuna! 🚀

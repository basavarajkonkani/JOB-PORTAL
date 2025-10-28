# Adzuna Job Search API Integration

This document describes the integration of the Adzuna Job Search API into the AI Job Portal.

## Overview

The Adzuna integration provides real-time job search functionality, allowing users to search thousands of jobs from across India. The integration includes:

- **Backend Proxy**: Secure API proxy to handle Adzuna API calls
- **Frontend Search Interface**: Clean, professional UI for job searching
- **Real-time Results**: Dynamic job listings with pagination

## Features

### Search Capabilities
- Search by job title or keywords (e.g., "developer", "designer")
- Filter by location (e.g., "Bangalore", "Mumbai")
- Display 10 results per page with pagination
- Real-time search results

### Job Information Displayed
- Job title
- Company name
- Location
- Salary range (with estimated indicator if predicted)
- Job description (truncated to 200 characters)
- Job category and contract type
- Posted date (relative format)
- "Apply Now" button with external link

## API Configuration

### Environment Variables

Add these to your `backend/.env` file:

```env
ADZUNA_APP_ID=4c8fcee3
ADZUNA_APP_KEY=1bde55fe7193f2afb4f0e4ab46534e2b
```

### API Endpoints

#### Backend Routes

**Search Jobs**
```
GET /api/adzuna/search
Query Parameters:
  - what: job title or keywords (optional)
  - where: location (optional)
  - results_per_page: number of results (default: 10, max: 50)
  - page: page number (default: 1)
```

**Get Categories**
```
GET /api/adzuna/categories
Returns available job categories
```

## File Structure

```
backend/
  src/
    routes/
      adzuna.ts          # Backend proxy routes

frontend/
  app/
    adzuna/
      page.tsx           # Adzuna search page
  components/
    adzuna/
      AdzunaJobSearch.tsx # Search component
```

## Usage

### Accessing External Jobs

The Adzuna integration is now available in two ways:

1. **Main Jobs Page** (Recommended): Navigate to `/jobs` and click the "External Jobs (Adzuna)" tab
2. **Dedicated Page**: Navigate to `/adzuna` or click "Job Search" in the navigation menu

### Searching for Jobs

1. Go to the `/jobs` page
2. Enter a job title or keyword in the filters (required for Adzuna)
3. Optionally enter a location
4. Click the "External Jobs (Adzuna)" tab
5. Browse results and click "Apply Now" to visit the job posting

### Pagination

- Use "Previous" and "Next" buttons to navigate through results
- Current page number is displayed
- Pagination automatically disabled when no more results available

## Security Features

- API credentials stored securely in environment variables
- Backend proxy prevents credential exposure to frontend
- CORS protection enabled
- Rate limiting on API requests
- Error handling for API failures

## Error Handling

The integration handles various error scenarios:

- **Rate Limiting**: Returns 429 status with user-friendly message
- **Authentication Errors**: Returns 500 status without exposing credentials
- **Network Errors**: Returns 500 status with generic error message
- **Empty Results**: Displays "No jobs found" message with suggestions

## UI/UX Features

- **Responsive Design**: Works on mobile, tablet, and desktop
- **Loading States**: Shows spinner during API calls
- **Error Messages**: Clear error feedback to users
- **Professional Layout**: Card-based design with proper spacing
- **Accessibility**: Semantic HTML and ARIA labels
- **Visual Feedback**: Hover effects and transitions

## Testing

### Manual Testing

1. Start the backend server:
   ```bash
   npm run dev:backend
   ```

2. Start the frontend server:
   ```bash
   npm run dev:frontend
   ```

3. Navigate to `http://localhost:3000/adzuna`

4. Test various search scenarios:
   - Search with keyword only
   - Search with keyword and location
   - Test pagination
   - Test error handling (invalid searches)

### API Testing

Test the backend proxy directly:

```bash
# Search for developer jobs
curl "http://localhost:3001/api/adzuna/search?what=developer&results_per_page=5"

# Search with location
curl "http://localhost:3001/api/adzuna/search?what=designer&where=bangalore"

# Get categories
curl "http://localhost:3001/api/adzuna/categories"
```

## Performance Considerations

- API requests timeout after 10 seconds
- Results cached on client side during pagination
- Minimal re-renders using React state management
- Optimized image loading with lazy loading

## Future Enhancements

Potential improvements for the integration:

1. **Advanced Filters**: Add salary range, contract type, and category filters
2. **Saved Searches**: Allow users to save and manage search queries
3. **Job Alerts**: Email notifications for new matching jobs
4. **Favorites**: Save jobs for later review
5. **Application Tracking**: Track applications made through Adzuna
6. **Analytics**: Track popular searches and job categories
7. **Caching**: Implement Redis caching for frequently searched terms

## Troubleshooting

### Common Issues

**Issue**: "Failed to fetch jobs"
- **Solution**: Check that backend server is running and environment variables are set

**Issue**: CORS errors
- **Solution**: Verify FRONTEND_URL in backend .env matches your frontend URL

**Issue**: "API authentication failed"
- **Solution**: Verify ADZUNA_APP_ID and ADZUNA_APP_KEY are correct

**Issue**: No results returned
- **Solution**: Try broader search terms or different locations

## API Limits

Adzuna API has the following limits:
- Free tier: Limited requests per month
- Rate limiting may apply
- Maximum 50 results per page

## Support

For issues or questions:
1. Check the Adzuna API documentation: https://developer.adzuna.com/
2. Review backend logs for error details
3. Check browser console for frontend errors

## License

This integration uses the Adzuna API under their terms of service.

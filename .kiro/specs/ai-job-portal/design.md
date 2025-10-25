# Design Document

## Overview

The AI-Integrated Job Portal is a full-stack web application built with a modern architecture that separates concerns between presentation, business logic, and data persistence. The system integrates with Pollinations API for AI-powered text and image generation, providing candidates with personalized job recommendations and application assistance, while helping recruiters create compelling job descriptions and identify top candidates.

### Technology Stack

- **Frontend**: React with TypeScript, Next.js for SSR/SSG, TailwindCSS for styling
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL for relational data, Redis for caching
- **AI Integration**: Pollinations API (text and image endpoints)
- **Authentication**: JWT-based auth with refresh tokens
- **File Storage**: S3-compatible object storage for resume files
- **Analytics**: Event tracking pipeline (e.g., Mixpanel or custom)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  (Next.js SSR/CSR, React Components, TailwindCSS)           │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTPS/REST
┌─────────────────▼───────────────────────────────────────────┐
│                      API Gateway Layer                       │
│         (Express Router, Auth Middleware, Rate Limiting)     │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┴──────────┬──────────────┬─────────────┐
        │                    │              │             │
┌───────▼────────┐  ┌────────▼──────┐  ┌───▼──────┐  ┌──▼────────┐
│  Job Service   │  │ User Service  │  │AI Service│  │Analytics  │
│                │  │               │  │          │  │Service    │
└───────┬────────┘  └────────┬──────┘  └───┬──────┘  └──┬────────┘
        │                    │              │            │
        └────────────┬───────┴──────────────┘            │
                     │                                   │
        ┌────────────▼────────────┐         ┌────────────▼────────┐
        │   PostgreSQL Database   │         │   Analytics Store   │
        │  (Users, Jobs, Apps)    │         │   (Events, Metrics) │
        └─────────────────────────┘         └─────────────────────┘
                     │
        ┌────────────▼────────────┐
        │     Redis Cache         │
        │  (Sessions, AI Results) │
        └─────────────────────────┘

External Services:
┌──────────────────────┐         ┌──────────────────────┐
│  Pollinations API    │         │   S3 Object Storage  │
│  (Text & Images)     │         │   (Resume Files)     │
└──────────────────────┘         └──────────────────────┘
```

### Design Principles

1. **Server-Side AI Execution**: All Pollinations API calls happen server-side to protect API access and enable caching
2. **Optimistic UI**: Frontend shows immediate feedback while AI operations complete asynchronously
3. **Graceful Degradation**: System remains functional when AI services are unavailable
4. **Deterministic AI**: Use fixed seeds and temperatures for reproducible results
5. **Privacy-First**: Minimal PII storage, server-side processing, clear consent flows

## Components and Interfaces

### Frontend Components

#### Core Layout Components

- **AppShell**: Main layout wrapper with navigation, AI copilot panel, and content area
- **Navigation**: Role-based navigation (candidate vs recruiter views)
- **AICopilotPanel**: Collapsible side panel showing AI suggestions and actions

#### Candidate Components

- **JobSearchPage**: Search filters, results grid, pagination
- **JobDetailPage**: Job info, AI fit summary, apply button, hero image
- **ResumeBuilder**: Upload interface, parsed data editor, AI suggestions
- **ApplicationsTracker**: Timeline view of applications with status and notes
- **CandidateDashboard**: Recommended jobs, recent activity, profile completion

#### Recruiter Components

- **RecruiterDashboard**: Open roles, pipeline summary, quick actions
- **JDWizard**: Multi-step form for job creation with AI assistance
- **CandidateShortlist**: Ranked applicants with AI rationale and screening questions
- **JobManagement**: Edit/close jobs, view applicant pipeline

#### Shared Components

- **AuthForms**: Sign in, sign up, password reset
- **LoadingStates**: Skeletons, spinners, progress indicators
- **ErrorBoundary**: Graceful error handling with fallback UI
- **ImageWithFallback**: Pollinations image with placeholder on failure

### Backend Services

#### User Service

**Responsibilities**: Authentication, user management, profile CRUD

**Key Methods**:
- `createUser(email, password, role)`: Create new user account
- `authenticateUser(email, password)`: Validate credentials, return JWT
- `getUserProfile(userId)`: Fetch user and associated profile data
- `updateCandidateProfile(userId, profileData)`: Update candidate profile
- `updateRecruiterProfile(userId, orgId)`: Update recruiter profile

**Database Tables**: `users`, `candidate_profiles`, `recruiter_profiles`, `orgs`

#### Job Service

**Responsibilities**: Job CRUD, search, filtering, application management

**Key Methods**:
- `searchJobs(filters, pagination)`: Query jobs with filters and pagination
- `getJobDetail(jobId, userId?)`: Fetch job with optional user context
- `createJob(recruiterId, jobData)`: Create new job posting
- `updateJob(jobId, recruiterId, jobData)`: Update existing job
- `submitApplication(jobId, userId, resumeVersionId, coverLetter)`: Create application
- `getApplications(userId)`: Fetch candidate's applications
- `getCandidatesForJob(jobId, recruiterId)`: Fetch applicants for a job

**Database Tables**: `jobs`, `applications`

#### Resume Service

**Responsibilities**: Resume upload, parsing, version management

**Key Methods**:
- `uploadResume(userId, file)`: Store file in S3, return file URL
- `parseResume(fileUrl)`: Extract text and structured data from PDF/DOCX
- `saveResumeVersion(userId, parsedData)`: Create new resume version
- `getResumeVersions(userId)`: Fetch all versions for a user
- `getResumeVersion(versionId)`: Fetch specific version

**Database Tables**: `resumes`, `resume_versions`

**External Dependencies**: S3 storage, PDF parsing library (pdf-parse), DOCX parsing library (mammoth)

#### AI Service

**Responsibilities**: Pollinations API integration, prompt engineering, caching

**Key Methods**:
- `generateText(systemPrompt, userPrompt, options)`: Call Pollinations text API
- `generateImage(prompt, options)`: Construct Pollinations image URL
- `generateFitSummary(jobData, candidateProfile)`: Create job fit analysis
- `generateCoverLetter(jobData, candidateProfile)`: Create tailored cover letter
- `improveResumeBullets(bullets)`: Enhance resume content for ATS
- `generateJD(notes)`: Create structured job description from notes
- `rankCandidates(jobData, applications)`: Score and rank applicants
- `generateScreeningQuestions(jobData, candidateProfile)`: Create interview questions

**Caching Strategy**:
- Cache image URLs by prompt hash (24 hour TTL)
- Cache text results by prompt hash (1 hour TTL)
- Invalidate on user request or parameter change

**Pollinations Integration**:

Text API format:
```
https://text.pollinations.ai/{model}?temperature={temp}&system={system}&prompt={prompt}
```

Image API format:
```
https://image.pollinations.ai/prompt/{encoded_prompt}?width={w}&height={h}&seed={seed}&nologo=true
```

**Error Handling**:
- Retry with exponential backoff (max 3 attempts)
- Return cached result if available
- Return error object with fallback suggestions

#### Analytics Service

**Responsibilities**: Event tracking, metric calculation, reporting

**Key Methods**:
- `trackEvent(userId, eventType, properties)`: Log user event
- `trackAIUsage(userId, operation, accepted)`: Log AI interaction
- `calculateD1Activation()`: Compute activation rate
- `calculateApplyConversion()`: Compute conversion rate
- `getRecruiterVelocity(recruiterId)`: Calculate time-to-publish metrics

**Database Tables**: `events`, `metrics_cache`

### API Endpoints

#### Public Endpoints

- `POST /api/auth/signup`: Create new user account
- `POST /api/auth/signin`: Authenticate and return JWT
- `POST /api/auth/refresh`: Refresh access token
- `GET /api/jobs`: Search and list jobs (public, no auth required)
- `GET /api/jobs/:id`: Get job detail (public, no auth required)

#### Candidate Endpoints (Auth Required)

- `GET /api/candidate/profile`: Get candidate profile
- `PUT /api/candidate/profile`: Update candidate profile
- `POST /api/candidate/resume/upload`: Upload resume file
- `POST /api/candidate/resume/parse`: Parse uploaded resume
- `GET /api/candidate/resumes`: List resume versions
- `POST /api/applications`: Submit job application
- `GET /api/applications`: List user's applications
- `PUT /api/applications/:id`: Update application notes/status

#### Recruiter Endpoints (Auth Required)

- `POST /api/recruiter/jobs`: Create new job posting
- `PUT /api/recruiter/jobs/:id`: Update job posting
- `DELETE /api/recruiter/jobs/:id`: Close/delete job posting
- `GET /api/recruiter/jobs/:id/candidates`: Get applicants for job
- `GET /api/recruiter/dashboard`: Get dashboard summary

#### AI Endpoints (Auth Required)

- `POST /api/ai/fit-summary`: Generate job fit analysis
- `POST /api/ai/cover-letter`: Generate tailored cover letter
- `POST /api/ai/resume-improve`: Get resume improvement suggestions
- `POST /api/ai/jd-generate`: Generate job description from notes
- `POST /api/ai/shortlist`: Rank candidates with rationale
- `POST /api/ai/screening-questions`: Generate interview questions
- `POST /api/ai/image`: Generate Pollinations image URL

#### Analytics Endpoints (Auth Required)

- `POST /api/analytics/event`: Track user event
- `GET /api/analytics/metrics`: Get aggregated metrics (admin only)

## Data Models

### User

```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'candidate' | 'recruiter' | 'admin';
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### CandidateProfile

```typescript
interface CandidateProfile {
  userId: string;
  location: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  preferences: {
    roles: string[];
    locations: string[];
    remoteOnly: boolean;
    minCompensation?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Experience {
  company: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: Date;
}
```

### Resume

```typescript
interface Resume {
  id: string;
  userId: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: Date;
}

interface ResumeVersion {
  id: string;
  resumeId: string;
  userId: string;
  rawText: string;
  parsedData: {
    skills: string[];
    experience: Experience[];
    education: Education[];
  };
  aiSuggestions?: string[];
  version: number;
  createdAt: Date;
}
```

### Job

```typescript
interface Job {
  id: string;
  orgId: string;
  createdBy: string; // recruiter userId
  title: string;
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote: boolean;
  description: string;
  requirements: string[];
  compensation: {
    min?: number;
    max?: number;
    currency: string;
    equity?: string;
  };
  benefits: string[];
  heroImageUrl?: string;
  status: 'draft' | 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}
```

### Application

```typescript
interface Application {
  id: string;
  jobId: string;
  userId: string;
  resumeVersionId: string;
  coverLetter: string;
  status: 'submitted' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  notes: string;
  aiScore?: number;
  aiRationale?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Org

```typescript
interface Org {
  id: string;
  name: string;
  website?: string;
  logoUrl?: string;
  recruiters: string[]; // array of user IDs
  createdAt: Date;
  updatedAt: Date;
}
```

### AICopilotResponse

```typescript
interface AICopilotResponse {
  summary: string;
  items?: string[];
  actions?: Action[];
  toolCalls?: ToolCall[];
}

interface Action {
  label: string;
  type: 'primary' | 'secondary';
  handler: string; // function name to call
}

interface ToolCall {
  tool: 'pollinations-text' | 'pollinations-image';
  params: Record<string, any>;
}
```

## Error Handling

### Error Types

```typescript
enum ErrorCode {
  // Auth errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  
  // External service errors
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: any;
  fallback?: any; // cached result or alternative action
}
```

### Error Handling Strategy

1. **Validation Errors**: Return 400 with specific field errors
2. **Auth Errors**: Return 401/403 with clear message, redirect to login
3. **Not Found**: Return 404 with suggestions for similar resources
4. **AI Service Errors**: Return 503 with cached result if available, otherwise fallback UI
5. **Rate Limiting**: Return 429 with retry-after header
6. **Server Errors**: Return 500, log full stack trace, show generic message to user

### Graceful Degradation

- **AI Text Unavailable**: Show manual input field with helper text
- **AI Image Unavailable**: Show default placeholder or gradient background
- **Resume Parsing Fails**: Allow manual profile entry
- **Search Fails**: Show cached results with warning banner

## Testing Strategy

### Unit Tests

**Coverage Target**: 80% for business logic

**Focus Areas**:
- Service methods (User, Job, Resume, AI services)
- Utility functions (prompt builders, parsers, validators)
- Data transformations and formatters

**Tools**: Jest, ts-jest

### Integration Tests

**Focus Areas**:
- API endpoint flows (auth → profile → job search → apply)
- Database operations (CRUD, transactions, constraints)
- External service mocking (Pollinations API, S3)

**Tools**: Jest, Supertest, testcontainers for PostgreSQL

### End-to-End Tests

**Critical Paths**:
1. Candidate onboarding: signup → upload resume → view profile
2. Job application: search → view detail → apply with AI cover letter
3. Recruiter JD creation: login → create job with AI → publish
4. Shortlist generation: view applicants → request AI ranking

**Tools**: Playwright or Cypress

### Performance Tests

**Scenarios**:
- Concurrent job searches (100 users)
- AI service load (50 simultaneous requests)
- Database query performance (complex joins, large result sets)

**Targets**:
- API response time p95 < 1s
- Page load time p95 < 2s
- AI response time p95 < 5s

**Tools**: k6 or Artillery

### Accessibility Tests

**Requirements**:
- Automated WCAG 2.1 AA checks
- Keyboard navigation testing
- Screen reader compatibility

**Tools**: axe-core, Pa11y, manual testing with NVDA/JAWS

## Security Considerations

### Authentication & Authorization

- JWT access tokens (15 min expiry) + refresh tokens (7 day expiry)
- Role-based access control (candidate, recruiter, admin)
- Password hashing with bcrypt (cost factor 12)
- Rate limiting on auth endpoints (5 attempts per 15 min)

### Data Protection

- Encrypt PII at rest (database encryption)
- HTTPS only for all traffic
- Secure cookie flags (httpOnly, secure, sameSite)
- Input sanitization and validation on all endpoints
- SQL injection prevention (parameterized queries)
- XSS prevention (React auto-escaping, CSP headers)

### Privacy

- Minimal PII collection (only what's needed)
- Clear consent for resume parsing and AI processing
- User data export capability (GDPR compliance)
- User data deletion capability (right to be forgotten)
- No sharing of candidate data with third parties

### API Security

- Server-side Pollinations API calls only (no client-side keys)
- Rate limiting per user (100 req/min) and per IP (500 req/min)
- Request size limits (10MB for file uploads, 1MB for JSON)
- CORS configuration (whitelist allowed origins)

## Deployment Architecture

### Infrastructure

- **Frontend**: Vercel or AWS Amplify (Next.js optimized)
- **Backend**: AWS ECS or Railway (containerized Node.js)
- **Database**: AWS RDS PostgreSQL (Multi-AZ for production)
- **Cache**: AWS ElastiCache Redis
- **Storage**: AWS S3 for resume files
- **CDN**: CloudFront for static assets and images

### Environments

1. **Development**: Local Docker Compose setup
2. **Staging**: Mirrors production, uses separate database
3. **Production**: Auto-scaling, monitoring, backups

### CI/CD Pipeline

1. Code push → GitHub Actions trigger
2. Run linting, type checking, unit tests
3. Build Docker image
4. Run integration tests
5. Deploy to staging
6. Run E2E tests on staging
7. Manual approval gate
8. Deploy to production
9. Run smoke tests

### Monitoring & Observability

- **Application Monitoring**: Datadog or New Relic
- **Error Tracking**: Sentry
- **Logging**: CloudWatch Logs or Papertrail
- **Uptime Monitoring**: Pingdom or UptimeRobot
- **Metrics**: Custom dashboard for business KPIs

### Backup & Disaster Recovery

- Database automated backups (daily, 30 day retention)
- Point-in-time recovery enabled
- S3 versioning for resume files
- Disaster recovery plan with 4-hour RTO, 1-hour RPO

## Performance Optimization

### Frontend

- Code splitting by route
- Image optimization (Next.js Image component)
- Lazy loading for below-fold content
- Service worker for offline capability (progressive enhancement)
- Bundle size budget (< 200KB initial JS)

### Backend

- Database connection pooling
- Query optimization (indexes on foreign keys, search fields)
- Redis caching for:
  - User sessions (30 min TTL)
  - Job search results (5 min TTL)
  - AI responses (1 hour TTL for text, 24 hour for images)
- Pagination for large result sets
- Background jobs for non-critical tasks (analytics, emails)

### AI Service

- Prompt caching by hash
- Batch requests where possible
- Timeout limits (10s for text, 30s for images)
- Circuit breaker pattern for external API calls

## Accessibility Implementation

### WCAG 2.1 AA Compliance

- Minimum contrast ratio 4.5:1 for normal text, 3:1 for large text
- All interactive elements keyboard accessible (tab order, focus management)
- ARIA labels for icon buttons and complex widgets
- Skip navigation links
- Form labels and error messages properly associated
- Alt text for all images (including AI-generated)
- No content that flashes more than 3 times per second

### Keyboard Navigation

- Tab order follows visual flow
- Focus indicators visible and high contrast
- Escape key closes modals and dropdowns
- Arrow keys for navigation in lists and menus
- Enter/Space for button activation

### Screen Reader Support

- Semantic HTML (nav, main, article, aside)
- ARIA landmarks for page regions
- Live regions for dynamic content updates (AI responses, form errors)
- Descriptive link text (no "click here")
- Table headers properly associated with data cells

## SEO Strategy

### Technical SEO

- Server-side rendering for public pages (job listings, job detail)
- Semantic HTML with proper heading hierarchy
- Meta tags (title, description, og:tags) for each page
- Structured data (JSON-LD) for job postings (schema.org/JobPosting)
- XML sitemap for job listings
- Robots.txt configuration
- Canonical URLs to prevent duplicate content

### Content SEO

- Descriptive page titles (< 60 chars)
- Compelling meta descriptions (< 160 chars)
- Clean URLs (e.g., /jobs/senior-software-engineer-remote)
- Internal linking between related jobs
- Fast page load times (Core Web Vitals)

## Future Considerations

### Scalability

- Horizontal scaling for API servers
- Read replicas for database
- Sharding strategy for multi-tenant growth
- CDN for global distribution

### Feature Extensibility

- Plugin architecture for additional AI providers
- Webhook system for third-party integrations
- GraphQL API for flexible data fetching
- Mobile app (React Native code sharing)

### Advanced AI Features

- Fine-tuned models for domain-specific tasks
- Conversation history for multi-turn AI interactions
- A/B testing framework for prompt optimization
- User feedback loop for AI quality improvement

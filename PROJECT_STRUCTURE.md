# AI Job Portal - Clean Project Structure

## 📁 Root Directory
```
jobportal/
├── frontend/          # Next.js frontend application
├── backend/           # Express.js backend API
├── monitoring/        # Monitoring configuration (optional)
├── scripts/           # Deployment scripts
├── .github/           # GitHub Actions CI/CD
├── docker-compose.yml # Docker configuration
└── README.md          # Project documentation
```

## 🎨 Frontend Structure
```
frontend/
├── app/                      # Next.js 13+ App Router
│   ├── page.tsx             # Home page
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles
│   ├── jobs/                # Jobs pages
│   ├── companies/           # Companies pages
│   ├── services/            # Services pages
│   ├── employers/           # Employers pages
│   ├── dashboard/           # Dashboard pages
│   ├── applications/        # Applications pages
│   ├── resume/              # Resume pages
│   ├── signin/              # Sign in page
│   └── signup/              # Sign up page
│
├── components/              # React components
│   ├── layout/             # Layout components (Navbar, Footer)
│   ├── auth/               # Authentication components
│   ├── jobs/               # Job-related components
│   ├── applications/       # Application tracking
│   ├── resume/             # Resume builder
│   ├── profile/            # User profiles
│   ├── dashboard/          # Dashboard components
│   ├── recruiter/          # Recruiter features
│   ├── notifications/      # Notification system
│   ├── onboarding/         # User onboarding
│   ├── adzuna/             # Adzuna API integration
│   └── ai/                 # AI features
│
├── lib/                     # Utility libraries
│   ├── firebase.ts         # Firebase configuration
│   ├── auth-context.tsx    # Authentication context
│   ├── api-client.ts       # API client
│   ├── api-error-handler.ts # Error handling
│   ├── performance.ts      # Performance utilities
│   ├── colorContrast.ts    # Accessibility utilities
│   └── useKeyboardNavigation.ts # Keyboard navigation
│
├── e2e/                     # End-to-end tests (Playwright)
├── public/                  # Static assets
├── tailwind.config.ts       # Tailwind CSS configuration
├── next.config.ts           # Next.js configuration
└── package.json             # Dependencies
```

## 🔙 Backend Structure
```
backend/
├── src/
│   ├── index.ts            # Application entry point
│   │
│   ├── config/             # Configuration files
│   │   ├── firebase.ts     # Firebase Admin SDK
│   │   ├── redis.ts        # Redis configuration
│   │   ├── s3.ts           # AWS S3 configuration
│   │   └── sentry.ts       # Error tracking
│   │
│   ├── middleware/         # Express middleware
│   │   ├── auth.ts         # JWT authentication
│   │   ├── firebaseAuth.ts # Firebase authentication
│   │   ├── errorHandler.ts # Error handling
│   │   ├── monitoring.ts   # Request monitoring
│   │   └── rateLimiter.ts  # Rate limiting
│   │
│   ├── models/             # Data models
│   │   ├── User.ts
│   │   ├── Job.ts
│   │   ├── Application.ts
│   │   ├── Resume.ts
│   │   ├── CandidateProfile.ts
│   │   ├── RecruiterProfile.ts
│   │   ├── Org.ts
│   │   ├── Event.ts
│   │   └── MetricsCache.ts
│   │
│   ├── routes/             # API routes
│   │   ├── auth.ts         # Authentication endpoints
│   │   ├── jobs.ts         # Job endpoints
│   │   ├── applications.ts # Application endpoints
│   │   ├── resume.ts       # Resume endpoints
│   │   ├── profile.ts      # Profile endpoints
│   │   ├── recruiter.ts    # Recruiter endpoints
│   │   ├── organizations.ts # Organization endpoints
│   │   ├── ai.ts           # AI endpoints
│   │   ├── adzuna.ts       # Adzuna API integration
│   │   ├── analytics.ts    # Analytics endpoints
│   │   └── notifications.ts # Notification endpoints
│   │
│   ├── services/           # Business logic
│   │   ├── aiService.ts    # AI/OpenAI integration
│   │   ├── aiPrompts.ts    # AI prompt templates
│   │   ├── realtimeService.ts # Real-time features
│   │   ├── analyticsService.ts # Analytics
│   │   └── monitoringService.ts # Monitoring
│   │
│   ├── utils/              # Utility functions
│   │   ├── logger.ts       # Winston logger
│   │   ├── errors.ts       # Custom error classes
│   │   ├── jwt.ts          # JWT utilities
│   │   ├── validation.ts   # Input validation
│   │   ├── resumeParser.ts # Resume parsing
│   │   └── storageHelper.ts # File storage
│   │
│   ├── scripts/            # Utility scripts
│   │   └── test-firebase-connection.ts
│   │
│   └── __tests__/          # Unit tests
│       ├── setup.ts
│       ├── auth.test.ts
│       ├── jobs-applications.test.ts
│       ├── resume.test.ts
│       ├── ai-service.test.ts
│       ├── recruiter.test.ts
│       ├── adzuna.test.ts
│       ├── firebase-auth.test.ts
│       ├── user-model.test.ts
│       ├── job-model.test.ts
│       ├── application-model.test.ts
│       ├── candidate-profile.test.ts
│       ├── recruiter-org.test.ts
│       ├── realtime-service.test.ts
│       └── api-integration.test.ts
│
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Firestore indexes
├── storage.rules           # Firebase Storage rules
├── database.rules.json     # Realtime Database rules
├── .env                    # Environment variables
├── .env.example            # Environment template
├── .env.test               # Test environment
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## 🚀 Key Features

### Frontend
- **Next.js 16** with App Router
- **React 19** with Server Components
- **Tailwind CSS 4** for styling
- **Firebase** for authentication and real-time features
- **Playwright** for E2E testing
- **TypeScript** for type safety

### Backend
- **Express.js** REST API
- **Firebase Admin SDK** for authentication
- **Redis** for caching
- **AWS S3** for file storage
- **OpenAI** for AI features
- **Sentry** for error tracking
- **Winston** for logging
- **Jest** for unit testing

## 📦 Dependencies

### Essential Frontend Dependencies
- next, react, react-dom
- firebase
- lucide-react (icons)
- tailwindcss

### Essential Backend Dependencies
- express
- firebase-admin
- bcrypt, jsonwebtoken
- axios
- redis
- @aws-sdk/client-s3
- multer, pdf-parse, mammoth
- winston
- @sentry/node

## 🧹 Removed Items
- ✅ All documentation markdown files (except README and DEPLOYMENT)
- ✅ Temporary test scripts
- ✅ IDE-specific directories (.kiro, .vscode)
- ✅ Migration scripts
- ✅ Load testing files
- ✅ Debug components
- ✅ Unused test files
- ✅ Documentation in component folders

## 🎯 Production Ready
- Clean folder structure
- No unused dependencies
- Optimized for performance
- Professional organization
- Easy to maintain
- Ready for deployment

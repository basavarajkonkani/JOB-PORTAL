# Implementation Plan

- [x] 1. Set up Firebase configuration and initialization
  - Create Firebase configuration modules for both backend and frontend
  - Initialize Firebase Admin SDK in backend with service account
  - Initialize Firebase client SDK in frontend with public config
  - Set up environment variables for Firebase credentials
  - Validate Firebase connection on application startup
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 2. Implement Firebase Authentication system
  - [x] 2.1 Create Firebase Auth middleware for backend
    - Write middleware to verify Firebase ID tokens
    - Extract user information from decoded tokens
    - Handle authentication errors appropriately
    - _Requirements: 2.1, 2.2, 2.3, 12.1_

  - [x] 2.2 Refactor backend auth routes to use Firebase Auth
    - Update signup endpoint to create Firebase Auth users
    - Update signin endpoint to authenticate with Firebase
    - Implement custom claims for user roles
    - Remove JWT token generation code
    - _Requirements: 2.1, 2.2, 2.4, 12.2_

  - [x] 2.3 Update frontend auth context to use Firebase SDK
    - Replace custom auth logic with Firebase Auth methods
    - Implement signInWithEmailAndPassword
    - Implement createUserWithEmailAndPassword
    - Implement signOut functionality
    - Handle auth state changes with onAuthStateChanged
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 13.1, 13.2, 13.5_

  - [x] 2.4 Write authentication integration tests
    - Test user signup flow
    - Test user signin flow
    - Test token verification
    - Test role-based access control
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Migrate User model to Firestore
  - [x] 3.1 Refactor User model to use Firestore operations
    - Replace PostgreSQL queries with Firestore operations
    - Implement create method using Firebase Auth and Firestore
    - Implement findById using Firestore document get
    - Implement findByEmail using Firestore where query
    - Implement update method using Firestore document update
    - Remove password hashing methods (handled by Firebase Auth)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 12.2_

  - [x] 3.2 Write unit tests for User model
    - Test user creation
    - Test user retrieval by ID and email
    - Test user updates
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Migrate CandidateProfile model to Firestore
  - [x] 4.1 Refactor CandidateProfile model to use Firestore
    - Replace PostgreSQL queries with Firestore operations
    - Implement create method with userId linking
    - Implement findByUserId query
    - Implement update method for profile fields
    - Add support for querying by skills and location
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 12.2_

  - [x] 4.2 Write unit tests for CandidateProfile model
    - Test profile creation and linking
    - Test profile queries
    - Test profile updates
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 5. Migrate RecruiterProfile and Organization models to Firestore
  - [x] 5.1 Refactor RecruiterProfile model to use Firestore
    - Replace PostgreSQL queries with Firestore operations
    - Implement create method with userId and orgId linking
    - Implement findByUserId and findByOrgId queries
    - Implement update method
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 12.2_

  - [x] 5.2 Refactor Organization model to use Firestore
    - Replace PostgreSQL queries with Firestore operations
    - Implement CRUD operations for organizations
    - Implement query methods for organization lookup
    - _Requirements: 5.2, 5.3, 12.2_

  - [x] 5.3 Write unit tests for RecruiterProfile and Organization models
    - Test recruiter profile creation and queries
    - Test organization CRUD operations
    - Test relationship queries
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 6. Migrate Job model to Firestore
  - [x] 6.1 Refactor Job model to use Firestore
    - Replace PostgreSQL queries with Firestore operations
    - Implement create method with orgId and createdBy linking
    - Implement findById query
    - Implement search method with filters and pagination
    - Implement update and delete methods
    - Add support for filtering by status, location, salary, and skills
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 12.2_

  - [x] 6.2 Create Firestore composite indexes for job queries
    - Define indexes for status + publishedAt
    - Define indexes for status + location + publishedAt
    - Define indexes for filtering and sorting combinations
    - _Requirements: 6.3_

  - [x] 6.3 Write unit tests for Job model
    - Test job creation and linking
    - Test job search with various filters
    - Test job updates and status changes
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7. Migrate Application model to Firestore
  - [x] 7.1 Refactor Application model to use Firestore
    - Replace PostgreSQL queries with Firestore operations
    - Implement create method with jobId and userId linking
    - Implement findByUserId and findByJobId queries
    - Implement update method for status changes
    - Implement existsByJobAndUser check
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 12.2_

  - [x] 7.2 Create Firestore composite indexes for application queries
    - Define indexes for userId + createdAt
    - Define indexes for jobId + status + aiScore
    - _Requirements: 7.3_

  - [x] 7.3 Write unit tests for Application model
    - Test application creation
    - Test application queries by user and job
    - Test application status updates
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 8. Migrate Resume model and implement Cloud Storage
  - [x] 8.1 Implement Firebase Cloud Storage integration
    - Create storage configuration module
    - Implement file upload handler using multer and Firebase Storage
    - Generate signed URLs for file access
    - Implement file deletion handler
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 8.2 Refactor Resume model to use Firestore and Cloud Storage
    - Replace PostgreSQL queries with Firestore operations
    - Store resume metadata in Firestore
    - Store file references and URLs
    - Implement resume versions as subcollection
    - Update upload endpoint to use Cloud Storage
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 8.3 Write unit tests for Resume model and storage
    - Test file upload flow
    - Test resume metadata storage
    - Test resume version management
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 9. Implement Realtime Database for live features
  - [x] 9.1 Set up Realtime Database structure
    - Create database structure for presence tracking
    - Create database structure for notifications
    - Create database structure for application status updates
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 9.2 Implement backend Realtime Database operations
    - Write helper functions to update presence data
    - Write helper functions to send notifications
    - Write helper functions to broadcast application status changes
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 9.3 Implement frontend Realtime Database listeners
    - Create hooks to listen for application updates
    - Create hooks to listen for notifications
    - Create hooks to update user presence
    - Integrate listeners with existing components
    - _Requirements: 9.2, 9.3, 9.4, 13.4_

  - [x] 9.4 Write tests for Realtime Database features
    - Test presence updates
    - Test notification delivery
    - Test application status broadcasts
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 10. Deploy Firebase security rules
  - [x] 10.1 Create Firestore security rules
    - Write rules for users collection
    - Write rules for candidate and recruiter profiles
    - Write rules for organizations
    - Write rules for jobs with public read access
    - Write rules for applications with role-based access
    - Write rules for resumes with owner-only access
    - _Requirements: 10.1, 10.2, 10.5_

  - [x] 10.2 Create Cloud Storage security rules
    - Write rules for resume file access
    - Write rules for avatar file access
    - Restrict file access to owners
    - _Requirements: 10.3_

  - [x] 10.3 Create Realtime Database security rules
    - Write rules for presence data
    - Write rules for notifications
    - Write rules for application updates
    - Validate authentication tokens
    - _Requirements: 10.4, 10.5_

  - [x] 10.4 Deploy security rules to Firebase
    - Deploy Firestore rules using Firebase CLI
    - Deploy Storage rules using Firebase CLI
    - Deploy Realtime Database rules using Firebase CLI
    - Verify rules are active
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 10.5 Write security rules tests
    - Test authentication requirements
    - Test role-based access control
    - Test owner-only access restrictions
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 11. Update API routes to use Firebase
  - [x] 11.1 Update auth routes
    - Replace JWT middleware with Firebase Auth middleware
    - Update signup endpoint to use Firebase Auth
    - Update signin endpoint to use Firebase Auth
    - Remove refresh token endpoint (handled by Firebase)
    - Add endpoint to set custom claims for roles
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 11.2 Update profile routes
    - Update candidate profile endpoints to use Firestore
    - Update recruiter profile endpoints to use Firestore
    - Maintain existing API response format
    - _Requirements: 12.2, 12.5_

  - [x] 11.3 Update job routes
    - Update job search endpoint to use Firestore queries
    - Update job detail endpoint to use Firestore
    - Update job creation endpoint for recruiters
    - Update job update and delete endpoints
    - Maintain caching strategy with Redis
    - _Requirements: 12.2, 12.5_

  - [x] 11.4 Update application routes
    - Update application submission endpoint
    - Update application listing endpoints
    - Update application status update endpoint
    - Trigger Realtime Database updates on status changes
    - _Requirements: 12.2, 12.5_

  - [x] 11.5 Update resume routes
    - Update resume upload endpoint to use Cloud Storage
    - Update resume retrieval endpoint
    - Update resume version management endpoints
    - _Requirements: 12.2, 12.5_

  - [x] 11.6 Write integration tests for updated API routes
    - Test all auth endpoints
    - Test all profile endpoints
    - Test all job endpoints
    - Test all application endpoints
    - Test all resume endpoints
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 12. Update frontend to use Firebase SDK
  - [x] 12.1 Update API client to use Firebase ID tokens
    - Modify API client to get Firebase ID token
    - Add token to Authorization header
    - Handle token refresh automatically
    - _Requirements: 13.1, 13.2_

  - [x] 12.2 Update components to use new auth context
    - Update SignIn component
    - Update SignUp component
    - Update ProtectedRoute component
    - Update all components using auth context
    - _Requirements: 13.2, 13.5_

  - [x] 12.3 Implement direct Firestore queries where appropriate
    - Identify components that can query Firestore directly
    - Implement Firestore queries for real-time data
    - Add loading and error states
    - _Requirements: 13.3_

  - [x] 12.4 Integrate Realtime Database listeners
    - Add notification listener to dashboard
    - Add application status listener to applications page
    - Add presence tracking to user profile
    - _Requirements: 13.4_

  - [x] 12.5 Write frontend integration tests
    - Test authentication flows
    - Test data fetching with Firebase
    - Test real-time updates
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 13. Create data migration scripts
  - [x] 13.1 Create PostgreSQL export script
    - Export all users data to JSON
    - Export all profiles data to JSON
    - Export all organizations data to JSON
    - Export all jobs data to JSON
    - Export all applications data to JSON
    - Export all resumes metadata to JSON
    - _Requirements: 14.1_

  - [x] 13.2 Create Firebase import script
    - Import users to Firebase Auth and Firestore
    - Import candidate profiles to Firestore
    - Import recruiter profiles to Firestore
    - Import organizations to Firestore
    - Import jobs to Firestore
    - Import applications to Firestore
    - Import resume metadata to Firestore
    - Set custom claims for user roles
    - _Requirements: 14.2, 14.3_

  - [x] 13.3 Create data verification script
    - Compare record counts between PostgreSQL and Firestore
    - Verify data integrity and field mappings
    - Check relationship consistency
    - Generate verification report
    - _Requirements: 14.4_

  - [x] 13.4 Create rollback script
    - Implement ability to delete all Firebase data
    - Implement ability to restore from backup
    - _Requirements: 14.5_

  - [x] 13.5 Test migration scripts
    - Test export script with sample data
    - Test import script with sample data
    - Test verification script
    - Test rollback script
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 14. Remove PostgreSQL dependencies
  - [x] 14.1 Remove PostgreSQL configuration and connection code
    - Delete database.ts configuration file
    - Remove PostgreSQL pool initialization
    - Remove database connection event handlers
    - _Requirements: 11.1, 11.5_

  - [x] 14.2 Remove PostgreSQL migration files
    - Delete all migration files in migrations directory
    - Delete seed data files
    - Remove migration scripts from package.json
    - _Requirements: 11.2_

  - [x] 14.3 Remove PostgreSQL dependencies from package.json
    - Remove pg package
    - Remove node-pg-migrate package
    - Remove @types/pg package
    - Run npm install to update lock file
    - _Requirements: 11.1_

  - [x] 14.4 Update documentation
    - Update README with Firebase setup instructions
    - Update SETUP.md with Firebase configuration
    - Remove PostgreSQL setup instructions
    - Update environment variable documentation
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 15. Update environment configuration
  - [x] 15.1 Create Firebase environment variables template
    - Add FIREBASE_SERVICE_ACCOUNT to backend .env.example
    - Add NEXT*PUBLIC_FIREBASE*\* variables to frontend .env.example
    - Document all required Firebase configuration values
    - _Requirements: 15.1, 15.2, 15.3_

  - [x] 15.2 Update Docker configuration
    - Update docker-compose.yml to include Firebase env vars
    - Remove PostgreSQL service from docker-compose
    - Update Dockerfile to remove PostgreSQL dependencies
    - _Requirements: 15.1, 15.2, 15.3_

  - [x] 15.3 Update CI/CD configuration
    - Add Firebase credentials to GitHub secrets
    - Update deployment scripts to use Firebase
    - Remove PostgreSQL setup from CI/CD pipeline
    - _Requirements: 15.1, 15.2, 15.3_

- [-] 16. Testing and validation
  - [ ] 16.1 Run comprehensive end-to-end tests
    - Test complete user signup and signin flow
    - Test candidate profile creation and job application
    - Test recruiter job posting and application review
    - Test resume upload and management
    - Test real-time notifications
    - _Requirements: All requirements_

  - [x] 16.2 Perform load testing
    - Test Firestore query performance under load
    - Test Firebase Auth performance
    - Test Cloud Storage upload performance
    - Compare performance with PostgreSQL baseline
    - _Requirements: All requirements_

  - [x] 16.3 Verify security rules
    - Test unauthorized access attempts
    - Test role-based access control
    - Test data isolation between users
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 17. Deploy to production
  - [x] 17.1 Deploy Firebase configuration to staging
    - Deploy security rules to staging Firebase project
    - Deploy Firestore indexes
    - Test all features in staging environment
    - _Requirements: All requirements_

  - [x] 17.2 Run data migration in production
    - Backup PostgreSQL database
    - Run export script
    - Run import script to Firebase
    - Run verification script
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [x] 17.3 Deploy application to production
    - Deploy backend with Firebase configuration
    - Deploy frontend with Firebase configuration
    - Monitor error rates and performance
    - Keep PostgreSQL running as backup
    - _Requirements: All requirements_

  - [x] 17.4 Monitor and validate production deployment
    - Monitor Firebase usage and quotas
    - Monitor application error rates
    - Verify all features working correctly
    - Collect user feedback
    - _Requirements: All requirements_

  - [x] 17.5 Complete migration and cleanup
    - Verify stable operation for 1 week
    - Remove PostgreSQL database and dependencies
    - Update all documentation
    - Announce migration completion
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

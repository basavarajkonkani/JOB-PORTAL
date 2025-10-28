# Requirements Document

## Introduction

This document outlines the requirements for migrating the AI Job Portal from a PostgreSQL-based backend with custom authentication to a Firebase-based architecture. The migration will replace all database operations, authentication, and storage with Firebase services including Firebase Authentication, Cloud Firestore, Realtime Database, and Cloud Storage.

## Glossary

- **Firebase_System**: The complete Firebase backend infrastructure including Authentication, Firestore, Realtime Database, and Storage
- **Firestore**: Firebase's NoSQL document database for structured data storage
- **Realtime_Database**: Firebase's real-time synchronized database for live data updates
- **Firebase_Auth**: Firebase Authentication service for user management
- **Cloud_Storage**: Firebase Cloud Storage for file uploads (resumes, avatars)
- **Legacy_Backend**: The existing PostgreSQL-based Express.js backend
- **Frontend_Client**: The Next.js frontend application
- **Migration_Process**: The systematic replacement of PostgreSQL operations with Firebase operations

## Requirements

### Requirement 1

**User Story:** As a developer, I want to configure Firebase in both frontend and backend, so that the application can connect to Firebase services

#### Acceptance Criteria

1. WHEN THE Firebase_System is initialized, THE Frontend_Client SHALL authenticate using the provided Firebase configuration credentials
2. WHEN THE Firebase_System is initialized, THE Backend SHALL initialize Firebase Admin SDK with service account credentials
3. THE Firebase_System SHALL store configuration securely in environment variables
4. THE Firebase_System SHALL validate Firebase connection on application startup
5. WHERE Firebase initialization fails, THE Firebase_System SHALL log detailed error messages and prevent application startup

### Requirement 2

**User Story:** As a user, I want to authenticate using Firebase Authentication, so that I can securely access the application

#### Acceptance Criteria

1. WHEN a user submits signup credentials, THE Firebase_Auth SHALL create a new user account with email and password
2. WHEN a user submits signin credentials, THE Firebase_Auth SHALL authenticate the user and return an ID token
3. WHEN a user signs out, THE Firebase_Auth SHALL invalidate the current session
4. THE Firebase_Auth SHALL store user role (candidate/recruiter/admin) in custom claims
5. WHEN authentication state changes, THE Frontend_Client SHALL update the user context immediately
6. THE Firebase_Auth SHALL support password reset functionality via email

### Requirement 3

**User Story:** As a developer, I want to migrate all user data to Firestore, so that user profiles are stored in Firebase

#### Acceptance Criteria

1. THE Firestore SHALL store user documents in a "users" collection with user ID as document ID
2. WHEN a user is created, THE Firestore SHALL create a corresponding user profile document
3. THE Firestore SHALL store user fields including email, name, role, avatarUrl, createdAt, and updatedAt
4. WHEN user data is updated, THE Firestore SHALL update the corresponding document with timestamp
5. THE Firestore SHALL enforce security rules that allow users to read/write only their own data

### Requirement 4

**User Story:** As a developer, I want to migrate candidate profiles to Firestore, so that candidate information is stored in Firebase

#### Acceptance Criteria

1. THE Firestore SHALL store candidate profiles in a "candidateProfiles" collection
2. WHEN a candidate profile is created, THE Firestore SHALL link it to the user document via userId field
3. THE Firestore SHALL store all candidate fields including skills, experience, education, and preferences
4. THE Firestore SHALL support querying candidate profiles by skills and location
5. THE Firestore SHALL enforce security rules allowing only the profile owner and recruiters to read candidate data

### Requirement 5

**User Story:** As a developer, I want to migrate recruiter profiles and organizations to Firestore, so that recruiter data is stored in Firebase

#### Acceptance Criteria

1. THE Firestore SHALL store recruiter profiles in a "recruiterProfiles" collection
2. THE Firestore SHALL store organizations in an "organizations" collection
3. WHEN a recruiter profile is created, THE Firestore SHALL link it to both user and organization documents
4. THE Firestore SHALL support querying recruiters by organization
5. THE Firestore SHALL enforce security rules allowing organization members to read recruiter profiles

### Requirement 6

**User Story:** As a developer, I want to migrate job postings to Firestore, so that job data is stored in Firebase

#### Acceptance Criteria

1. THE Firestore SHALL store job postings in a "jobs" collection
2. WHEN a job is created, THE Firestore SHALL link it to the recruiter and organization
3. THE Firestore SHALL support filtering jobs by status, location, salary range, and required skills
4. THE Firestore SHALL store job fields including title, description, requirements, salary, and location
5. THE Firestore SHALL enforce security rules allowing public read access and recruiter-only write access

### Requirement 7

**User Story:** As a developer, I want to migrate job applications to Firestore, so that application data is stored in Firebase

#### Acceptance Criteria

1. THE Firestore SHALL store applications in an "applications" collection
2. WHEN an application is created, THE Firestore SHALL link it to both job and candidate documents
3. THE Firestore SHALL support querying applications by candidate, job, and status
4. THE Firestore SHALL store application fields including status, coverLetter, aiScore, and timestamps
5. THE Firestore SHALL enforce security rules allowing candidates to read their applications and recruiters to read applications for their jobs

### Requirement 8

**User Story:** As a developer, I want to migrate resume data to Firestore and Cloud Storage, so that resumes are stored in Firebase

#### Acceptance Criteria

1. THE Cloud_Storage SHALL store resume files in a "resumes" bucket organized by user ID
2. THE Firestore SHALL store resume metadata in a "resumes" collection
3. WHEN a resume is uploaded, THE Cloud_Storage SHALL store the file and THE Firestore SHALL store metadata
4. THE Firestore SHALL store resume versions in a subcollection under each resume document
5. THE Cloud_Storage SHALL enforce security rules allowing only the resume owner to upload and access files

### Requirement 9

**User Story:** As a developer, I want to use Realtime Database for live features, so that users receive instant updates

#### Acceptance Criteria

1. THE Realtime_Database SHALL store active user presence data
2. WHEN a user's application status changes, THE Realtime_Database SHALL broadcast the update to connected clients
3. THE Realtime_Database SHALL store notification data for real-time delivery
4. THE Realtime_Database SHALL support listening for changes to application status
5. THE Realtime_Database SHALL enforce security rules based on Firebase_Auth tokens

### Requirement 10

**User Story:** As a developer, I want to implement Firebase security rules, so that data access is properly controlled

#### Acceptance Criteria

1. THE Firestore SHALL implement security rules that validate user authentication
2. THE Firestore SHALL implement security rules that enforce role-based access control
3. THE Cloud_Storage SHALL implement security rules that restrict file access to owners
4. THE Realtime_Database SHALL implement security rules that validate user permissions
5. THE Firebase_System SHALL deny all unauthenticated requests by default

### Requirement 11

**User Story:** As a developer, I want to remove PostgreSQL dependencies, so that the application runs entirely on Firebase

#### Acceptance Criteria

1. THE Backend SHALL remove all PostgreSQL connection code and dependencies
2. THE Backend SHALL remove all SQL migration files
3. THE Backend SHALL remove all PostgreSQL-specific model methods
4. THE Backend SHALL update all route handlers to use Firebase operations
5. THE Backend SHALL remove database connection pool configuration

### Requirement 12

**User Story:** As a developer, I want to update API endpoints to use Firebase, so that all backend operations work with Firebase

#### Acceptance Criteria

1. WHEN an API endpoint receives a request, THE Backend SHALL verify Firebase ID tokens for authentication
2. THE Backend SHALL replace all database queries with Firestore operations
3. THE Backend SHALL use Firebase Admin SDK for server-side operations
4. THE Backend SHALL handle Firebase-specific errors appropriately
5. THE Backend SHALL maintain the same API response format for frontend compatibility

### Requirement 13

**User Story:** As a developer, I want to update the frontend to use Firebase SDK, so that the frontend communicates directly with Firebase

#### Acceptance Criteria

1. THE Frontend_Client SHALL initialize Firebase SDK with the provided configuration
2. THE Frontend_Client SHALL use Firebase Authentication for user management
3. THE Frontend_Client SHALL use Firestore SDK for data operations where appropriate
4. THE Frontend_Client SHALL listen to Realtime_Database for live updates
5. THE Frontend_Client SHALL handle Firebase authentication state changes

### Requirement 14

**User Story:** As a developer, I want to implement data migration scripts, so that existing data can be transferred to Firebase

#### Acceptance Criteria

1. THE Migration_Process SHALL export all existing PostgreSQL data to JSON format
2. THE Migration_Process SHALL import user data into Firestore with proper structure
3. THE Migration_Process SHALL import all related data (profiles, jobs, applications) maintaining relationships
4. THE Migration_Process SHALL verify data integrity after migration
5. THE Migration_Process SHALL provide rollback capability in case of migration failure

### Requirement 15

**User Story:** As a developer, I want to update environment configuration, so that Firebase credentials are properly managed

#### Acceptance Criteria

1. THE Firebase_System SHALL load Firebase configuration from environment variables
2. THE Backend SHALL load Firebase Admin service account from secure environment variable
3. THE Frontend_Client SHALL load Firebase client configuration from environment variables
4. THE Firebase_System SHALL validate all required configuration values on startup
5. THE Firebase_System SHALL provide clear error messages for missing configuration

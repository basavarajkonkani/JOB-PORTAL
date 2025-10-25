# Requirements Document

## Introduction

The AI-Integrated Job Portal is a modern web application that accelerates job discovery for candidates and streamlines recruiting for hiring managers. The system integrates AI capabilities via Pollinations API for both text generation (resume improvements, cover letters, job descriptions) and image generation (hero banners, illustrations). The MVP focuses on core job search, application workflows, and AI-assisted content creation while excluding payments, complex ATS workflows, and enterprise SSO.

## Glossary

- **Portal**: The AI-Integrated Job Portal web application
- **AI Copilot**: The inline AI assistant that provides summaries, suggestions, and one-click actions
- **Candidate**: A job seeker user who searches for jobs and submits applications
- **Recruiter**: A hiring manager user who posts jobs and reviews applications
- **JD**: Job Description document
- **Pollinations API**: External AI service for text and image generation via URL-based requests
- **Resume Parser**: Component that extracts structured data from uploaded resume files
- **Application**: A candidate's submission for a specific job posting
- **Shortlist**: A filtered view of top candidate applications for a job
- **ATS**: Applicant Tracking System

## Requirements

### Requirement 1

**User Story:** As a candidate, I want to search and filter job listings, so that I can quickly find relevant opportunities matching my criteria.

#### Acceptance Criteria

1. THE Portal SHALL display a searchable list of active job postings
2. WHEN a Candidate applies title filter, THE Portal SHALL return jobs matching the title keyword
3. WHEN a Candidate applies level filter, THE Portal SHALL return jobs matching the selected experience level
4. WHEN a Candidate applies location filter, THE Portal SHALL return jobs matching the specified location
5. WHEN a Candidate applies remote filter, THE Portal SHALL return jobs marked as remote-eligible
6. THE Portal SHALL paginate search results with a maximum of 20 jobs per page

### Requirement 2

**User Story:** As a candidate, I want to view detailed job information with AI-generated insights, so that I can understand if the role is a good fit for me.

#### Acceptance Criteria

1. WHEN a Candidate selects a job, THE Portal SHALL display the complete job description including title, level, location, type, requirements, compensation, and benefits
2. WHEN a job detail page loads, THE Portal SHALL display an AI-generated hero banner image via Pollinations API
3. WHEN a job detail page loads, THE AI Copilot SHALL generate a fit summary explaining match quality based on the Candidate profile
4. THE Portal SHALL provide save, share, and apply actions on the job detail page
5. WHEN a Candidate requests a tailored cover letter, THE AI Copilot SHALL generate a cover letter using Pollinations text API with the job requirements and Candidate profile as context

### Requirement 3

**User Story:** As a candidate, I want to upload and improve my resume with AI assistance, so that I can create an ATS-friendly profile that increases my application success rate.

#### Acceptance Criteria

1. THE Portal SHALL accept resume uploads in PDF and DOCX formats
2. WHEN a Candidate uploads a resume, THE Resume Parser SHALL extract text content and structured data including skills, experience, and education
3. WHEN resume parsing completes, THE AI Copilot SHALL suggest improvements to resume bullets for ATS compatibility
4. THE Portal SHALL store multiple resume versions linked to the Candidate profile
5. THE Portal SHALL allow Candidates to edit parsed resume data before saving to their profile

### Requirement 4

**User Story:** As a candidate, I want to track my job applications with status updates, so that I can manage my job search effectively.

#### Acceptance Criteria

1. WHEN a Candidate submits an application, THE Portal SHALL create an Application record with status, resume version, and cover letter
2. THE Portal SHALL display all applications in a timeline view showing job title, company, status, and submission date
3. THE Portal SHALL allow Candidates to add notes to each application
4. WHEN an application status changes, THE Portal SHALL update the status field with timestamp
5. THE Portal SHALL provide reminders for applications pending follow-up actions

### Requirement 5

**User Story:** As a recruiter, I want to create job descriptions quickly using AI assistance, so that I can publish high-quality, inclusive JDs faster.

#### Acceptance Criteria

1. THE Portal SHALL provide a JD wizard interface for Recruiters to input job notes
2. WHEN a Recruiter submits job notes, THE AI Copilot SHALL generate a structured job description using Pollinations text API
3. THE AI Copilot SHALL ensure generated JDs use inclusive language and clear section formatting
4. THE Portal SHALL allow Recruiters to edit the AI-generated JD before publishing
5. WHEN a Recruiter publishes a JD, THE Portal SHALL generate a hero banner image via Pollinations image API with deterministic seed
6. WHEN a Recruiter publishes a JD, THE Portal SHALL create a Job record with status set to active

### Requirement 6

**User Story:** As a recruiter, I want to view a shortlist of top candidates with AI rationale, so that I can efficiently identify the best applicants for screening.

#### Acceptance Criteria

1. WHEN a Recruiter views applications for a job, THE Portal SHALL display all submitted applications
2. WHEN a Recruiter requests AI shortlist, THE AI Copilot SHALL analyze applications and rank candidates by fit score
3. THE AI Copilot SHALL provide a rationale explaining why each shortlisted candidate is a strong match
4. THE AI Copilot SHALL suggest screening questions specific to each shortlisted candidate
5. THE Portal SHALL allow Recruiters to filter and sort the candidate list by status, submission date, and AI score

### Requirement 7

**User Story:** As a new candidate, I want a guided onboarding experience, so that I can quickly set up my profile and start applying to jobs.

#### Acceptance Criteria

1. WHEN a new Candidate signs up, THE Portal SHALL prompt for resume upload
2. WHEN resume upload completes, THE Portal SHALL display parsed profile data for confirmation
3. THE AI Copilot SHALL provide profile improvement suggestions during onboarding
4. WHEN a Candidate confirms their profile, THE Portal SHALL save the profile data and redirect to the dashboard
5. THE Portal SHALL display recommended jobs on the Candidate dashboard based on profile data

### Requirement 8

**User Story:** As a user, I want the AI copilot to provide consistent, structured responses, so that I can rely on predictable assistance throughout the portal.

#### Acceptance Criteria

1. THE AI Copilot SHALL return responses in JSON format containing summary, items, actions, and optional tool_calls fields
2. WHEN the AI Copilot generates text via Pollinations API, THE Portal SHALL use deterministic temperature and seed parameters
3. WHEN the AI Copilot generates images via Pollinations API, THE Portal SHALL construct URLs with width, height, seed, and nologo parameters
4. THE Portal SHALL execute all AI API calls server-side to protect API access
5. IF Pollinations API is unavailable, THEN THE Portal SHALL display the last cached result with a warning message

### Requirement 9

**User Story:** As a user, I want fast page loads and responsive AI interactions, so that I can complete tasks efficiently without waiting.

#### Acceptance Criteria

1. THE Portal SHALL serve cached public pages with Time To First Byte under 500 milliseconds
2. THE Portal SHALL execute AI calls asynchronously with optimistic UI updates
3. THE Portal SHALL implement server-side rendering for public job listing and detail pages
4. THE Portal SHALL cache Pollinations image URLs after first generation
5. THE Portal SHALL display loading indicators during AI processing with estimated completion time

### Requirement 10

**User Story:** As a user with accessibility needs, I want the portal to be keyboard navigable with proper contrast, so that I can use all features effectively.

#### Acceptance Criteria

1. THE Portal SHALL meet WCAG 2.1 AA contrast requirements for all text and interactive elements
2. THE Portal SHALL support full keyboard navigation for all interactive features
3. THE Portal SHALL provide descriptive ARIA labels for all form inputs and buttons
4. THE Portal SHALL ensure focus indicators are visible on all interactive elements
5. THE Portal SHALL provide text alternatives for all AI-generated images

### Requirement 11

**User Story:** As a system administrator, I want the portal to handle failures gracefully, so that users can continue working even when external services are degraded.

#### Acceptance Criteria

1. IF Pollinations text API fails, THEN THE Portal SHALL display an error message and allow manual text entry
2. IF Pollinations image API fails, THEN THE Portal SHALL display a default placeholder image
3. THE Portal SHALL rate-limit API endpoints to prevent abuse with 429 status code responses
4. THE Portal SHALL log all AI API failures with timestamp and error details for monitoring
5. THE Portal SHALL implement retry logic with exponential backoff for transient API failures

### Requirement 12

**User Story:** As a product manager, I want to track key funnel metrics and AI usage, so that I can measure MVP success and identify improvement opportunities.

#### Acceptance Criteria

1. THE Portal SHALL track page visits, job views, and application submissions in the analytics pipeline
2. THE Portal SHALL track AI Copilot session count, artifacts generated, and suggestion acceptance rate
3. THE Portal SHALL track Recruiter time-to-publish from JD draft to published status
4. THE Portal SHALL calculate and display D1 activation rate for new Candidates who view 3 or more jobs
5. THE Portal SHALL calculate and display apply conversion rate as percentage of job views resulting in applications

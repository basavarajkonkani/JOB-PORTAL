# Database Migrations

This directory contains database migrations for the AI Job Portal application.

## Prerequisites

- PostgreSQL database running (use `docker-compose up -d postgres` from project root)
- DATABASE_URL environment variable set in `.env` file

## Running Migrations

### Apply all pending migrations
```bash
npm run migrate:up
```

### Rollback the last migration
```bash
npm run migrate:down
```

### Create a new migration
```bash
npm run migrate:create <migration-name>
```

## Seeding Development Data

After running migrations, seed the database with sample data:

```bash
npm run seed:dev
```

This will create:
- 3 sample organizations
- 6 sample users (3 candidates, 2 recruiters, 1 admin)
- 3 candidate profiles with skills and experience
- 2 recruiter profiles
- 6 sample job postings

### Test Credentials

After seeding, you can login with:
- **Candidate**: `candidate1@example.com` / `password123`
- **Recruiter**: `recruiter1@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

## Migration Files

1. `1700000001_create_users_table.ts` - Users table with authentication
2. `1700000002_create_orgs_table.ts` - Organizations table
3. `1700000003_create_candidate_profiles_table.ts` - Candidate profiles with skills and preferences
4. `1700000004_create_recruiter_profiles_table.ts` - Recruiter profiles linked to orgs
5. `1700000005_create_jobs_table.ts` - Job postings with search indexes
6. `1700000006_create_resumes_table.ts` - Resume file storage
7. `1700000007_create_resume_versions_table.ts` - Resume versions with parsed data
8. `1700000008_create_applications_table.ts` - Job applications
9. `1700000009_create_events_table.ts` - Analytics event tracking
10. `1700000010_create_metrics_cache_table.ts` - Pre-calculated metrics cache

## Database Schema Overview

### Core Tables
- **users**: Authentication and user management
- **orgs**: Organizations/companies
- **candidate_profiles**: Candidate skills, experience, education, preferences
- **recruiter_profiles**: Recruiter information linked to organizations

### Job & Application Tables
- **jobs**: Job postings with search indexes on title, location, level, type
- **applications**: Job applications with AI scoring
- **resumes**: Resume file storage
- **resume_versions**: Parsed resume data with versioning

### Analytics Tables
- **events**: User activity tracking
- **metrics_cache**: Pre-calculated analytics metrics

## Indexes

The schema includes indexes on:
- Foreign keys for all relationships
- Search fields: job title, location, skills
- Filter fields: job level, type, remote, status
- Analytics fields: event_type, created_at

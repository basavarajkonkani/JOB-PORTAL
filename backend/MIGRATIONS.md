# Database Migrations Setup

## Overview

This project uses `node-pg-migrate` for database schema management. All migration files are located in `src/migrations/`.

## Quick Start

### 1. Start the Database

```bash
# From project root
docker-compose up -d postgres
```

### 2. Run Migrations

```bash
# From backend directory
cd backend
npm run migrate:up
```

### 3. Seed Development Data

```bash
npm run seed:dev
```

## Available Commands

- `npm run migrate:up` - Apply all pending migrations
- `npm run migrate:down` - Rollback the last migration
- `npm run migrate:create <name>` - Create a new migration file
- `npm run seed:dev` - Seed database with sample data

## Migration Files

All migrations are in `src/migrations/`:

1. **1700000001_create_users_table.ts** - Core users table
2. **1700000002_create_orgs_table.ts** - Organizations
3. **1700000003_create_candidate_profiles_table.ts** - Candidate profiles with skills
4. **1700000004_create_recruiter_profiles_table.ts** - Recruiter profiles
5. **1700000005_create_jobs_table.ts** - Job postings with indexes
6. **1700000006_create_resumes_table.ts** - Resume file storage
7. **1700000007_create_resume_versions_table.ts** - Resume versions
8. **1700000008_create_applications_table.ts** - Job applications
9. **1700000009_create_events_table.ts** - Analytics events
10. **1700000010_create_metrics_cache_table.ts** - Metrics cache

## Database Schema

### Core Tables
- **users**: Authentication (email, password_hash, role, name)
- **orgs**: Organizations/companies
- **candidate_profiles**: Skills, experience, education, preferences
- **recruiter_profiles**: Linked to organizations

### Job & Application Tables
- **jobs**: Job postings with full-text search indexes
- **applications**: Job applications with AI scoring
- **resumes**: Resume file metadata
- **resume_versions**: Parsed resume data with versioning

### Analytics Tables
- **events**: User activity tracking
- **metrics_cache**: Pre-calculated metrics

## Indexes

The schema includes comprehensive indexes for:
- All foreign key relationships
- Search fields (job title, location, candidate skills)
- Filter fields (job level, type, remote status)
- Analytics queries (event_type, timestamps)

## Test Data

After seeding, you can login with:
- **Candidate**: `candidate1@example.com` / `password123`
- **Recruiter**: `recruiter1@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

The seed data includes:
- 3 organizations
- 6 users (3 candidates, 2 recruiters, 1 admin)
- 3 candidate profiles with realistic data
- 2 recruiter profiles
- 6 sample job postings

## Troubleshooting

### TypeScript Errors

The migration files may show TypeScript errors in your IDE due to module resolution. This is expected and doesn't affect runtime execution. The migrations will run correctly with `node-pg-migrate`.

### Database Connection

Ensure your `.env` file has the correct `DATABASE_URL`:
```
DATABASE_URL=postgresql://jobportal:jobportal_dev@localhost:5432/jobportal_db
```

### Docker Not Running

If you get connection errors, make sure Docker is running and the postgres container is up:
```bash
docker ps | grep jobportal-postgres
```

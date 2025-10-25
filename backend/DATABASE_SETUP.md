# Database Setup Guide

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ installed
- PostgreSQL client (optional, for manual queries)

## Step-by-Step Setup

### 1. Start PostgreSQL Database

From the project root directory:

```bash
docker-compose up -d postgres
```

Verify the database is running:

```bash
docker ps | grep jobportal-postgres
```

You should see the container running on port 5432.

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment

The `.env` file should already be configured with:

```env
DATABASE_URL=postgresql://jobportal:jobportal_dev@localhost:5432/jobportal_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jobportal_db
DB_USER=jobportal
DB_PASSWORD=jobportal_dev
```

### 4. Run Database Migrations

Apply all migrations to create the database schema:

```bash
npm run migrate:up
```

This will create all tables with proper indexes and constraints.

### 5. Seed Development Data

Populate the database with sample data:

```bash
npm run seed:dev
```

This creates:
- 3 sample organizations (TechCorp Inc, StartupHub, InnovateLabs)
- 6 users (3 candidates, 2 recruiters, 1 admin)
- 3 candidate profiles with skills and experience
- 2 recruiter profiles
- 6 job postings across different levels and locations

### 6. Verify Setup

You can verify the setup by connecting to the database:

```bash
docker exec -it jobportal-postgres psql -U jobportal -d jobportal_db
```

Then run some queries:

```sql
-- Check tables
\dt

-- Count users
SELECT role, COUNT(*) FROM users GROUP BY role;

-- List jobs
SELECT title, level, location, remote FROM jobs WHERE status = 'active';

-- Exit
\q
```

## Test Credentials

After seeding, you can use these credentials for testing:

### Candidates
- Email: `candidate1@example.com` | Password: `password123`
- Email: `candidate2@example.com` | Password: `password123`
- Email: `candidate3@example.com` | Password: `password123`

### Recruiters
- Email: `recruiter1@example.com` | Password: `password123`
- Email: `recruiter2@example.com` | Password: `password123`

### Admin
- Email: `admin@example.com` | Password: `password123`

## Database Schema Overview

### Users & Profiles
- `users` - Core user authentication and info
- `candidate_profiles` - Candidate skills, experience, education, preferences
- `recruiter_profiles` - Recruiter info linked to organizations
- `orgs` - Company/organization information

### Jobs & Applications
- `jobs` - Job postings with search indexes
- `applications` - Job applications with AI scoring
- `resumes` - Resume file storage metadata
- `resume_versions` - Parsed resume data with versioning

### Analytics
- `events` - User activity tracking
- `metrics_cache` - Pre-calculated analytics metrics

## Common Operations

### Reset Database

To start fresh:

```bash
# Rollback all migrations
npm run migrate:down

# Or drop and recreate (from psql)
docker exec -it jobportal-postgres psql -U jobportal -d postgres -c "DROP DATABASE IF EXISTS jobportal_db;"
docker exec -it jobportal-postgres psql -U jobportal -d postgres -c "CREATE DATABASE jobportal_db;"

# Then run migrations again
npm run migrate:up
npm run seed:dev
```

### Create New Migration

```bash
npm run migrate:create add_new_feature
```

This creates a new migration file in `src/migrations/`.

### Check Migration Status

```bash
npx node-pg-migrate list
```

## Troubleshooting

### Connection Refused

If you get "connection refused" errors:
1. Check Docker is running: `docker ps`
2. Check postgres container is up: `docker-compose ps`
3. Restart the container: `docker-compose restart postgres`

### Permission Denied

If you get permission errors:
1. Check the DATABASE_URL in `.env` matches docker-compose.yml
2. Verify the postgres user has proper permissions

### Migration Errors

If migrations fail:
1. Check the migration files for syntax errors
2. Verify the database is empty or in a clean state
3. Check the logs: `docker-compose logs postgres`

## Production Considerations

For production deployment:

1. **Change Credentials**: Update all passwords in environment variables
2. **Enable SSL**: Configure SSL for database connections
3. **Backup Strategy**: Set up automated backups
4. **Connection Pooling**: Already configured in `src/config/database.ts`
5. **Monitoring**: Add database monitoring and alerting
6. **Migrations**: Run migrations as part of deployment pipeline

## Additional Resources

- [node-pg-migrate Documentation](https://salsita.github.io/node-pg-migrate/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

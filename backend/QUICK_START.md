# Quick Start Guide

## Database Setup (First Time)

```bash
# 1. Start PostgreSQL
docker-compose up -d postgres

# 2. Navigate to backend
cd backend

# 3. Install dependencies (if not done)
npm install

# 4. Run migrations
npm run migrate:up

# 5. Seed development data
npm run seed:dev
```

## Test Credentials

After seeding, login with:
- **Candidate**: `candidate1@example.com` / `password123`
- **Recruiter**: `recruiter1@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

## Available Commands

```bash
# Migrations
npm run migrate:up          # Apply all pending migrations
npm run migrate:down        # Rollback last migration
npm run migrate:create <name>  # Create new migration

# Seeding
npm run seed:dev           # Populate with sample data

# Development
npm run dev                # Start development server
npm run build              # Build for production
npm start                  # Run production build

# Code Quality
npm run lint               # Check code style
npm run lint:fix           # Fix code style issues
npm run format             # Format code with Prettier
```

## Database Access

Connect to PostgreSQL directly:

```bash
docker exec -it jobportal-postgres psql -U jobportal -d jobportal_db
```

Useful SQL commands:
```sql
\dt                        -- List all tables
\d users                   -- Describe users table
SELECT * FROM users;       -- Query users
\q                         -- Quit
```

## Project Structure

```
backend/
├── src/
│   ├── config/           # Database and Redis config
│   ├── migrations/       # Database migrations
│   │   ├── seeds/        # Seed data scripts
│   │   └── *.ts          # Migration files
│   └── index.ts          # Application entry point
├── .env                  # Environment variables
└── package.json          # Dependencies and scripts
```

## What's Been Created

### 10 Database Tables
- users, orgs
- candidate_profiles, recruiter_profiles
- jobs, applications
- resumes, resume_versions
- events, metrics_cache

### Comprehensive Indexes
- Foreign keys
- Search fields (title, location, skills)
- Filter fields (level, type, remote, status)
- Composite indexes for common queries

### Sample Data
- 3 organizations
- 6 users (3 candidates, 2 recruiters, 1 admin)
- 3 candidate profiles with skills and experience
- 6 job postings

## Next Steps

1. ✅ Database schema is ready
2. 🔄 Build authentication system (Task 3)
3. 🔄 Implement User Service (Task 4)
4. 🔄 Build Resume Service (Task 5)
5. 🔄 Implement AI Service (Task 6)

## Need Help?

- See `DATABASE_SETUP.md` for detailed setup instructions
- See `MIGRATIONS.md` for migration documentation
- See `src/migrations/IMPLEMENTATION_SUMMARY.md` for schema details

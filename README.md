# AI-Integrated Job Portal

An AI-powered job portal that accelerates job discovery for candidates and streamlines recruiting for hiring managers.

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **AI**: Pollinations API

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

## Getting Started

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspaces
```

### 2. Set Up Environment Variables

```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit the .env files with your configuration
```

### 3. Start Database Services

```bash
# Start PostgreSQL and Redis with Docker Compose
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 4. Run Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or run individually:
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:3000
```

## Project Structure

```
.
├── frontend/          # Next.js frontend application
├── backend/           # Express backend API
│   └── src/
│       └── index.ts   # Main server file
├── docker-compose.yml # Database services configuration
└── package.json       # Root workspace configuration
```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications
- `npm run lint` - Lint all workspaces
- `npm run format` - Format code with Prettier

## Database Access

- **PostgreSQL**: localhost:5432
  - Database: `jobportal_db`
  - User: `jobportal`
  - Password: `jobportal_dev`

- **Redis**: localhost:6379

## API Endpoints

- Health Check: `GET http://localhost:3001/health`
- API Root: `GET http://localhost:3001/api`

## Next Steps

Refer to the implementation plan in `.kiro/specs/ai-job-portal/tasks.md` for the next development tasks.

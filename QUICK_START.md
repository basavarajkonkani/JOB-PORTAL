# Quick Start Guide

## Starting the Application

### Option 1: Use the startup script (Recommended)

```bash
./start-dev.sh
```

This will:

- Clean up any existing processes
- Start backend on port 3001
- Start frontend on port 3000

### Option 2: Manual startup

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

## Configuration

### Backend (port 3001)

- Uses Firebase for authentication, database, and storage
- Environment variables in `backend/.env`

### Frontend (port 3000)

- Connects to backend at `http://localhost:3001`
- Environment variables in `frontend/.env.local`

## Troubleshooting

### Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Next.js lock error

```bash
rm -rf frontend/.next
```

### Backend not connecting

Check that:

1. Backend is running on port 3001
2. `frontend/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3001`
3. Firebase credentials are configured in both `backend/.env` and `frontend/.env.local`

## Tech Stack

- **Frontend**: Next.js 16 (React) on port 3000
- **Backend**: Express.js on port 3001
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Storage**: Firebase Storage
- **Real-time**: Firebase Realtime Database

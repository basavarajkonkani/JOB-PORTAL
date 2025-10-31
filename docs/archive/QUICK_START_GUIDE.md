# AI Job Portal - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

This guide will help you get the beautifully enhanced AI Job Portal up and running quickly.

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- Git installed

## Step 1: Clone and Setup

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd ai-job-portal

# Install dependencies for frontend
npm install

# Install dependencies for backend
cd backend
npm install
cd ..
```

## Step 2: Environment Configuration

### Backend Environment

Create `backend/.env` file:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jobportal
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=jobportal

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Server
PORT=3001
NODE_ENV=development

# S3 (or S3-compatible storage)
S3_BUCKET=job-portal-resumes
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key

# Pollinations AI (no key required - it's free!)
POLLINATIONS_TEXT_API=https://text.pollinations.ai
POLLINATIONS_IMAGE_API=https://image.pollinations.ai

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment

Create `.env.local` file in root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Step 3: Start Database Services

```bash
# Start PostgreSQL and Redis with Docker Compose
docker-compose up -d

# Wait a few seconds for services to be ready
```

## Step 4: Run Database Migrations

```bash
cd backend

# Run migrations to create tables
npm run migrate

# Seed the database with sample data (optional)
npm run seed

cd ..
```

## Step 5: Start the Application

### Terminal 1 - Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3001`

### Terminal 2 - Frontend Server

```bash
# In the root directory
npm run dev
```

The frontend will start on `http://localhost:3000`

## Step 6: Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

## 🎨 What You'll See

### Homepage

- Beautiful gradient hero section
- Feature cards with AI capabilities
- Job search interface
- Modern navigation with sticky header

### Sign Up / Sign In

- Elegant authentication forms
- Icon-enhanced input fields
- Social login buttons (UI only)
- Smooth animations

### Dashboard (After Login)

- **Candidates**: Personalized job recommendations, activity timeline, quick actions
- **Recruiters**: Job statistics, pipeline view, applicant management

### Job Search

- Advanced filters with icons
- Beautiful job cards with hover effects
- Pagination
- Save and share functionality

## 🧪 Test Accounts (If Seeded)

### Candidate Account

```
Email: candidate@example.com
Password: Password123!
```

### Recruiter Account

```
Email: recruiter@example.com
Password: Password123!
```

## 🎯 Key Features to Try

### For Candidates

1. **Browse Jobs**: Click "Browse Jobs" to see available positions
2. **Apply with AI**: Click on a job and use AI to generate a cover letter
3. **Upload Resume**: Go to Resume section and upload your resume
4. **AI Resume Enhancement**: Get AI suggestions to improve your resume
5. **Track Applications**: View all your applications in one place

### For Recruiters

1. **Create Job**: Use AI to generate job descriptions
2. **AI Hero Images**: Generate beautiful hero images for job postings
3. **View Applicants**: See all candidates who applied
4. **AI Ranking**: Get AI-powered candidate rankings with rationale
5. **Screening Questions**: Generate interview questions automatically

## 🔧 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker ps

# Restart Redis
docker-compose restart redis

# Check logs
docker-compose logs redis
```

### Port Already in Use

```bash
# Backend (3001)
lsof -ti:3001 | xargs kill -9

# Frontend (3000)
lsof -ti:3000 | xargs kill -9
```

### Clear Cache and Restart

```bash
# Backend
cd backend
rm -rf node_modules
npm install
npm run dev

# Frontend
cd ..
rm -rf node_modules
npm install
npm run dev
```

## 📱 Mobile Testing

The application is fully responsive. To test on mobile:

1. Find your local IP address:

   ```bash
   # macOS/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Update `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=http://YOUR_IP:3001
   ```

3. Access from mobile:
   ```
   http://YOUR_IP:3000
   ```

## 🎨 UI Features to Explore

### Animations

- Hover over job cards to see lift effect
- Click buttons to see loading states
- Scroll to see smooth transitions

### Gradients

- Notice the blue-to-indigo gradients throughout
- Gradient text in headings
- Gradient buttons with shadows

### Interactive Elements

- Save jobs (bookmark icon)
- Share jobs (share icon)
- Filter jobs with beautiful sidebar
- Profile completion progress bar

## 🚀 Production Deployment

For production deployment, see:

- `DEPLOYMENT.md` - Detailed deployment guide
- `DEPLOYMENT_SUMMARY.md` - Quick deployment summary
- `docker-compose.prod.yml` - Production Docker configuration

## 📚 Additional Documentation

- `README.md` - Project overview and setup
- `SETUP.md` - Detailed setup instructions
- `UI_ENHANCEMENTS.md` - UI design documentation
- `FEATURE_COMPLETION_SUMMARY.md` - Complete feature list
- `backend/QUICK_START.md` - Backend-specific guide
- `backend/TESTING.md` - Testing guide

## 🆘 Need Help?

### Common Issues

1. **"Cannot connect to database"**
   - Ensure Docker is running
   - Check `docker-compose up -d` completed successfully
   - Verify DATABASE_URL in backend/.env

2. **"AI features not working"**
   - Pollinations API is free and requires no key
   - Check your internet connection
   - Look for errors in backend console

3. **"Images not loading"**
   - Check S3 configuration in backend/.env
   - For local testing, images may use fallback placeholders

4. **"Styles not applying"**
   - Clear browser cache
   - Restart Next.js dev server
   - Check console for CSS errors

### Debug Mode

Enable detailed logging:

```bash
# Backend
cd backend
DEBUG=* npm run dev

# Frontend - check browser console
```

## ✅ Verification Checklist

After setup, verify:

- [ ] Homepage loads with gradient design
- [ ] Can sign up new account
- [ ] Can sign in with account
- [ ] Dashboard shows based on role
- [ ] Job search works with filters
- [ ] Job cards display correctly
- [ ] Can view job details
- [ ] AI features respond (may take a few seconds)
- [ ] Responsive on mobile (resize browser)
- [ ] All animations work smoothly

## 🎉 You're Ready!

Congratulations! You now have a fully functional, beautifully designed AI-powered job portal running locally. Explore all the features and enjoy the modern UI!

### Next Steps

1. Create your account (candidate or recruiter)
2. Explore the dashboard
3. Try AI features (cover letter, resume enhancement, JD generation)
4. Test the responsive design on different screen sizes
5. Check out the smooth animations and transitions

Happy job hunting! 🚀

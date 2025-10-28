# AI-Integrated Job Portal

An AI-powered job portal that accelerates job discovery for candidates and streamlines recruiting for hiring managers.

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: Firebase (Firestore, Realtime Database)
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Cloud Storage
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

### 3. Set Up Firebase

```bash
# 1. Create a Firebase project at https://console.firebase.google.com
# 2. Enable Authentication, Firestore, Realtime Database, and Storage
# 3. Download service account key and save as backend/firebase-service-account.json
# 4. Add Firebase configuration to backend/.env and frontend/.env

# Start Redis with Docker Compose
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

## Services

- **Firebase**: Cloud-hosted (Firestore, Authentication, Storage, Realtime Database)
- **Redis**: localhost:6379 (for caching)

## API Endpoints

- Health Check: `GET http://localhost:3001/health`
- API Root: `GET http://localhost:3001/api`

## Next Steps

Refer to the implementation plan in `.kiro/specs/ai-job-portal/tasks.md` for the next development tasks.

## 📚 Documentation

Comprehensive documentation is available to help you get started and understand the project:

### Quick Start

- **[QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)** - Get up and running in 5 minutes
- **[INDEX.md](INDEX.md)** - Complete documentation index

### Features & UI

- **[FEATURE_COMPLETION_SUMMARY.md](FEATURE_COMPLETION_SUMMARY.md)** - All implemented features
- **[UI_ENHANCEMENTS.md](UI_ENHANCEMENTS.md)** - UI design documentation
- **[UI_SHOWCASE.md](UI_SHOWCASE.md)** - Visual design showcase
- **[BEFORE_AFTER_COMPARISON.md](BEFORE_AFTER_COMPARISON.md)** - UI transformation

### Deployment & Operations

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[PERFORMANCE_OPTIMIZATIONS.md](PERFORMANCE_OPTIMIZATIONS.md)** - Performance guide
- **[VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)** - Verification checklist

### Summary

- **[FINAL_SUMMARY.md](FINAL_SUMMARY.md)** - Project completion summary

## 🎨 UI Highlights

The application features a beautiful, modern UI with:

- ✨ Gradient design system (Blue → Indigo)
- ✨ Smooth animations and transitions
- ✨ Responsive design (mobile, tablet, desktop)
- ✨ WCAG 2.1 AA accessibility compliance
- ✨ Professional components and layouts

## ✅ Project Status

**Status**: ✅ Complete & Production Ready

All 19 tasks from the requirements have been implemented:

- ✅ Authentication & User Management
- ✅ Job Search & Filtering
- ✅ AI-Powered Features (Resume, Cover Letter, JD Generation)
- ✅ Application Tracking
- ✅ Recruiter Dashboard & Tools
- ✅ Analytics & Monitoring
- ✅ Performance Optimization
- ✅ Accessibility Features
- ✅ SEO Optimization
- ✅ Comprehensive Testing

See [FEATURE_COMPLETION_SUMMARY.md](FEATURE_COMPLETION_SUMMARY.md) for details.

## 🚀 Key Features

### For Candidates

- 🔍 AI-powered job search and recommendations
- 📄 Resume upload with AI enhancement suggestions
- ✍️ AI-generated cover letters tailored to each job
- 📊 Application tracking with status updates
- 🎯 Job fit analysis with AI insights

### For Recruiters

- 📝 AI-assisted job description creation
- 🖼️ AI-generated hero images for job postings
- 👥 Candidate ranking with AI rationale
- ❓ AI-generated screening questions
- 📈 Dashboard with pipeline analytics

## 🎯 Quick Commands

```bash
# Start everything
docker-compose up -d
cd backend && npm run migrate && npm run dev &
cd .. && npm run dev

# Run tests
cd backend && npm test
cd ../frontend && npm run test:e2e

# Build for production
npm run build
cd backend && npm run build
```

## 🌟 What Makes This Special

1. **Complete AI Integration**: Pollinations API for text and image generation
2. **Beautiful Modern UI**: Professional gradient design with smooth animations
3. **Production Ready**: Docker, CI/CD, monitoring, error tracking
4. **Fully Accessible**: WCAG 2.1 AA compliant
5. **Well Tested**: Unit, integration, and E2E tests
6. **Comprehensive Documentation**: Guides for every aspect

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Android Chrome)

## 🔒 Security

- Firebase Authentication with ID tokens
- Firestore security rules for data access control
- Cloud Storage security rules for file access
- Realtime Database security rules
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- XSS prevention

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Pollinations AI for free AI API
- Next.js team for the amazing framework
- TailwindCSS for the utility-first CSS framework
- All open-source contributors

---

**Ready to revolutionize job searching and recruiting with AI!** 🚀

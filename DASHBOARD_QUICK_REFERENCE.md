# 🚀 Dashboard Quick Reference

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     FIXED SIDEBAR (288px)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Logo & Branding                                      │  │
│  │  ─────────────────────────────────────────────────   │  │
│  │  📊 Dashboard (Active)                                │  │
│  │  💼 Jobs                                              │  │
│  │  📝 Applications                                      │  │
│  │  👤 Profile                                           │  │
│  │  📄 Resume                                            │  │
│  │  ─────────────────────────────────────────────────   │  │
│  │  User Profile                                         │  │
│  │  🚪 Sign Out                                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    TOP HEADER (Sticky)                       │
│  Welcome Back, Basavaraj!        Today: October 31, 2025    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    STAT CARDS (3 columns)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Jobs     │  │ Recommend│  │ Profile  │                  │
│  │ Applied  │  │ Jobs     │  │ Strength │                  │
│  │   12     │  │   24     │  │   85%    │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              PROFILE COMPLETION BANNER                       │
│  🚀 Boost Your Profile - 85% Complete  [Complete Profile]   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  RECOMMENDED JOBS (2/3)    │    RECENT ACTIVITY (1/3)       │
│  ┌────────────────────┐    │    ┌──────────────────┐       │
│  │ Job Card 1         │    │    │ Activity 1       │       │
│  └────────────────────┘    │    ├──────────────────┤       │
│  ┌────────────────────┐    │    │ Activity 2       │       │
│  │ Job Card 2         │    │    ├──────────────────┤       │
│  └────────────────────┘    │    │ Activity 3       │       │
│  ┌────────────────────┐    │    └──────────────────┘       │
│  │ Job Card 3         │    │                                │
│  └────────────────────┘    │                                │
└─────────────────────────────────────────────────────────────┘
```

## Spacing Guide

### Padding
- **Sidebar**: 24px (p-6)
- **Main Content**: 80px left/right (px-20)
- **Cards**: 32px (p-8)
- **Sections**: 40px vertical gap (space-y-10)

### Gaps
- **Stat Cards**: 32px (gap-8)
- **Job Cards**: 20px (space-y-5)
- **Two Columns**: 32px (gap-8)

### Margins
- **Section Spacing**: 40px (space-y-10)
- **Card Spacing**: 24px (space-y-6)

## Color Palette

### Gradients
```css
/* Blue Gradient */
from-blue-600 to-indigo-600

/* Purple Gradient */
from-purple-500 to-pink-600

/* Orange Gradient */
from-orange-500 to-rose-500

/* Emerald Gradient */
from-emerald-500 to-teal-600
```

### Background
```css
/* Main Background */
bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40

/* Cards */
bg-white border-2 border-gray-100
```

## Component Sizes

### Icons
- **Sidebar Icons**: 24px (w-6 h-6)
- **Stat Card Icons**: 32px (w-8 h-8)
- **Section Icons**: 24px (w-6 h-6)

### Buttons
- **Primary**: px-8 py-4 rounded-2xl
- **Secondary**: px-6 py-3 rounded-xl
- **Icon Size**: 20px (w-5 h-5)

### Cards
- **Stat Cards**: p-8 rounded-2xl
- **Job Cards**: p-6 rounded-2xl
- **Activity Cards**: p-5 rounded-2xl

## Typography Scale

```css
/* Headings */
H1: text-3xl (30px) - Page Title
H2: text-2xl (24px) - Section Title
H3: text-xl (20px) - Card Title

/* Body */
Body: text-base (16px)
Small: text-sm (14px)
Extra Small: text-xs (12px)

/* Numbers */
Stats: text-4xl (36px) font-bold
```

## Shadow Levels

```css
/* Soft */
shadow-sm - Subtle elevation

/* Card */
shadow-lg - Default cards

/* Hover */
shadow-xl - Interactive elements

/* Premium */
shadow-2xl - Important elements
```

## Border Radius

```css
/* Small */
rounded-xl (12px) - Buttons

/* Medium */
rounded-2xl (16px) - Cards

/* Large */
rounded-3xl (24px) - Special cards
```

## Hover Effects

### Cards
```css
hover:shadow-xl
transition-all
```

### Buttons
```css
hover:-translate-y-1
hover:shadow-lg
transition-all
```

### Icons
```css
group-hover:scale-110
transition-transform
```

## Quick Commands

### Start Development
```bash
cd frontend
npm run dev
```

### Build for Production
```bash
cd frontend
npm run build
```

### Run Tests
```bash
cd frontend
npm test
```

## File Locations

```
frontend/
├── app/
│   └── dashboard/
│       └── page.tsx          # Dashboard route
├── components/
│   └── dashboard/
│       └── CandidateDashboard.tsx  # Main dashboard component
└── app/
    └── globals.css           # Global styles & variables
```

## Key Features

✅ Fixed sidebar navigation
✅ Sticky top header
✅ Three stat cards
✅ Profile completion banner
✅ Two-column layout
✅ Recommended jobs section
✅ Recent activity sidebar
✅ Consistent spacing (32px)
✅ Premium gradients
✅ Smooth animations
✅ Responsive design
✅ Loading states

## Testing Checklist

- [ ] Sidebar is fixed on left
- [ ] Navigation items work
- [ ] Active state highlights correctly
- [ ] Stat cards display data
- [ ] Profile banner shows when < 100%
- [ ] Jobs load and display
- [ ] Activity section works
- [ ] All spacing is consistent (32px)
- [ ] Hover effects are smooth
- [ ] Sign out button works
- [ ] Mobile responsive (future)

---

**Quick Start**: Navigate to `/dashboard` after signing in to see the new design!

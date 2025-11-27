# Dashboard Redesign V2 - Clean & Minimal

## Design System

### Color Palette
- **Background**: `#0f0f1a` (Deep dark blue-black)
- **Card Background**: `#16161f` (Slightly lighter dark)
- **Primary Accent**: `#9b5de5` (Light violet)
- **Primary Hover**: `#8b4dd5` (Darker violet)
- **Text Primary**: `white`
- **Text Secondary**: `white/50` (50% opacity)
- **Text Tertiary**: `white/40` (40% opacity)
- **Borders**: `white/5` (5% opacity)
- **Hover Borders**: `#9b5de5/20` (20% opacity)

### Design Principles
1. **Flat Design**: No gradients, glows, or heavy shadows
2. **Clean Spacing**: Consistent padding and margins
3. **Minimal Borders**: Subtle borders with low opacity
4. **Smooth Corners**: Rounded corners (8px-12px)
5. **Clear Typography**: Easy-to-read font sizes and weights
6. **Professional**: Modern, premium look without being flashy

## Component Updates

### Sidebar
- **Width**: 240px (60 in Tailwind)
- **Background**: `#16161f`
- **Border**: `border-white/5`
- **Logo**: 36px square with `#9b5de5` background
- **Navigation Items**: 
  - Padding: `px-3 py-2.5`
  - Border radius: `rounded-lg`
  - Active state: `bg-[#9b5de5]/10` with `border-[#9b5de5]/20`
  - Hover state: `bg-white/5`
- **User Section**: Compact with 36px avatar

### Top Bar
- **Background**: `#16161f`
- **Border**: `border-b border-white/5`
- **Height**: Auto with `px-6 py-4` padding
- **Title**: `text-xl font-semibold`
- **Date Badge**: Minimal with `bg-white/5` and `rounded-lg`

### Stats Cards
- **Background**: `#16161f`
- **Border**: `border-white/5`
- **Hover Border**: `border-[#9b5de5]/20`
- **Border Radius**: `rounded-xl`
- **Padding**: `p-5`
- **Icon Container**: 
  - Size: 40px (p-2)
  - Background: Color-specific with 10% opacity
  - Border radius: `rounded-lg`
- **Number**: `text-3xl font-bold`
- **Label**: `text-sm text-white/50`
- **Badge**: Small rounded badge with matching colors

### Content Cards
- **Background**: `#16161f`
- **Border**: `border-white/5`
- **Border Radius**: `rounded-xl`
- **Padding**: `p-5`
- **Title**: `text-base font-semibold`
- **Subtitle**: `text-sm text-white/50`

### Buttons
- **Primary**: 
  - Background: `#9b5de5`
  - Hover: `#8b4dd5`
  - Text: `white`
  - Padding: `px-5 py-2.5`
  - Border radius: `rounded-lg`
  - Font: `text-sm font-medium`
- **Secondary**:
  - Background: `white/5`
  - Hover: `white/10`
  - Border: `border-white/5`
  - Text: `white`

### Quick Actions
- **Container**: `bg-white/5` with `border-white/5`
- **Padding**: `p-2.5`
- **Border Radius**: `rounded-lg`
- **Icon Size**: 16px (w-4 h-4)
- **Arrow**: Subtle translate on hover

### AI Insights
- **Dot Indicator**: 6px (w-1.5 h-1.5) with color-coded backgrounds
- **Progress Bar**: 
  - Height: 4px (h-1)
  - Background: `white/10`
  - Fill: Color-specific
  - Border radius: `rounded-full`

### Profile Completion Banner
- **Background**: `#16161f`
- **Border**: `border-[#9b5de5]/20`
- **Icon Container**: `bg-[#9b5de5]/10`
- **Progress Bar**: 6px height with `#9b5de5` fill

### Loading State
- **Spinner**: 48px with `border-[#9b5de5]/20` and `border-t-[#9b5de5]`
- **Text**: `text-sm text-white/70`

### Scrollbar
- **Width**: 4px
- **Track**: `rgba(255, 255, 255, 0.03)`
- **Thumb**: `#9b5de5`
- **Thumb Hover**: `#8b4dd5`

## Typography Scale
- **Page Title**: `text-xl font-semibold`
- **Card Title**: `text-base font-semibold`
- **Section Title**: `text-lg font-semibold`
- **Body Text**: `text-sm`
- **Caption**: `text-xs`
- **Stats Number**: `text-3xl font-bold`

## Spacing System
- **Card Gap**: 16px (gap-4)
- **Section Gap**: 20px (gap-5)
- **Card Padding**: 20px (p-5)
- **Button Padding**: `px-5 py-2.5`
- **Icon Padding**: `p-2`

## Border Radius
- **Small**: 8px (rounded-lg)
- **Medium**: 12px (rounded-xl)
- **Circle**: 9999px (rounded-full)

## Key Features
1. ✅ Dark background (#0f0f1a) with light violet highlights (#9b5de5)
2. ✅ All cards are flat with no glows or heavy gradients
3. ✅ Well-aligned with consistent spacing
4. ✅ Minimal design with smooth rounded corners
5. ✅ Clear typography with proper hierarchy
6. ✅ Compact sidebar that's easy to read
7. ✅ Dashboard cards look like clean panels
8. ✅ Small icons with clean labels
9. ✅ Modern, premium, and easy on the eyes
10. ✅ Not flashy - professional and subtle

## Accessibility
- High contrast text (white on dark)
- Clear focus states
- Readable font sizes
- Proper spacing for touch targets
- Semantic HTML structure

## Browser Support
- Modern browsers with CSS custom properties
- Webkit scrollbar styling
- Backdrop filter support
- CSS Grid and Flexbox

## Performance
- Minimal animations (only on hover/focus)
- No heavy shadows or filters
- Optimized for 60fps
- Reduced motion support

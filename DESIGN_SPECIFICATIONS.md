# 📐 Design Specifications - Exact Measurements

## 🎯 Component Specifications

### Navbar
```
Height: 64px (h-16)
Background: white/95 with backdrop-blur
Border: 1px bottom, gray-100
Position: sticky top-0
Z-index: 50

Logo:
  - Size: 40px × 40px
  - Border radius: 12px (rounded-xl)
  - Gradient: blue-600 → indigo-600

Title:
  - Font size: 18px (text-lg)
  - Font weight: 700 (bold)
  - Gradient text: blue-600 → indigo-600

Navigation Links:
  - Padding: 8px 16px (px-4 py-2)
  - Border radius: 12px (rounded-xl)
  - Gap: 8px between links
  - Hover: bg-blue-50

Search Bar:
  - Max width: 448px (max-w-md)
  - Height: 40px (py-2.5)
  - Border radius: 12px (rounded-xl)
  - Padding left: 40px (for icon)

Buttons:
  - Sign In: px-5 py-2.5 (20px × 10px)
  - Get Started: px-6 py-2.5 (24px × 10px)
  - Border radius: 12px (rounded-xl)
  - Shadow: lg with blue-500/25
```

### Hero Section
```
Padding:
  - Desktop: py-20 (80px top/bottom)
  - Large: py-32 (128px top/bottom)
  - Horizontal: px-4 sm:px-6 lg:px-8

Badge:
  - Padding: 10px 20px (px-5 py-2.5)
  - Border radius: 9999px (rounded-full)
  - Margin bottom: 32px (mb-8)

Heading:
  - Font size: 
    * Mobile: 3rem (text-5xl)
    * Tablet: 3.75rem (text-6xl)
    * Desktop: 4.5rem (text-7xl)
  - Line height: 1.2
  - Letter spacing: -0.02em
  - Margin bottom: 32px (mb-8)

Subtext:
  - Font size: 1.25rem → 1.5rem (text-xl → text-2xl)
  - Max width: 768px (max-w-3xl)
  - Margin bottom: 40px (mb-10)
  - Line height: 1.75

Buttons:
  - Padding: 16px 40px (px-10 py-4)
  - Border radius: 12px (rounded-xl)
  - Gap: 16px (gap-4)
  - Font size: 18px (text-lg)
  - Shadow: xl with blue-500/30
```

### Feature Cards
```
Grid:
  - Columns: 1 (mobile) → 3 (desktop)
  - Gap: 32px (gap-8)

Card:
  - Padding: 40px (p-10)
  - Border radius: 16px (rounded-2xl)
  - Background: white/90
  - Border: 1px gray-100
  - Shadow: xl
  - Hover: -translate-y-2 (8px up)

Icon Container:
  - Size: 64px × 64px (w-16 h-16)
  - Border radius: 16px (rounded-2xl)
  - Margin bottom: 24px (mb-6)
  - Shadow: lg
  - Hover scale: 110%

Icon:
  - Size: 36px × 36px (w-9 h-9)
  - Stroke width: 2

Title:
  - Font size: 24px (text-2xl)
  - Font weight: 700 (bold)
  - Margin bottom: 16px (mb-4)

Description:
  - Font size: 16px (text-base)
  - Line height: 1.75 (leading-relaxed)
  - Color: gray-600
```

### Dashboard Welcome Header
```
Container:
  - Padding: 32px → 40px (p-8 lg:p-10)
  - Border radius: 16px (rounded-2xl)
  - Margin bottom: 32px (mb-8)
  - Gradient: blue-600 → indigo-600 → purple-700

Avatar:
  - Size: 80px × 80px (w-20 h-20)
  - Border radius: 16px (rounded-2xl)
  - Background: white/20
  - Border: 1px white/30
  - Font size: 32px (text-3xl)

Title:
  - Font size: 
    * Mobile: 1.875rem (text-3xl)
    * Desktop: 2.25rem (text-4xl)
  - Color: white
  - Margin bottom: 8px (mt-2)

Subtitle:
  - Font size: 16px → 18px (text-base → text-lg)
  - Color: blue-100

Stat Cards:
  - Grid: 1 col (mobile) → 3 cols (desktop)
  - Gap: 24px (gap-6)
  - Padding: 24px (p-6)
  - Border radius: 12px (rounded-xl)
  - Background: white/10
  - Border: 1px white/20

Stat Icon:
  - Size: 56px × 56px (w-14 h-14)
  - Border radius: 12px (rounded-xl)
  - Background: white/20

Stat Value:
  - Font size: 32px (text-3xl)
  - Font weight: 700 (bold)
  - Color: white
```

### Profile Completion Banner
```
Container:
  - Padding: 32px (p-8)
  - Border radius: 16px (rounded-2xl)
  - Margin bottom: 32px (mb-8)
  - Gradient: amber-50 → orange-50 → red-50
  - Border: 1px orange-200

Icon Container:
  - Size: 56px × 56px (w-14 h-14)
  - Border radius: 12px (rounded-xl)
  - Gradient: orange-500 → red-500

Progress Bar:
  - Height: 12px (h-3)
  - Border radius: 9999px (rounded-full)
  - Margin top: 12px (mt-3)
  - Background: orange-200/50

Circular Progress:
  - Size: 64px × 64px
  - Stroke width: 6px
  - Gradient: orange-500 → red-500

Button:
  - Padding: 12px 24px (px-6 py-3)
  - Border radius: 12px (rounded-xl)
  - Shadow: lg with orange-500/30
```

### Content Layout (Dashboard)
```
Grid:
  - Columns: 1 (mobile) → 3 (desktop)
  - Gap: 32px (gap-8)
  - Main content: 2 columns (lg:col-span-2)
  - Sidebar: 1 column

Section Headers:
  - Icon size: 48px × 48px (w-12 h-12)
  - Border radius: 12px (rounded-xl)
  - Gap: 12px (gap-3)
  - Margin bottom: 24px (mb-6)

Section Title:
  - Font size: 24px (text-2xl)
  - Font weight: 700 (bold)

Job Cards:
  - Gap: 20px (gap-5)
  - Fade-in delay: 100ms per card

Sidebar Sections:
  - Gap: 32px (gap-8)
  - Card padding: 16px (p-4)
  - Border radius: 12px (rounded-xl)

Quick Action Items:
  - Padding: 16px (p-4)
  - Icon size: 44px × 44px (w-11 h-11)
  - Border radius: 12px (rounded-xl)
  - Hover scale: 110%
```

### Footer
```
Container:
  - Padding: 64px vertical (py-16)
  - Gradient: slate-900 → blue-900 → indigo-900

Grid:
  - Columns: 1 (mobile) → 4 (desktop)
  - Gap: 48px (gap-12)
  - Margin bottom: 48px (mb-12)

Logo:
  - Size: 40px × 40px (w-10 h-10)
  - Border radius: 12px (rounded-xl)
  - Shadow: lg

Social Icons:
  - Size: 40px × 40px (w-10 h-10)
  - Border radius: 8px (rounded-lg)
  - Gap: 12px (gap-3)
  - Background: white/10
  - Hover: white/20, scale-110

Column Titles:
  - Font size: 18px (text-lg)
  - Font weight: 700 (bold)
  - Margin bottom: 16px (mb-4)

Links:
  - Font size: 14px (text-sm)
  - Gap: 12px (gap-3)
  - Bullet size: 6px (w-1.5 h-1.5)

Bottom Bar:
  - Border top: 1px white/10
  - Padding top: 32px (pt-8)
  - Font size: 14px (text-sm)
```

## 📏 Spacing System Reference

### Tailwind to Pixels
```
p-1  = 4px      gap-1  = 4px      m-1  = 4px
p-2  = 8px      gap-2  = 8px      m-2  = 8px
p-3  = 12px     gap-3  = 12px     m-3  = 12px
p-4  = 16px     gap-4  = 16px     m-4  = 16px
p-5  = 20px     gap-5  = 20px     m-5  = 20px
p-6  = 24px     gap-6  = 24px     m-6  = 24px
p-8  = 32px     gap-8  = 32px     m-8  = 32px
p-10 = 40px     gap-10 = 40px     m-10 = 40px
p-12 = 48px     gap-12 = 48px     m-12 = 48px
p-16 = 64px     gap-16 = 64px     m-16 = 64px
p-20 = 80px     gap-20 = 80px     m-20 = 80px
```

### Border Radius
```
rounded-none = 0px
rounded-sm   = 2px
rounded      = 4px
rounded-md   = 6px
rounded-lg   = 8px
rounded-xl   = 12px
rounded-2xl  = 16px
rounded-3xl  = 24px
rounded-full = 9999px
```

### Font Sizes
```
text-xs   = 12px (0.75rem)
text-sm   = 14px (0.875rem)
text-base = 16px (1rem)
text-lg   = 18px (1.125rem)
text-xl   = 20px (1.25rem)
text-2xl  = 24px (1.5rem)
text-3xl  = 30px (1.875rem)
text-4xl  = 36px (2.25rem)
text-5xl  = 48px (3rem)
text-6xl  = 60px (3.75rem)
text-7xl  = 72px (4.5rem)
```

### Shadows
```
shadow-sm  = 0 1px 2px rgba(0,0,0,0.05)
shadow     = 0 1px 3px rgba(0,0,0,0.1)
shadow-md  = 0 4px 6px rgba(0,0,0,0.1)
shadow-lg  = 0 10px 15px rgba(0,0,0,0.1)
shadow-xl  = 0 20px 25px rgba(0,0,0,0.1)
shadow-2xl = 0 25px 50px rgba(0,0,0,0.25)
```

## 🎨 Color Values

### Primary Colors
```
blue-50:  #eff6ff
blue-100: #dbeafe
blue-500: #3b82f6
blue-600: #2563eb
blue-700: #1d4ed8

indigo-50:  #eef2ff
indigo-100: #e0e7ff
indigo-500: #6366f1
indigo-600: #4f46e5
indigo-700: #4338ca

purple-500: #a855f7
purple-600: #9333ea
purple-700: #7e22ce
```

### Neutral Colors
```
slate-50:  #f8fafc
slate-900: #0f172a

gray-50:  #f9fafb
gray-100: #f3f4f6
gray-200: #e5e7eb
gray-400: #9ca3af
gray-500: #6b7280
gray-600: #4b5563
gray-700: #374151
gray-900: #111827
```

### Accent Colors
```
amber-50:  #fffbeb
orange-50: #fff7ed
orange-200: #fed7aa
orange-500: #f97316
red-50:    #fef2f2
red-500:   #ef4444
```

## 📐 Breakpoints

```
sm:  640px  - Small devices (landscape phones)
md:  768px  - Medium devices (tablets)
lg:  1024px - Large devices (desktops)
xl:  1280px - Extra large devices
2xl: 1536px - 2X large devices
```

## 🎯 Z-Index Layers

```
z-0:  0   - Base layer
z-10: 10  - Dropdowns
z-20: 20  - Sticky elements
z-30: 30  - Fixed elements
z-40: 40  - Overlays
z-50: 50  - Modals/Navigation
```

## ⚡ Animation Timing

```
Duration:
  - Fast: 150ms
  - Normal: 300ms
  - Slow: 500ms

Easing:
  - ease-in: cubic-bezier(0.4, 0, 1, 1)
  - ease-out: cubic-bezier(0, 0, 0.2, 1)
  - ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

## 📊 Aspect Ratios

```
Icons: 1:1 (square)
Cards: 16:9 or auto
Images: 16:9 or 4:3
Avatars: 1:1 (square or circle)
```

This specification document provides exact measurements for every component in the redesigned AI Job Portal. Use these values to maintain consistency when adding new features or making modifications.

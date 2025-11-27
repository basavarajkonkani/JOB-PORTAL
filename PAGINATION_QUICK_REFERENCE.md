# 🎯 Pagination Quick Reference Card

## 📍 Component Location
```
frontend/components/jobs/Pagination.tsx
```

## 🚀 Quick Usage

```tsx
import Pagination from '@/components/jobs/Pagination';

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={(page) => handlePageChange(page)}
  isLoading={loading}
/>
```

## 🎨 Visual Features at a Glance

| Feature | Implementation |
|---------|---------------|
| **Centering** | `flex items-center justify-center` |
| **Spacing Above** | `mt-12` (48px) |
| **Spacing Below** | `mb-16` (64px) |
| **Separator** | `bg-gray-200/40` (40% opacity) |
| **Active Color** | `#005DFF` (Deep Blue) |
| **Hover Color** | `#4EA8FF` (Light Blue) |
| **Transition** | `0.2s ease-in-out` |
| **Hover Scale** | `1.05` |
| **Button Shape** | `rounded-full` (pill) |
| **Shadow** | `shadow-sm` → `shadow-lg` |

## 📱 Responsive Behavior

```
Mobile:   ← [1] [2] [3] ... [10] →
Desktop:  ← Previous [1] [2] [3] ... [10] Next →
```

## 🎯 Smart Page Display

```typescript
// 7 or fewer pages: Show all
[1] [2] [3] [4] [5] [6] [7]

// Many pages, near start:
[1] [2] [3] [4] ... [20]

// Many pages, in middle:
[1] ... [8] [9] [10] ... [20]

// Many pages, near end:
[1] ... [17] [18] [19] [20]
```

## ♿ Accessibility

```tsx
// ARIA labels
aria-label="Previous page"
aria-label="Go to page 3"
aria-current="page"  // On active page

// Keyboard support
Tab → Navigate between buttons
Enter/Space → Activate button
```

## 🎨 Color States

```css
/* Default */
bg: white, text: gray-700, border: gray-200

/* Hover */
bg: #4EA8FF/10, text: #005DFF, border: #4EA8FF

/* Active */
bg: #005DFF, text: white, scale: 1.05

/* Disabled */
opacity: 40%, cursor: not-allowed
```

## 🔧 Props Interface

```typescript
interface PaginationProps {
  currentPage: number;        // Required: Current page (1-indexed)
  totalPages: number;         // Required: Total page count
  onPageChange: (page: number) => void;  // Required: Callback
  isLoading?: boolean;        // Optional: Disable during load
}
```

## 📊 Integration Points

### Adzuna Jobs (External API)
```tsx
{adzunaJobs.length > 0 && adzunaTotalCount > 10 && (
  <Pagination
    currentPage={adzunaPage}
    totalPages={Math.ceil(adzunaTotalCount / 10)}
    onPageChange={(page) => {
      searchAdzunaJobs(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }}
    isLoading={adzunaLoading}
  />
)}
```

### Organization Jobs (Internal)
```tsx
{internalJobs.length > jobsPerPage && (
  <Pagination
    currentPage={internalPage}
    totalPages={internalTotalPages}
    onPageChange={(page) => {
      setInternalPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }}
    isLoading={internalLoading}
  />
)}
```

## 🎯 Key CSS Classes

```tsx
// Container
"mt-12 mb-16"  // Spacing

// Separator
"w-full h-px bg-gray-200/40 mb-12"

// Button Base
"px-4 py-2.5 font-medium rounded-full transition-all duration-200 ease-in-out shadow-sm"

// Hover Effects
"hover:scale-105 hover:shadow-lg"

// Active State
"bg-[#005DFF] text-white shadow-md scale-105"

// Disabled State
"disabled:opacity-40 disabled:cursor-not-allowed"
```

## 🚀 Performance Tips

1. **Memoization**: Wrap in `React.memo` if needed
2. **Scroll**: Use `behavior: 'smooth'` for UX
3. **Loading**: Always pass `isLoading` prop
4. **Conditional**: Only render when `totalPages > 1`

## ✅ Checklist Before Deploy

- [ ] Component imported correctly
- [ ] Props passed with correct types
- [ ] Smooth scroll implemented
- [ ] Loading state handled
- [ ] Tested on mobile
- [ ] Tested keyboard navigation
- [ ] Verified accessibility

## 🎉 That's It!

**Simple, powerful, and beautiful pagination in one component! 🌟**

---

*For detailed documentation, see:*
- `PAGINATION_UPGRADE.md` - Full feature list
- `PAGINATION_VISUAL_GUIDE.md` - Visual design guide
- `PAGINATION_IMPLEMENTATION_SUMMARY.md` - Complete overview

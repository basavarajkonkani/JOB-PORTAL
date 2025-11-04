# Quick Test Guide - Sign-In Page Cross-Browser Testing

## Quick Start

### 1. Install Playwright Browsers (First Time Only)
```bash
cd frontend
npx playwright install
```

### 2. Run All Tests
```bash
./test-signin-browsers.sh all
```

### 3. View Results
```bash
./test-signin-browsers.sh report
```

## Common Commands

### Test Specific Browser
```bash
./test-signin-browsers.sh chrome    # Chrome only
./test-signin-browsers.sh firefox   # Firefox only
./test-signin-browsers.sh safari    # Safari only
```

### Test Specific Device Type
```bash
./test-signin-browsers.sh mobile    # Mobile tests
./test-signin-browsers.sh tablet    # Tablet tests
./test-signin-browsers.sh desktop   # Desktop tests
```

### Test All Breakpoints
```bash
./test-signin-browsers.sh breakpoints
```

### Interactive Testing (Debug Mode)
```bash
./test-signin-browsers.sh ui
```

## Manual Testing

### Desktop (1024px+)
1. Open `/signin` in browser
2. Verify split-screen layout
3. Check hero section on left
4. Check form panel on right
5. Test form submission

### Mobile (375px)
1. Open `/signin` in mobile browser or DevTools
2. Verify single-column layout
3. Check hero is hidden
4. Test touch interactions
5. Verify form submission

### Tablet (768px)
1. Open `/signin` at tablet size
2. Verify layout adaptation
3. Test form functionality

## Troubleshooting

### Browsers Not Installed
```bash
npx playwright install
```

### Tests Failing
```bash
# Run in UI mode to debug
./test-signin-browsers.sh ui
```

### Need Fresh Screenshots
```bash
npx playwright test signin-visual-regression.spec.ts --update-snapshots
```

## Test Coverage

✅ Chrome, Firefox, Safari, Edge (latest 2 versions)
✅ iOS Safari and Chrome Android
✅ Breakpoints: 375px, 768px, 1024px, 1920px
✅ Touch interactions
✅ Form submission
✅ Visual consistency

## Documentation

- Full guide: `e2e/SIGNIN_CROSS_BROWSER_TESTING.md`
- Summary: `SIGNIN_CROSS_BROWSER_TEST_SUMMARY.md`
- Test files: `e2e/signin-cross-browser.spec.ts`

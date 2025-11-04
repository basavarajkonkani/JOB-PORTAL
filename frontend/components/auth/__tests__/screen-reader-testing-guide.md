# Screen Reader Testing Guide - SignIn Page

## Overview
This guide provides instructions for manually testing the SignIn page with screen readers to verify accessibility compliance beyond automated testing.

---

## Screen Readers to Test

### Windows
- **NVDA** (Free, recommended): https://www.nvaccess.org/download/
- **JAWS** (Commercial): https://www.freedomscientific.com/products/software/jaws/

### macOS
- **VoiceOver** (Built-in): Cmd+F5 to enable

### Mobile
- **VoiceOver** (iOS): Settings > Accessibility > VoiceOver
- **TalkBack** (Android): Settings > Accessibility > TalkBack

---

## Testing Checklist

### 1. Page Load and Structure

#### Expected Announcements
- [ ] Page title announced: "Sign In - AI Job Portal"
- [ ] Main landmark announced
- [ ] Complementary landmark announced (hero section on desktop)

#### Test Steps
1. Navigate to `/signin` page
2. Listen for page title announcement
3. Use landmark navigation (NVDA: D key, VoiceOver: VO+U)
4. Verify main and complementary regions are announced

---

### 2. Hero Section (Desktop Only)

#### Expected Announcements
- [ ] "Platform information and statistics, complementary"
- [ ] Heading level 2: "Hire Interns and Freshers Faster"
- [ ] List with 2 items announced
- [ ] "Platform benefits, list"
- [ ] Each bullet point read correctly
- [ ] "Platform statistics, region"
- [ ] Statistics: "32 million plus candidates", "100 thousand plus companies", "900 plus cities"
- [ ] "User ratings, region"
- [ ] "4.5 out of 5 stars, image"
- [ ] Rating text: "4.5 Rated by 2,448 users as on 6th October 2025"
- [ ] Image: "Professional using laptop for hiring"

#### Test Steps
1. Navigate to hero section (left side on desktop)
2. Use heading navigation (H key in NVDA)
3. Use list navigation (L key in NVDA)
4. Use region navigation (D key in NVDA)
5. Verify all content is announced correctly
6. Verify decorative icons are NOT announced

---

### 3. Form Panel

#### Expected Announcements

##### Page Heading
- [ ] "Sign In to Your Account, heading level 1" (screen reader only)

##### Google Button
- [ ] "Sign up with Google, button"
- [ ] Button state announced (enabled/disabled)
- [ ] Loading state: "Signing in..."

##### OR Divider
- [ ] "OR" text should be announced but marked as decorative context

##### Form
- [ ] "Sign in form, form"

##### Email Input
- [ ] "Official Email Id, required, edit, blank"
- [ ] Required state announced
- [ ] Type announced as "edit" or "text field"
- [ ] Placeholder NOT announced (correct behavior)

##### Password Input
- [ ] "Password, required, password edit, blank"
- [ ] Required state announced
- [ ] Type announced as "password"
- [ ] Secure entry mode indicated

##### First Name Input
- [ ] "First Name, edit, blank"
- [ ] NOT announced as required (correct)

##### Last Name Input
- [ ] "Last Name, edit, blank"
- [ ] NOT announced as required (correct)

##### Country Code Select
- [ ] "Country Code, combo box, +91"
- [ ] Current selection announced

##### Mobile Number Input
- [ ] "Mobile Number, edit, blank"
- [ ] Type may be announced as "telephone"

##### Submit Button
- [ ] "Submit sign in form, button"
- [ ] Button state announced
- [ ] Loading state: "Signing in..."

##### Login Link
- [ ] "Go to login page, link"
- [ ] Context: "Already registered? Login"

#### Test Steps
1. Tab through all form elements
2. Verify each element is announced with correct role
3. Verify required fields are announced as required
4. Verify button states are announced
5. Verify form landmark is announced

---

### 4. Error Handling

#### Expected Announcements
- [ ] Error message announced immediately (assertive)
- [ ] Full error text read: e.g., "Invalid email or password"
- [ ] Error icon NOT announced (decorative)
- [ ] Form inputs announce error state: "invalid"
- [ ] Error message linked to inputs via aria-describedby

#### Test Steps
1. Submit form with invalid credentials
2. Verify error is announced immediately
3. Navigate to email input
4. Verify "invalid" state is announced
5. Verify error message is associated with input

---

### 5. Keyboard Navigation

#### Tab Order
1. [ ] Google Sign-In Button
2. [ ] Email Input
3. [ ] Password Input
4. [ ] First Name Input
5. [ ] Last Name Input
6. [ ] Country Code Select
7. [ ] Mobile Number Input
8. [ ] Submit Button
9. [ ] Login Link

#### Test Steps
1. Use Tab key to navigate forward
2. Use Shift+Tab to navigate backward
3. Verify tab order matches visual layout
4. Verify no elements are skipped
5. Verify no keyboard traps

---

### 6. Form Submission

#### Expected Behavior
- [ ] Enter key submits form from any input
- [ ] Space key activates buttons
- [ ] Loading state announced during submission
- [ ] Success: Navigation to dashboard
- [ ] Failure: Error announced immediately

#### Test Steps
1. Fill in email and password
2. Press Enter from password field
3. Verify form submits
4. Verify loading state is announced
5. Test with invalid credentials
6. Verify error is announced

---

### 7. Focus Management

#### Expected Behavior
- [ ] Focus visible on all interactive elements
- [ ] Focus not lost during state changes
- [ ] Focus not trapped in any component
- [ ] Disabled elements announced as disabled
- [ ] Focus order preserved during loading

#### Test Steps
1. Tab through all elements
2. Verify focus is always visible
3. Click Google button (triggers loading)
4. Verify focus is maintained
5. Verify disabled state is announced

---

### 8. Mobile Testing (VoiceOver/TalkBack)

#### Expected Behavior
- [ ] Hero section hidden on mobile (correct)
- [ ] Form takes full width
- [ ] Touch targets are large enough
- [ ] Swipe gestures work correctly
- [ ] Double-tap activates elements
- [ ] Form inputs trigger correct keyboards

#### Test Steps
1. Enable screen reader on mobile device
2. Navigate to sign-in page
3. Swipe through all elements
4. Verify hero section is not present
5. Verify all form elements are accessible
6. Test form submission

---

## Common Issues to Check

### ❌ Issues to Avoid
- [ ] Decorative images announced (should be aria-hidden)
- [ ] Icons without text announced (should be aria-hidden)
- [ ] Placeholder text announced as label (incorrect)
- [ ] Required state not announced
- [ ] Error messages not announced immediately
- [ ] Focus lost during state changes
- [ ] Keyboard traps
- [ ] Incorrect heading hierarchy
- [ ] Missing form labels
- [ ] Incorrect ARIA roles

### ✅ Expected Behavior
- [x] All form inputs have labels
- [x] Required fields announced as required
- [x] Errors announced immediately
- [x] Loading states announced
- [x] Button states announced
- [x] Logical tab order
- [x] No keyboard traps
- [x] Proper heading hierarchy
- [x] Decorative elements hidden
- [x] Semantic HTML used

---

## Screen Reader Commands Reference

### NVDA (Windows)
- **Start/Stop**: Ctrl+Alt+N
- **Next element**: Tab
- **Previous element**: Shift+Tab
- **Next heading**: H
- **Next landmark**: D
- **Next form field**: F
- **Next button**: B
- **Next link**: K
- **Next list**: L
- **Elements list**: NVDA+F7
- **Read all**: NVDA+Down Arrow

### VoiceOver (macOS)
- **Start/Stop**: Cmd+F5
- **Next element**: VO+Right Arrow (VO = Ctrl+Option)
- **Previous element**: VO+Left Arrow
- **Next heading**: VO+Cmd+H
- **Next landmark**: VO+U, then arrow keys
- **Next form field**: VO+Cmd+J
- **Interact with element**: VO+Space
- **Read all**: VO+A

### VoiceOver (iOS)
- **Enable**: Triple-click home button (or side button)
- **Next element**: Swipe right
- **Previous element**: Swipe left
- **Activate**: Double-tap
- **Rotor**: Rotate two fingers
- **Read all**: Two-finger swipe down

### TalkBack (Android)
- **Enable**: Volume keys (both) for 3 seconds
- **Next element**: Swipe right
- **Previous element**: Swipe left
- **Activate**: Double-tap
- **Local context menu**: Swipe up then right
- **Read from top**: Swipe down then right

---

## Testing Scenarios

### Scenario 1: First-Time User
1. Navigate to sign-in page
2. Explore page structure with landmarks
3. Navigate to form
4. Fill in email and password
5. Submit form
6. Handle any errors

### Scenario 2: Google Sign-In
1. Navigate to sign-in page
2. Tab to Google button
3. Activate with Space or Enter
4. Verify loading state announced
5. Handle success or error

### Scenario 3: Error Recovery
1. Submit form with invalid data
2. Verify error announced immediately
3. Navigate to first input
4. Correct the error
5. Resubmit form
6. Verify success

### Scenario 4: Mobile Experience
1. Enable screen reader on mobile
2. Navigate to sign-in page
3. Swipe through all elements
4. Fill in form using mobile keyboard
5. Submit form
6. Verify all interactions work

---

## Expected Test Results

### ✅ Pass Criteria
- All interactive elements are announced
- All labels are associated with inputs
- Required fields are announced as required
- Errors are announced immediately
- Loading states are announced
- Tab order is logical
- No keyboard traps
- Proper heading hierarchy
- Decorative elements are hidden
- Form can be completed using screen reader only

### ❌ Fail Criteria
- Any interactive element not announced
- Missing or incorrect labels
- Required state not announced
- Errors not announced or delayed
- Focus lost during interactions
- Keyboard traps present
- Illogical tab order
- Decorative elements announced
- Form cannot be completed

---

## Reporting Issues

If you find any accessibility issues during testing:

1. **Document the issue**:
   - Screen reader used
   - Operating system
   - Browser
   - Steps to reproduce
   - Expected behavior
   - Actual behavior

2. **Severity levels**:
   - **Critical**: Prevents form completion
   - **High**: Significantly impacts usability
   - **Medium**: Causes confusion but workaround exists
   - **Low**: Minor annoyance

3. **Create issue** with:
   - Clear title
   - Detailed description
   - Steps to reproduce
   - Screenshots/recordings if possible
   - Suggested fix

---

## Conclusion

This guide provides comprehensive instructions for manual screen reader testing. While automated tests show excellent compliance, manual testing with real screen readers is essential to verify the actual user experience.

**Estimated Testing Time**: 30-45 minutes per screen reader

**Recommended Testing**: At minimum, test with NVDA (Windows) and VoiceOver (macOS) to cover the majority of screen reader users.

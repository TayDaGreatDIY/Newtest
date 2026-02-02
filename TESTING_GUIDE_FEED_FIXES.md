# Testing Guide: Feed Page Error Fixes

## Overview
This guide provides comprehensive testing instructions for the feed page error fixes. Follow these steps after applying the database migration to verify everything works correctly.

## Prerequisites

Before testing:
1. ✅ Database migration has been applied (`get_single_post` function exists)
2. ✅ Latest code has been deployed
3. ✅ You have a test account with login credentials
4. ✅ Test data exists (at least a few posts in the feed)

## Test Environment Setup

### Desktop Testing
- **Browser:** Chrome, Firefox, Safari, or Edge (latest version)
- **Tools:** Browser DevTools (F12)
- **Screen Size:** Desktop resolution (1920x1080 or similar)

### Mobile Testing
- **Option 1:** Real mobile device (iPhone, Android)
- **Option 2:** Browser DevTools device emulation
  - Press F12
  - Click device toolbar icon (or Ctrl+Shift+M)
  - Select a mobile device (e.g., iPhone 12)

## Test Cases

### Test Case 1: View Post Detail from Feed

**Steps:**
1. Log in to the application
2. Navigate to the Feed page
3. Find any post in the feed
4. Click anywhere on the post card (not on action buttons)

**Expected Result:**
- ✅ Post detail page loads successfully
- ✅ No "Failed to load post" error
- ✅ Post content is displayed correctly
- ✅ Author name and timestamp are visible
- ✅ Like, comment, and share counts are displayed
- ✅ Post image is shown (if applicable)

**What to Check:**
- Browser console (F12 → Console): Should have no errors
- Network tab: POST request to `get_single_post` should succeed (200 OK)

---

### Test Case 2: Navigate to Post via Comment Button

**Steps:**
1. From the Feed page
2. Locate any post
3. Click the comment button (💬)

**Expected Result:**
- ✅ Navigates to post detail page
- ✅ Post loads successfully with all details
- ✅ Comments section is visible at bottom
- ✅ "Add a Comment" form is displayed
- ✅ Existing comments are shown (if any)

**What to Check:**
- URL should be `/app/posts/{post-id}`
- No console errors
- Comment count matches the number shown

---

### Test Case 3: Add a Comment

**Steps:**
1. On the post detail page
2. Scroll to "Add a Comment" section
3. Type a test comment in the textarea
4. Click "Post Comment" button

**Expected Result:**
- ✅ Success toast notification appears
- ✅ Comment is added to the comments list
- ✅ Comment count increases by 1
- ✅ Your comment appears at the bottom of the list
- ✅ Form is cleared after posting

**What to Check:**
- Comment appears immediately without page refresh
- Your display name is shown next to the comment
- Timestamp shows "just now"

---

### Test Case 4: Repost a Post

**Steps:**
1. From the Feed page
2. Locate a post you haven't reposted yet
3. Click the repost button (🔄)

**Expected Result:**
- ✅ Success toast: "Reposted!"
- ✅ Repost button turns green
- ✅ Share count increases by 1
- ✅ No error messages

**Follow-up:**
4. Click the repost button again (to un-repost)

**Expected Result:**
- ✅ Success toast: "Unreposted"
- ✅ Repost button returns to gray
- ✅ Share count decreases by 1

---

### Test Case 5: View Who Reposted (Desktop - Right-Click)

**Steps:**
1. From the Feed page
2. Locate a post with at least 1 repost
3. Right-click on the repost button (🔄)

**Expected Result:**
- ✅ Modal opens with title "Reposted by"
- ✅ List of users who reposted is displayed
- ✅ Each user has avatar, name, and timestamp
- ✅ No "Failed to load reposts" error

**If no reposts:**
- ✅ Modal shows "No reposts yet"

**What to Check:**
- Right-click menu is prevented (context menu doesn't show)
- Modal opens smoothly
- User names are clickable (should navigate to profile)

---

### Test Case 6: View Who Reposted (Mobile - Long-Press)

**Setup:**
1. Use a mobile device OR enable device emulation in DevTools
2. Navigate to Feed page
3. Locate a post with at least 1 repost

**Steps:**
1. Touch and hold the repost button (🔄) for at least 500ms
2. Keep finger pressed without moving

**Expected Result:**
- ✅ Modal opens after ~500ms with title "Reposted by"
- ✅ List of users who reposted is displayed
- ✅ No "Failed to load reposts" error
- ✅ Vibration feedback (on supported devices)

**Alternative Test - Quick Tap:**
1. Quickly tap the repost button (< 500ms)

**Expected Result:**
- ✅ Normal repost action occurs
- ✅ Modal does NOT open
- ✅ Success toast appears

**Alternative Test - Move While Pressing:**
1. Touch the repost button
2. Move finger slightly while holding

**Expected Result:**
- ✅ Long-press is cancelled
- ✅ Modal does NOT open
- ✅ Can swipe/scroll normally

---

### Test Case 7: Like a Post

**Steps:**
1. From the Feed page
2. Click the heart button (🤍 or ❤️) on any post

**Expected Result:**
- ✅ Heart changes from 🤍 to ❤️ (or vice versa)
- ✅ Like count increases/decreases by 1
- ✅ No error messages
- ✅ Change is reflected immediately

---

### Test Case 8: Navigation Back to Feed

**Steps:**
1. From a post detail page
2. Click the "← Back" button (top of page)

**Expected Result:**
- ✅ Returns to Feed page
- ✅ Scroll position is preserved (if possible)
- ✅ Updated like/comment/share counts are shown

---

### Test Case 9: Multiple Posts Interaction

**Steps:**
1. From the Feed page
2. Open post A (click on it)
3. Go back to feed
4. Open post B (click on it)
5. Go back to feed
6. Click comment button on post C

**Expected Result:**
- ✅ All three posts load correctly
- ✅ No "Failed to load post" errors
- ✅ Each post shows correct data
- ✅ Navigation works smoothly

---

### Test Case 10: Error Scenarios (Negative Testing)

**Test 10a: Non-existent Post**
1. Manually navigate to `/app/posts/00000000-0000-0000-0000-000000000000`

**Expected Result:**
- ✅ Error message: "Post not found"
- ✅ No crash or unhandled errors

**Test 10b: Unauthorized Access**
1. Log out
2. Try to access a post detail URL

**Expected Result:**
- ✅ Redirected to login page
- ✅ No errors in console

---

## Performance Testing

### Test 11: Page Load Performance

**Steps:**
1. Open DevTools → Network tab
2. Navigate to Feed page
3. Click on a post to open detail

**What to Check:**
- ✅ Feed page loads in < 2 seconds
- ✅ Post detail page loads in < 1 second
- ✅ No unnecessary API calls
- ✅ Images load progressively

---

## Browser Compatibility Testing

Test the following browsers (if possible):

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Samsung Internet

**For each browser:**
- Test basic functionality (view post, add comment, repost)
- Test long-press on mobile browsers
- Verify no console errors

---

## Regression Testing

### Test 12: Existing Features Still Work

**Feed Page:**
- [ ] Posts load correctly
- [ ] Real-time updates work (if enabled)
- [ ] Infinite scroll works (if implemented)
- [ ] Search/filter works (if implemented)

**Other Pages:**
- [ ] Profile page loads
- [ ] Courts page loads
- [ ] Challenges page loads
- [ ] Messages page loads

---

## Console Error Checking

Throughout testing, monitor the browser console:

1. Press F12 to open DevTools
2. Go to Console tab
3. Watch for any errors (red text)

**Expected:** No errors related to:
- "get_single_post"
- "Failed to load post"
- "Failed to load reposts"
- "post_reposts"
- React errors or warnings

**Acceptable:** (These are okay)
- Warnings about chunk size (build optimization)
- PWA service worker messages
- External library warnings

---

## Network Monitoring

For each test case, check the Network tab:

1. Open DevTools → Network tab
2. Perform the action
3. Look for the related API call

**Key Requests to Monitor:**
- `get_feed_posts` - Should return 200 OK
- `get_single_post` - Should return 200 OK
- `get_post_reposts` - Should return 200 OK

**What to Check:**
- Status: 200 OK (success)
- Response time: < 500ms for most requests
- Response size: Reasonable (not too large)
- No failed requests (red text)

---

## Test Results Template

Use this template to record your test results:

```
## Test Results - [Date]

### Environment
- Device: [Desktop/Mobile]
- Browser: [Name & Version]
- User: [Test account]

### Test Case Results
- [ ] TC1: View Post Detail from Feed
- [ ] TC2: Navigate via Comment Button
- [ ] TC3: Add a Comment
- [ ] TC4: Repost a Post
- [ ] TC5: View Reposts (Right-Click)
- [ ] TC6: View Reposts (Long-Press)
- [ ] TC7: Like a Post
- [ ] TC8: Navigation Back
- [ ] TC9: Multiple Posts
- [ ] TC10: Error Scenarios
- [ ] TC11: Performance
- [ ] TC12: Regression

### Issues Found
[List any issues discovered]

### Console Errors
[Copy any error messages]

### Screenshots
[Attach screenshots if needed]

### Overall Result
✅ PASS / ❌ FAIL

### Notes
[Any additional observations]
```

---

## Troubleshooting

### Issue: "Failed to load post" still appears

**Possible Causes:**
1. Database migration not applied
2. Function not granted to authenticated users
3. Post doesn't exist
4. Network connectivity issue

**Solutions:**
1. Verify migration: Run `SELECT * FROM pg_proc WHERE proname = 'get_single_post';` in SQL Editor
2. Check grants: Re-run `GRANT EXECUTE ON FUNCTION public.get_single_post(UUID) TO authenticated;`
3. Test with different post IDs
4. Check Network tab for actual error message

---

### Issue: Long-press not working

**Possible Causes:**
1. Not using a touch device/emulation
2. Moving finger while pressing
3. Pressing for < 500ms
4. Browser doesn't support touch events

**Solutions:**
1. Enable device emulation in DevTools
2. Hold still while pressing
3. Press longer (at least 0.5 seconds)
4. Test in different browser

---

### Issue: Modal doesn't show reposts

**Possible Causes:**
1. No one has reposted yet
2. Database query failing
3. RLS policy blocking access

**Solutions:**
1. Repost the post yourself first
2. Check browser console for errors
3. Verify RLS policies allow viewing post_reposts

---

## Success Criteria

All tests pass when:
- ✅ All test cases complete successfully
- ✅ No "Failed to load post" errors
- ✅ No "Failed to load reposts" errors
- ✅ Long-press works on mobile
- ✅ Right-click works on desktop
- ✅ No console errors
- ✅ Good performance (< 2s page loads)
- ✅ Works across browsers
- ✅ No regressions in other features

---

## Reporting Issues

If you find any issues during testing:

1. **Document the issue:**
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Browser/device info
   - Screenshots/video

2. **Check console:**
   - Copy error messages
   - Note any network failures

3. **Create a bug report:**
   - Title: Brief description
   - Description: Full details from step 1
   - Severity: Critical/High/Medium/Low
   - Attach: Console logs, screenshots

---

## Conclusion

This testing guide covers all aspects of the feed page error fixes. Following these tests ensures that:
- Post loading works correctly
- Comments functionality is operational
- Repost features work on all devices
- Mobile long-press provides good UX
- No regressions in existing features

Happy testing! 🧪

# M2DG Manual Testing Guide

This guide provides step-by-step instructions for manually testing the M2DG app after cleaning test data.

## 🎯 Testing Objectives

1. Verify all features work with a fresh database
2. Ensure user flows are smooth and intuitive
3. Confirm data persistence and real-time updates
4. Validate security and permissions

## 📋 Pre-Testing Setup

Before starting:
1. ✅ Database is clean (run `cleanup_test_data.sql`)
2. ✅ Real-time is enabled for posts, messages, likes, comments
3. ✅ Storage bucket `post-images` exists and is public
4. ✅ App is built and deployed (or running locally via `npm run dev`)

## 🧪 Test Scenarios

### Test 1: User Registration & Authentication (5 minutes)

**Goal:** Verify users can sign up, sign in, and access protected routes.

**Steps:**
1. Open the app (https://taydagreatdiy.github.io/Newtest/ or http://localhost:5173)
2. Click "Sign Up" or navigate to `/auth/sign-up`
3. Enter test credentials:
   - Email: `test1@example.com`
   - Password: `TestPassword123!`
   - Display Name: `Test User 1`
4. Submit the form

**Expected Results:**
- ✅ Form submits without errors
- ✅ Redirected to `/app/feed` after signup
- ✅ Bottom navigation is visible
- ✅ User display name appears in profile

**Test Sign In:**
1. Sign out (from profile page)
2. Sign in with the same credentials

**Expected Results:**
- ✅ Sign in successful
- ✅ Redirected to `/app/feed`

---

### Test 2: Courts System (10 minutes)

**Goal:** Verify court creation, viewing, and check-in functionality.

**Part A: View Empty State**
1. Navigate to `/app/courts`

**Expected Results:**
- ✅ Empty state message appears
- ✅ "+ Court" button is visible

**Part B: Create a Court**
1. Click "+ Court" button
2. Fill in court details:
   - Name: `Rucker Park`
   - Location: `Harlem, NY`
   - Description: `Historic basketball court`
   - Select amenities: Lights, Water
   - Max Players: 10
3. Click "Create Court"

**Expected Results:**
- ✅ Modal closes
- ✅ Court appears in the list
- ✅ Toast notification shows success

**Part C: Check In to Court**
1. Click on "Rucker Park" court card
2. View court detail page
3. Click "Check In" button

**Expected Results:**
- ✅ Check-in successful
- ✅ Button changes to "Checked in today"
- ✅ Your name appears in "Recent Check-ins"
- ✅ If first check-in, you become court champion

**Part D: Search for Courts**
1. Go back to `/app/courts`
2. Create another court: `Venice Beach Courts`, `Venice, CA`
3. Use search bar to search for "Venice"

**Expected Results:**
- ✅ Only Venice Beach court appears
- ✅ Search is case-insensitive

---

### Test 3: Challenges System (15 minutes)

**Goal:** Verify challenge creation, joining, and leaderboards.

**Part A: Create a Challenge**
1. Go to court detail page (e.g., Rucker Park)
2. Scroll to challenges section
3. Click "+ Challenge" button
4. Fill in challenge details:
   - Title: `Friday Night 3-Point Contest`
   - Type: 3-Point Contest
   - Description: `Shoot from 5 spots around the arc`
   - Rules: `10 attempts per spot, highest score wins`
   - Start: Today's date, 6:00 PM
   - End: Today's date + 7 days, 8:00 PM
5. Click "Create Challenge"

**Expected Results:**
- ✅ Modal closes
- ✅ Challenge appears in court's challenge list
- ✅ Toast notification shows success

**Part B: Join Challenge & Submit Score**
1. Click on the challenge to view detail
2. Click "Join Challenge & Submit Score"
3. Enter score: `42`
4. Add note: `Great session!`
5. Click "Submit Score"

**Expected Results:**
- ✅ Modal closes
- ✅ Your name appears in leaderboard with score 42
- ✅ 🥇 medal appears next to your name (as first participant)
- ✅ Toast notification shows success

**Part C: Multi-User Leaderboard Test (requires 2nd user)**
1. Open app in incognito/private window
2. Sign up as second user: `test2@example.com`, `Test User 2`
3. Navigate to same challenge
4. Join and submit score: `50`
5. Switch back to first user's window

**Expected Results:**
- ✅ Leaderboard updates automatically (real-time)
- ✅ User 2 (score 50) is now #1 with 🥇
- ✅ User 1 (score 42) is now #2 with 🥈
- ✅ Scores are sorted correctly (highest first)

**Part D: Browse All Challenges**
1. Navigate to `/app/challenges`
2. Test filters: All, Active, Upcoming, Ended
3. Create a challenge with different time ranges to test filters

**Expected Results:**
- ✅ Filters work correctly
- ✅ Active shows only challenges between start and end time
- ✅ Upcoming shows challenges that haven't started
- ✅ Ended shows challenges that have ended

---

### Test 4: Posts & Feed System (20 minutes)

**Goal:** Verify post creation, likes, comments, and shares.

**Part A: View Empty Feed**
1. Navigate to `/app/feed`

**Expected Results:**
- ✅ Empty state message appears
- ✅ "+ Post" button is visible

**Part B: Create Text Post**
1. Click "+ Post" button (or navigate to `/app/posts/new`)
2. Enter text: `Just had an amazing session at Rucker Park! 🏀`
3. Click "Post"

**Expected Results:**
- ✅ Redirected to `/app/feed`
- ✅ Post appears at top of feed
- ✅ Post shows your display name
- ✅ Timestamp is "now" or "1m"

**Part C: Create Image Post**
1. Click "+ Post" button
2. Enter text: `Check out this court!`
3. Click image upload and select an image
4. Wait for upload (should show progress)
5. Click "Post"

**Expected Results:**
- ✅ Image uploads successfully
- ✅ Post appears in feed with image
- ✅ Image is visible and clickable

**Part D: Like a Post**
1. Find a post in feed
2. Click heart icon to like

**Expected Results:**
- ✅ Heart fills with color
- ✅ Like count increases by 1
- ✅ Click again to unlike
- ✅ Heart empties and count decreases

**Part E: Comment on Post**
1. Click on a post to view detail
2. Scroll to comments section
3. Enter comment: `Great shot! 👏`
4. Click "Post Comment"

**Expected Results:**
- ✅ Comment appears immediately
- ✅ Comment count updates on post
- ✅ Back button returns to feed

**Part F: Repost (Share)**
1. Find a post in feed
2. Click share/repost icon
3. Confirm repost

**Expected Results:**
- ✅ Share count increases
- ✅ Icon changes to indicate you reposted
- ✅ Click again to undo repost

**Part G: Real-Time Updates (requires 2nd user)**
1. Keep feed open as User 1
2. In another window, sign in as User 2
3. Create a post as User 2

**Expected Results:**
- ✅ User 1's feed updates automatically
- ✅ User 2's post appears without refresh

---

### Test 5: Messaging System (15 minutes)

**Goal:** Verify direct messaging and real-time chat.

**Part A: View Empty Messages**
1. Navigate to `/app/messages`

**Expected Results:**
- ✅ Empty state message appears
- ✅ UI suggests starting a conversation

**Part B: Start Conversation (requires 2nd user)**
1. Create or use existing second test user
2. Note the user ID of User 2 (from profile or database)
3. As User 1, try to start a conversation
   - Note: Current UI might need a "New Message" button
   - If missing, we'll document this as a future enhancement

**Part C: Send Messages**
1. If conversation exists, open it
2. Type message: `Hey, want to play at Rucker Park tomorrow?`
3. Send message

**Expected Results:**
- ✅ Message appears in thread
- ✅ Timestamp shows
- ✅ Message is on the right (sent by you)

**Part D: Real-Time Messaging**
1. Keep thread open as User 1
2. In another window, sign in as User 2
3. Open same thread
4. Send reply as User 2: `Sure! What time?`

**Expected Results:**
- ✅ User 1 sees message appear automatically
- ✅ Message is on the left (sent by other user)
- ✅ Thread updates in messages list

---

### Test 6: Profile & Stats (10 minutes)

**Goal:** Verify profile displays correct stats.

**Part A: View Profile**
1. Navigate to `/app/profile`

**Expected Results:**
- ✅ Display name shows correctly
- ✅ Stats section shows:
  - Total check-ins (should match number of check-ins you made)
  - Total challenges (should match challenges you joined)
  - Challenges won (should be 0 or match your wins)
  - Courts championed (should show courts where you're champion)

**Part B: Edit Profile**
1. Click edit button on display name
2. Change to: `Test User (Updated)`
3. Save changes

**Expected Results:**
- ✅ Display name updates
- ✅ New name appears throughout app (feed, comments, etc.)
- ✅ Toast notification confirms update

**Part C: Verify Champion Status**
1. If you're champion at any court, check profile
2. "Champion Status" section should appear

**Expected Results:**
- ✅ Shows court(s) where you're champion
- ✅ Shows check-in count for each
- ✅ Champion badge is visible

---

### Test 7: Navigation & UI (5 minutes)

**Goal:** Verify navigation works smoothly.

**Part A: Bottom Navigation**
1. Tap each bottom nav icon:
   - Feed
   - Courts
   - Challenges
   - Messages
   - Profile

**Expected Results:**
- ✅ Each page loads correctly
- ✅ Active tab is highlighted
- ✅ No errors in navigation

**Part B: Back Navigation**
1. Navigate: Feed → Post Detail → Back
2. Navigate: Courts → Court Detail → Challenge Detail → Back → Back

**Expected Results:**
- ✅ Back button works correctly
- ✅ Returns to previous page
- ✅ State is preserved

**Part C: Deep Linking**
1. Copy a post URL (e.g., `/app/posts/[id]`)
2. Open in new tab
3. Should redirect to login if not authenticated
4. After login, should show the post

**Expected Results:**
- ✅ Deep links work
- ✅ Protected routes redirect to auth
- ✅ After auth, redirects to intended page

---

### Test 8: PWA Installation (5 minutes)

**Goal:** Verify app can be installed as PWA.

**On Mobile (iOS Safari):**
1. Open app in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Tap "Add"
5. Open app from home screen

**Expected Results:**
- ✅ Icon appears on home screen
- ✅ App opens in standalone mode (no browser UI)
- ✅ Splash screen shows briefly
- ✅ App works normally

**On Desktop (Chrome):**
1. Open app in Chrome
2. Look for install icon in address bar
3. Click and select "Install"
4. Open installed app

**Expected Results:**
- ✅ App installs successfully
- ✅ Opens in standalone window
- ✅ App works normally

---

## 🐛 Bug Reporting Template

If you find issues during testing, document them like this:

```
**Bug Title:** [Short description]

**Steps to Reproduce:**
1. ...
2. ...
3. ...

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[If applicable]

**Environment:**
- Browser: [Chrome/Safari/Firefox]
- Device: [iPhone/Android/Desktop]
- OS: [iOS 17/Android 13/Windows 11]
```

## ✅ Testing Completion Checklist

After completing all tests:

- [ ] All authentication tests pass
- [ ] All court features work
- [ ] All challenge features work
- [ ] All post/feed features work
- [ ] All messaging features work
- [ ] Profile and stats are accurate
- [ ] Navigation works smoothly
- [ ] PWA installs correctly
- [ ] No console errors
- [ ] Real-time updates work

**If all tests pass: App is ready for production use! 🎉**

## 📝 Notes for Testing

1. **Real-time Testing:** Best tested with two browsers/devices side-by-side
2. **Image Upload:** Use small test images (< 5MB) for faster testing
3. **Time-based Features:** Challenges have time restrictions, so test with appropriate dates
4. **Network Issues:** Test with slow connection to see loading states
5. **Error States:** Try invalid inputs to verify error handling

## 🆘 Common Testing Issues

**Issue: "Not authorized" errors**
- Make sure you're signed in
- Check that RLS policies are set up correctly

**Issue: Real-time not working**
- Verify replication is enabled in Supabase Dashboard
- Check browser console for subscription errors

**Issue: Images not uploading**
- Verify post-images bucket exists and is public
- Check browser console for storage errors

**Issue: Slow performance**
- Clear browser cache
- Check network tab for slow requests
- Verify Supabase region is appropriate

---

**Happy Testing! 🚀**

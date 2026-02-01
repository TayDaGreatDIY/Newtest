# Testing Guide for Recent Fixes

This guide helps you verify that all the reported issues have been fixed.

## Prerequisites

1. **Update your database** (if you have an existing Supabase database):
   ```sql
   -- Run in Supabase SQL Editor
   DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
   CREATE POLICY "Authenticated users can view all profiles"
     ON public.profiles FOR SELECT
     USING (auth.uid() IS NOT NULL);
   ```

2. **Create local .env file** (if you don't have one):
   ```bash
   cp .env.example .env
   # Edit .env and add your credentials:
   # VITE_SUPABASE_URL=your-supabase-url
   # VITE_SUPABASE_ANON_KEY=your-anon-key
   # VITE_OPENAI_API_KEY=your-openai-key (optional)
   ```

3. **Install dependencies and build**:
   ```bash
   npm install
   npm run build
   ```

## Test Cases

### 1. Feed Page Tests ✅

**Test: Challenge Button**
- [ ] Navigate to `/app/feed`
- [ ] Click the "Challenge" button on any post
- [ ] ✅ Should navigate to `/app/challenges` page
- [ ] ✅ Challenges page should load WITHOUT the error: "Could not find a relationship between 'challenges' and 'created_by'"

**Test: User Name Navigation**
- [ ] Navigate to `/app/feed`
- [ ] Click on a user's name in any post
- [ ] ✅ Should navigate to that user's profile page (`/app/profile/:id`)
- [ ] ✅ Should show the user's stats and information
- [ ] ✅ If it's your own post, should redirect to `/app/profile`

**Test: Comment Loading**
- [ ] Navigate to `/app/feed`
- [ ] Click on the comment bubble (💬) icon on any post
- [ ] ✅ Should navigate to post detail page
- [ ] ✅ Comments should load WITHOUT error: "failed to load comments, unknown error"
- [ ] ✅ You should be able to add a new comment

**Test: Repost Functionality**
- [ ] Navigate to `/app/feed`
- [ ] Click on the repost button (🔄) on any post
- [ ] ✅ Should successfully repost WITHOUT error: "Failed to repost post, unknown error"
- [ ] ✅ Button should change color (green) to indicate you've reposted
- [ ] ✅ Counter should increment
- [ ] Right-click on the repost button
- [ ] ✅ Modal should show who has reposted the post

### 2. Challenges Page Tests ✅

**Test: Challenge List**
- [ ] Navigate to `/app/challenges`
- [ ] ✅ Page should load WITHOUT the error: "Could not find a relationship between 'challenges' and 'created_by'"
- [ ] ✅ Challenges should display with creator names
- [ ] ✅ You should be able to filter challenges (all/active/upcoming/ended)

**Test: Challenge Creation**
- [ ] Click "+ Challenge" button
- [ ] Fill out the form
- [ ] Submit
- [ ] ✅ Challenge should be created successfully
- [ ] ✅ New challenge should appear in the list with your name as creator

### 3. Courts Page Tests ✅

**Test: Court Detail Page**
- [ ] Navigate to `/app/courts`
- [ ] Click on "Rucker Park" or any court
- [ ] ✅ Should show court details page
- [ ] ✅ Should see three action buttons: "Check In", "Queue", "Next Game"
- [ ] ✅ Should see "Active Games" section
- [ ] ✅ Check-in button should work (shows green when checked in)
- [ ] Click "Queue" button
- [ ] ✅ Should show "coming soon" alert
- [ ] Click "Next Game" button
- [ ] ✅ Should show "coming soon" alert

**Test: Check-In Functionality**
- [ ] On court detail page, click "Check In" button
- [ ] ✅ Button should change to indicate you've checked in
- [ ] ✅ Your name should appear in "Recent Check-ins" list
- [ ] ✅ Champion badge should update if you become champion

### 4. Messages Tests ✅

**Test: New Message with Search**
- [ ] Navigate to `/app/messages`
- [ ] Click "+ New" button
- [ ] ✅ Modal should open with a search box
- [ ] Type a user's name in the search box
- [ ] ✅ Should filter users based on search query
- [ ] Click on a user
- [ ] ✅ Should create/open a thread with that user

**Test: Messaging Functionality**
- [ ] Send a message in a thread
- [ ] ✅ Message should appear immediately
- [ ] ✅ No errors should occur

### 5. Thinking Corner (AI Coach) Tests ✅

**Test: Without OpenAI Key**
- [ ] Navigate to `/app/thinking-corner`
- [ ] Type a message and send
- [ ] ✅ Should show yellow warning: "OpenAI API key is not configured"
- [ ] ✅ Should receive a fallback response (not from AI)

**Test: With OpenAI Key**
- [ ] Add `VITE_OPENAI_API_KEY` to your `.env` file
- [ ] Restart dev server (`npm run dev`)
- [ ] Navigate to `/app/thinking-corner`
- [ ] Type a message and send
- [ ] ✅ Should receive AI-generated response
- [ ] ✅ No error message should appear

### 6. Settings Navigation Tests ✅

**Test: All Settings Tabs**
- [ ] Navigate to `/app/profile`
- [ ] Click "AI Coach (Thinking Corner)" option
- [ ] ✅ Should navigate to `/app/thinking-corner`
- [ ] Go back to profile
- [ ] Click "Account Settings"
- [ ] ✅ Should navigate to `/app/profile/settings`
- [ ] ✅ Settings page should display correctly
- [ ] Go back to profile
- [ ] Click "Notifications"
- [ ] ✅ Should navigate to `/app/profile/notifications`
- [ ] ✅ Notifications page should display correctly
- [ ] Go back to profile
- [ ] Click "Appearance"
- [ ] ✅ Should navigate to `/app/profile/appearance`
- [ ] ✅ Appearance page should display correctly
- [ ] Go back to profile
- [ ] Click "About M2DG"
- [ ] ✅ Should navigate to `/app/profile/about`
- [ ] ✅ About page should display correctly

## Common Issues and Solutions

### Issue: Still Getting RLS Errors

**Solution:**
1. Verify the RLS policy was applied correctly:
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'profiles';
   ```
   Should show: "Authenticated users can view all profiles"

2. Clear browser cache and reload
3. Sign out and sign back in

### Issue: OpenAI API Key Not Working

**Solution:**
1. Verify `.env` file exists in project root (not in `src/` or any subdirectory)
2. Check the file contains: `VITE_OPENAI_API_KEY=your-key-here`
3. Restart dev server after adding the key
4. Remember: GitHub secrets are for CI/CD only, not local development

### Issue: Environment Variables Not Loading

**Solution:**
1. Ensure `.env` file is in the root directory
2. Variable names must start with `VITE_`
3. Restart dev server after any changes to `.env`
4. Check for typos in variable names

## Success Criteria

All tests should pass with ✅ checkmarks. Specifically:

- ✅ No "Could not find a relationship" errors
- ✅ No "unknown error" messages
- ✅ User names display correctly everywhere
- ✅ Navigation works as expected
- ✅ All settings pages are accessible
- ✅ Court features are enhanced with new buttons
- ✅ Messages work with search functionality
- ✅ OpenAI integration works (or falls back gracefully)

## Verification Checklist

- [ ] Database RLS policy updated
- [ ] Local `.env` file created with all credentials
- [ ] Build succeeds: `npm run build`
- [ ] Linter passes: `npm run lint`
- [ ] All Feed page tests pass
- [ ] All Challenges tests pass
- [ ] All Courts tests pass
- [ ] All Messages tests pass
- [ ] All Thinking Corner tests pass
- [ ] All Settings navigation tests pass

## Reporting Issues

If you encounter any remaining issues:

1. Check the console for error messages (F12 in browser)
2. Verify your database has the correct RLS policy
3. Ensure your `.env` file is properly configured
4. Check that you're using the latest code from this PR
5. Review the specific test case that's failing

For database issues, see `DATABASE_FIXES.md`.
For environment issues, see `ENV_SETUP.md`.

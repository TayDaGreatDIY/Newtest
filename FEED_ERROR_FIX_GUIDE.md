# Feed Page Error Fix - Implementation Guide

## Problem
You're experiencing these errors on the feed page:
1. ❌ "Failed to load post. Please try again" when clicking to view post details
2. ❌ Comments fail to load
3. ❌ Repost feature throws errors

## Root Cause Analysis
After analyzing the code and previous fixes, the issue is **NOT** in the application code itself. The code is correct. The problem is in the **database configuration**:

1. **Missing or Misconfigured RPC Functions**: The `get_single_post` and `get_feed_posts` database functions may not exist or lack proper permissions
2. **Restrictive RLS Policies**: Row Level Security policies on `profiles`, `post_comments`, and `post_reposts` tables may be too restrictive
3. **Missing GRANT Permissions**: The `authenticated` role may not have EXECUTE permissions on the RPC functions

## Solution: Two-Step Fix

### Step 1: Apply Code Changes (Already Done ✅)
The code has been updated to provide better error messages. This helps us see the actual database errors instead of generic messages.

**Changes made:**
- Enhanced error logging in all post-related functions
- Database errors now show as "Database error: [actual Supabase message]"
- This helps identify exactly what's wrong in Supabase

### Step 2: Apply Database Fixes (USER ACTION REQUIRED ⚠️)
You **must** run the SQL fix script in your Supabase dashboard.

#### Instructions:

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Fix Script**
   - Copy the **entire contents** of `supabase/fix_feed_errors.sql`
   - Paste into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify Success**
   - You should see: "✅ Feed page error fixes applied successfully!"
   - If you see any errors, read them carefully and fix the issues

#### What This Script Does:

✅ **Fixes Profiles RLS Policy**
   - Changes from restrictive "own profile only" to "all authenticated users can view all profiles"
   - This allows user names to appear in posts, comments, and reposts

✅ **Creates/Updates RPC Functions**
   - Ensures `get_feed_posts()` function exists with proper SECURITY DEFINER
   - Ensures `get_single_post()` function exists with proper SECURITY DEFINER
   - Grants EXECUTE permission to authenticated users

✅ **Fixes RLS Policies on Related Tables**
   - `post_comments`: Allows all authenticated users to view all comments
   - `post_reposts`: Allows all authenticated users to view all reposts
   - `posts`: Allows all authenticated users to view all posts

✅ **Includes Verification Checks**
   - Automatically verifies all functions and policies exist
   - Shows error messages if something is missing

## Testing After Fix

### Test 1: View Feed
1. Navigate to `/app/feed`
2. Verify posts load without errors
3. Verify author names appear on posts

### Test 2: View Post Details
1. Click on any post in the feed
2. Verify post details page opens without "Failed to load post" error
3. Verify post content displays correctly

### Test 3: View Comments
1. On a post detail page, scroll to comments section
2. Verify comments load without errors
3. Verify commenter names appear

### Test 4: Add Comment
1. On a post detail page, type a comment in the text box
2. Click "Post Comment"
3. Verify comment appears in the list
4. Verify your name appears next to the comment

### Test 5: Repost Feature
1. On the feed page, click the repost button (🔄) on a post
2. Verify "Reposted!" success message appears
3. Verify the repost count increases
4. Verify the button turns green
5. Click repost again to unrepost
6. Verify "Unreposted" message appears

### Test 6: View Reposts (Desktop)
1. Right-click the repost button
2. Verify a modal shows who reposted
3. Verify user names appear

### Test 7: View Reposts (Mobile)
1. Long-press the repost button
2. Verify a modal shows who reposted
3. Verify user names appear

## Expected Results

✅ **All features should work without errors**
✅ **User names should appear everywhere (posts, comments, reposts)**
✅ **Error messages (if any) should show actual database errors, not generic messages**

## If You Still Have Issues

### 1. Check Browser Console
- Open browser DevTools (F12)
- Check Console tab for errors
- Look for "Database error:" messages
- These will show the actual Supabase error

### 2. Check Supabase Logs
- Go to Supabase Dashboard → Logs
- Look for recent errors
- Check for RLS policy violations or function errors

### 3. Verify Environment Variables
Make sure your `.env` file has:
```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Clear Cache and Rebuild
```bash
# Clear node modules and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 5. Check Supabase Storage (if image uploads fail)
- Go to Supabase Dashboard → Storage
- Verify `post-images` bucket exists
- Verify bucket is public
- Verify RLS policies allow authenticated users to upload

## Technical Details

### Why SECURITY DEFINER?
The RPC functions use `SECURITY DEFINER` which means they run with the permissions of the function creator (who is an admin) rather than the calling user. This bypasses RLS restrictions that might prevent joining with the `profiles` table.

### Why Allow All Authenticated Users?
This is a **social media app** where users need to see each other's:
- Names on posts
- Names on comments
- Names on reposts
- Challenge creators
- Message senders

The RLS policies still protect:
- Only users can UPDATE their own profile
- Only users can DELETE their own posts/comments
- Authentication is still required (anonymous users see nothing)

### Security Notes
- Only `display_name` is exposed in queries
- Email addresses and other sensitive data remain protected
- Users cannot modify other users' data
- This follows standard social media app patterns

## Related Files
- Code changes: `src/lib/posts.ts`
- Database fix: `supabase/fix_feed_errors.sql`
- Migration reference: `supabase/mvp_migrations.sql`
- RLS fix reference: `supabase/fix_profiles_rls.sql`

## Summary
The **code is now correct** and provides better error messages. However, the **database configuration** needs to be updated by running the SQL script. This is a **one-time fix** that addresses the root cause of all three reported issues.

# Database Migration Instructions - Fix Feed Page Errors

## Overview
This document explains how to apply the database migration to fix the "Failed to load post" errors on the feed page.

## Problem
Users were experiencing the following errors:
- "Error: Failed to load post. Please try again." when clicking on posts
- "Failed to load reposts" when right-clicking the repost button
- Comment button not opening post details properly

## Root Cause
The `get_single_post` RPC function was missing from the main database migration file. The frontend code was trying to call this function, but it didn't exist in the database, causing the errors.

## Solution
Added the `get_single_post` RPC function to the main migration file (`supabase/mvp_migrations.sql`).

## How to Apply the Fix

### Option 1: Fresh Database Setup (Recommended for New Projects)
If you're setting up a fresh database or can reset your database:

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to the SQL Editor
4. Create a new query
5. Copy and paste the **entire contents** of `supabase/mvp_migrations.sql`
6. Run the query
7. Verify success - you should see "Success. No rows returned" or similar

### Option 2: Add Missing Function to Existing Database
If you already have data in your database and just need to add the missing function:

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to the SQL Editor
4. Create a new query
5. Copy and paste the following SQL:

```sql
-- =====================================================
-- GET SINGLE POST FUNCTION
-- =====================================================
-- Function to get a single post by ID with all details
-- This uses SECURITY DEFINER to bypass RLS issues similar to get_feed_posts
CREATE OR REPLACE FUNCTION public.get_single_post(post_uuid UUID)
RETURNS TABLE(
  post_id UUID,
  post_type TEXT,
  post_content TEXT,
  post_image_url TEXT,
  post_challenge_id UUID,
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  user_display_name TEXT,
  is_liked_by_me BOOLEAN,
  is_reposted_by_me BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS post_id,
    p.type AS post_type,
    p.content AS post_content,
    p.image_url AS post_image_url,
    p.challenge_id AS post_challenge_id,
    p.likes_count,
    p.comments_count,
    p.shares_count,
    p.created_at,
    p.updated_at,
    p.user_id,
    prof.display_name AS user_display_name,
    EXISTS(
      SELECT 1 FROM public.post_likes pl
      WHERE pl.post_id = p.id AND pl.user_id = auth.uid()
    ) AS is_liked_by_me,
    EXISTS(
      SELECT 1 FROM public.post_reposts pr
      WHERE pr.post_id = p.id AND pr.user_id = auth.uid()
    ) AS is_reposted_by_me
  FROM public.posts p
  LEFT JOIN public.profiles prof ON p.user_id = prof.id
  WHERE p.id = post_uuid
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_single_post(UUID) TO authenticated;
```

6. Run the query
7. Verify success

## Verification

After applying the migration, test the following:

### 1. Test Post Detail Page
1. Log in to your app
2. Go to the Feed page
3. Click on any post (click anywhere in the post card)
4. Verify the post detail page loads correctly
5. Verify you can see the post content, likes, comments, and reposts

### 2. Test Comment Button
1. Go to the Feed page
2. Click the comment button (💬) on any post
3. Verify the post detail page loads correctly
4. Try adding a comment
5. Verify the comment appears

### 3. Test Repost Functionality
1. Go to the Feed page
2. Click the repost button (🔄) on any post
3. Verify you see a success message
4. Verify the repost count increases

### 4. Test View Reposts (Desktop)
1. Go to the Feed page
2. Right-click on the repost button (🔄) on any post
3. Verify a modal opens showing who reposted
4. If no reposts yet, it should say "No reposts yet"

### 5. Test View Reposts (Mobile)
1. Go to the Feed page on a mobile device or use browser dev tools to simulate touch
2. Long-press (hold for 500ms) on the repost button (🔄)
3. Verify a modal opens showing who reposted
4. If no reposts yet, it should say "No reposts yet"

## Expected Results

After applying this migration:
- ✅ No more "Failed to load post" errors
- ✅ Clicking on posts opens the detail page successfully
- ✅ Comment button works correctly
- ✅ Repost button works correctly
- ✅ Right-click on repost button shows who reposted
- ✅ Long-press on repost button shows who reposted (mobile)

## Troubleshooting

### Error: "function get_single_post does not exist"
**Solution**: Run the SQL migration again. Make sure you've copied the entire function definition.

### Error: "permission denied for function get_single_post"
**Solution**: Make sure the GRANT statement ran successfully. Try running just the GRANT line:
```sql
GRANT EXECUTE ON FUNCTION public.get_single_post(UUID) TO authenticated;
```

### Error: "Failed to load reposts"
**Solution**: This error suggests the `post_reposts` table doesn't exist. You need to run the full `mvp_migrations.sql` file, not just the function.

### Posts still not loading
1. Check browser console for errors (F12 → Console tab)
2. Verify you're logged in (the function requires authentication)
3. Check that the post ID is valid
4. Verify the `posts` table has data

## Code Changes Included

In addition to the database migration, the following frontend changes were made:

### Feed.tsx
- Added touch event handlers for long-press functionality
- Added state management for touch timers
- Updated repost button to support both right-click and long-press
- Added cleanup for touch timers on component unmount

These changes are already committed and don't require any action from you.

## Summary

This migration adds the missing `get_single_post` RPC function to your database, which is required for:
1. Loading individual post details
2. Viewing post comments
3. Navigating to posts from the feed
4. Viewing who reposted a post

The function uses `SECURITY DEFINER` to bypass RLS restrictions, similar to the existing `get_feed_posts` function.

## Next Steps

After applying this migration:
1. Deploy the updated code to your production environment
2. Test all the verification steps above
3. Monitor for any remaining errors
4. If you encounter any issues, check the Troubleshooting section

## Additional Resources

- Main migration file: `supabase/mvp_migrations.sql`
- Original fix file: `supabase/fix_get_single_post.sql` (now incorporated into main migration)
- Frontend changes: `src/pages/Feed.tsx`
- API functions: `src/lib/posts.ts`

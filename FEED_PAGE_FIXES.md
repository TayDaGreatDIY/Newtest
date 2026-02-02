# Feed Page Fixes

This document describes the fixes applied to resolve the feed page issues.

**Note**: All conflicts with main branch have been resolved via merge commit.

## Issues Fixed

### 1. Comment Bubble Error
**Problem**: When clicking the comment bubble on a post, users saw "Error: Failed to load post. Please try again."

**Root Cause**: The `getPost()` function was using `.single()` which throws an error if no post is found, rather than returning null.

**Fix**: Changed `getPost()` to use `.maybeSingle()` and added explicit null checking with a proper "Post not found" error message.

**Location**: `src/lib/posts.ts` - `getPost()` function

### 2. Repost Button Error
**Problem**: When clicking repost, users saw "Failed to repost post: Failed to repost. Please try again"

**Root Cause**: The repost function didn't check if the post exists before attempting to repost, and didn't handle duplicate repost attempts gracefully.

**Fix**: 
- Added post existence verification before reposting
- Added specific handling for duplicate repost errors (PostgreSQL error code 23505)
- Improved error messages to be more descriptive

**Location**: `src/lib/posts.ts` - `repostPost()` function

### 3. Image Upload RLS Error
**Problem**: When uploading an image with a post, users received "Failed to upload image: new row violates row-level security policy"

**Root Cause**: The storage bucket's RLS policies may not have been properly configured or the bucket might not exist.

**Fix**: 
- Added comprehensive validation (file type and size) before upload attempt
- Improved error messaging to distinguish between different failure types
- Created SQL migration to ensure proper bucket setup and RLS policies
- Added helpful error messages for common issues (bucket not found, RLS violations)

**Locations**: 
- `src/lib/posts.ts` - `uploadPostImage()` function
- `supabase/fix_storage_rls.sql` - SQL migration for storage bucket setup

## Testing the Fixes

To verify all fixes are working:

1. **Test Comments**:
   - Navigate to the feed page
   - Click the comment bubble (💬) on any post
   - Verify you can see the post detail page
   - Try adding a comment
   - Verify "No comments yet. Be the first to comment!" shows if there are no comments

2. **Test Reposts**:
   - Click the repost button (🔄) on a post
   - Verify success toast appears
   - Try reposting the same post again
   - Verify appropriate error message appears

3. **Test Image Upload**:
   - Click "+ Post" button
   - Add text content
   - Upload an image (JPEG, PNG, GIF, or WebP under 5MB)
   - Click "Post"
   - Verify post appears in feed with image

## Database Setup Required

If image uploads still fail after code changes, run the SQL migration:

```sql
-- Run this in your Supabase SQL Editor
-- File: supabase/fix_storage_rls.sql
```

This will:
1. Create or update the 'post-images' storage bucket
2. Set proper file size limits (5MB)
3. Configure allowed file types
4. Set up all necessary RLS policies

## Additional Improvements

All error messages now provide more context to help users understand what went wrong:
- "User not authenticated" - User needs to log in
- "Post not found" - The post was deleted or doesn't exist
- "You have already reposted this post" - Can't repost twice
- "Invalid file type..." - Wrong image format
- "File size exceeds 5MB limit..." - Image too large
- "Permission denied..." - Storage bucket configuration issue

These messages help both users and developers quickly identify and resolve issues.

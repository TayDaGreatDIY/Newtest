# Fix for "Failed to load post" Error

## Problem
Users were getting an error "Error: Failed to load post. Please try again." when clicking on the comment bubble (💬) or repost button (🔄) to view post details.

## Root Cause
The `getPost()` function was using a direct Supabase query with a foreign key join to the `profiles` table:

```typescript
.select(`
  *,
  profiles:user_id (display_name)
`)
```

This approach failed because:
1. Direct queries respect the user's RLS (Row Level Security) context
2. The foreign key join to `profiles` must pass RLS policies
3. RLS restrictions on the profiles table can cause the entire query to fail
4. The feed worked fine because it uses an RPC function with `SECURITY DEFINER` that bypasses RLS

## Solution
Created a new SQL RPC function `get_single_post()` that mirrors the `get_feed_posts()` pattern:
- Uses `SECURITY DEFINER` to bypass RLS restrictions
- Includes all necessary fields: post data, user info, like/repost status
- Updated `getPost()` function to call this RPC instead of direct query

## Files Changed
1. **`supabase/fix_get_single_post.sql`** - New SQL migration file
2. **`src/lib/posts.ts`** - Updated `getPost()` function to use RPC

## How to Apply the Fix

### Step 1: Run the SQL Migration
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to the SQL Editor
4. Create a new query
5. Copy and paste the contents of `supabase/fix_get_single_post.sql`
6. Run the query

### Step 2: Deploy the Code Changes
The code changes in `src/lib/posts.ts` are already committed. Simply deploy the updated code to production.

### Step 3: Test the Fix
1. Log in to the application
2. Go to the Feed page
3. Click on the comment bubble (💬) on any post
4. Verify the post detail page loads correctly
5. Go back to the Feed
6. Click on the repost button (🔄) on any post  
7. Verify the post detail page loads correctly

## Technical Details

### Before (Direct Query - Failed)
```typescript
const { data, error } = await supabase
  .from('posts')
  .select(`
    *,
    profiles:user_id (display_name)
  `)
  .eq('id', postId)
  .maybeSingle();
```

### After (RPC Function - Works)
```typescript
const { data, error } = await supabase.rpc('get_single_post', {
  post_uuid: postId,
});
```

The RPC function uses `SECURITY DEFINER` which allows it to execute with elevated privileges, bypassing RLS restrictions that were causing the issue.

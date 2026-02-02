# Fix: "relation 'public.post_reposts' does not exist" Error

## Problem
When you open the feed page, you see this error:
```
Error: Database error: relation "public.post_reposts" does not exist
```

## Root Cause
The `post_reposts` table is missing from your Supabase database. This table is required for the repost/share feature on posts.

## Solution

You have **two options** to fix this. **Option 1 is recommended** for best performance:

### Option 1: Quick Fix - Create the Missing Table (RECOMMENDED)

This option creates the `post_reposts` table without affecting your existing data. This is the **best solution** for performance and functionality.

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Creation Script**
   - Copy the **entire contents** of `supabase/create_post_reposts_table.sql`
   - Paste into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify Success**
   - You should see: "✅ post_reposts table created successfully!"

### Option 2: Update RPC Functions (Temporary workaround)

If for some reason you cannot create the `post_reposts` table right now, you can update the RPC functions to handle its absence gracefully. The feed will work, but the repost feature won't show correct status.

**Note:** This option has a small performance overhead as it checks for table existence on every query. Only use this if you can't create the table immediately.

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

### Option 3: Complete Migration (If starting fresh)

If you're starting fresh or want to ensure all tables exist:

1. **Backup any existing data** (if you have important data)

2. **Run the complete migration**:
   - Copy the **entire contents** of `supabase/mvp_migrations.sql`
   - Paste into Supabase SQL Editor
   - Click "Run"

This creates all tables including `post_reposts`.

## What is post_reposts?

The `post_reposts` table stores information about which users have reposted/shared which posts. It enables:
- Tracking who reposted a post
- Showing repost counts on posts
- Preventing duplicate reposts
- Allowing users to "unrepost" a post

## Testing After Fix

1. **Navigate to the Feed page** (`/app/feed`)
2. **Verify posts load** without the error message
3. **Test the repost feature**:
   - Click the repost button (🔄) on a post
   - Verify the repost count increases
   - Verify the button state changes (turns green)
   - Click again to unrepost
   - Verify the count decreases

## Still Having Issues?

If you still see the error after running the script:

1. **Check the SQL execution log** in Supabase for any error messages
2. **Verify the table was created**:
   - Go to Supabase Dashboard → Table Editor
   - Look for `post_reposts` in the tables list
3. **Check that you ran the script in the correct project**
4. **Clear your browser cache** and refresh the app
5. **Check browser console** (F12) for any additional error messages

## Related Files

- Quick fix: `supabase/create_post_reposts_table.sql`
- RPC function fix: `supabase/fix_feed_errors.sql`
- Complete migration: `supabase/mvp_migrations.sql`
- Application code: `src/lib/posts.ts`

## Technical Details

The error occurs because:
1. The app's feed page calls the `get_feed_posts()` RPC function
2. This function includes a subquery that checks the `post_reposts` table
3. If the table doesn't exist, PostgreSQL throws the "relation does not exist" error
4. The updated RPC functions now check if the table exists before querying it

## Prevention

To prevent this issue in the future:
- Always run the complete `mvp_migrations.sql` when setting up a new Supabase project
- Keep your database schema in sync with the application code
- Check the `SUPABASE_SETUP.md` guide for complete setup instructions

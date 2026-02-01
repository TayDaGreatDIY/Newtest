# Database Fixes Guide

This guide explains how to fix common database issues in the M2DG application.

## Critical Fix: Profiles RLS Policy

### Problem
If you're experiencing these errors:
- "Could not find a relationship between 'challenges' and 'created_by' in the schema cache"
- "failed to load comments, unknown error"
- "Failed to repost post, unknown error"
- User names not showing up in posts, challenges, or messages

The root cause is likely an overly restrictive RLS (Row Level Security) policy on the `profiles` table.

### Solution

Run the following SQL in your Supabase SQL Editor:

```sql
-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a new policy that allows all authenticated users to view all profiles
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

### Why This Works

The original policy only allowed users to view their OWN profile:
```sql
USING (auth.uid() = id);  -- ❌ Too restrictive
```

This prevented the app from joining with the profiles table to display other users' names in:
- Posts (author names)
- Challenges (creator names)
- Comments (commenter names)
- Messages (sender/receiver names)
- Reposts (reposter names)

The new policy allows all authenticated users to view all profiles:
```sql
USING (auth.uid() IS NOT NULL);  -- ✅ Correct for social app
```

### Security Notes

- Only the `display_name` field is exposed in most queries
- Users can still only UPDATE their own profile (that policy remains unchanged)
- This is a standard pattern for social applications where user names need to be visible

## Alternative: Complete Database Reset

If you're starting fresh or want to ensure everything is correct:

1. **Backup your data** (if you have any important data)

2. **Drop all tables** in Supabase SQL Editor:
   ```sql
   DROP TABLE IF EXISTS public.messages CASCADE;
   DROP TABLE IF EXISTS public.thread_participants CASCADE;
   DROP TABLE IF EXISTS public.message_threads CASCADE;
   DROP TABLE IF EXISTS public.post_reposts CASCADE;
   DROP TABLE IF EXISTS public.post_comments CASCADE;
   DROP TABLE IF EXISTS public.post_likes CASCADE;
   DROP TABLE IF EXISTS public.posts CASCADE;
   DROP TABLE IF EXISTS public.challenge_participants CASCADE;
   DROP TABLE IF EXISTS public.challenges CASCADE;
   DROP TABLE IF EXISTS public.court_checkins CASCADE;
   DROP TABLE IF EXISTS public.courts CASCADE;
   DROP TABLE IF EXISTS public.profiles CASCADE;
   ```

3. **Run the complete migration** with the fixed policy:
   ```bash
   # Copy the contents of supabase/mvp_migrations.sql
   # Paste into Supabase SQL Editor
   # Click "Run"
   ```

4. **Verify the fix**:
   ```sql
   -- Check that the correct policy exists
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE tablename = 'profiles';
   
   -- You should see "Authenticated users can view all profiles"
   ```

## Testing the Fix

After applying the fix:

1. **Sign in to the app**
2. **Navigate to the Feed page**
   - Posts should show author names
   - Comments should load without errors
   - Reposts should work
3. **Navigate to the Challenges page**
   - Challenges should load without "schema cache" errors
   - Creator names should be visible
4. **Test other features**
   - Messages should work
   - User profiles should display correctly

## Still Having Issues?

If you're still experiencing problems after applying this fix:

1. **Clear your browser cache** and reload the app
2. **Check Supabase logs** in the Dashboard for any RLS policy errors
3. **Verify all migrations ran successfully** by checking the table structures
4. **Ensure your environment variables are set** (see ENV_SETUP.md)

## Migration History

If you ran the migrations in this order, you need the fix:
1. `schema.sql` (old version with restrictive policy)
2. `mvp_phase1.sql`
3. `mvp_phase2_posts.sql`
4. `mvp_phase2_messaging.sql`

The fixed versions are now in:
- `supabase/schema.sql` (updated)
- `supabase/mvp_migrations.sql` (updated)
- `supabase/fix_profiles_rls.sql` (migration-only fix)

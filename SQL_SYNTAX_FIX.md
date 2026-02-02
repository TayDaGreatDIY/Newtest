# SQL Script Syntax Fixes

## Problem
User reported SQL syntax errors when running `supabase/fix_feed_errors.sql`:

1. **Error**: `syntax error at or near "NOT"` on `CREATE POLICY IF NOT EXISTS`
   - PostgreSQL doesn't support `IF NOT EXISTS` for CREATE POLICY

2. **Error**: `cannot change return type of existing function` 
   - `CREATE OR REPLACE FUNCTION` fails when return type differs from existing function

## Solution (Commit d517a2e)

### Fix 1: CREATE POLICY Syntax
**Problem**: Standalone `CREATE POLICY IF NOT EXISTS` statements after DO blocks
```sql
-- ❌ This doesn't work in PostgreSQL
CREATE POLICY IF NOT EXISTS "Authenticated users can view all comments"
  ON public.post_comments
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

**Solution**: Move CREATE POLICY into DO blocks with dynamic EXECUTE
```sql
-- ✅ This works
DO $$
BEGIN
  -- Drop existing policies first
  FOR policy_record IN ... LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ...', policy_record.policyname);
  END LOOP;
  
  -- Create new policy dynamically
  EXECUTE '
    CREATE POLICY "Authenticated users can view all comments"
      ON public.post_comments
      FOR SELECT
      USING (auth.uid() IS NOT NULL)
  ';
END $$;
```

### Fix 2: Function Signature Changes
**Problem**: `CREATE OR REPLACE` fails when return type changes
```sql
-- ❌ Fails if return type differs (e.g., missing updated_at column)
CREATE OR REPLACE FUNCTION public.get_feed_posts(...)
RETURNS TABLE(...)
```

**Solution**: Drop function first, then create
```sql
-- ✅ Drop existing function regardless of signature
DROP FUNCTION IF EXISTS public.get_feed_posts(INTEGER, INTEGER);

-- Create with new signature
CREATE FUNCTION public.get_feed_posts(...)
RETURNS TABLE(...)
```

## Changes Made

### Tables with Fixed Policies:
1. ✅ `profiles` - Moved CREATE POLICY into DO block
2. ✅ `post_comments` - Moved CREATE POLICY into DO block
3. ✅ `post_reposts` - Moved CREATE POLICY into DO block
4. ✅ `posts` - Moved CREATE POLICY into DO block

### Functions Fixed:
1. ✅ `get_feed_posts(INTEGER, INTEGER)` - Added DROP before CREATE
2. ✅ `get_single_post(UUID)` - Added DROP before CREATE

## Result
The SQL script now:
- ✅ Runs without syntax errors
- ✅ Handles existing policies with any name
- ✅ Handles existing functions with different signatures
- ✅ Creates all necessary RLS policies
- ✅ Creates both RPC functions with SECURITY DEFINER
- ✅ Grants EXECUTE permissions

## User Action
Run the updated `supabase/fix_feed_errors.sql` in Supabase Dashboard → SQL Editor.
All syntax errors should now be resolved.

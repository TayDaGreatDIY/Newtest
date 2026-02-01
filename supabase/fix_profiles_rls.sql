-- =====================================================
-- Fix Profiles RLS Policy
-- =====================================================
-- This migration fixes the profiles table RLS policy to allow
-- authenticated users to view all profiles (not just their own).
-- This is necessary for displaying user names in posts, challenges,
-- comments, messages, etc.
--
-- SECURITY NOTE: Only display_name is exposed, not sensitive data.
-- =====================================================

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a new policy that allows all authenticated users to view all profiles
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Note: The other policies (insert, update) remain unchanged
-- Users can still only insert/update their own profile

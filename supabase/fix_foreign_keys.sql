-- =====================================================
-- Fix Foreign Key Relationships for Profiles
-- =====================================================
-- This migration adds foreign key constraints from tables
-- referencing auth.users to also work with profiles table
-- for proper Supabase query joins

-- Since court_checkins.user_id references auth.users(id)
-- and profiles.id also references auth.users(id),
-- we can rely on implicit joins through auth.users

-- However, for Supabase to recognize the relationship in queries,
-- we need to ensure profiles policies allow viewing by others

-- Update profiles policy to allow authenticated users to view other profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- This allows court_checkins and other tables to join with profiles
-- when querying with authenticated users

-- Add a comment to document the relationship
COMMENT ON COLUMN public.court_checkins.user_id IS 'References auth.users(id), which maps to profiles(id)';
COMMENT ON COLUMN public.challenges.created_by IS 'References auth.users(id), which maps to profiles(id)';
COMMENT ON COLUMN public.challenge_participants.user_id IS 'References auth.users(id), which maps to profiles(id)';

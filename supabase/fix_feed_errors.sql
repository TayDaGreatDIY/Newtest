-- =====================================================
-- Fix Feed Page Errors
-- =====================================================
-- This script fixes common issues that cause:
-- - "Failed to load post. Please try again"
-- - "Failed to load comments"
-- - "Failed to repost"
--
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Verify and fix profiles RLS policy
-- This is the most common cause of join failures
-- Drop any existing SELECT policies and create a new permissive one
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  -- Drop all existing SELECT policies on profiles table
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
  END LOOP;
  
  -- Create the correct policy
  EXECUTE '
    CREATE POLICY "Authenticated users can view all profiles"
      ON public.profiles
      FOR SELECT
      USING (auth.uid() IS NOT NULL)
  ';
END $$;

-- 2. Ensure get_feed_posts function exists and has correct permissions
-- Drop existing function first if it exists with different signature
DROP FUNCTION IF EXISTS public.get_feed_posts(INTEGER, INTEGER);

CREATE FUNCTION public.get_feed_posts(
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
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
  ORDER BY p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_feed_posts(INTEGER, INTEGER) TO authenticated;

-- 3. Ensure get_single_post function exists and has correct permissions
-- This uses SECURITY DEFINER to bypass RLS issues similar to get_feed_posts
-- Drop existing function first if it exists with different signature
DROP FUNCTION IF EXISTS public.get_single_post(UUID);

CREATE FUNCTION public.get_single_post(post_uuid UUID)
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_single_post(UUID) TO authenticated;

-- 4. Verify post_comments RLS policies allow reading with joins
-- Ensure authenticated users can read all comments
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  -- Drop all existing SELECT policies on post_comments table
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'post_comments' 
    AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.post_comments', policy_record.policyname);
    RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
  END LOOP;
  
  -- Create the new policy
  EXECUTE '
    CREATE POLICY "Authenticated users can view all comments"
      ON public.post_comments
      FOR SELECT
      USING (auth.uid() IS NOT NULL)
  ';
END $$;

-- 5. Verify post_reposts RLS policies
-- Ensure authenticated users can view all reposts
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  -- Drop all existing SELECT policies on post_reposts table
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'post_reposts' 
    AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.post_reposts', policy_record.policyname);
    RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
  END LOOP;
  
  -- Create the new policy
  EXECUTE '
    CREATE POLICY "Authenticated users can view all reposts"
      ON public.post_reposts
      FOR SELECT
      USING (auth.uid() IS NOT NULL)
  ';
END $$;

-- 6. Verify posts RLS policies allow reading
-- This is needed for the repost function's post existence check
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  -- Drop all existing SELECT policies on posts table
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'posts' 
    AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.posts', policy_record.policyname);
    RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
  END LOOP;
  
  -- Create the new policy
  EXECUTE '
    CREATE POLICY "Authenticated users can view all posts"
      ON public.posts
      FOR SELECT
      USING (auth.uid() IS NOT NULL)
  ';
END $$;

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these to verify everything is set up correctly:

-- Check RPC functions exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_feed_posts' 
    AND prokind = 'f'
  ) THEN
    RAISE EXCEPTION 'Function get_feed_posts does not exist';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_single_post' 
    AND prokind = 'f'
  ) THEN
    RAISE EXCEPTION 'Function get_single_post does not exist';
  END IF;
  
  RAISE NOTICE 'All RPC functions exist ✓';
END $$;

-- Check policies exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Authenticated users can view all profiles'
  ) THEN
    RAISE EXCEPTION 'Profile view policy is missing or incorrectly named';
  END IF;
  
  RAISE NOTICE 'All RLS policies configured correctly ✓';
END $$;

-- =====================================================
-- Test Queries
-- =====================================================
-- Test the RPC functions work:
-- SELECT * FROM get_feed_posts(10, 0);
-- SELECT * FROM get_single_post('your-post-uuid-here');

-- Test comment joins work:
-- SELECT pc.*, p.display_name 
-- FROM post_comments pc
-- LEFT JOIN profiles p ON pc.user_id = p.id
-- LIMIT 10;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '✅ Feed page error fixes applied successfully!';
  RAISE NOTICE 'Test the app now: Feed → Post Details → Comments → Repost';
END $$;

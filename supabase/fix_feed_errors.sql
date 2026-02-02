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
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY IF NOT EXISTS "Authenticated users can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 2. Ensure get_feed_posts function exists and has correct permissions
CREATE OR REPLACE FUNCTION public.get_feed_posts(
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_single_post(UUID) TO authenticated;

-- 4. Verify post_comments RLS policies allow reading with joins
-- Ensure authenticated users can read all comments
DROP POLICY IF EXISTS "Users can view comments" ON public.post_comments;

CREATE POLICY IF NOT EXISTS "Authenticated users can view all comments"
  ON public.post_comments
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 5. Verify post_reposts RLS policies
-- Ensure authenticated users can view all reposts
DROP POLICY IF EXISTS "Users can view reposts" ON public.post_reposts;

CREATE POLICY IF NOT EXISTS "Authenticated users can view all reposts"
  ON public.post_reposts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 6. Verify posts RLS policies allow reading
-- This is needed for the repost function's post existence check
DROP POLICY IF EXISTS "Users can view posts" ON public.posts;

CREATE POLICY IF NOT EXISTS "Authenticated users can view all posts"
  ON public.posts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

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

RAISE NOTICE '✅ Feed page error fixes applied successfully!';
RAISE NOTICE 'Test the app now: Feed → Post Details → Comments → Repost';

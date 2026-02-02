-- =====================================================
-- Fix for Post Detail Page: Get Single Post Function
-- =====================================================
-- This function provides a way to fetch a single post with all necessary
-- user information and interaction status, using SECURITY DEFINER to bypass
-- RLS restrictions that were causing the detail page to fail.
--
-- Root Cause: Direct queries with foreign key joins to the profiles table
-- fail due to RLS policies. This RPC function bypasses those restrictions
-- similar to how get_feed_posts works.

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

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This function should be run in the Supabase SQL Editor to fix
-- the "Failed to load post" error on the Post Detail page.

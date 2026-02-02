-- =====================================================
-- Fix Storage RLS Policies for post-images bucket
-- =====================================================
-- This migration ensures the post-images storage bucket
-- exists and has the correct RLS policies applied.
--
-- Run this if you're getting RLS policy violations when
-- uploading images to posts.
--
-- NOTE: This uses correct UUID comparison (auth.uid() = owner)
-- instead of text casting (auth.uid()::text = owner) which
-- would cause "operator does not exist: text = uuid" errors.
-- =====================================================

-- First, ensure the bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,  -- Make bucket public so images can be viewed
  5242880,  -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view post images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Policy: Anyone can view post images (public bucket)
CREATE POLICY "Anyone can view post images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

-- Policy: Authenticated users can upload post images to their own folder
CREATE POLICY "Authenticated users can upload post images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-images' AND 
    auth.uid() IS NOT NULL AND
    -- Ensure file is uploaded to user's own folder
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can update their own images
CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'post-images' AND 
    auth.uid() = owner
  );

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'post-images' AND 
    auth.uid() = owner
  );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify the setup:
--
-- 1. Check if bucket exists:
-- SELECT * FROM storage.buckets WHERE id = 'post-images';
--
-- 2. Check policies:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%post images%';
--
-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- =====================================================
-- Fix Storage RLS Policies for post-images bucket
-- =====================================================
-- This migration ensures the post-images storage bucket
-- exists and has the correct RLS policies applied.
--
-- Run this if you're getting RLS policy violations when
-- uploading images to posts.
--
-- IMPORTANT - UUID Type Casting Fix:
-- This file uses correct UUID comparison (auth.uid() = owner)
-- instead of incorrect text casting (auth.uid()::text = owner).
--
-- PROBLEM with text casting:
-- - auth.uid()::text converts UUID to text
-- - owner column is UUID type
-- - PostgreSQL cannot compare text with UUID directly
-- - Results in error: "operator does not exist: text = uuid"
--
-- SOLUTION:
-- - Compare UUIDs directly without casting
-- - Both auth.uid() and owner are UUIDs
-- - Direct comparison works correctly
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
  TO authenticated
  USING (
    bucket_id = 'post-images' AND
    auth.uid() = owner
  );

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  TO authenticated
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
-- NOTES
-- =====================================================
-- 1. The 'owner' column in storage.objects is UUID type
-- 2. The auth.uid() function returns a UUID
-- 3. Direct UUID comparison is the correct approach
-- 4. The TO authenticated clause ensures only authenticated users can execute
-- 5. Alternative approaches (but direct comparison is cleaner):
--    - Cast both sides: auth.uid()::text = owner::text
--    - Use subquery: owner = (SELECT auth.uid())
-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- =====================================================
-- Create Storage Bucket for Post Images
-- =====================================================
-- This migration creates the storage bucket for post images
-- and sets up the necessary policies

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,  -- Make bucket public so images can be viewed
  5242880,  -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view post images
CREATE POLICY "Anyone can view post images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

-- Policy: Authenticated users can upload post images
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
    auth.uid()::text = owner
  );

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'post-images' AND 
    auth.uid()::text = owner
  );

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- The 'post-images' bucket is now ready for use
-- Images should be uploaded to: {user_id}/{filename}
-- Public URLs will be available at:
-- https://{project}.supabase.co/storage/v1/object/public/post-images/{user_id}/{filename}

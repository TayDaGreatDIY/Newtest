-- =====================================================
-- Fix Storage RLS Policies - Type Casting Issue
-- =====================================================
-- This file explains the fix for the storage RLS policy error:
-- "ERROR: 42883: operator does not exist: text = uuid"
--
-- PROBLEM:
-- The original policies had: auth.uid()::text = owner
-- This caused a type mismatch error because:
-- - auth.uid()::text converts the UUID to text
-- - owner column is of type UUID
-- - PostgreSQL cannot compare text with UUID directly
--
-- SOLUTION:
-- Compare UUIDs directly without type casting:
-- auth.uid() = owner
--
-- Both auth.uid() and owner are UUIDs, so they can be compared directly.
-- =====================================================

-- If you need to drop existing policies and recreate them, use:

-- Drop existing policies (if they exist with errors)
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Recreate policies with correct type handling
CREATE POLICY "Users can update their own images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'post-images'
    AND auth.uid() = owner
  );

CREATE POLICY "Users can delete their own images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'post-images'
    AND auth.uid() = owner
  );

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. The 'owner' column in storage.objects is of type UUID
-- 2. The auth.uid() function returns a UUID
-- 3. Therefore, no type casting is needed - compare directly
-- 4. Alternative approaches (all work, but direct comparison is cleaner):
--    - Cast both sides: auth.uid()::text = owner::text
--    - Use subquery: owner = (SELECT auth.uid())
-- 5. The TO authenticated clause ensures only authenticated users can execute
-- =====================================================

-- =====================================================
-- M2DG Production Data Cleanup Script
-- =====================================================
-- This script removes ALL test data from the database
-- to prepare for production testing.
-- 
-- WARNING: This will delete ALL user data!
-- Only run this in a development/test environment.
-- 
-- Run this in your Supabase SQL Editor BEFORE
-- starting production testing.
-- =====================================================

-- IMPORTANT: This script will:
-- 1. Delete all messages and message threads
-- 2. Delete all posts, likes, comments, and reposts
-- 3. Delete all challenge participants
-- 4. Delete all challenges
-- 5. Delete all court check-ins
-- 6. Delete all courts
-- 7. Delete all user profiles
-- 8. Reset storage (if needed - see instructions below)

-- Start transaction (optional - remove if you want to run statements individually)
BEGIN;

-- =====================================================
-- 1. CLEAN MESSAGING DATA
-- =====================================================
-- Delete messages first (child of threads)
DELETE FROM public.messages;

-- Delete thread participants
DELETE FROM public.thread_participants;

-- Delete message threads
DELETE FROM public.message_threads;

-- =====================================================
-- 2. CLEAN POSTS AND INTERACTIONS
-- =====================================================
-- Delete post reposts
DELETE FROM public.post_reposts;

-- Delete post comments
DELETE FROM public.post_comments;

-- Delete post likes
DELETE FROM public.post_likes;

-- Delete posts
DELETE FROM public.posts;

-- =====================================================
-- 3. CLEAN CHALLENGES
-- =====================================================
-- Delete challenge participants first (child table)
DELETE FROM public.challenge_participants;

-- Delete challenges
DELETE FROM public.challenges;

-- =====================================================
-- 4. CLEAN COURTS
-- =====================================================
-- Delete court check-ins first (child table)
DELETE FROM public.court_checkins;

-- Delete courts
DELETE FROM public.courts;

-- =====================================================
-- 5. CLEAN USER PROFILES
-- =====================================================
-- Note: This will NOT delete auth.users records
-- Those need to be deleted from the Supabase Auth dashboard
DELETE FROM public.profiles;

-- Commit transaction (optional - remove if running statements individually)
COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify all data has been deleted:

-- Check message counts
SELECT 'messages' as table_name, COUNT(*) as count FROM public.messages
UNION ALL
SELECT 'message_threads', COUNT(*) FROM public.message_threads
UNION ALL
SELECT 'thread_participants', COUNT(*) FROM public.thread_participants
UNION ALL

-- Check post counts
SELECT 'posts', COUNT(*) FROM public.posts
UNION ALL
SELECT 'post_likes', COUNT(*) FROM public.post_likes
UNION ALL
SELECT 'post_comments', COUNT(*) FROM public.post_comments
UNION ALL
SELECT 'post_reposts', COUNT(*) FROM public.post_reposts
UNION ALL

-- Check challenge counts
SELECT 'challenges', COUNT(*) FROM public.challenges
UNION ALL
SELECT 'challenge_participants', COUNT(*) FROM public.challenge_participants
UNION ALL

-- Check court counts
SELECT 'courts', COUNT(*) FROM public.courts
UNION ALL
SELECT 'court_checkins', COUNT(*) FROM public.court_checkins
UNION ALL

-- Check profile count
SELECT 'profiles', COUNT(*) FROM public.profiles;

-- =====================================================
-- STORAGE CLEANUP (MANUAL STEP)
-- =====================================================
-- To clean uploaded images from Supabase Storage:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Select the 'post-images' bucket
-- 3. Delete all files (or specific folders)
-- 
-- Alternatively, you can delete and recreate the bucket:
-- 1. Delete the 'post-images' bucket
-- 2. Create a new 'post-images' bucket
-- 3. Make it public
-- 4. Set up the storage policies (see mvp_migrations.sql)

-- =====================================================
-- AUTH USERS CLEANUP (MANUAL STEP)
-- =====================================================
-- To delete test user accounts:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Manually delete test users one by one
-- OR
-- 3. Use the Supabase API/CLI to bulk delete users
--
-- Note: When auth.users are deleted, profiles are 
-- automatically deleted due to CASCADE constraint.

-- =====================================================
-- RESET AUTO-INCREMENT SEQUENCES (OPTIONAL)
-- =====================================================
-- If you want to reset any sequences (we're using UUIDs, so this is not needed)
-- But if you added any SERIAL columns, you can reset them like:
-- ALTER SEQUENCE sequence_name RESTART WITH 1;

-- =====================================================
-- DONE!
-- =====================================================
-- Your database is now clean and ready for production testing.
-- Next steps:
-- 1. Verify all counts are 0 using the verification queries above
-- 2. Clean storage buckets (see manual step above)
-- 3. Delete auth users (see manual step above)
-- 4. Start testing with fresh user accounts

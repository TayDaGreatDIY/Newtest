-- Test script to verify coaches RLS policies work correctly
-- This should be run after coaches_trainers_system.sql migration

-- Test 1: Check if get_coaches_trainers function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_coaches_trainers';

-- Test 2: Try calling get_coaches_trainers function
-- This should work even without authentication due to SECURITY DEFINER
SELECT * FROM get_coaches_trainers(NULL, NULL, 10, 0);

-- Test 3: Check table policies
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('coaches_trainers', 'coach_certifications', 'coach_schedules')
ORDER BY tablename, policyname;

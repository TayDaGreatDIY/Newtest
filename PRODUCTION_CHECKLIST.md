# M2DG Production Deployment Checklist

This checklist helps prepare the M2DG app for production testing and deployment.

## 🗄️ Database Setup

### Step 1: Verify Schema is Complete
- [x] Profiles table exists with RLS policies
- [x] Courts table exists with RLS policies
- [x] Court check-ins table exists
- [x] Challenges table exists with RLS policies
- [x] Challenge participants table exists
- [x] Posts table exists with RLS policies
- [x] Post likes, comments, and reposts tables exist
- [x] Message threads and messages tables exist with RLS policies
- [x] All helper functions are created
- [x] All triggers are set up

**How to verify:**
1. Go to Supabase Dashboard → Table Editor
2. Check that all tables exist
3. Go to SQL Editor and run:
```sql
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### Step 2: Clean Test Data
- [ ] Run `supabase/cleanup_test_data.sql` in Supabase SQL Editor
- [ ] Verify all tables are empty (see verification queries in cleanup script)
- [ ] Delete test users from Auth → Users in Supabase Dashboard
- [ ] Clean uploaded images from Storage → post-images bucket

**Commands to verify:**
```sql
-- Should all return 0
SELECT COUNT(*) FROM public.posts;
SELECT COUNT(*) FROM public.courts;
SELECT COUNT(*) FROM public.challenges;
SELECT COUNT(*) FROM public.messages;
SELECT COUNT(*) FROM public.profiles;
```

### Step 3: Verify Storage Setup
- [ ] `post-images` bucket exists
- [ ] `post-images` bucket is public
- [ ] Storage policies are set up correctly

**How to verify:**
1. Go to Supabase Dashboard → Storage
2. Check that `post-images` bucket exists and is public
3. Try uploading a test image to verify policies work

## 🔐 Environment Configuration

### Development Environment
- [ ] `.env` file exists locally (not committed)
- [ ] `VITE_SUPABASE_URL` is set correctly
- [ ] `VITE_SUPABASE_ANON_KEY` is set correctly
- [ ] `VITE_OPENAI_API_KEY` is set (optional - for AI Coach)

### GitHub Secrets (for CI/CD)
- [ ] `VITE_SUPABASE_URL` secret is set in GitHub
- [ ] `VITE_SUPABASE_ANON_KEY` secret is set in GitHub

**How to verify:**
1. Go to GitHub Repository → Settings → Secrets and variables → Actions
2. Check that both secrets exist

## 🔄 Real-time Features

### Enable Realtime Replication
- [ ] Enable replication for `posts` table
- [ ] Enable replication for `post_likes` table
- [ ] Enable replication for `post_comments` table
- [ ] Enable replication for `messages` table
- [ ] Enable replication for `message_threads` table

**How to enable:**
1. Go to Supabase Dashboard → Database → Replication
2. Find each table and toggle "Enable Replication"
3. Click "Save" for each table

## 🏗️ Application Build

### Local Build Test
- [ ] Run `npm install` successfully
- [ ] Run `npm run lint` with no errors
- [ ] Run `npm run build` successfully
- [ ] Run `npm run preview` and test the built app

**Commands:**
```bash
npm install
npm run lint
npm run build
npm run preview
```

### GitHub Pages Deployment
- [ ] GitHub Actions workflow runs successfully
- [ ] App is accessible at https://taydagreatdiy.github.io/Newtest/
- [ ] All routes work correctly (no 404s)
- [ ] Service Worker registers correctly
- [ ] PWA can be installed

## 📱 Manual Testing

### Authentication Tests
- [ ] Sign up with new email works
- [ ] Sign in with existing account works
- [ ] Sign out works
- [ ] Protected routes redirect to auth when not logged in
- [ ] After login, redirects to /app/feed

### Courts Feature Tests
- [ ] Can view empty courts list (shows empty state)
- [ ] Can create a new court
- [ ] Court appears in list after creation
- [ ] Can search for courts
- [ ] Can view court detail page
- [ ] Can check in to a court
- [ ] Check-in appears in recent check-ins
- [ ] Can only check in once per day per court
- [ ] Court champion updates after check-ins

### Challenges Feature Tests
- [ ] Can view empty challenges list (shows empty state)
- [ ] Can create a challenge from court detail page
- [ ] Challenge appears in court's challenge list
- [ ] Challenge appears in /app/challenges
- [ ] Can filter challenges (All, Active, Upcoming, Ended)
- [ ] Can view challenge detail page
- [ ] Can join challenge and submit score
- [ ] Score appears in leaderboard
- [ ] Leaderboard sorts correctly (highest first)
- [ ] Top 3 show medals (🥇🥈🥉)

### Posts & Feed Tests
- [ ] Can view empty feed (shows empty state)
- [ ] Can create a text post
- [ ] Can create a post with image
- [ ] Image uploads to Supabase Storage
- [ ] Post appears in feed after creation
- [ ] Can like a post
- [ ] Like count updates in real-time
- [ ] Can unlike a post
- [ ] Can comment on a post
- [ ] Comment appears in post detail
- [ ] Comment count updates
- [ ] Can repost (share) a post
- [ ] Share count updates
- [ ] Can view post detail page

### Messaging Tests
- [ ] Can view empty messages list (shows empty state)
- [ ] Can start a new conversation
- [ ] Can send a message
- [ ] Message appears in thread
- [ ] Can view message thread
- [ ] Messages update in real-time
- [ ] Thread shows last message preview
- [ ] Unread indicator works

### Profile Tests
- [ ] Profile page shows correct stats
- [ ] Can edit display name
- [ ] Display name updates throughout app
- [ ] Stats update after actions:
  - Check-ins count
  - Challenges participated count
  - Challenges won count
  - Champion status (if applicable)

### AI Coach Tests (Optional - requires OpenAI API key)
- [ ] Thinking Corner page loads
- [ ] Can ask a question
- [ ] AI responds with relevant answer
- [ ] Conversation history is maintained
- [ ] Can start new conversation

## 🎨 UI/UX Tests

### Responsive Design
- [ ] Works on mobile (375px width)
- [ ] Works on tablet (768px width)
- [ ] Works on desktop (1024px+ width)
- [ ] Bottom navigation works on mobile
- [ ] All buttons are tappable on mobile

### PWA Tests
- [ ] Can install app on iOS Safari
- [ ] Can install app on Android Chrome
- [ ] Can install app on desktop Chrome/Edge
- [ ] Installed app opens in standalone mode
- [ ] App icon appears correctly
- [ ] Splash screen shows on iOS

### Performance
- [ ] Pages load quickly (< 2 seconds)
- [ ] Images load progressively
- [ ] No console errors in browser
- [ ] No memory leaks during navigation

## 🔒 Security Tests

### Row Level Security
- [ ] Users can only see their own profile
- [ ] Users can only edit their own profile
- [ ] Users can only delete their own posts
- [ ] Users can only edit/delete their own comments
- [ ] Users cannot access other users' private data

**How to test:**
1. Create two user accounts
2. Try to access/modify data from another account
3. Should receive authorization errors

### Storage Security
- [ ] Can upload images when authenticated
- [ ] Cannot upload images when not authenticated
- [ ] Can only delete own uploaded images
- [ ] Public images are accessible without auth

## 📊 Post-Launch Monitoring

### Things to Monitor
- [ ] Supabase database usage
- [ ] Storage bucket size
- [ ] Number of active users
- [ ] Error logs in browser console
- [ ] Supabase API error logs
- [ ] Page load times
- [ ] API response times

### Supabase Dashboard
- [ ] Check Database → Logs for errors
- [ ] Check Auth → Users for user activity
- [ ] Check Storage → Usage for storage limits
- [ ] Check Database → Roles → Usage for database limits

## 🚀 Go-Live Checklist

Before announcing to real users:
- [ ] All database tests pass
- [ ] All environment variables are set
- [ ] All real-time features work
- [ ] App builds and deploys successfully
- [ ] All manual tests pass
- [ ] PWA installation works
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Security tests pass
- [ ] Monitoring is set up

## 🆘 Troubleshooting

### Common Issues

**Issue: "Invalid API key" error**
- Solution: Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly

**Issue: "Row Level Security" errors**
- Solution: Verify that RLS policies are set up correctly in Supabase

**Issue: Images not uploading**
- Solution: Check that post-images bucket exists and is public

**Issue: Real-time not working**
- Solution: Enable replication for tables in Supabase Dashboard

**Issue: 404 on page refresh**
- Solution: GitHub Pages should handle this automatically. Check deploy workflow.

**Issue: Service Worker errors**
- Solution: Clear browser cache and reload. Check vite.config.ts

## 📝 Notes

- All SQL migrations are in `supabase/mvp_migrations.sql`
- Test data cleanup script is in `supabase/cleanup_test_data.sql`
- Documentation is in README.md and other markdown files
- Mock data files (in `src/data/`) are no longer used but kept for reference

## ✅ Final Verification

Run through this quick checklist:
1. ✅ Database is clean (no test data)
2. ✅ Can sign up as new user
3. ✅ Can create a court
4. ✅ Can check in to court
5. ✅ Can create a challenge
6. ✅ Can join challenge and submit score
7. ✅ Can create a post
8. ✅ Can like and comment on post
9. ✅ Can send a message
10. ✅ Profile stats are correct

**If all items pass: You're ready for production testing! 🎉**

# Complete Supabase Setup Guide for M2DG

This guide provides all the SQL you need to run in Supabase to set up your M2DG application, plus configuration for OpenAI integration.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Step 1: Database Migration](#step-1-database-migration)
- [Step 2: Storage Bucket Setup](#step-2-storage-bucket-setup)
- [Step 3: Enable Realtime](#step-3-enable-realtime)
- [Step 4: OpenAI API Key Setup](#step-4-openai-api-key-setup)
- [Step 5: Verify Setup](#step-5-verify-setup)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:
- A Supabase account (sign up at [https://supabase.com](https://supabase.com))
- A Supabase project created
- Access to your Supabase project dashboard
- An OpenAI API key (optional, for AI Coach feature) from [https://platform.openai.com](https://platform.openai.com)

## Step 1: Database Migration

### Complete SQL Migration

Copy and paste the entire contents of `supabase/mvp_migrations.sql` into your Supabase SQL Editor and run it. This single file creates everything you need:

**What it creates:**
- ✅ Profiles table with automatic user creation
- ✅ Courts, check-ins, and challenges tables
- ✅ Posts, likes, comments, and reposts tables (Feed system)
- ✅ Message threads and messages tables (Messaging system)
- ✅ All Row Level Security (RLS) policies
- ✅ All helper functions and triggers
- ✅ Indexes for optimal performance

### How to Run:

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file `supabase/mvp_migrations.sql` from this repository
6. Copy the **entire contents** of the file
7. Paste into the SQL Editor
8. Click **Run** (or press Cmd/Ctrl + Enter)

You should see a success message. The migration includes:
- 15 tables
- 40+ RLS policies
- 10+ helper functions
- Multiple triggers and indexes

## Step 2: Storage Bucket Setup

The app uses Supabase Storage to store post images. Follow these steps:

### Create the Storage Bucket

1. In your Supabase Dashboard, go to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Enter the following details:
   - **Name:** `post-images`
   - **Public bucket:** Toggle **ON** ✅
4. Click **Create bucket**

### Set Up Storage Policies

After creating the bucket, you need to set up access policies:

1. Click on the `post-images` bucket
2. Go to **Policies** tab
3. Run the following SQL in the SQL Editor:

```sql
-- Allow anyone to view post images
CREATE POLICY "Anyone can view post images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload post images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'post-images' AND auth.uid() IS NOT NULL);

-- Allow users to update their own images
CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'post-images' AND auth.uid() = owner);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'post-images' AND auth.uid() = owner);
```

Alternatively, you can use the visual policy editor in the Storage section.

## Step 3: Enable Realtime

For real-time updates in messaging and feed, enable Realtime replication:

1. In your Supabase Dashboard, go to **Database** → **Replication**
2. Find and enable replication for these tables:
   - ✅ `posts`
   - ✅ `post_likes`
   - ✅ `post_comments`
   - ✅ `messages`
   - ✅ `message_threads`

Toggle the switch next to each table to enable Realtime.

## Step 4: OpenAI API Key Setup

The AI Coach feature uses OpenAI's API. Here's how to configure it:

### Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (you won't be able to see it again!)
6. Save it securely

### Configure for Local Development

Add to your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=sk-your-openai-api-key
```

### Configure for GitHub Actions (Production)

You mentioned you've already added the OpenAI key to GitHub Actions. Here's how to verify and complete the setup:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Verify you have these secrets configured:
   - ✅ `VITE_SUPABASE_URL` - Your Supabase project URL
   - ✅ `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key
   - ✅ `VITE_OPENAI_API_KEY` - Your OpenAI API key

If any are missing, click **New repository secret** and add them.

### Update GitHub Actions Workflow

The workflow file needs to include the OpenAI key in the build step. Update `.github/workflows/deploy.yml`:

```yaml
- name: Build application
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
  run: npm run build
```

And `.github/workflows/ci.yml`:

```yaml
- name: Build application
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
  run: npm run build
```

### Important Security Note

⚠️ **For Production:** The current implementation uses OpenAI API directly from the browser with `dangerouslyAllowBrowser: true`. This is acceptable for development and prototypes but not recommended for production.

**For production, consider:**
- Creating a Supabase Edge Function to handle OpenAI calls
- Using a separate backend API to keep your API key secure
- Never exposing API keys in client-side code

The app will still work without the OpenAI key - it will use fallback hardcoded responses for the AI Coach.

## Step 5: Verify Setup

After completing all steps, verify everything is working:

### Test Database Tables

Run this query in the SQL Editor to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see these tables:
- challenge_participants
- challenges
- court_checkins
- courts
- message_threads
- messages
- post_comments
- post_likes
- post_reposts
- posts
- profiles
- thread_participants

### Test Storage Bucket

```sql
SELECT * FROM storage.buckets WHERE id = 'post-images';
```

Should return one row showing the post-images bucket.

### Test Authentication Flow

1. Start your development server: `npm run dev`
2. Navigate to `/auth/sign-up`
3. Create a test account
4. Verify you're redirected to `/app/feed`
5. Check that your profile was automatically created:

```sql
SELECT * FROM public.profiles WHERE display_name = 'YourDisplayName';
```

### Test Feature Access

Try these features to ensure everything works:
- ✅ Create a court
- ✅ Check in to a court
- ✅ Create a challenge
- ✅ Create a post
- ✅ Upload an image to a post
- ✅ Send a message (requires 2 user accounts)
- ✅ Ask the AI Coach a question

## Troubleshooting

### "relation 'public.post_reposts' does not exist" error

**Problem:** You see this error when opening the feed page.

**Solution:** The `post_reposts` table is missing from your database. Follow the detailed guide in [`FIX_POST_REPOSTS_ERROR.md`](FIX_POST_REPOSTS_ERROR.md).

**Quick Fix:**
1. Go to Supabase SQL Editor
2. Run the SQL from `supabase/create_post_reposts_table.sql`
3. Refresh your app

### "permission denied" or RLS errors

**Solution:** Make sure you're logged in to the app. All tables have Row Level Security enabled, which requires authentication.

### Storage bucket not found

**Solution:** 
- Verify the bucket exists: Go to Storage section in Supabase Dashboard
- Check the bucket name is exactly `post-images`
- Ensure it's marked as public

### Images not uploading

**Solution:**
- Verify storage policies are set up correctly
- Check browser console for specific error messages
- Ensure you're authenticated when trying to upload

### Messages not appearing in realtime

**Solution:**
- Verify Realtime is enabled for the `messages` table
- Check Database → Replication in Supabase Dashboard
- Look for subscription errors in browser console

### AI Coach not responding

**Solution:**
- Verify `VITE_OPENAI_API_KEY` is set in your `.env` file
- Check that the key is valid on OpenAI platform
- The app will still work with fallback responses if the key is missing
- Check browser console for API errors

### GitHub Actions build failing

**Solution:**
- Verify all three secrets are added to your repository
- Check workflow logs for specific error messages
- Ensure secret names match exactly (they're case-sensitive)
- Re-add secrets if necessary

### Tables already exist

If you see "table already exists" errors, either:
1. Drop existing tables first (be careful - this deletes data!)
2. Or skip to the next steps if tables are already set up

To drop all tables and start fresh:

```sql
-- WARNING: This will delete all data!
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.thread_participants CASCADE;
DROP TABLE IF EXISTS public.message_threads CASCADE;
DROP TABLE IF EXISTS public.post_reposts CASCADE;
DROP TABLE IF EXISTS public.post_comments CASCADE;
DROP TABLE IF EXISTS public.post_likes CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.challenge_participants CASCADE;
DROP TABLE IF EXISTS public.challenges CASCADE;
DROP TABLE IF EXISTS public.court_checkins CASCADE;
DROP TABLE IF EXISTS public.courts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Then run mvp_migrations.sql again
```

## Summary Checklist

Use this checklist to ensure you've completed all setup steps:

- [ ] Created a Supabase project
- [ ] Ran `mvp_migrations.sql` in SQL Editor
- [ ] Created `post-images` storage bucket (public)
- [ ] Set up storage policies for the bucket
- [ ] Enabled Realtime for posts, post_likes, post_comments, messages, message_threads
- [ ] Created `.env` file with Supabase credentials
- [ ] Added OpenAI API key to `.env` (optional)
- [ ] Added GitHub Actions secrets: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_OPENAI_API_KEY
- [ ] Updated GitHub Actions workflow files to include OpenAI key
- [ ] Tested authentication (sign up/sign in)
- [ ] Tested creating courts, posts, and messages
- [ ] Verified image uploads work
- [ ] Tested AI Coach feature

## Next Steps

After completing the setup:

1. **Deploy to Production:** Push your changes to trigger GitHub Actions deployment
2. **Test Live App:** Visit your deployed app and test all features
3. **Monitor Usage:** Check Supabase Dashboard for usage statistics
4. **Read Documentation:** See `TESTING_GUIDE.md` for comprehensive testing steps
5. **Review Security:** See `PRODUCTION_CHECKLIST.md` for production readiness

## Support

If you encounter issues not covered in this guide:
- Check the Supabase Dashboard logs
- Review browser console errors
- Consult the [Supabase Documentation](https://supabase.com/docs)
- Check the [OpenAI API Documentation](https://platform.openai.com/docs)

## Additional Resources

- `ENV_SETUP.md` - Detailed environment variable configuration
- `PHASE2_SETUP.md` - Step-by-step Phase 2 setup guide
- `TESTING_GUIDE.md` - Comprehensive testing procedures
- `PRODUCTION_CHECKLIST.md` - Production deployment checklist
- `README.md` - General project overview and features

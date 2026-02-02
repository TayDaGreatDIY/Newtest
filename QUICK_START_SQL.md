# Quick Start: SQL for Supabase

This is a quick reference for the SQL you need to run in Supabase. For detailed instructions, see [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

## What You Need

1. **Main Database Migration**: `supabase/mvp_migrations.sql`
2. **Storage Bucket Policies**: See below
3. **OpenAI API Key**: Already added to GitHub Actions ✅

## Step 1: Run Database Migration

Copy the entire contents of `supabase/mvp_migrations.sql` and run it in your Supabase SQL Editor.

This one file creates everything:
- ✅ All tables (profiles, courts, challenges, posts, messages)
- ✅ All Row Level Security policies
- ✅ All helper functions and triggers
- ✅ All indexes

## Step 2: Create Storage Bucket

In Supabase Dashboard → Storage:
1. Create bucket named `post-images`
2. Make it public ✅

Then run this SQL for storage policies:

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

## Step 3: Enable Realtime (Optional)

In Supabase Dashboard → Database → Replication, enable for:
- ✅ `posts`
- ✅ `post_likes`
- ✅ `post_comments`
- ✅ `messages`
- ✅ `message_threads`

## Step 4: Configure OpenAI API Key

### GitHub Actions (Already Done ✅)
You've already added the OpenAI key to GitHub Actions secrets. The workflow files have been updated to use it.

### Local Development
Add to your `.env` file:
```
VITE_OPENAI_API_KEY=sk-your-openai-api-key
```

## That's It!

Your database is now set up. For detailed explanations and troubleshooting, see [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

## Verification

Run this SQL to verify tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see 12 tables:
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

# Phase 2 Setup Guide

This guide walks you through setting up Phase 2 features: Posts & Feed System, Real-time Messaging, and AI Coach Integration.

## Prerequisites

Before starting, ensure you have:
- Completed Phase 1 setup (authentication, profiles, courts, challenges)
- Run `mvp_phase1.sql` migration in your Supabase project
- A Supabase project with authentication enabled
- Node.js and npm installed

## 1. Database Setup

### Step 1.1: Run Posts Migration

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `supabase/mvp_phase2_posts.sql`
6. Paste into the SQL editor
7. Click **Run** to execute the migration

This creates:
- `posts` table (for text, image, and challenge posts)
- `post_likes` table (for tracking post likes)
- `post_comments` table (for post comments)
- Triggers for updating counts automatically
- RLS policies for security
- Helper function `get_feed_posts()` for efficient feed queries

### Step 1.2: Run Messaging Migration

1. In the **SQL Editor**, click **New Query**
2. Copy the contents of `supabase/mvp_phase2_messaging.sql`
3. Paste into the SQL editor
4. Click **Run** to execute the migration

This creates:
- `message_threads` table (for conversation threads)
- `thread_participants` table (for tracking who's in each thread)
- `messages` table (for individual messages)
- Triggers for updating last message timestamps
- RLS policies for security
- Helper functions for thread management and message retrieval

### Step 1.3: Set Up Storage Bucket for Post Images

1. In your Supabase Dashboard, go to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Enter **Name**: `post-images`
4. Set **Public bucket**: Toggle ON (to allow public access to images)
5. Click **Create bucket**

Now configure the storage policies:

1. Click on the `post-images` bucket
2. Go to **Policies** tab
3. Click **New Policy** and create the following policies:

**Policy 1: Allow public viewing**
```sql
CREATE POLICY "Anyone can view post images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');
```

**Policy 2: Allow authenticated uploads**
```sql
CREATE POLICY "Authenticated users can upload post images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'post-images' AND auth.uid() IS NOT NULL);
```

**Policy 3: Allow users to update their own images**
```sql
CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'post-images' AND auth.uid() = owner);
```

**Policy 4: Allow users to delete their own images**
```sql
CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'post-images' AND auth.uid() = owner);
```

### Step 1.4: Enable Realtime

For real-time messaging and post updates to work:

1. Go to **Database** → **Replication** in your Supabase Dashboard
2. Enable replication for these tables:
   - `posts`
   - `post_likes`
   - `messages`
   - `message_threads`

Click the toggle next to each table to enable Realtime.

## 2. Environment Setup

### Step 2.1: Configure Supabase Credentials

If you haven't already, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 2.2: Configure OpenAI API Key (Optional but Recommended)

For the AI Coach to work with real AI responses:

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (you won't be able to see it again!)
6. Add to your `.env` file:

```env
VITE_OPENAI_API_KEY=sk-your-openai-api-key
```

**Note:** Without this key, the AI Coach will use fallback hardcoded responses, but won't provide dynamic AI-powered coaching.

**Security Note:** In production, you should use a backend API to call OpenAI (not directly from the browser) to keep your API key secure. The current implementation includes `dangerouslyAllowBrowser: true` which is only suitable for development/prototyping.

## 3. Install Dependencies

```bash
npm install
```

This installs the new OpenAI SDK dependency that was added in Phase 2.

## 4. Build and Test

### Step 4.1: Build the Project

```bash
npm run build
```

Ensure the build completes without errors.

### Step 4.2: Run Development Server

```bash
npm run dev
```

The app should start at `http://localhost:5173`

### Step 4.3: Test Features

Once logged in, test each feature:

#### Test Posts & Feed:
1. Navigate to the **Feed** page
2. Click **+ Post** button
3. Create a text post
4. Try uploading an image post
5. Like/unlike posts
6. Verify real-time updates (open in two browser windows)

#### Test Messaging:
1. Navigate to the **Messages** page
2. To test, you'll need two user accounts
3. Use Supabase SQL Editor to create a test thread:

```sql
-- Get your user IDs first
SELECT id, email FROM auth.users;

-- Create a thread between two users (replace with actual user IDs)
SELECT get_or_create_thread('other-user-uuid');
```

4. Send messages between accounts
5. Verify real-time delivery
6. Check unread counts

#### Test AI Coach:
1. Navigate to the **Thinking Corner** page
2. Try the quick prompts
3. Ask custom questions
4. Verify responses (AI-powered if key configured, fallback otherwise)

## 5. Verify Security (RLS Policies)

Test that Row Level Security is working:

1. **Posts**: Users should only be able to edit/delete their own posts
2. **Likes**: Users can only like/unlike posts as themselves
3. **Messages**: Users can only see threads they're part of
4. **Comments**: Users can only edit/delete their own comments

Try these actions in the browser console:
```javascript
// This should fail (trying to delete someone else's post)
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', 'someone-elses-post-id');
```

## 6. Production Deployment

### Before deploying to production:

1. **Environment Variables**: Ensure all production environment variables are set in your hosting platform (Netlify, Vercel, etc.)

2. **OpenAI Security**: Replace direct browser calls with a backend API:
   - Create a Supabase Edge Function for AI requests
   - Or use a separate backend service
   - Never expose API keys in the browser

3. **Storage Limits**: Monitor your Supabase storage usage for post images

4. **Realtime Connections**: Be aware of Supabase's realtime connection limits on your plan

5. **Database Indexes**: The migrations include indexes, but monitor query performance

## 7. Common Issues and Solutions

### Issue: Posts not loading
- **Solution**: Check that `mvp_phase2_posts.sql` was run successfully
- Verify the `get_feed_posts()` function exists in Supabase SQL Editor
- Check browser console for errors

### Issue: Images not uploading
- **Solution**: Verify the `post-images` bucket exists and is public
- Check that storage policies are correctly configured
- Ensure authenticated user is logged in

### Issue: Messages not appearing in real-time
- **Solution**: Verify Realtime is enabled for the `messages` table
- Check that subscriptions are working in browser console
- Try refreshing the page

### Issue: AI Coach not responding
- **Solution**: Check that `VITE_OPENAI_API_KEY` is set in `.env`
- Verify the API key is valid on OpenAI platform
- Check browser console for error messages
- Fallback responses should still work without the key

### Issue: "User not authenticated" errors
- **Solution**: Make sure you're logged in
- Check that the auth token hasn't expired
- Try logging out and logging back in

## 8. Next Steps

After completing Phase 2 setup:

1. Monitor Supabase usage and quotas
2. Consider implementing additional features:
   - Post comments UI
   - Share functionality
   - Push notifications
   - Image optimization
3. Run security audits
4. Gather user feedback
5. Plan for Phase 3 features (see PHASE2_ROADMAP.md)

## Support

If you encounter issues:
1. Check Supabase Dashboard logs
2. Review browser console errors
3. Verify all migrations ran successfully
4. Check that environment variables are set correctly

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [React Query for Real-time](https://react-query.tanstack.com/)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)

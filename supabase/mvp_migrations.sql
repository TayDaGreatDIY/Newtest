-- =====================================================
-- M2DG MVP Complete Migration
-- =====================================================
-- This is the COMPLETE migration for the M2DG MVP.
-- Run this file ONCE in your Supabase SQL Editor to set up:
-- - Profiles table with automatic creation on signup
-- - Courts, Check-ins, and Challenges system
-- - Posts, Likes, Comments, and Reposts (Feed system)
-- - Messaging system (Threads and Messages)
-- - All RLS policies
-- - All helper functions
--
-- IMPORTANT: Run this in order:
-- 1. This file creates all tables and policies
-- 2. Create storage bucket in Supabase Dashboard (see instructions below)
-- =====================================================

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function to automatically create a profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on profiles
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 2. COURTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  amenities TEXT[] DEFAULT '{}',
  max_players INTEGER DEFAULT 10,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Courts are viewable by authenticated users"
  ON public.courts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create courts"
  ON public.courts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

CREATE POLICY "Users can update their own courts"
  ON public.courts
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_court_updated ON public.courts;
CREATE TRIGGER on_court_updated
  BEFORE UPDATE ON public.courts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 3. COURT CHECK-INS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.court_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(court_id, user_id, checked_in_at)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_court_checkins_court_id ON public.court_checkins(court_id);
CREATE INDEX IF NOT EXISTS idx_court_checkins_user_id ON public.court_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_court_checkins_checked_in_at ON public.court_checkins(checked_in_at);

-- Enable RLS
ALTER TABLE public.court_checkins ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create their own check-ins"
  ON public.court_checkins
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view check-ins"
  ON public.court_checkins
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 4. CHALLENGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL,
  rules TEXT,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_challenges_court_id ON public.challenges(court_id);
CREATE INDEX IF NOT EXISTS idx_challenges_created_by ON public.challenges(created_by);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view challenges"
  ON public.challenges
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create challenges"
  ON public.challenges
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

CREATE POLICY "Users can update their own challenges"
  ON public.challenges
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_challenge_updated ON public.challenges;
CREATE TRIGGER on_challenge_updated
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 5. CHALLENGE PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score NUMERIC,
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON public.challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON public.challenge_participants(user_id);

-- Enable RLS
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view participants"
  ON public.challenge_participants
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can submit their own results"
  ON public.challenge_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own results"
  ON public.challenge_participants
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 6. COURT CHAMPION VIEW
-- =====================================================
CREATE OR REPLACE VIEW public.court_champions AS
SELECT DISTINCT ON (court_id)
  court_id,
  user_id AS champion_id,
  COUNT(*) AS checkin_count
FROM public.court_checkins
WHERE checked_in_at >= NOW() - INTERVAL '7 days'
GROUP BY court_id, user_id
ORDER BY court_id, checkin_count DESC, MAX(checked_in_at) DESC;

-- =====================================================
-- 7. HELPER FUNCTION: Get Court with Champion
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_court_with_champion(court_uuid UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  location TEXT,
  description TEXT,
  amenities TEXT[],
  max_players INTEGER,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  champion_id UUID,
  champion_name TEXT,
  champion_checkin_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.location,
    c.description,
    c.amenities,
    c.max_players,
    c.created_by,
    c.created_at,
    c.updated_at,
    cc.champion_id,
    p.display_name AS champion_name,
    cc.checkin_count AS champion_checkin_count
  FROM public.courts c
  LEFT JOIN public.court_champions cc ON c.id = cc.court_id
  LEFT JOIN public.profiles p ON cc.champion_id = p.id
  WHERE c.id = court_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'challenge')),
  content TEXT NOT NULL,
  image_url TEXT,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_type ON public.posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_challenge_id ON public.posts(challenge_id);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Posts are viewable by authenticated users"
  ON public.posts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own posts"
  ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_post_updated ON public.posts;
CREATE TRIGGER on_post_updated
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 9. POST LIKES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);

-- Enable RLS
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Likes are viewable by authenticated users"
  ON public.post_likes
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can like posts"
  ON public.post_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON public.post_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update like counts
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for like count
DROP TRIGGER IF EXISTS on_post_like_change ON public.post_likes;
CREATE TRIGGER on_post_like_change
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_likes_count();

-- =====================================================
-- 10. POST COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON public.post_comments(created_at DESC);

-- Enable RLS
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Comments are viewable by authenticated users"
  ON public.post_comments
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create comments"
  ON public.post_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.post_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.post_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update comment counts
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment count
DROP TRIGGER IF EXISTS on_post_comment_change ON public.post_comments;
CREATE TRIGGER on_post_comment_change
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_comments_count();

-- Trigger for updated_at on comments
DROP TRIGGER IF EXISTS on_comment_updated ON public.post_comments;
CREATE TRIGGER on_comment_updated
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 11. POST REPOSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.post_reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_reposts_post_id ON public.post_reposts(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reposts_user_id ON public.post_reposts(user_id);

-- Enable RLS
ALTER TABLE public.post_reposts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Reposts are viewable by authenticated users"
  ON public.post_reposts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can repost posts"
  ON public.post_reposts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unrepost posts"
  ON public.post_reposts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update repost/share counts
CREATE OR REPLACE FUNCTION public.update_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET shares_count = shares_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET shares_count = GREATEST(0, shares_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for share count
DROP TRIGGER IF EXISTS on_post_repost_change ON public.post_reposts;
CREATE TRIGGER on_post_repost_change
  AFTER INSERT OR DELETE ON public.post_reposts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_shares_count();

-- =====================================================
-- 12. HELPER FUNCTION: Get Feed Posts
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_feed_posts(
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  post_id UUID,
  post_type TEXT,
  post_content TEXT,
  post_image_url TEXT,
  post_challenge_id UUID,
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  user_display_name TEXT,
  is_liked_by_me BOOLEAN,
  is_reposted_by_me BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS post_id,
    p.type AS post_type,
    p.content AS post_content,
    p.image_url AS post_image_url,
    p.challenge_id AS post_challenge_id,
    p.likes_count,
    p.comments_count,
    p.shares_count,
    p.created_at,
    p.user_id,
    prof.display_name AS user_display_name,
    EXISTS(
      SELECT 1 FROM public.post_likes pl
      WHERE pl.post_id = p.id AND pl.user_id = auth.uid()
    ) AS is_liked_by_me,
    EXISTS(
      SELECT 1 FROM public.post_reposts pr
      WHERE pr.post_id = p.id AND pr.user_id = auth.uid()
    ) AS is_reposted_by_me
  FROM public.posts p
  LEFT JOIN public.profiles prof ON p.user_id = prof.id
  ORDER BY p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 13. MESSAGE THREADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_message_threads_last_message ON public.message_threads(last_message_at DESC);

-- Enable RLS
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their threads"
  ON public.message_threads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.thread_participants tp
      WHERE tp.thread_id = id AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create threads"
  ON public.message_threads
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_thread_updated ON public.message_threads;
CREATE TRIGGER on_thread_updated
  BEFORE UPDATE ON public.message_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 14. THREAD PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.thread_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_thread_participants_thread_id ON public.thread_participants(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_participants_user_id ON public.thread_participants(user_id);

-- Enable RLS
ALTER TABLE public.thread_participants ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view participants in their threads"
  ON public.thread_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.thread_participants tp
      WHERE tp.thread_id = thread_id AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add participants to threads"
  ON public.thread_participants
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.thread_participants tp
        WHERE tp.thread_id = thread_id AND tp.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own participant record"
  ON public.thread_participants
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 15. MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread_created ON public.messages(thread_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view messages in their threads"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.thread_participants tp
      WHERE tp.thread_id = thread_id AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their threads"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.thread_participants tp
      WHERE tp.thread_id = thread_id AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages
  FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages"
  ON public.messages
  FOR DELETE
  USING (auth.uid() = sender_id);

-- Function to update thread's last_message_at
CREATE OR REPLACE FUNCTION public.update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.message_threads
  SET last_message_at = NEW.created_at
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for last_message_at
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_thread_last_message();

-- Trigger for updated_at on messages
DROP TRIGGER IF EXISTS on_message_updated ON public.messages;
CREATE TRIGGER on_message_updated
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 16. MESSAGING HELPER FUNCTIONS
-- =====================================================

-- Function to get all threads for a user
CREATE OR REPLACE FUNCTION public.get_user_threads(user_uuid UUID)
RETURNS TABLE(
  thread_id UUID,
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message TEXT,
  last_sender_id UUID,
  unread_count BIGINT,
  other_participant_id UUID,
  other_participant_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mt.id AS thread_id,
    mt.last_message_at,
    (
      SELECT m.content
      FROM public.messages m
      WHERE m.thread_id = mt.id
      ORDER BY m.created_at DESC
      LIMIT 1
    ) AS last_message,
    (
      SELECT m.sender_id
      FROM public.messages m
      WHERE m.thread_id = mt.id
      ORDER BY m.created_at DESC
      LIMIT 1
    ) AS last_sender_id,
    (
      SELECT COUNT(*)
      FROM public.messages m
      WHERE m.thread_id = mt.id 
        AND m.created_at > COALESCE(tp.last_read_at, '1970-01-01'::timestamp)
        AND m.sender_id != user_uuid
    ) AS unread_count,
    other_tp.user_id AS other_participant_id,
    other_prof.display_name AS other_participant_name
  FROM public.message_threads mt
  JOIN public.thread_participants tp ON mt.id = tp.thread_id AND tp.user_id = user_uuid
  LEFT JOIN public.thread_participants other_tp ON mt.id = other_tp.thread_id AND other_tp.user_id != user_uuid
  LEFT JOIN public.profiles other_prof ON other_tp.user_id = other_prof.id
  ORDER BY mt.last_message_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get messages in a thread
CREATE OR REPLACE FUNCTION public.get_thread_messages(
  thread_uuid UUID,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  message_id UUID,
  thread_id UUID,
  sender_id UUID,
  sender_name TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.thread_participants tp
    WHERE tp.thread_id = thread_uuid AND tp.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User is not a participant in this thread';
  END IF;

  RETURN QUERY
  SELECT 
    m.id AS message_id,
    m.thread_id,
    m.sender_id,
    p.display_name AS sender_name,
    m.content,
    m.created_at
  FROM public.messages m
  LEFT JOIN public.profiles p ON m.sender_id = p.id
  WHERE m.thread_id = thread_uuid
  ORDER BY m.created_at ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create or get existing thread between two users
CREATE OR REPLACE FUNCTION public.get_or_create_thread(other_user_id UUID)
RETURNS UUID AS $$
DECLARE
  existing_thread_id UUID;
  new_thread_id UUID;
BEGIN
  SELECT mt.id INTO existing_thread_id
  FROM public.message_threads mt
  WHERE EXISTS (
    SELECT 1 FROM public.thread_participants tp1
    WHERE tp1.thread_id = mt.id AND tp1.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.thread_participants tp2
    WHERE tp2.thread_id = mt.id AND tp2.user_id = other_user_id
  )
  AND (
    SELECT COUNT(*) FROM public.thread_participants tp
    WHERE tp.thread_id = mt.id
  ) = 2
  LIMIT 1;

  IF existing_thread_id IS NOT NULL THEN
    RETURN existing_thread_id;
  END IF;

  INSERT INTO public.message_threads DEFAULT VALUES
  RETURNING id INTO new_thread_id;

  INSERT INTO public.thread_participants (thread_id, user_id)
  VALUES 
    (new_thread_id, auth.uid()),
    (new_thread_id, other_user_id);

  RETURN new_thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark thread as read
CREATE OR REPLACE FUNCTION public.mark_thread_as_read(thread_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.thread_participants
  SET last_read_at = NOW()
  WHERE thread_id = thread_uuid AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- =====================================================
-- STORAGE SETUP (Run in Supabase Dashboard)
-- =====================================================
-- Go to Storage section in Supabase Dashboard and:
-- 1. Create a new bucket named "post-images"
-- 2. Make it public
-- 3. Set up the following policies via Dashboard or run this SQL:

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('post-images', 'post-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- CREATE POLICY "Anyone can view post images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'post-images');

-- CREATE POLICY "Authenticated users can upload post images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'post-images' AND auth.uid() IS NOT NULL);

-- CREATE POLICY "Users can update their own images"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'post-images' AND auth.uid()::text = owner);

-- CREATE POLICY "Users can delete their own images"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'post-images' AND auth.uid()::text = owner);

-- =====================================================
-- NEXT STEPS
-- =====================================================
-- 1. ✅ Run this file in Supabase SQL Editor
-- 2. ⬜ Create 'post-images' storage bucket in Dashboard
-- 3. ⬜ Enable Realtime for tables (optional, recommended):
--    - Go to Database → Replication
--    - Enable for: posts, post_likes, post_comments, messages
-- 4. ⬜ Test the app with real data!

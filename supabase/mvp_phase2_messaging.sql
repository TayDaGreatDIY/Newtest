-- =====================================================
-- M2DG MVP Phase 2: Messaging System
-- =====================================================
-- This migration creates the data model for:
-- - Message Threads (conversations between users)
-- - Thread Participants (users in each thread)
-- - Messages (individual messages in threads)
-- - Real-time messaging support

-- =====================================================
-- 1. MESSAGE THREADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for sorting
CREATE INDEX IF NOT EXISTS idx_message_threads_last_message ON public.message_threads(last_message_at DESC);

-- Enable RLS
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

-- Users can only see threads they're part of
CREATE POLICY "Users can view their threads"
  ON public.message_threads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.thread_participants tp
      WHERE tp.thread_id = id AND tp.user_id = auth.uid()
    )
  );

-- Users can create threads (will be validated by thread_participants)
CREATE POLICY "Authenticated users can create threads"
  ON public.message_threads
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- 2. THREAD PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.thread_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(thread_id, user_id) -- Each user can only be in a thread once
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_thread_participants_thread_id ON public.thread_participants(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_participants_user_id ON public.thread_participants(user_id);

-- Enable RLS
ALTER TABLE public.thread_participants ENABLE ROW LEVEL SECURITY;

-- Users can see participants in their threads
CREATE POLICY "Users can view participants in their threads"
  ON public.thread_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.thread_participants tp
      WHERE tp.thread_id = thread_id AND tp.user_id = auth.uid()
    )
  );

-- Users can be added to threads
CREATE POLICY "Users can add participants to threads"
  ON public.thread_participants
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (
      -- Either adding yourself
      user_id = auth.uid() OR
      -- Or adding someone to a thread you're in
      EXISTS (
        SELECT 1 FROM public.thread_participants tp
        WHERE tp.thread_id = thread_id AND tp.user_id = auth.uid()
      )
    )
  );

-- Users can update their own participant record (for last_read_at)
CREATE POLICY "Users can update their own participant record"
  ON public.thread_participants
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 3. MESSAGES TABLE
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

-- Users can view messages in their threads
CREATE POLICY "Users can view messages in their threads"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.thread_participants tp
      WHERE tp.thread_id = thread_id AND tp.user_id = auth.uid()
    )
  );

-- Users can send messages to threads they're part of
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

-- Users can update their own messages
CREATE POLICY "Users can update their own messages"
  ON public.messages
  FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON public.messages
  FOR DELETE
  USING (auth.uid() = sender_id);

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function to update thread's last_message_at when new message is sent
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

-- Trigger for updated_at on threads
DROP TRIGGER IF EXISTS on_thread_updated ON public.message_threads;
CREATE TRIGGER on_thread_updated
  BEFORE UPDATE ON public.message_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for updated_at on messages
DROP TRIGGER IF EXISTS on_message_updated ON public.messages;
CREATE TRIGGER on_message_updated
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 5. HELPER FUNCTIONS: Get Threads with Details
-- =====================================================

-- Function to get all threads for a user with unread count
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
  -- Get the other participant (assuming 1-on-1 conversations)
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
  -- Verify user is part of the thread
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
  -- Check if thread already exists between these two users
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
    -- Ensure it's a 1-on-1 thread (exactly 2 participants)
    SELECT COUNT(*) FROM public.thread_participants tp
    WHERE tp.thread_id = mt.id
  ) = 2
  LIMIT 1;

  -- If thread exists, return it
  IF existing_thread_id IS NOT NULL THEN
    RETURN existing_thread_id;
  END IF;

  -- Otherwise, create new thread
  INSERT INTO public.message_threads DEFAULT VALUES
  RETURNING id INTO new_thread_id;

  -- Add both participants
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
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Update TypeScript types in src/types/db.ts
-- 3. Implement real-time subscriptions in messaging components
-- 4. Update src/pages/Messages.tsx to use real data
-- 5. Update src/pages/ChatThread.tsx to use real data
-- 6. Remove mock data from src/data/mockMessages.ts
-- 7. Enable Realtime in Supabase Dashboard for these tables

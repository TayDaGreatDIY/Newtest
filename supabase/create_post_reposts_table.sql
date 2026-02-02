-- =====================================================
-- Create post_reposts Table
-- =====================================================
-- This script creates the post_reposts table if it doesn't exist
-- Run this if you get the error: "relation 'public.post_reposts' does not exist"
--
-- This table is used for the repost/share feature on posts
-- =====================================================

-- Create post_reposts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.post_reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_post_reposts_post_id ON public.post_reposts(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reposts_user_id ON public.post_reposts(user_id);

-- Enable Row Level Security
ALTER TABLE public.post_reposts ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Reposts are viewable by authenticated users" ON public.post_reposts;
DROP POLICY IF EXISTS "Authenticated users can view all reposts" ON public.post_reposts;
DROP POLICY IF EXISTS "Users can repost posts" ON public.post_reposts;
DROP POLICY IF EXISTS "Users can unrepost posts" ON public.post_reposts;

-- Create RLS Policies
-- Policy: Allow authenticated users to view all reposts
CREATE POLICY "Authenticated users can view all reposts"
  ON public.post_reposts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Allow users to create reposts
CREATE POLICY "Users can repost posts"
  ON public.post_reposts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to delete their own reposts (unrepost)
CREATE POLICY "Users can unrepost posts"
  ON public.post_reposts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create or replace function to update post shares count
CREATE OR REPLACE FUNCTION public.update_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment shares_count when a repost is added
    UPDATE public.posts
    SET shares_count = shares_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement shares_count when a repost is removed
    UPDATE public.posts
    SET shares_count = GREATEST(shares_count - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS update_post_shares_count_trigger ON public.post_reposts;

-- Create trigger to automatically update shares count
CREATE TRIGGER update_post_shares_count_trigger
  AFTER INSERT OR DELETE ON public.post_reposts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_shares_count();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ post_reposts table created successfully!';
  RAISE NOTICE 'Repost/share feature is now enabled.';
END $$;

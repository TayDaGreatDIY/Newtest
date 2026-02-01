-- =====================================================
-- M2DG MVP Phase 1: Courts, Check-ins, and Challenges
-- =====================================================
-- This migration creates the core data model for:
-- - Courts (basketball courts/venues)
-- - Court Check-ins (user check-ins at courts)
-- - Challenges (competitions at courts)
-- - Challenge Participants (users in challenges with results)
-- - Court Champions (computed based on check-ins in last 7 days)

-- =====================================================
-- 1. COURTS TABLE
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

-- Policies: Courts are readable by anyone authenticated
CREATE POLICY "Courts are viewable by authenticated users"
  ON public.courts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Create allowed for authenticated users
CREATE POLICY "Authenticated users can create courts"
  ON public.courts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- Updates only by creator
CREATE POLICY "Users can update their own courts"
  ON public.courts
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- =====================================================
-- 2. COURT CHECK-INS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.court_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(court_id, user_id, checked_in_at)
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_court_checkins_court_id ON public.court_checkins(court_id);
CREATE INDEX IF NOT EXISTS idx_court_checkins_user_id ON public.court_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_court_checkins_checked_in_at ON public.court_checkins(checked_in_at);

-- Enable RLS
ALTER TABLE public.court_checkins ENABLE ROW LEVEL SECURITY;

-- Policies: Users can insert their own check-ins
CREATE POLICY "Users can create their own check-ins"
  ON public.court_checkins
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Read is authenticated
CREATE POLICY "Authenticated users can view check-ins"
  ON public.court_checkins
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 3. CHALLENGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL, -- e.g., "2-dribble-1-shot", "3-point-contest", "free-throw"
  rules TEXT,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_challenges_court_id ON public.challenges(court_id);
CREATE INDEX IF NOT EXISTS idx_challenges_created_by ON public.challenges(created_by);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Policies: Authenticated can read
CREATE POLICY "Authenticated users can view challenges"
  ON public.challenges
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Creator can create
CREATE POLICY "Authenticated users can create challenges"
  ON public.challenges
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- Creator can update
CREATE POLICY "Users can update their own challenges"
  ON public.challenges
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- =====================================================
-- 4. CHALLENGE PARTICIPANTS TABLE
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

-- Create index
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON public.challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON public.challenge_participants(user_id);

-- Enable RLS
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- Policies: Authenticated can view
CREATE POLICY "Authenticated users can view participants"
  ON public.challenge_participants
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Participants can insert their own results
CREATE POLICY "Users can submit their own results"
  ON public.challenge_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Participants can update their own results
CREATE POLICY "Users can update their own results"
  ON public.challenge_participants
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS on_court_updated ON public.courts;
CREATE TRIGGER on_court_updated
  BEFORE UPDATE ON public.courts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_challenge_updated ON public.challenges;
CREATE TRIGGER on_challenge_updated
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 6. COURT CHAMPION VIEW
-- =====================================================
-- This view computes the court champion based on:
-- "The user with the most check-ins in the last 7 days at that court"
-- 
-- MVP Approach: Champion = user with most check-ins in last 7 days
-- (Alternative would be: latest winning challenge, but we're using check-ins for MVP)

CREATE OR REPLACE VIEW public.court_champions AS
SELECT DISTINCT ON (court_id)
  court_id,
  user_id AS champion_id,
  COUNT(*) AS checkin_count
FROM public.court_checkins
WHERE checked_in_at >= NOW() - INTERVAL '7 days'
GROUP BY court_id, user_id
ORDER BY court_id, checkin_count DESC, MAX(checked_in_at) DESC;

-- Note: This view is computed on-the-fly and doesn't need RLS
-- because it only aggregates data that users can already see

-- =====================================================
-- 7. HELPER FUNCTION: Get Court with Champion
-- =====================================================
-- This function returns court data with champion info

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
-- MIGRATION COMPLETE
-- =====================================================
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Verify tables are created
-- 3. Test RLS policies
-- 4. Start using the tables in your app

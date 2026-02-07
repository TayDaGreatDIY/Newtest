-- =====================================================
-- Coaches and Trainers System
-- =====================================================
-- This migration adds the coaches and trainers corner feature
-- allowing coaches and trainers to offer services to athletes
-- =====================================================

-- =====================================================
-- 1. COACHES_TRAINERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.coaches_trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('coach', 'trainer', 'both')),
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',
  calendly_link TEXT,
  years_of_experience INTEGER,
  hourly_rate DECIMAL(10, 2),
  location TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.coaches_trainers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active coaches and trainers"
  ON public.coaches_trainers
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Coaches/trainers can insert own profile"
  ON public.coaches_trainers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches/trainers can update own profile"
  ON public.coaches_trainers
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_coaches_trainers_user_id ON public.coaches_trainers(user_id);
CREATE INDEX IF NOT EXISTS idx_coaches_trainers_role ON public.coaches_trainers(role);
CREATE INDEX IF NOT EXISTS idx_coaches_trainers_active ON public.coaches_trainers(is_active);

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS on_coaches_trainers_updated ON public.coaches_trainers;
CREATE TRIGGER on_coaches_trainers_updated
  BEFORE UPDATE ON public.coaches_trainers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 2. COACH_CERTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.coach_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coaches_trainers(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL CHECK (certification_type IN ('resume', 'certification', 'reference', 'other')),
  document_url TEXT NOT NULL,
  document_name TEXT NOT NULL,
  description TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.coach_certifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view verified certifications"
  ON public.coach_certifications
  FOR SELECT
  USING (verified = true);

CREATE POLICY "Coaches can view own certifications"
  ON public.coach_certifications
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.coaches_trainers WHERE id = coach_id
    )
  );

CREATE POLICY "Coaches can insert own certifications"
  ON public.coach_certifications
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.coaches_trainers WHERE id = coach_id
    )
  );

CREATE POLICY "Coaches can delete own certifications"
  ON public.coach_certifications
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.coaches_trainers WHERE id = coach_id
    )
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_coach_certifications_coach_id ON public.coach_certifications(coach_id);

-- =====================================================
-- 3. COACH_SCHEDULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.coach_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coaches_trainers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT NOT NULL CHECK (session_type IN ('individual', 'group', 'workshop', 'clinic')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER DEFAULT 1,
  location TEXT,
  price DECIMAL(10, 2),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.coach_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view available schedules"
  ON public.coach_schedules
  FOR SELECT
  USING (is_available = true);

CREATE POLICY "Coaches can insert own schedules"
  ON public.coach_schedules
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.coaches_trainers WHERE id = coach_id
    )
  );

CREATE POLICY "Coaches can update own schedules"
  ON public.coach_schedules
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.coaches_trainers WHERE id = coach_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.coaches_trainers WHERE id = coach_id
    )
  );

CREATE POLICY "Coaches can delete own schedules"
  ON public.coach_schedules
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.coaches_trainers WHERE id = coach_id
    )
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_coach_schedules_coach_id ON public.coach_schedules(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_schedules_start_time ON public.coach_schedules(start_time);

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS on_coach_schedules_updated ON public.coach_schedules;
CREATE TRIGGER on_coach_schedules_updated
  BEFORE UPDATE ON public.coach_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 4. ATHLETE_COACH_CONNECTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.athlete_coach_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coaches_trainers(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(athlete_id, coach_id)
);

-- Enable RLS
ALTER TABLE public.athlete_coach_connections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own connections"
  ON public.athlete_coach_connections
  FOR SELECT
  USING (
    auth.uid() = athlete_id OR 
    auth.uid() IN (
      SELECT user_id FROM public.coaches_trainers WHERE id = coach_id
    )
  );

CREATE POLICY "Athletes can create connection requests"
  ON public.athlete_coach_connections
  FOR INSERT
  WITH CHECK (auth.uid() = athlete_id AND auth.uid() = requested_by);

CREATE POLICY "Users can update own connections"
  ON public.athlete_coach_connections
  FOR UPDATE
  USING (
    auth.uid() = athlete_id OR 
    auth.uid() IN (
      SELECT user_id FROM public.coaches_trainers WHERE id = coach_id
    )
  )
  WITH CHECK (
    auth.uid() = athlete_id OR 
    auth.uid() IN (
      SELECT user_id FROM public.coaches_trainers WHERE id = coach_id
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_athlete_coach_connections_athlete_id ON public.athlete_coach_connections(athlete_id);
CREATE INDEX IF NOT EXISTS idx_athlete_coach_connections_coach_id ON public.athlete_coach_connections(coach_id);
CREATE INDEX IF NOT EXISTS idx_athlete_coach_connections_status ON public.athlete_coach_connections(status);

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS on_athlete_coach_connections_updated ON public.athlete_coach_connections;
CREATE TRIGGER on_athlete_coach_connections_updated
  BEFORE UPDATE ON public.athlete_coach_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function to get coaches/trainers with details
-- NOTE: For production use with large datasets, consider:
-- 1. Adding pg_trgm extension for trigram-based search
-- 2. Creating GIN indexes on text columns for better ILIKE performance
-- 3. Implementing full-text search with tsvector/tsquery
CREATE OR REPLACE FUNCTION get_coaches_trainers(
  p_role TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  display_name TEXT,
  role TEXT,
  bio TEXT,
  specialties TEXT[],
  calendly_link TEXT,
  years_of_experience INTEGER,
  hourly_rate DECIMAL(10, 2),
  location TEXT,
  is_verified BOOLEAN,
  certification_count BIGINT,
  connection_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.id,
    ct.user_id,
    p.display_name,
    ct.role,
    ct.bio,
    ct.specialties,
    ct.calendly_link,
    ct.years_of_experience,
    ct.hourly_rate,
    ct.location,
    ct.is_verified,
    COUNT(DISTINCT cc.id) AS certification_count,
    COUNT(DISTINCT acc.id) AS connection_count,
    ct.created_at
  FROM public.coaches_trainers ct
  LEFT JOIN public.profiles p ON p.id = ct.user_id
  LEFT JOIN public.coach_certifications cc ON cc.coach_id = ct.id AND cc.verified = true
  LEFT JOIN public.athlete_coach_connections acc ON acc.coach_id = ct.id AND acc.status = 'accepted'
  WHERE ct.is_active = true
    AND (p_role IS NULL OR ct.role = p_role OR ct.role = 'both')
    AND (p_search IS NULL OR 
         p.display_name ILIKE '%' || p_search || '%' OR
         ct.bio ILIKE '%' || p_search || '%' OR
         ct.location ILIKE '%' || p_search || '%')
  GROUP BY ct.id, p.display_name
  ORDER BY ct.is_verified DESC, connection_count DESC, ct.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get coach profile with all details
CREATE OR REPLACE FUNCTION get_coach_profile(p_coach_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  display_name TEXT,
  role TEXT,
  bio TEXT,
  specialties TEXT[],
  calendly_link TEXT,
  years_of_experience INTEGER,
  hourly_rate DECIMAL(10, 2),
  location TEXT,
  is_verified BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  certification_count BIGINT,
  connection_count BIGINT,
  upcoming_sessions_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.id,
    ct.user_id,
    p.display_name,
    ct.role,
    ct.bio,
    ct.specialties,
    ct.calendly_link,
    ct.years_of_experience,
    ct.hourly_rate,
    ct.location,
    ct.is_verified,
    ct.created_at,
    COUNT(DISTINCT cc.id) AS certification_count,
    COUNT(DISTINCT acc.id) AS connection_count,
    COUNT(DISTINCT cs.id) FILTER (WHERE cs.start_time > NOW()) AS upcoming_sessions_count
  FROM public.coaches_trainers ct
  LEFT JOIN public.profiles p ON p.id = ct.user_id
  LEFT JOIN public.coach_certifications cc ON cc.coach_id = ct.id AND cc.verified = true
  LEFT JOIN public.athlete_coach_connections acc ON acc.coach_id = ct.id AND acc.status = 'accepted'
  LEFT JOIN public.coach_schedules cs ON cs.coach_id = ct.id AND cs.is_available = true
  WHERE ct.id = p_coach_id AND ct.is_active = true
  GROUP BY ct.id, p.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

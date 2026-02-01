-- AI Coach User Preferences Table
-- Stores user goals, preferences, and context for personalized AI coaching
CREATE TABLE IF NOT EXISTS public.ai_coach_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User Goals
  primary_goal TEXT, -- e.g., "Improve shooting", "Increase vertical", "Get in shape"
  fitness_level TEXT, -- e.g., "Beginner", "Intermediate", "Advanced"
  training_days_per_week INTEGER DEFAULT 3,
  available_equipment TEXT, -- e.g., "Full gym", "Home court", "Minimal equipment"
  
  -- Specific Goals
  shooting_goal TEXT,
  defense_goal TEXT,
  conditioning_goal TEXT,
  
  -- Nutrition Preferences
  dietary_restrictions TEXT, -- e.g., "Vegetarian", "No dairy", "None"
  nutrition_goal TEXT, -- e.g., "Build muscle", "Lose weight", "Maintain"
  
  -- Mental Training
  mental_focus_areas TEXT, -- e.g., "Confidence", "Focus", "Handling pressure"
  
  -- Additional Context
  injuries_or_limitations TEXT,
  notes TEXT, -- Any other relevant information
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- AI Coach Conversation History Table
-- Stores conversation context for continuity and learning
CREATE TABLE IF NOT EXISTS public.ai_coach_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  message_role TEXT NOT NULL CHECK (message_role IN ('user', 'assistant')),
  message_content TEXT NOT NULL,
  
  -- Metadata
  conversation_context JSONB, -- Stores extracted context like goals mentioned, progress noted, etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_coach_conversations_user_id ON public.ai_coach_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coach_conversations_created_at ON public.ai_coach_conversations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.ai_coach_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coach_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_coach_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.ai_coach_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.ai_coach_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.ai_coach_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_coach_conversations
CREATE POLICY "Users can view their own conversations"
  ON public.ai_coach_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON public.ai_coach_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at timestamp for preferences
DROP TRIGGER IF EXISTS on_ai_coach_preferences_updated ON public.ai_coach_preferences;
CREATE TRIGGER on_ai_coach_preferences_updated
  BEFORE UPDATE ON public.ai_coach_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

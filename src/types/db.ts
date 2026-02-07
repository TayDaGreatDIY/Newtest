// =====================================================
// Database Types for M2DG MVP Phase 1
// =====================================================
// These types match the Supabase database schema

// =====================================================
// COURTS
// =====================================================
export interface Court {
  id: string;
  name: string;
  location: string;
  description: string | null;
  amenities: string[];
  max_players: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourtWithChampion extends Court {
  champion_id: string | null;
  champion_name: string | null;
  champion_checkin_count: number | null;
}

export interface CreateCourtInput {
  name: string;
  location: string;
  description?: string;
  amenities?: string[];
  max_players?: number;
}

// =====================================================
// COURT CHECK-INS
// =====================================================
export interface CourtCheckin {
  id: string;
  court_id: string;
  user_id: string;
  checked_in_at: string;
  notes: string | null;
}

export interface CourtCheckinWithUser extends CourtCheckin {
  user_display_name: string | null;
}

export interface CreateCheckinInput {
  court_id: string;
  notes?: string;
}

// =====================================================
// CHALLENGES
// =====================================================
export interface Challenge {
  id: string;
  court_id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  rules: string | null;
  start_time: string;
  end_time: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ChallengeWithDetails extends Challenge {
  court_name: string;
  creator_name: string | null;
  participant_count: number;
}

export interface CreateChallengeInput {
  court_id: string;
  title: string;
  description?: string;
  challenge_type: string;
  rules?: string;
  start_time?: string;
  end_time?: string;
}

// =====================================================
// CHALLENGE PARTICIPANTS
// =====================================================
export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  score: number | null;
  notes: string | null;
  submitted_at: string;
}

export interface ChallengeParticipantWithUser extends ChallengeParticipant {
  user_display_name: string | null;
}

export interface SubmitResultInput {
  challenge_id: string;
  score: number;
  notes?: string;
}

// =====================================================
// COURT CHAMPIONS
// =====================================================
export interface CourtChampion {
  court_id: string;
  champion_id: string;
  checkin_count: number;
}

// =====================================================
// USER STATS (aggregated data)
// =====================================================
export interface UserStats {
  total_checkins: number;
  total_challenges: number;
  challenges_won: number;
  courts_championed: number;
}

// =====================================================
// POSTS (Phase 2)
// =====================================================
export interface Post {
  id: string;
  user_id: string;
  type: 'text' | 'image' | 'challenge';
  content: string;
  image_url: string | null;
  challenge_id: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostWithUser extends Post {
  user_display_name: string | null;
  is_liked_by_me: boolean;
  is_reposted_by_me: boolean;
}

export interface CreatePostInput {
  type: 'text' | 'image' | 'challenge';
  content: string;
  image_url?: string;
  challenge_id?: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface PostCommentWithUser extends PostComment {
  user_display_name: string | null;
}

export interface PostRepost {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostRepostWithUser extends PostRepost {
  user_display_name: string | null;
}

// =====================================================
// MESSAGING (Phase 2)
// =====================================================
export interface MessageThread {
  id: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface ThreadParticipant {
  id: string;
  thread_id: string;
  user_id: string;
  last_read_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface MessageWithSender extends Message {
  sender_name: string | null;
}

export interface ThreadWithDetails {
  thread_id: string;
  last_message_at: string;
  last_message: string | null;
  last_sender_id: string | null;
  unread_count: number;
  other_participant_id: string | null;
  other_participant_name: string | null;
}

// =====================================================
// AI COACH
// =====================================================
export interface AICoachPreferences {
  id: string;
  user_id: string;
  primary_goal: string | null;
  fitness_level: string | null;
  training_days_per_week: number;
  available_equipment: string | null;
  shooting_goal: string | null;
  defense_goal: string | null;
  conditioning_goal: string | null;
  dietary_restrictions: string | null;
  nutrition_goal: string | null;
  mental_focus_areas: string | null;
  injuries_or_limitations: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AICoachConversation {
  id: string;
  user_id: string;
  message_role: 'user' | 'assistant';
  message_content: string;
  conversation_context: Record<string, unknown> | null;
  created_at: string;
}

export interface UpdateAICoachPreferencesInput {
  primary_goal?: string;
  fitness_level?: string;
  training_days_per_week?: number;
  available_equipment?: string;
  shooting_goal?: string;
  defense_goal?: string;
  conditioning_goal?: string;
  dietary_restrictions?: string;
  nutrition_goal?: string;
  mental_focus_areas?: string;
  injuries_or_limitations?: string;
  notes?: string;
}

// =====================================================
// COACHES AND TRAINERS
// =====================================================
export interface CoachTrainer {
  id: string;
  user_id: string;
  role: 'coach' | 'trainer' | 'both';
  bio: string | null;
  specialties: string[];
  calendly_link: string | null;
  years_of_experience: number | null;
  hourly_rate: number | null;
  location: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoachTrainerWithDetails extends CoachTrainer {
  display_name: string | null;
  certification_count: number;
  connection_count: number;
  upcoming_sessions_count?: number;
}

export interface CreateCoachTrainerInput {
  role: 'coach' | 'trainer' | 'both';
  bio?: string;
  specialties?: string[];
  calendly_link?: string;
  years_of_experience?: number;
  hourly_rate?: number;
  location?: string;
}

export interface CoachCertification {
  id: string;
  coach_id: string;
  certification_type: 'resume' | 'certification' | 'reference' | 'other';
  document_url: string;
  document_name: string;
  description: string | null;
  verified: boolean;
  created_at: string;
}

export interface CreateCoachCertificationInput {
  coach_id: string;
  certification_type: 'resume' | 'certification' | 'reference' | 'other';
  document_url: string;
  document_name: string;
  description?: string;
}

export interface CoachSchedule {
  id: string;
  coach_id: string;
  title: string;
  description: string | null;
  session_type: 'individual' | 'group' | 'workshop' | 'clinic';
  start_time: string;
  end_time: string;
  max_participants: number;
  location: string | null;
  price: number | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCoachScheduleInput {
  title: string;
  description?: string;
  session_type: 'individual' | 'group' | 'workshop' | 'clinic';
  start_time: string;
  end_time: string;
  max_participants?: number;
  location?: string;
  price?: number;
}

export interface AthleteCoachConnection {
  id: string;
  athlete_id: string;
  coach_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  requested_by: string;
  created_at: string;
  updated_at: string;
}

export interface AthleteCoachConnectionWithDetails extends AthleteCoachConnection {
  coach_display_name: string | null;
  athlete_display_name: string | null;
}

// =====================================================
// FORM VALIDATION TYPES
// =====================================================
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

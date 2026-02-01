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

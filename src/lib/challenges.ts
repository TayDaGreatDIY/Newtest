// =====================================================
// Challenges Query Helpers
// =====================================================
import { supabase } from './supabaseClient';
import type { 
  Challenge, 
  ChallengeWithDetails, 
  CreateChallengeInput,
  ChallengeParticipant,
  ChallengeParticipantWithUser,
  SubmitResultInput 
} from '../types/db';

/**
 * Get all challenges
 */
export async function getChallenges() {
  const { data, error } = await supabase
    .from('challenges')
    .select(`
      *,
      courts:court_id (
        id,
        name
      ),
      profiles:created_by (
        id,
        display_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error };
  }

  // Get participant counts
  const challengeIds = data?.map(c => c.id) || [];
  const { data: participantCounts } = await supabase
    .from('challenge_participants')
    .select('challenge_id')
    .in('challenge_id', challengeIds);

  // Count participants per challenge
  const participantCountMap = new Map<string, number>();
  participantCounts?.forEach(p => {
    participantCountMap.set(p.challenge_id, (participantCountMap.get(p.challenge_id) || 0) + 1);
  });

  // Transform data
  const challengesWithDetails: ChallengeWithDetails[] = data?.map(challenge => ({
    ...challenge,
    court_name: challenge.courts?.name || 'Unknown Court',
    creator_name: challenge.profiles?.display_name || null,
    participant_count: participantCountMap.get(challenge.id) || 0,
  })) || [];

  return { data: challengesWithDetails, error: null };
}

/**
 * Get a single challenge by ID
 */
export async function getChallenge(challengeId: string) {
  const { data, error } = await supabase
    .from('challenges')
    .select(`
      *,
      courts:court_id (
        id,
        name,
        location
      ),
      profiles:created_by (
        id,
        display_name
      )
    `)
    .eq('id', challengeId)
    .single();

  if (error) {
    return { data: null, error };
  }

  // Get participant count
  const { count } = await supabase
    .from('challenge_participants')
    .select('*', { count: 'exact', head: true })
    .eq('challenge_id', challengeId);

  const challengeWithDetails: ChallengeWithDetails = {
    ...data,
    court_name: data.courts?.name || 'Unknown Court',
    creator_name: data.profiles?.display_name || null,
    participant_count: count || 0,
  };

  return { data: challengeWithDetails, error: null };
}

/**
 * Get challenges for a specific court
 */
export async function getCourtChallenges(courtId: string) {
  const { data, error } = await supabase
    .from('challenges')
    .select(`
      *,
      profiles:created_by (
        id,
        display_name
      )
    `)
    .eq('court_id', courtId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error };
  }

  // Get participant counts
  const challengeIds = data?.map(c => c.id) || [];
  const { data: participantCounts } = await supabase
    .from('challenge_participants')
    .select('challenge_id')
    .in('challenge_id', challengeIds);

  // Count participants per challenge
  const participantCountMap = new Map<string, number>();
  participantCounts?.forEach(p => {
    participantCountMap.set(p.challenge_id, (participantCountMap.get(p.challenge_id) || 0) + 1);
  });

  // Transform data
  const challengesWithDetails: ChallengeWithDetails[] = data?.map(challenge => ({
    ...challenge,
    court_name: '', // Not needed for court-specific queries
    creator_name: challenge.profiles?.display_name || null,
    participant_count: participantCountMap.get(challenge.id) || 0,
  })) || [];

  return { data: challengesWithDetails, error: null };
}

/**
 * Create a new challenge
 */
export async function createChallenge(input: CreateChallengeInput) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  const { data, error } = await supabase
    .from('challenges')
    .insert([{
      court_id: input.court_id,
      title: input.title,
      description: input.description || null,
      challenge_type: input.challenge_type,
      rules: input.rules || null,
      start_time: input.start_time || new Date().toISOString(),
      end_time: input.end_time || null,
      created_by: user.id,
    }])
    .select()
    .single();

  return { data: data as Challenge | null, error };
}

/**
 * Get challenge participants with leaderboard
 */
export async function getChallengeParticipants(challengeId: string) {
  const { data, error } = await supabase
    .from('challenge_participants')
    .select(`
      *,
      profiles:user_id (
        id,
        display_name
      )
    `)
    .eq('challenge_id', challengeId)
    .order('score', { ascending: false });

  if (error) {
    return { data: null, error };
  }

  const participantsWithUser: ChallengeParticipantWithUser[] = data?.map(p => ({
    ...p,
    user_display_name: p.profiles?.display_name || 'Anonymous',
  })) || [];

  return { data: participantsWithUser, error: null };
}

/**
 * Join a challenge (submit result)
 */
export async function submitChallengeResult(input: SubmitResultInput) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  const { data, error } = await supabase
    .from('challenge_participants')
    .insert([{
      challenge_id: input.challenge_id,
      user_id: user.id,
      score: input.score,
      notes: input.notes || null,
    }])
    .select()
    .single();

  return { data: data as ChallengeParticipant | null, error };
}

/**
 * Update challenge result
 */
export async function updateChallengeResult(participantId: string, score: number, notes?: string) {
  const { data, error } = await supabase
    .from('challenge_participants')
    .update({ score, notes: notes || null })
    .eq('id', participantId)
    .select()
    .single();

  return { data: data as ChallengeParticipant | null, error };
}

/**
 * Check if user has joined a challenge
 */
export async function hasJoinedChallenge(challengeId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { hasJoined: false, error: null };
  }

  const { data, error } = await supabase
    .from('challenge_participants')
    .select('id')
    .eq('challenge_id', challengeId)
    .eq('user_id', user.id)
    .limit(1);

  return { hasJoined: (data?.length || 0) > 0, error };
}

/**
 * Get user's challenge participation
 */
export async function getUserChallenges(userId: string) {
  const { data, error } = await supabase
    .from('challenge_participants')
    .select(`
      *,
      challenges:challenge_id (
        *,
        courts:court_id (
          name,
          location
        )
      )
    `)
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });

  return { data, error };
}

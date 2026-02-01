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
  // Fetch challenges
  const { data: challenges, error: challengesError } = await supabase
    .from('challenges')
    .select('*')
    .order('created_at', { ascending: false });

  if (challengesError) {
    return { data: null, error: challengesError };
  }

  if (!challenges || challenges.length === 0) {
    return { data: [], error: null };
  }

  // Get unique court IDs and creator IDs
  const courtIds = [...new Set(challenges.map(c => c.court_id))];
  const creatorIds = [...new Set(challenges.map(c => c.created_by))];

  // Fetch courts
  const { data: courts } = await supabase
    .from('courts')
    .select('id, name')
    .in('id', courtIds);

  // Fetch creator profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', creatorIds);

  // Get participant counts
  const challengeIds = challenges.map(c => c.id);
  const { data: participantCounts } = await supabase
    .from('challenge_participants')
    .select('challenge_id')
    .in('challenge_id', challengeIds);

  // Create maps
  const courtMap = new Map((courts || []).map(c => [c.id, c.name]));
  const profileMap = new Map((profiles || []).map(p => [p.id, p.display_name]));
  
  // Count participants per challenge
  const participantCountMap = new Map<string, number>();
  (participantCounts || []).forEach(p => {
    participantCountMap.set(p.challenge_id, (participantCountMap.get(p.challenge_id) || 0) + 1);
  });

  // Transform data
  const challengesWithDetails: ChallengeWithDetails[] = challenges.map(challenge => ({
    ...challenge,
    court_name: courtMap.get(challenge.court_id) || 'Unknown Court',
    creator_name: profileMap.get(challenge.created_by) || null,
    participant_count: participantCountMap.get(challenge.id) || 0,
  }));

  return { data: challengesWithDetails, error: null };
}

/**
 * Get a single challenge by ID
 */
export async function getChallenge(challengeId: string) {
  // Fetch challenge
  const { data: challenge, error: challengeError } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', challengeId)
    .single();

  if (challengeError) {
    return { data: null, error: challengeError };
  }

  // Fetch court
  const { data: court } = await supabase
    .from('courts')
    .select('id, name, location')
    .eq('id', challenge.court_id)
    .single();

  // Fetch creator profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('id', challenge.created_by)
    .single();

  // Get participant count
  const { count } = await supabase
    .from('challenge_participants')
    .select('*', { count: 'exact', head: true })
    .eq('challenge_id', challengeId);

  const challengeWithDetails: ChallengeWithDetails = {
    ...challenge,
    court_name: court?.name || 'Unknown Court',
    creator_name: profile?.display_name || null,
    participant_count: count || 0,
  };

  return { data: challengeWithDetails, error: null };
}

/**
 * Get challenges for a specific court
 */
export async function getCourtChallenges(courtId: string) {
  // First, get the court name
  const { data: courtData } = await supabase
    .from('courts')
    .select('name')
    .eq('id', courtId)
    .single();

  const courtName = courtData?.name || 'Unknown Court';

  // Fetch challenges
  const { data: challenges, error: challengesError } = await supabase
    .from('challenges')
    .select('*')
    .eq('court_id', courtId)
    .order('created_at', { ascending: false });

  if (challengesError) {
    return { data: null, error: challengesError };
  }

  if (!challenges || challenges.length === 0) {
    return { data: [], error: null };
  }

  // Get unique creator IDs
  const creatorIds = [...new Set(challenges.map(c => c.created_by))];

  // Fetch creator profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', creatorIds);

  // Get participant counts
  const challengeIds = challenges.map(c => c.id);
  const { data: participantCounts } = await supabase
    .from('challenge_participants')
    .select('challenge_id')
    .in('challenge_id', challengeIds);

  // Create maps
  const profileMap = new Map((profiles || []).map(p => [p.id, p.display_name]));

  // Count participants per challenge
  const participantCountMap = new Map<string, number>();
  (participantCounts || []).forEach(p => {
    participantCountMap.set(p.challenge_id, (participantCountMap.get(p.challenge_id) || 0) + 1);
  });

  // Transform data
  const challengesWithDetails: ChallengeWithDetails[] = challenges.map(challenge => ({
    ...challenge,
    court_name: courtName,
    creator_name: profileMap.get(challenge.created_by) || null,
    participant_count: participantCountMap.get(challenge.id) || 0,
  }));

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
  // Fetch participants
  const { data: participants, error: participantsError } = await supabase
    .from('challenge_participants')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('score', { ascending: false });

  if (participantsError) {
    return { data: null, error: participantsError };
  }

  if (!participants || participants.length === 0) {
    return { data: [], error: null };
  }

  // Get unique user IDs
  const userIds = [...new Set(participants.map(p => p.user_id))];

  // Fetch profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds);

  // Create map
  const profileMap = new Map((profiles || []).map(p => [p.id, p.display_name]));

  const participantsWithUser: ChallengeParticipantWithUser[] = participants.map(p => ({
    ...p,
    user_display_name: profileMap.get(p.user_id) || 'Anonymous User',
  }));

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
  // Fetch participation records
  const { data: participations, error: participationsError } = await supabase
    .from('challenge_participants')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });

  if (participationsError) {
    return { data: null, error: participationsError };
  }

  if (!participations || participations.length === 0) {
    return { data: [], error: null };
  }

  // Get unique challenge IDs
  const challengeIds = [...new Set(participations.map(p => p.challenge_id))];

  // Fetch challenges
  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .in('id', challengeIds);

  if (!challenges || challenges.length === 0) {
    return { data: participations, error: null };
  }

  // Get unique court IDs
  const courtIds = [...new Set(challenges.map(c => c.court_id))];

  // Fetch courts
  const { data: courts } = await supabase
    .from('courts')
    .select('id, name, location')
    .in('id', courtIds);

  // Create maps
  const challengeMap = new Map(challenges.map(c => [c.id, c]));
  const courtMap = new Map((courts || []).map(c => [c.id, { name: c.name, location: c.location }]));

  // Transform data
  const participationsWithDetails = participations.map(p => {
    const challenge = challengeMap.get(p.challenge_id);
    return {
      ...p,
      challenges: challenge ? {
        ...challenge,
        courts: courtMap.get(challenge.court_id) || null,
      } : null,
    };
  });

  return { data: participationsWithDetails, error: null };
}

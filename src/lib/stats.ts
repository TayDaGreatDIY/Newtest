// =====================================================
// User Stats Query Helpers
// =====================================================
import { supabase } from './supabaseClient';
import type { UserStats } from '../types/db';

/**
 * Get user statistics
 */
export async function getUserStats(
  userId: string
): Promise<{ data: UserStats | null; error: Error | null }> {
  try {
    // Get total check-ins
    const { count: totalCheckins, error: checkinsError } = await supabase
      .from('court_checkins')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (checkinsError) throw checkinsError;

    // Get total challenges participated
    const { count: totalChallenges, error: challengesError } = await supabase
      .from('challenge_participants')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (challengesError) throw challengesError;

    // Get challenges won (highest score in each challenge)
    const { data: participations, error: participationsError } = await supabase
      .from('challenge_participants')
      .select('challenge_id, score')
      .eq('user_id', userId);

    if (participationsError) throw participationsError;

    // For each challenge, check if user has the highest score
    let challengesWon = 0;

    if (participations && participations.length > 0) {
      // Get all challenge IDs at once
      const challengeIds = participations.map((p) => p.challenge_id);

      // Get max scores for all challenges in one query
      const { data: maxScores, error: maxScoresError } = await supabase
        .from('challenge_participants')
        .select('challenge_id, score')
        .in('challenge_id', challengeIds)
        .order('score', { ascending: false });

      if (maxScoresError) throw maxScoresError;

      if (maxScores && maxScores.length > 0) {
        // Group by challenge_id and get the max score for each
        const maxScoreByChallenge = new Map<string, number>();

        maxScores.forEach((item) => {
          const currentMax = maxScoreByChallenge.get(item.challenge_id);

          // normalize score to number (handle null)
          const itemScore = item.score ?? 0;

          if (currentMax === undefined || itemScore > currentMax) {
            maxScoreByChallenge.set(item.challenge_id, itemScore);
          }
        });

        // Count how many times user has the max score
        participations.forEach((participation) => {
          const maxScore = maxScoreByChallenge.get(participation.challenge_id);
          if (maxScore !== undefined && (participation.score ?? 0) === maxScore) {
            challengesWon++;
          }
        });
      }
    }

    // Get courts championed (from court_champions view)
    const { count: courtsChampioned, error: championsError } = await supabase
      .from('court_champions')
      .select('*', { count: 'exact', head: true })
      .eq('champion_id', userId);

    if (championsError) throw championsError;

    const stats: UserStats = {
      total_checkins: totalCheckins ?? 0,
      total_challenges: totalChallenges ?? 0,
      challenges_won: challengesWon,
      courts_championed: courtsChampioned ?? 0,
    };

    return { data: stats, error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { data: null, error };
  }
}

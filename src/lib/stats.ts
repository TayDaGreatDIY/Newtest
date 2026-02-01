// =====================================================
// User Stats Query Helpers
// =====================================================
import { supabase } from './supabaseClient';
import type { UserStats } from '../types/db';

/**
 * Get user statistics
 */
export async function getUserStats(userId: string): Promise<{ data: UserStats | null; error: any }> {
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
    if (participations) {
      for (const participation of participations) {
        const { data: allScores, error: scoresError } = await supabase
          .from('challenge_participants')
          .select('score')
          .eq('challenge_id', participation.challenge_id)
          .order('score', { ascending: false })
          .limit(1);

        if (!scoresError && allScores && allScores.length > 0) {
          if (allScores[0].score === participation.score) {
            challengesWon++;
          }
        }
      }
    }

    // Get courts championed (from court_champions view)
    const { count: courtsChampioned, error: championsError } = await supabase
      .from('court_champions')
      .select('*', { count: 'exact', head: true })
      .eq('champion_id', userId);

    if (championsError) throw championsError;

    const stats: UserStats = {
      total_checkins: totalCheckins || 0,
      total_challenges: totalChallenges || 0,
      challenges_won: challengesWon,
      courts_championed: courtsChampioned || 0,
    };

    return { data: stats, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

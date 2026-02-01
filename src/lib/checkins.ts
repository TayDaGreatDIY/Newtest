// =====================================================
// Check-ins Query Helpers
// =====================================================
import { supabase } from './supabaseClient';
import type { CourtCheckin, CourtCheckinWithUser, CreateCheckinInput } from '../types/db';

/**
 * Check in to a court
 */
export async function checkInToCourt(input: CreateCheckinInput) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  const { data, error } = await supabase
    .from('court_checkins')
    .insert([{
      court_id: input.court_id,
      user_id: user.id,
      notes: input.notes || null,
    }])
    .select()
    .single();

  return { data: data as CourtCheckin | null, error };
}

/**
 * Get check-ins for a court
 */
export async function getCourtCheckins(courtId: string, limit = 20) {
  const { data, error } = await supabase
    .from('court_checkins')
    .select(`
      *,
      profiles:user_id (
        id,
        display_name
      )
    `)
    .eq('court_id', courtId)
    .order('checked_in_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error };
  }

  // Transform the data to match CourtCheckinWithUser type
  const checkinsWithUser = data?.map(checkin => ({
    ...checkin,
    user_display_name: checkin.profiles?.display_name || null,
  })) as CourtCheckinWithUser[];

  return { data: checkinsWithUser, error: null };
}

/**
 * Get user's check-ins
 */
export async function getUserCheckins(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('court_checkins')
    .select(`
      *,
      courts:court_id (
        id,
        name,
        location
      )
    `)
    .eq('user_id', userId)
    .order('checked_in_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

/**
 * Get user's total check-ins count
 */
export async function getUserCheckinCount(userId: string) {
  const { count, error } = await supabase
    .from('court_checkins')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return { count, error };
}

/**
 * Check if user has checked in to a court today
 */
export async function hasCheckedInToday(courtId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { hasCheckedIn: false, error: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('court_checkins')
    .select('id')
    .eq('court_id', courtId)
    .eq('user_id', user.id)
    .gte('checked_in_at', today.toISOString())
    .limit(1);

  return { hasCheckedIn: (data?.length || 0) > 0, error };
}

/**
 * Get recent check-ins across all courts (for feed)
 */
export async function getRecentCheckins(limit = 20) {
  const { data, error } = await supabase
    .from('court_checkins')
    .select(`
      *,
      profiles:user_id (
        id,
        display_name
      ),
      courts:court_id (
        id,
        name,
        location
      )
    `)
    .order('checked_in_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

/**
 * Get check-in count for a court in the last 7 days
 */
export async function getCourtCheckinCountLast7Days(courtId: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count, error } = await supabase
    .from('court_checkins')
    .select('*', { count: 'exact', head: true })
    .eq('court_id', courtId)
    .gte('checked_in_at', sevenDaysAgo.toISOString());

  return { count, error };
}

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
  // Fetch check-ins
  const { data: checkins, error: checkinsError } = await supabase
    .from('court_checkins')
    .select('*')
    .eq('court_id', courtId)
    .order('checked_in_at', { ascending: false })
    .limit(limit);

  if (checkinsError) {
    return { data: null, error: checkinsError };
  }

  if (!checkins || checkins.length === 0) {
    return { data: [], error: null };
  }

  // Get unique user IDs
  const userIds = [...new Set(checkins.map(c => c.user_id))];

  // Fetch profiles for these users
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds);

  if (profilesError) {
    console.warn('Error fetching profiles:', profilesError);
  }

  // Create a map of user_id to display_name
  const profileMap = new Map(
    (profiles || []).map(p => [p.id, p.display_name])
  );

  // Transform the data to match CourtCheckinWithUser type
  const checkinsWithUser: CourtCheckinWithUser[] = checkins.map(checkin => ({
    ...checkin,
    user_display_name: profileMap.get(checkin.user_id) || null,
  }));

  return { data: checkinsWithUser, error: null };
}

/**
 * Get user's check-ins
 */
export async function getUserCheckins(userId: string, limit = 50) {
  // Fetch check-ins
  const { data: checkins, error: checkinsError } = await supabase
    .from('court_checkins')
    .select('*')
    .eq('user_id', userId)
    .order('checked_in_at', { ascending: false })
    .limit(limit);

  if (checkinsError) {
    return { data: null, error: checkinsError };
  }

  if (!checkins || checkins.length === 0) {
    return { data: [], error: null };
  }

  // Get unique court IDs
  const courtIds = [...new Set(checkins.map(c => c.court_id))];

  // Fetch courts
  const { data: courts } = await supabase
    .from('courts')
    .select('id, name, location')
    .in('id', courtIds);

  // Create map
  const courtMap = new Map((courts || []).map(c => [c.id, { name: c.name, location: c.location }]));

  // Transform data
  const checkinsWithCourts = checkins.map(checkin => ({
    ...checkin,
    courts: courtMap.get(checkin.court_id) || null,
  }));

  return { data: checkinsWithCourts, error: null };
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
  // Fetch check-ins
  const { data: checkins, error: checkinsError } = await supabase
    .from('court_checkins')
    .select('*')
    .order('checked_in_at', { ascending: false })
    .limit(limit);

  if (checkinsError) {
    return { data: null, error: checkinsError };
  }

  if (!checkins || checkins.length === 0) {
    return { data: [], error: null };
  }

  // Get unique user IDs and court IDs
  const userIds = [...new Set(checkins.map(c => c.user_id))];
  const courtIds = [...new Set(checkins.map(c => c.court_id))];

  // Fetch profiles and courts
  const [{ data: profiles }, { data: courts }] = await Promise.all([
    supabase.from('profiles').select('id, display_name').in('id', userIds),
    supabase.from('courts').select('id, name, location').in('id', courtIds),
  ]);

  // Create maps
  const profileMap = new Map((profiles || []).map(p => [p.id, p.display_name]));
  const courtMap = new Map((courts || []).map(c => [c.id, { name: c.name, location: c.location }]));

  // Transform data
  const checkinsWithDetails = checkins.map(checkin => ({
    ...checkin,
    profiles: { display_name: profileMap.get(checkin.user_id) || null },
    courts: courtMap.get(checkin.court_id) || null,
  }));

  return { data: checkinsWithDetails, error: null };
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

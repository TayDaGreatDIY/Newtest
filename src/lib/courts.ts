// =====================================================
// Courts Query Helpers
// =====================================================
import { supabase } from './supabaseClient';
import type { Court, CourtWithChampion, CreateCourtInput } from '../types/db';

/**
 * Get all courts
 */
export async function getCourts() {
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .order('created_at', { ascending: false });

  return { data: data as Court[] | null, error };
}

/**
 * Get a single court by ID
 */
export async function getCourt(courtId: string) {
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .eq('id', courtId)
    .single();

  return { data: data as Court | null, error };
}

/**
 * Get a court with champion info using the helper function
 */
export async function getCourtWithChampion(courtId: string) {
  const { data, error } = await supabase
    .rpc('get_court_with_champion', { court_uuid: courtId })
    .single();

  return { data: data as CourtWithChampion | null, error };
}

/**
 * Create a new court
 */
export async function createCourt(input: CreateCourtInput) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  const { data, error } = await supabase
    .from('courts')
    .insert([{
      name: input.name,
      location: input.location,
      description: input.description || null,
      amenities: input.amenities || [],
      max_players: input.max_players || 10,
      created_by: user.id,
    }])
    .select()
    .single();

  return { data: data as Court | null, error };
}

/**
 * Update a court
 */
export async function updateCourt(courtId: string, updates: Partial<CreateCourtInput>) {
  const { data, error } = await supabase
    .from('courts')
    .update(updates)
    .eq('id', courtId)
    .select()
    .single();

  return { data: data as Court | null, error };
}

/**
 * Delete a court
 */
export async function deleteCourt(courtId: string) {
  const { error } = await supabase
    .from('courts')
    .delete()
    .eq('id', courtId);

  return { error };
}

/**
 * Search courts by name or location
 */
export async function searchCourts(query: string) {
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  return { data: data as Court[] | null, error };
}

/**
 * Get courts with champion info (all courts)
 */
export async function getCourtsWithChampions() {
  // Get all courts
  const { data: courts, error: courtsError } = await supabase
    .from('courts')
    .select('*')
    .order('created_at', { ascending: false });

  if (courtsError || !courts) {
    return { data: null, error: courtsError };
  }

  // Get champions for all courts
  const { data: champions, error: championsError } = await supabase
    .from('court_champions')
    .select('*');

  if (championsError) {
    return { data: null, error: championsError };
  }

  // Get champion profiles
  const championIds = champions?.map(c => c.champion_id) || [];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', championIds);

  // Merge data
  const courtsWithChampions: CourtWithChampion[] = courts.map(court => {
    const champion = champions?.find(c => c.court_id === court.id);
    const profile = profiles?.find(p => p.id === champion?.champion_id);
    
    return {
      ...court,
      champion_id: champion?.champion_id || null,
      champion_name: profile?.display_name || null,
      champion_checkin_count: champion?.checkin_count || null,
    };
  });

  return { data: courtsWithChampions, error: null };
}

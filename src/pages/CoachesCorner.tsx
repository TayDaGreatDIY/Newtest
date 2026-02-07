import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, SectionHeader, Badge } from '../components';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import type { CoachTrainerWithDetails } from '../types/db';

export const CoachesCorner: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [coaches, setCoaches] = useState<CoachTrainerWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<'all' | 'coach' | 'trainer' | 'both'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCoachOrTrainer, setIsCoachOrTrainer] = useState(false);

  const checkIfCoachOrTrainer = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('coaches_trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      setIsCoachOrTrainer(!!data);
    } catch {
      setIsCoachOrTrainer(false);
    }
  }, [user]);

  const loadCoaches = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Demo mode - use mock data
      const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
      
      if (isDemoMode) {
        // Mock coaches data for demo
        const mockCoaches: CoachTrainerWithDetails[] = [
          {
            id: '1',
            user_id: 'demo-user-1',
            role: 'coach',
            bio: 'Former college basketball player with 10+ years of coaching experience. Specialized in player development and fundamentals.',
            specialties: ['Shooting', 'Ball Handling', 'Player Development'],
            years_of_experience: 10,
            hourly_rate: 75,
            location: 'Los Angeles, CA',
            calendly_link: 'https://calendly.com/coach-demo',
            is_verified: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            display_name: 'Coach Mike Johnson',
            certification_count: 3,
            connection_count: 45,
            upcoming_sessions_count: 8
          },
          {
            id: '2',
            user_id: 'demo-user-2',
            role: 'trainer',
            bio: 'Certified strength and conditioning specialist. Focus on athletic performance, injury prevention, and recovery.',
            specialties: ['Strength Training', 'Conditioning', 'Injury Prevention'],
            years_of_experience: 8,
            hourly_rate: 65,
            location: 'New York, NY',
            calendly_link: 'https://calendly.com/trainer-demo',
            is_verified: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            display_name: 'Sarah Williams',
            certification_count: 5,
            connection_count: 32,
            upcoming_sessions_count: 12
          },
          {
            id: '3',
            user_id: 'demo-user-3',
            role: 'both',
            bio: 'Elite performance coach combining basketball expertise with advanced training techniques. Works with NBA players.',
            specialties: ['Elite Training', 'Mental Conditioning', 'Game Strategy'],
            years_of_experience: 15,
            hourly_rate: 150,
            location: 'Miami, FL',
            calendly_link: 'https://calendly.com/elite-coach',
            is_verified: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            display_name: 'Coach David Martinez',
            certification_count: 8,
            connection_count: 89,
            upcoming_sessions_count: 15
          },
          {
            id: '4',
            user_id: 'demo-user-4',
            role: 'coach',
            bio: 'Youth basketball coach specializing in foundational skills for ages 8-16. Making the game fun while building fundamentals.',
            specialties: ['Youth Development', 'Fundamentals', 'Team Building'],
            years_of_experience: 6,
            hourly_rate: 50,
            location: 'Chicago, IL',
            calendly_link: null,
            is_verified: false,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            display_name: 'Coach Emma Thompson',
            certification_count: 2,
            connection_count: 28,
            upcoming_sessions_count: 6
          },
          {
            id: '5',
            user_id: 'demo-user-5',
            role: 'trainer',
            bio: 'Sports nutritionist and fitness trainer helping athletes optimize performance through diet and training programs.',
            specialties: ['Nutrition', 'Weight Training', 'Recovery'],
            years_of_experience: 12,
            hourly_rate: 80,
            location: 'Atlanta, GA',
            calendly_link: 'https://calendly.com/nutrition-trainer',
            is_verified: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            display_name: 'Alex Rodriguez',
            certification_count: 6,
            connection_count: 54,
            upcoming_sessions_count: 10
          }
        ];
        
        // Filter by role - include 'both' when filtering for specific roles
        let filteredCoaches = mockCoaches;
        if (filterRole !== 'all') {
          filteredCoaches = mockCoaches.filter(c => 
            c.role === filterRole || c.role === 'both'
          );
        }
        
        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredCoaches = filteredCoaches.filter(c => 
            c.display_name?.toLowerCase().includes(query) ||
            c.location?.toLowerCase().includes(query) ||
            c.specialties?.some(s => s.toLowerCase().includes(query))
          );
        }
        
        setTimeout(() => {
          setCoaches(filteredCoaches);
          setLoading(false);
        }, 500); // Simulate network delay
        return;
      }

      const { data, error: fetchError } = await supabase.rpc('get_coaches_trainers', {
        p_role: filterRole === 'all' ? null : filterRole,
        p_search: searchQuery || null,
        p_limit: 50,
        p_offset: 0
      });

      if (fetchError) throw fetchError;
      setCoaches(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coaches and trainers');
    } finally {
      setLoading(false);
    }
  }, [filterRole, searchQuery]);

  useEffect(() => {
    checkIfCoachOrTrainer();
  }, [checkIfCoachOrTrainer]);

  useEffect(() => {
    loadCoaches();
  }, [loadCoaches]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'coach':
        return '🏀';
      case 'trainer':
        return '💪';
      case 'both':
        return '⭐';
      default:
        return '👤';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'coach':
        return 'Coach';
      case 'trainer':
        return 'Trainer';
      case 'both':
        return 'Coach & Trainer';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            Coaches & Trainers Corner
          </h1>
          {!isCoachOrTrainer && (
            <button
              onClick={() => navigate('/app/coaches/signup')}
              className="glass px-4 py-2 rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              Become a Coach
            </button>
          )}
        </div>
        <p className="text-gray-400 text-sm">
          Connect with certified coaches and trainers to elevate your game
        </p>
      </div>

      {/* Search and Filter */}
      <GlassCard className="mb-6">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, location, or specialty..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Role Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilterRole('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filterRole === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'glass hover:bg-white/10'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRole('coach')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filterRole === 'coach'
                  ? 'bg-purple-600 text-white'
                  : 'glass hover:bg-white/10'
              }`}
            >
              🏀 Coaches
            </button>
            <button
              onClick={() => setFilterRole('trainer')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filterRole === 'trainer'
                  ? 'bg-purple-600 text-white'
                  : 'glass hover:bg-white/10'
              }`}
            >
              💪 Trainers
            </button>
            <button
              onClick={() => setFilterRole('both')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filterRole === 'both'
                  ? 'bg-purple-600 text-white'
                  : 'glass hover:bg-white/10'
              }`}
            >
              ⭐ Both
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4 animate-bounce">🏀</div>
          <p className="text-gray-400">Loading coaches and trainers...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <GlassCard className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-500">{error}</p>
        </GlassCard>
      )}

      {/* Coaches List */}
      {!loading && !error && (
        <>
          {coaches.length === 0 ? (
            <GlassCard className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-400 mb-2">No coaches or trainers found</p>
              <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
            </GlassCard>
          ) : (
            <>
              <SectionHeader 
                title={`${coaches.length} Coach${coaches.length !== 1 ? 'es' : ''} & Trainers`} 
                className="mb-4" 
              />
              <div className="space-y-4">
                {coaches.map((coach) => (
                  <GlassCard
                    key={coach.id}
                    className="cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => navigate(`/app/coaches/${coach.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-3xl flex-shrink-0">
                        {getRoleIcon(coach.role)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg truncate">
                            {coach.display_name || 'Anonymous'}
                          </h3>
                          {coach.is_verified && (
                            <Badge variant="accent">Verified</Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-400 mb-2">
                          {getRoleLabel(coach.role)}
                          {coach.years_of_experience && ` • ${coach.years_of_experience} years exp`}
                          {coach.location && ` • ${coach.location}`}
                        </p>

                        {coach.bio && (
                          <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                            {coach.bio}
                          </p>
                        )}

                        {/* Specialties */}
                        {coach.specialties && coach.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {coach.specialties.slice(0, 3).map((specialty, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 rounded-full bg-purple-600/30 text-purple-300"
                              >
                                {specialty}
                              </span>
                            ))}
                            {coach.specialties.length > 3 && (
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-600/30 text-gray-400">
                                +{coach.specialties.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>✅ {coach.certification_count} certifications</span>
                          <span>👥 {coach.connection_count} connections</span>
                          {coach.hourly_rate && (
                            <span className="font-semibold text-green-400">
                              ${coach.hourly_rate}/hr
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="text-gray-400 text-xl">›</div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

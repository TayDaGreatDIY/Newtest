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

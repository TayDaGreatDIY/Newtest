import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlassCard, SectionHeader, Badge, GradientButton } from '../components';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import type { CoachTrainerWithDetails, CoachSchedule, AthleteCoachConnection } from '../types/db';

export const CoachTrainerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [coach, setCoach] = useState<CoachTrainerWithDetails | null>(null);
  const [schedules, setSchedules] = useState<CoachSchedule[]>([]);
  const [connection, setConnection] = useState<AthleteCoachConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = user?.id === coach?.user_id;

  const loadCoachData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      // Load coach profile
      const { data: coachData, error: coachError } = await supabase
        .rpc('get_coach_profile', { p_coach_id: id })
        .single();

      if (coachError) throw coachError;
      setCoach(coachData as CoachTrainerWithDetails);

      // Load schedules
      const { data: schedulesData } = await supabase
        .from('coach_schedules')
        .select('*')
        .eq('coach_id', id)
        .eq('is_available', true)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(10);

      setSchedules(schedulesData || []);

      // Check connection status
      if (user) {
        const { data: connectionData } = await supabase
          .from('athlete_coach_connections')
          .select('*')
          .eq('athlete_id', user.id)
          .eq('coach_id', id)
          .single();

        setConnection(connectionData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coach profile');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadCoachData();
  }, [loadCoachData]);

  const handleConnectionRequest = async () => {
    if (!user || !coach) return;

    setRequesting(true);
    try {
      const { error: insertError } = await supabase
        .from('athlete_coach_connections')
        .insert({
          athlete_id: user.id,
          coach_id: coach.id,
          requested_by: user.id,
          status: 'pending'
        });

      if (insertError) throw insertError;

      // Reload connection status
      await loadCoachData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send connection request');
    } finally {
      setRequesting(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🏀</div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="min-h-screen px-4 py-6">
        <GlassCard className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-500 mb-4">{error || 'Coach not found'}</p>
          <button
            onClick={() => navigate('/app/coaches')}
            className="glass px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            Back to Coaches
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/app/coaches')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
      >
        <span>←</span>
        <span>Back</span>
      </button>

      {/* Profile Header */}
      <GlassCard className="mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-4xl flex-shrink-0">
            {getRoleIcon(coach.role)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-2xl font-bold">
                {coach.display_name || 'Anonymous'}
              </h2>
              {coach.is_verified && (
                <Badge variant="accent">Verified</Badge>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-2">
              {getRoleLabel(coach.role)}
              {coach.years_of_experience && ` • ${coach.years_of_experience} years of experience`}
            </p>
            {coach.location && (
              <p className="text-gray-400 text-sm flex items-center gap-1">
                📍 {coach.location}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {coach.bio && (
          <div className="mb-4">
            <p className="text-gray-300">{coach.bio}</p>
          </div>
        )}

        {/* Specialties */}
        {coach.specialties && coach.specialties.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">Specialties</p>
            <div className="flex flex-wrap gap-2">
              {coach.specialties.map((specialty, idx) => (
                <span
                  key={idx}
                  className="text-sm px-3 py-1 rounded-full bg-purple-600/30 text-purple-300"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 py-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              {coach.certification_count}
            </p>
            <p className="text-xs text-gray-400">Certifications</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold gradient-secondary bg-clip-text text-transparent">
              {coach.connection_count}
            </p>
            <p className="text-xs text-gray-400">Connections</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold gradient-accent bg-clip-text text-transparent">
              {coach.upcoming_sessions_count || 0}
            </p>
            <p className="text-xs text-gray-400">Sessions</p>
          </div>
        </div>

        {/* Pricing */}
        {coach.hourly_rate && (
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-gray-400 mb-1">Rate</p>
            <p className="text-xl font-bold text-green-400">
              ${coach.hourly_rate}/hour
            </p>
          </div>
        )}
      </GlassCard>

      {/* Action Buttons */}
      {!isOwnProfile && (
        <div className="mb-6 space-y-3">
          {/* Calendly Link */}
          {coach.calendly_link && (
            <GradientButton
              variant="primary"
              fullWidth
              onClick={() => window.open(coach.calendly_link!, '_blank')}
            >
              📅 Schedule a Session
            </GradientButton>
          )}

          {/* Connection Request */}
          {!connection && (
            <GradientButton
              variant="secondary"
              fullWidth
              onClick={handleConnectionRequest}
              disabled={requesting}
            >
              {requesting ? 'Sending...' : '👥 Connect'}
            </GradientButton>
          )}

          {connection && connection.status === 'pending' && (
            <div className="glass p-4 rounded-xl text-center">
              <p className="text-yellow-400">⏳ Connection request pending</p>
            </div>
          )}

          {connection && connection.status === 'accepted' && (
            <div className="glass p-4 rounded-xl text-center">
              <p className="text-green-400">✅ Connected</p>
            </div>
          )}
        </div>
      )}

      {/* Upcoming Sessions */}
      {schedules.length > 0 && (
        <>
          <SectionHeader title="Upcoming Sessions" className="mb-4" />
          <div className="space-y-3 mb-6">
            {schedules.map((schedule) => (
              <GlassCard key={schedule.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">{schedule.title}</h3>
                    {schedule.description && (
                      <p className="text-sm text-gray-400 mb-2">{schedule.description}</p>
                    )}
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>🗓️ {formatDate(schedule.start_time)}</p>
                      <p>👥 {schedule.session_type}</p>
                      {schedule.location && <p>📍 {schedule.location}</p>}
                      {schedule.max_participants > 1 && (
                        <p>Max {schedule.max_participants} participants</p>
                      )}
                    </div>
                  </div>
                  {schedule.price && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400">
                        ${schedule.price}
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      )}

      {/* No Calendly Link Message */}
      {!coach.calendly_link && !isOwnProfile && (
        <GlassCard className="text-center">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-gray-400">
            This coach hasn't set up their scheduling link yet
          </p>
        </GlassCard>
      )}
    </div>
  );
};

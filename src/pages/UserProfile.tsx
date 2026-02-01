import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlassCard, SectionHeader, Badge } from '../components';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { getUserStats } from '../lib/stats';
import type { UserStats } from '../types/db';

interface UserProfile {
  id: string;
  display_name: string | null;
}

export const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = user?.id === id;

  const loadUserData = useCallback(async () => {
    if (!id) {
      navigate('/app/feed');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load stats
      const { data: statsData } = await getUserStats(id);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">👤</div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen px-4 py-6">
        <div className="glass rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-500 mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={() => navigate('/app/feed')}
            className="glass px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  // If viewing own profile, redirect to the main profile page
  if (isOwnProfile) {
    navigate('/app/profile');
    return null;
  }

  return (
    <div className="min-h-screen px-4 py-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
      >
        <span>←</span>
        <span>Back</span>
      </button>

      {/* Profile Header */}
      <GlassCard className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-4xl">
            👤
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">
              {profile.display_name || 'Anonymous User'}
            </h2>
            <p className="text-gray-400 text-sm">M2DG Player</p>
          </div>
        </div>

        {/* Stats */}
        {stats ? (
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                {stats.challenges_won}
              </p>
              <p className="text-xs text-gray-400">Wins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold gradient-secondary bg-clip-text text-transparent">
                {stats.total_challenges}
              </p>
              <p className="text-xs text-gray-400">Challenges</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold gradient-accent bg-clip-text text-transparent">
                {stats.total_checkins}
              </p>
              <p className="text-xs text-gray-400">Check-ins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                {stats.courts_championed}
              </p>
              <p className="text-xs text-gray-400">Courts</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">0</p>
              <p className="text-xs text-gray-400">Wins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold gradient-secondary bg-clip-text text-transparent">0</p>
              <p className="text-xs text-gray-400">Challenges</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold gradient-accent bg-clip-text text-transparent">0</p>
              <p className="text-xs text-gray-400">Check-ins</p>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Champion Status */}
      {stats && stats.courts_championed > 0 && (
        <>
          <SectionHeader title="Champion Status" className="mb-4" />
          <GlassCard className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl animate-pulse">
                👑
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Court Champion</h3>
                <p className="text-xs text-gray-400">
                  Champion at {stats.courts_championed} court{stats.courts_championed !== 1 ? 's' : ''}
                </p>
              </div>
              <Badge variant="accent">Active</Badge>
            </div>
          </GlassCard>
        </>
      )}

      {/* Info */}
      <GlassCard>
        <p className="text-center text-gray-400 text-sm">
          This player's full profile and activity history coming soon!
        </p>
      </GlassCard>
    </div>
  );
};

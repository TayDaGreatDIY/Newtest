import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, SectionHeader, GradientButton, Badge } from '../components';
import { useAuth } from '../lib/AuthContext';
import { getUserStats } from '../lib/stats';
import type { UserStats } from '../types/db';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile?.display_name || '');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const loadStats = useCallback(async () => {
    if (!user) return;
    
    setLoadingStats(true);
    const { data } = await getUserStats(user.id);
    setStats(data);
    setLoadingStats(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadStats();
    }
  }, [user, loadStats]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile(editedName);
    if (!error) {
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen px-4 py-6">
      {/* Profile Header */}
      <GlassCard className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-4xl">
            👤
          </div>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full text-2xl font-bold mb-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 focus:border-purple-500 focus:outline-none"
                placeholder="Enter display name"
              />
            ) : (
              <h2 className="text-2xl font-bold mb-1">
                {profile?.display_name || 'Anonymous User'}
              </h2>
            )}
            <p className="text-gray-400 text-sm">{user?.email || 'user@example.com'}</p>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="glass px-4 py-2 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditedName(profile?.display_name || '');
                }}
                disabled={saving}
                className="glass px-4 py-2 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="glass px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {/* Stats */}
        {loadingStats ? (
          <div className="text-center text-gray-400 py-4">
            Loading stats...
          </div>
        ) : stats ? (
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">{stats.challenges_won}</p>
              <p className="text-xs text-gray-400">Wins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold gradient-secondary bg-clip-text text-transparent">{stats.total_challenges}</p>
              <p className="text-xs text-gray-400">Challenges</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold gradient-accent bg-clip-text text-transparent">{stats.total_checkins}</p>
              <p className="text-xs text-gray-400">Check-ins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">{stats.courts_championed}</p>
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

      {/* Quick Actions */}
      <SectionHeader title="Quick Actions" className="mb-4" />
      <div className="grid grid-cols-2 gap-3 mb-6">
        <GlassCard 
          className="text-center cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => navigate('/app/courts')}
        >
          <div className="text-3xl mb-2">🏀</div>
          <p className="text-sm font-semibold">Browse Courts</p>
        </GlassCard>
        <GlassCard 
          className="text-center cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => navigate('/app/challenges')}
        >
          <div className="text-3xl mb-2">⚔️</div>
          <p className="text-sm font-semibold">Challenges</p>
        </GlassCard>
      </div>

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

      {/* Settings */}
      <SectionHeader title="Settings" className="mb-4" />
      <div className="space-y-3 mb-6">
        <GlassCard 
          className="flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => navigate('/app/thinking-corner')}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🤖</span>
            <span className="font-medium">AI Coach (Thinking Corner)</span>
          </div>
          <span className="text-gray-400">›</span>
        </GlassCard>

        <GlassCard className="flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚙️</span>
            <span className="font-medium">Account Settings</span>
          </div>
          <span className="text-gray-400">›</span>
        </GlassCard>

        <GlassCard className="flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔔</span>
            <span className="font-medium">Notifications</span>
          </div>
          <span className="text-gray-400">›</span>
        </GlassCard>

        <GlassCard className="flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎨</span>
            <span className="font-medium">Appearance</span>
          </div>
          <span className="text-gray-400">›</span>
        </GlassCard>

        <GlassCard className="flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-xl">ℹ️</span>
            <span className="font-medium">About M2DG</span>
          </div>
          <span className="text-gray-400">›</span>
        </GlassCard>
      </div>

      {/* Logout */}
      <GradientButton 
        variant="secondary" 
        fullWidth
        onClick={handleSignOut}
      >
        Sign Out
      </GradientButton>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, SectionHeader, GradientButton, Badge, EmptyState } from '../components';
import { mockChallenges, type Challenge } from '../data/mockChallenges';

export const Challenges: React.FC = () => {
  const navigate = useNavigate();
  const [challenges] = useState<Challenge[]>(mockChallenges);
  const [filter, setFilter] = useState<'all' | 'open' | 'accepted' | 'completed'>('all');

  const filteredChallenges = challenges.filter(
    challenge => filter === 'all' || challenge.status === filter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="accent">Open</Badge>;
      case 'accepted': return <Badge variant="secondary">Accepted</Badge>;
      case 'in-progress': return <Badge variant="primary">In Progress</Badge>;
      case 'completed': return <Badge variant="glass">Completed</Badge>;
      default: return null;
    }
  };

  const getChallengeEmoji = (type: string) => {
    switch (type) {
      case '1v1': return '🥊';
      case '3v3': return '👥';
      case 'HORSE': return '🐴';
      case 'Shooting Contest': return '🎯';
      default: return '⚔️';
    }
  };

  return (
    <div className="min-h-screen px-4 py-6">
      <SectionHeader 
        title="Challenges" 
        subtitle="Compete and prove your skills"
        action={
          <GradientButton size="sm" variant="primary" onClick={() => alert('Create Challenge flow coming soon!')}>
            + Create
          </GradientButton>
        }
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'open', 'accepted', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as typeof filter)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
              filter === status
                ? 'gradient-primary text-white'
                : 'glass hover:bg-white/10'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Challenge Types Quick Select */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <GlassCard className="text-center cursor-pointer hover:bg-white/10 transition-colors">
          <div className="text-3xl mb-2">🥊</div>
          <p className="text-xs font-semibold">1v1</p>
        </GlassCard>
        <GlassCard className="text-center cursor-pointer hover:bg-white/10 transition-colors">
          <div className="text-3xl mb-2">👥</div>
          <p className="text-xs font-semibold">3v3</p>
        </GlassCard>
        <GlassCard className="text-center cursor-pointer hover:bg-white/10 transition-colors">
          <div className="text-3xl mb-2">🐴</div>
          <p className="text-xs font-semibold">HORSE</p>
        </GlassCard>
        <GlassCard className="text-center cursor-pointer hover:bg-white/10 transition-colors">
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-xs font-semibold">Shooting</p>
        </GlassCard>
      </div>

      {/* Challenges List */}
      {filteredChallenges.length === 0 ? (
        <EmptyState 
          icon="⚔️"
          title="No challenges found"
          description="Create a new challenge or adjust your filters"
          actionLabel="Create Challenge"
          onAction={() => alert('Create Challenge flow coming soon!')}
        />
      ) : (
        <div className="space-y-4">
          {filteredChallenges.map(challenge => (
            <GlassCard 
              key={challenge.id}
              onClick={() => navigate(`/app/challenges/${challenge.id}`)}
              className="hover:scale-[1.02] cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getChallengeEmoji(challenge.type)}</span>
                    <Badge variant="glass">{challenge.type}</Badge>
                    {getStatusBadge(challenge.status)}
                  </div>
                  <h3 className="text-lg font-bold mb-1">{challenge.title}</h3>
                  <p className="text-sm text-gray-400">{challenge.description}</p>
                </div>
              </div>

              {/* Participants */}
              <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-lg">
                    {challenge.creator.avatar}
                  </div>
                  <span className="text-sm font-semibold">{challenge.creator.name}</span>
                </div>
                
                <span className="text-gray-400">vs</span>
                
                {challenge.opponent ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full gradient-secondary flex items-center justify-center text-lg">
                      {challenge.opponent.avatar}
                    </div>
                    <span className="text-sm font-semibold">{challenge.opponent.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">Open Spot</span>
                )}
              </div>

              {/* Details */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">📍 {challenge.location}</span>
                  <span className="text-gray-400">🕐 {challenge.dateTime}</span>
                </div>
                {challenge.stakes && (
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                    💰 {challenge.stakes}
                  </span>
                )}
              </div>

              {/* Score (if completed) */}
              {challenge.status === 'completed' && challenge.score && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Final Score:</span>
                    <span className="text-lg font-bold">
                      {challenge.score.player1} - {challenge.score.player2}
                      {challenge.score.confirmed && <span className="text-green-400 ml-2">✓</span>}
                    </span>
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

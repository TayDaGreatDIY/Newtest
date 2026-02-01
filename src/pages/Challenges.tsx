import React, { useState, useEffect } from 'react';
import { 
  SectionHeader, 
  GradientButton, 
  EmptyState, 
  ChallengeCard,
  CreateChallengeModal 
} from '../components';
import { getChallenges, createChallenge } from '../lib/challenges';
import { getCourts } from '../lib/courts';
import type { ChallengeWithDetails, CreateChallengeInput, Court } from '../types/db';

export const Challenges: React.FC = () => {
  const [challenges, setChallenges] = useState<ChallengeWithDetails[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [challengesResult, courtsResult] = await Promise.all([
        getChallenges(),
        getCourts()
      ]);

      if (challengesResult.error) throw new Error(challengesResult.error.message);
      if (courtsResult.error) throw new Error(courtsResult.error.message);

      setChallenges(challengesResult.data || []);
      setCourts(courtsResult.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async (input: CreateChallengeInput) => {
    const { error } = await createChallenge(input);
    if (error) {
      throw new Error(error.message);
    }
    await loadData();
  };

  const isActive = (challenge: ChallengeWithDetails) => {
    const now = new Date();
    const startTime = new Date(challenge.start_time);
    const endTime = challenge.end_time ? new Date(challenge.end_time) : null;
    return startTime <= now && (!endTime || endTime >= now);
  };

  const isUpcoming = (challenge: ChallengeWithDetails) => {
    const now = new Date();
    const startTime = new Date(challenge.start_time);
    return startTime > now;
  };

  const isEnded = (challenge: ChallengeWithDetails) => {
    if (!challenge.end_time) return false;
    const now = new Date();
    const endTime = new Date(challenge.end_time);
    return endTime < now;
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (filter === 'all') return true;
    if (filter === 'active') return isActive(challenge);
    if (filter === 'upcoming') return isUpcoming(challenge);
    if (filter === 'ended') return isEnded(challenge);
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🎯</div>
          <p className="text-gray-400">Loading challenges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-6">
        <div className="glass rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="glass px-4 py-2 rounded-xl hover:bg-white/10 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <SectionHeader 
        title="Challenges" 
        subtitle="Compete and prove your skills"
        action={
          <GradientButton 
            size="sm" 
            variant="primary" 
            onClick={() => {
              if (courts.length === 0) {
                alert('Please create a court first!');
              } else {
                setIsCreateModalOpen(true);
              }
            }}
          >
            + Create
          </GradientButton>
        }
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'active', 'upcoming', 'ended'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
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

      {/* Challenges List */}
      {filteredChallenges.length === 0 ? (
        <EmptyState 
          icon="🎯"
          title={filter === 'all' ? "No challenges yet" : `No ${filter} challenges`}
          description={filter === 'all' ? "Create a challenge to get started!" : "Try a different filter"}
          actionLabel={filter === 'all' && courts.length > 0 ? "Create Challenge" : undefined}
          onAction={filter === 'all' && courts.length > 0 ? () => setIsCreateModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredChallenges.map(challenge => (
            <ChallengeCard 
              key={challenge.id}
              challenge={challenge}
              showCourtName={true}
            />
          ))}
        </div>
      )}

      {/* Create Challenge Modal */}
      {courts.length > 0 && (
        <CreateChallengeModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateChallenge}
          courtId={courts[0]?.id}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  GlassCard, 
  SectionHeader, 
  GradientButton, 
  ChampionBadge, 
  CheckInButton,
  ChallengeCard,
  CreateChallengeModal,
  EmptyState
} from '../components';
import { getCourtWithChampion } from '../lib/courts';
import { checkInToCourt, getCourtCheckins, hasCheckedInToday } from '../lib/checkins';
import { getCourtChallenges, createChallenge } from '../lib/challenges';
import type { CourtWithChampion, CourtCheckinWithUser, ChallengeWithDetails, CreateChallengeInput } from '../types/db';

export const CourtDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [court, setCourt] = useState<CourtWithChampion | null>(null);
  const [checkins, setCheckins] = useState<CourtCheckinWithUser[]>([]);
  const [challenges, setChallenges] = useState<ChallengeWithDetails[]>([]);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateChallengeOpen, setIsCreateChallengeOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadCourtData();
    }
  }, [id]);

  const loadCourtData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);

    try {
      // Load court with champion
      const { data: courtData, error: courtError } = await getCourtWithChampion(id);
      if (courtError) throw new Error(courtError.message);
      setCourt(courtData);

      // Load recent check-ins
      const { data: checkinsData, error: checkinsError } = await getCourtCheckins(id, 10);
      if (checkinsError) throw new Error(checkinsError.message);
      setCheckins(checkinsData || []);

      // Load challenges
      const { data: challengesData, error: challengesError } = await getCourtChallenges(id);
      if (challengesError) throw new Error(challengesError.message);
      setChallenges(challengesData || []);

      // Check if user has checked in today
      const { hasCheckedIn: checkedIn } = await hasCheckedInToday(id);
      setHasCheckedIn(checkedIn);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load court data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!id) return;
    
    const { error } = await checkInToCourt({ court_id: id });
    if (error) {
      throw new Error(error.message);
    }
    
    // Reload data
    await loadCourtData();
  };

  const handleCreateChallenge = async (input: CreateChallengeInput) => {
    const { error } = await createChallenge(input);
    if (error) {
      throw new Error(error.message);
    }
    
    // Reload challenges
    await loadCourtData();
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🏀</div>
          <p className="text-gray-400">Loading court...</p>
        </div>
      </div>
    );
  }

  if (error || !court) {
    return (
      <div className="min-h-screen px-4 py-6">
        <div className="glass rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-500 mb-4">{error || 'Court not found'}</p>
          <GradientButton 
            variant="primary" 
            onClick={() => navigate('/app/courts')}
          >
            Back to Courts
          </GradientButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6">
      {/* Header */}
      <button 
        onClick={() => navigate('/app/courts')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
      >
        <span>←</span>
        <span>Back to Courts</span>
      </button>

      <SectionHeader 
        title={court.name} 
        subtitle={court.location}
      />

      {/* Court Info */}
      <GlassCard className="mb-4">
        {court.description && (
          <p className="text-gray-300 mb-4">{court.description}</p>
        )}
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-400">Max Players:</span>
          <span className="font-bold">{court.max_players}</span>
        </div>

        {court.amenities && court.amenities.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-2">Amenities</p>
            <div className="flex gap-2 flex-wrap">
              {court.amenities.map((amenity, idx) => (
                <span key={idx} className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-300">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Champion Badge */}
      <ChampionBadge 
        championName={court.champion_name}
        checkinCount={court.champion_checkin_count}
        className="mb-4"
      />

      {/* Check-In Button */}
      <CheckInButton 
        courtName={court.name}
        hasCheckedIn={hasCheckedIn}
        onCheckIn={handleCheckIn}
        className="mb-6"
      />

      {/* Recent Check-ins */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3">Recent Check-ins</h3>
        {checkins.length === 0 ? (
          <GlassCard>
            <p className="text-center text-gray-400 py-4">No check-ins yet</p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {checkins.slice(0, 5).map((checkin) => (
              <GlassCard key={checkin.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-xl">
                  👤
                </div>
                <div className="flex-1">
                  <p className="font-medium">{checkin.user_display_name || 'Anonymous'}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(checkin.checked_in_at).toLocaleString()}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Active Challenges */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">Challenges</h3>
          <GradientButton 
            size="sm" 
            variant="accent"
            onClick={() => setIsCreateChallengeOpen(true)}
          >
            + Challenge
          </GradientButton>
        </div>

        {challenges.length === 0 ? (
          <EmptyState 
            icon="🎯"
            title="No challenges yet"
            description="Create a challenge to compete with others!"
            actionLabel="Create Challenge"
            onAction={() => setIsCreateChallengeOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <ChallengeCard 
                key={challenge.id}
                challenge={challenge}
                showCourtName={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Challenge Modal */}
      <CreateChallengeModal 
        isOpen={isCreateChallengeOpen}
        onClose={() => setIsCreateChallengeOpen(false)}
        onSubmit={handleCreateChallenge}
        courtId={court.id}
        courtName={court.name}
      />
    </div>
  );
};

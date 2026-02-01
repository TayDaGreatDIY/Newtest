import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  GlassCard, 
  SectionHeader, 
  Badge, 
  GradientButton, 
  Modal,
  EmptyState 
} from '../components';
import { getChallenge, getChallengeParticipants, submitChallengeResult, hasJoinedChallenge } from '../lib/challenges';
import type { ChallengeWithDetails, ChallengeParticipantWithUser } from '../types/db';

export const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [challenge, setChallenge] = useState<ChallengeWithDetails | null>(null);
  const [participants, setParticipants] = useState<ChallengeParticipantWithUser[]>([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [score, setScore] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadChallengeData();
    }
  }, [id]);

  const loadChallengeData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);

    try {
      // Load challenge
      const { data: challengeData, error: challengeError } = await getChallenge(id);
      if (challengeError) throw new Error(challengeError.message);
      setChallenge(challengeData);

      // Load participants
      const { data: participantsData, error: participantsError } = await getChallengeParticipants(id);
      if (participantsError) throw new Error(participantsError.message);
      setParticipants(participantsData || []);

      // Check if user has joined
      const { hasJoined: joined } = await hasJoinedChallenge(id);
      setHasJoined(joined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitScore = async () => {
    if (!id || !score) return;
    
    setSubmitting(true);
    try {
      const { error } = await submitChallengeResult({
        challenge_id: id,
        score: parseFloat(score),
        notes: notes || undefined,
      });

      if (error) throw new Error(error.message);

      // Reload data
      await loadChallengeData();
      setShowScoreModal(false);
      setScore('');
      setNotes('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit score');
    } finally {
      setSubmitting(false);
    }
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

  const getStatusBadge = (challenge: ChallengeWithDetails) => {
    if (isUpcoming(challenge)) {
      return <Badge variant="glass">📅 Upcoming</Badge>;
    } else if (isActive(challenge)) {
      return <Badge variant="accent">🔥 Active</Badge>;
    } else if (isEnded(challenge)) {
      return <Badge variant="glass">✓ Ended</Badge>;
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🎯</div>
          <p className="text-gray-400">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen px-4 py-6">
        <div className="glass rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-500 mb-4">{error || 'Challenge not found'}</p>
          <GradientButton 
            variant="primary" 
            onClick={() => navigate('/app/challenges')}
          >
            Back to Challenges
          </GradientButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6">
      {/* Header */}
      <button 
        onClick={() => navigate('/app/challenges')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
      >
        <span>←</span>
        <span>Back to Challenges</span>
      </button>

      <SectionHeader 
        title={challenge.title} 
        subtitle={challenge.court_name}
      />

      {/* Status */}
      <div className="flex items-center gap-2 mb-6">
        {getStatusBadge(challenge)}
        <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300">
          {challenge.challenge_type}
        </span>
      </div>

      {/* Description */}
      <GlassCard className="mb-4">
        <h3 className="text-lg font-bold mb-2">Details</h3>
        {challenge.description && (
          <p className="text-gray-300 mb-4">{challenge.description}</p>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">🏀 Court:</span>
            <button 
              onClick={() => navigate(`/app/courts/${challenge.court_id}`)}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              {challenge.court_name}
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">📅 Start:</span>
            <span>{formatDate(challenge.start_time)}</span>
          </div>
          {challenge.end_time && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">🏁 End:</span>
              <span>{formatDate(challenge.end_time)}</span>
            </div>
          )}
          {challenge.creator_name && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">👤 Created by:</span>
              <span>{challenge.creator_name}</span>
            </div>
          )}
        </div>

        {challenge.rules && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <h4 className="text-sm font-bold mb-2 text-gray-400">Rules</h4>
            <p className="text-sm text-gray-300">{challenge.rules}</p>
          </div>
        )}
      </GlassCard>

      {/* Join Button */}
      {!hasJoined && isActive(challenge) && (
        <GradientButton 
          variant="primary" 
          fullWidth
          onClick={() => setShowScoreModal(true)}
          className="mb-4"
        >
          Join Challenge & Submit Score
        </GradientButton>
      )}

      {hasJoined && (
        <div className="mb-4 glass rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center gap-2 justify-center text-green-500">
            <span className="text-xl">✓</span>
            <span className="font-medium">You've joined this challenge!</span>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3">
          🏆 Leaderboard ({participants.length} participant{participants.length !== 1 ? 's' : ''})
        </h3>

        {participants.length === 0 ? (
          <EmptyState 
            icon="🎯"
            title="No participants yet"
            description="Be the first to join this challenge!"
            actionLabel={!hasJoined && isActive(challenge) ? "Join Now" : undefined}
            onAction={!hasJoined && isActive(challenge) ? () => setShowScoreModal(true) : undefined}
          />
        ) : (
          <div className="space-y-2">
            {participants.map((participant, index) => (
              <GlassCard 
                key={participant.id}
                className={`flex items-center gap-3 ${
                  index === 0 ? 'border-2 border-yellow-500/30' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                  index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                  index === 2 ? 'bg-gradient-to-br from-orange-700 to-orange-800' :
                  'gradient-primary'
                }`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div className="flex-1">
                  <p className="font-bold">{participant.user_display_name}</p>
                  {participant.notes && (
                    <p className="text-xs text-gray-400">{participant.notes}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(participant.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                    {participant.score}
                  </p>
                  <p className="text-xs text-gray-400">points</p>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Submit Score Modal */}
      <Modal 
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        title="Submit Your Score"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Enter your score for this challenge. Make sure it's accurate!
          </p>

          {/* Score */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Score *
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-center text-2xl font-bold"
              placeholder="0"
              required
              min="0"
              step="0.1"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              placeholder="Any additional details..."
              rows={2}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowScoreModal(false)}
              disabled={submitting}
              className="flex-1 px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <GradientButton
              variant="primary"
              onClick={handleSubmitScore}
              disabled={!score || submitting}
              className="flex-1"
            >
              {submitting ? 'Submitting...' : 'Submit Score'}
            </GradientButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

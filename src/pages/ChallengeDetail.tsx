import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlassCard, SectionHeader, Badge, GradientButton, Modal } from '../components';
import { mockChallenges } from '../data/mockChallenges';

export const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');

  const challenge = mockChallenges.find(c => c.id === id);

  if (!challenge) {
    return (
      <div className="min-h-screen px-4 py-6">
        <div className="text-center py-12">
          <p className="text-gray-400">Challenge not found</p>
          <GradientButton 
            variant="primary" 
            onClick={() => navigate('/app/challenges')}
            className="mt-4"
          >
            Back to Challenges
          </GradientButton>
        </div>
      </div>
    );
  }

  const handleSubmitScore = () => {
    alert(`Score submitted for verification:\n${challenge.creator.name}: ${player1Score}\n${challenge.opponent?.name || 'Opponent'}: ${player2Score}\n\nWaiting for opponent confirmation...`);
    setShowScoreModal(false);
    setPlayer1Score('');
    setPlayer2Score('');
  };

  const handleAcceptChallenge = () => {
    alert('✅ Challenge accepted! Good luck!');
  };

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
        subtitle={challenge.type}
      />

      {/* Status */}
      <div className="flex items-center gap-2 mb-6">
        <Badge variant={
          challenge.status === 'open' ? 'accent' :
          challenge.status === 'accepted' ? 'secondary' :
          challenge.status === 'completed' ? 'glass' : 'primary'
        }>
          {challenge.status.toUpperCase()}
        </Badge>
        <span className="text-2xl">{
          challenge.type === '1v1' ? '🥊' :
          challenge.type === '3v3' ? '👥' :
          challenge.type === 'HORSE' ? '🐴' : '🎯'
        }</span>
      </div>

      {/* Description */}
      <GlassCard className="mb-4">
        <h3 className="text-lg font-bold mb-2">Details</h3>
        <p className="text-gray-300 mb-4">{challenge.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">📍 Location:</span>
            <span>{challenge.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">🕐 Time:</span>
            <span>{challenge.dateTime}</span>
          </div>
          {challenge.stakes && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">💰 Stakes:</span>
              <span className="text-yellow-400">{challenge.stakes}</span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Participants */}
      <GlassCard className="mb-4">
        <h3 className="text-lg font-bold mb-4">Participants</h3>
        
        <div className="space-y-4">
          {/* Creator */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-2xl">
                {challenge.creator.avatar}
              </div>
              <div>
                <p className="font-bold">{challenge.creator.name}</p>
                <p className="text-xs text-gray-400">Challenge Creator</p>
              </div>
            </div>
            {challenge.status === 'completed' && challenge.score && (
              <div className="text-right">
                <p className="text-2xl font-bold">{challenge.score.player1}</p>
                <p className="text-xs text-gray-400">Score</p>
              </div>
            )}
          </div>

          {/* VS Divider */}
          <div className="text-center text-gray-400 text-sm font-semibold">VS</div>

          {/* Opponent */}
          {challenge.opponent ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-l from-pink-500/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-secondary flex items-center justify-center text-2xl">
                  {challenge.opponent.avatar}
                </div>
                <div>
                  <p className="font-bold">{challenge.opponent.name}</p>
                  <p className="text-xs text-gray-400">Opponent</p>
                </div>
              </div>
              {challenge.status === 'completed' && challenge.score && (
                <div className="text-right">
                  <p className="text-2xl font-bold">{challenge.score.player2}</p>
                  <p className="text-xs text-gray-400">Score</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center p-4 rounded-xl border-2 border-dashed border-white/20">
              <p className="text-gray-400 text-sm">Open Spot - Waiting for opponent</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Score Verification (if completed) */}
      {challenge.status === 'completed' && challenge.score && (
        <GlassCard className="mb-4 bg-gradient-to-r from-green-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Final Score</h3>
              <p className="text-sm text-gray-400">
                {challenge.score.confirmed ? '✅ Verified by both players' : '⏳ Pending verification'}
              </p>
            </div>
            <div className="text-3xl font-bold">
              {challenge.score.player1} - {challenge.score.player2}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {challenge.status === 'open' && !challenge.opponent && (
          <GradientButton 
            variant="primary" 
            fullWidth
            onClick={handleAcceptChallenge}
          >
            Accept Challenge
          </GradientButton>
        )}

        {challenge.status === 'accepted' && (
          <>
            <GradientButton 
              variant="accent" 
              fullWidth
              onClick={() => setShowScoreModal(true)}
            >
              Submit Score
            </GradientButton>
            <GradientButton 
              variant="secondary" 
              fullWidth
              onClick={() => alert('Message sent to opponent')}
            >
              💬 Message Opponent
            </GradientButton>
          </>
        )}

        {challenge.status === 'completed' && (
          <GradientButton 
            variant="glass" 
            fullWidth
            onClick={() => alert('Rematch challenge created!')}
          >
            🔄 Request Rematch
          </GradientButton>
        )}
      </div>

      {/* Score Submission Modal */}
      <Modal 
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        title="Submit Score"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Both players need to confirm the score before it's finalized.
          </p>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              {challenge.creator.name}'s Score
            </label>
            <input
              type="number"
              placeholder="0"
              value={player1Score}
              onChange={(e) => setPlayer1Score(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-center text-2xl font-bold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              {challenge.opponent?.name || 'Opponent'}'s Score
            </label>
            <input
              type="number"
              placeholder="0"
              value={player2Score}
              onChange={(e) => setPlayer2Score(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-center text-2xl font-bold"
            />
          </div>

          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-400">
              ⚠️ Make sure both players agree on the score before submitting. This helps maintain fair play!
            </p>
          </div>

          <GradientButton 
            variant="primary" 
            fullWidth
            onClick={handleSubmitScore}
            disabled={!player1Score || !player2Score}
          >
            Submit for Verification
          </GradientButton>
        </div>
      </Modal>
    </div>
  );
};

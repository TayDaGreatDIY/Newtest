import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import type { ChallengeWithDetails } from '../types/db';

interface ChallengeCardProps {
  challenge: ChallengeWithDetails;
  onClick?: () => void;
  showCourtName?: boolean;
  className?: string;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ 
  challenge, 
  onClick,
  showCourtName = true,
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/app/challenges/${challenge.id}`);
    }
  };

  const isActive = () => {
    const now = new Date();
    const startTime = new Date(challenge.start_time);
    const endTime = challenge.end_time ? new Date(challenge.end_time) : null;
    
    return startTime <= now && (!endTime || endTime >= now);
  };

  const isUpcoming = () => {
    const now = new Date();
    const startTime = new Date(challenge.start_time);
    return startTime > now;
  };

  const isEnded = () => {
    if (!challenge.end_time) return false;
    const now = new Date();
    const endTime = new Date(challenge.end_time);
    return endTime < now;
  };

  const getStatusBadge = () => {
    if (isUpcoming()) {
      return <Badge variant="glass">📅 Upcoming</Badge>;
    } else if (isActive()) {
      return <Badge variant="accent">🔥 Active</Badge>;
    } else if (isEnded()) {
      return <Badge variant="glass">✓ Ended</Badge>;
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <GlassCard 
      onClick={handleClick}
      className={`hover:scale-[1.02] cursor-pointer transition-transform ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">{challenge.title}</h3>
          {showCourtName && (
            <p className="text-sm text-gray-400 flex items-center gap-1">
              🏀 {challenge.court_name}
            </p>
          )}
        </div>
        {getStatusBadge()}
      </div>

      {/* Description */}
      {challenge.description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
          {challenge.description}
        </p>
      )}

      {/* Challenge Type */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300">
          {challenge.challenge_type}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>{challenge.participant_count} participant{challenge.participant_count !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {formatDate(challenge.start_time)}
        </div>
      </div>

      {/* Creator */}
      {challenge.creator_name && (
        <div className="mt-2 text-xs text-gray-500">
          Created by {challenge.creator_name}
        </div>
      )}
    </GlassCard>
  );
};

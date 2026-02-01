import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from './GlassCard';
import { StatPill } from './StatPill';
import type { CourtWithChampion } from '../types/db';

interface CourtCardProps {
  court: CourtWithChampion;
  onClick?: () => void;
  className?: string;
}

export const CourtCard: React.FC<CourtCardProps> = ({ 
  court, 
  onClick,
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/app/courts/${court.id}`);
    }
  };

  return (
    <GlassCard 
      onClick={handleClick}
      className={`hover:scale-[1.02] cursor-pointer transition-transform ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">{court.name}</h3>
          <p className="text-sm text-gray-400 flex items-center gap-1">
            📍 {court.location}
          </p>
        </div>
        {court.champion_name && (
          <div className="flex items-center gap-1 text-xs bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-2 py-1 rounded-full border border-yellow-500/30">
            <span>👑</span>
            <span className="text-yellow-500">{court.champion_name}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {court.description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
          {court.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <StatPill 
          label="Max Players" 
          value={court.max_players} 
          icon="👥"
          variant="glass"
          className="text-xs"
        />
        {court.champion_checkin_count && (
          <StatPill 
            label="Champion Check-ins" 
            value={court.champion_checkin_count} 
            icon="🏆"
            variant="glass"
            className="text-xs"
          />
        )}
      </div>

      {/* Amenities */}
      {court.amenities && court.amenities.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {court.amenities.slice(0, 3).map((amenity, idx) => (
            <span 
              key={idx} 
              className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400"
            >
              {amenity}
            </span>
          ))}
          {court.amenities.length > 3 && (
            <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">
              +{court.amenities.length - 3} more
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
};

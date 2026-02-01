import React from 'react';

interface ChampionBadgeProps {
  championName: string | null;
  checkinCount: number | null;
  className?: string;
}

export const ChampionBadge: React.FC<ChampionBadgeProps> = ({ 
  championName, 
  checkinCount,
  className = '' 
}) => {
  if (!championName) {
    return (
      <div className={`glass rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center text-2xl">
            👑
          </div>
          <div>
            <p className="text-sm text-gray-400">Court Champion</p>
            <p className="text-lg font-bold text-gray-500">No champion yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass rounded-xl p-4 border-2 border-yellow-500/30 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl animate-pulse">
          👑
        </div>
        <div className="flex-1">
          <p className="text-sm text-yellow-500 font-medium">Court Champion</p>
          <p className="text-lg font-bold">{championName}</p>
          <p className="text-xs text-gray-400">
            {checkinCount} check-in{checkinCount !== 1 ? 's' : ''} this week
          </p>
        </div>
      </div>
    </div>
  );
};

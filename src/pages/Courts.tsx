import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, SectionHeader, StatPill, EmptyState } from '../components';
import { mockCourts, type Court } from '../data/mockCourts';

export const Courts: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [courts] = useState<Court[]>(mockCourts);

  const filteredCourts = courts.filter(court => 
    court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    court.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400';
      case 'busy': return 'text-yellow-400';
      case 'full': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'available': return '✅';
      case 'busy': return '⚠️';
      case 'full': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="min-h-screen px-4 py-6">
      <SectionHeader 
        title="Courts" 
        subtitle="Find and check in to nearby courts"
      />

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search courts by name or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
        />
      </div>

      {/* Location Filter (Placeholder) */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button className="glass px-4 py-2 rounded-full text-sm whitespace-nowrap hover:bg-white/10 transition-colors">
          📍 Near Me
        </button>
        <button className="glass px-4 py-2 rounded-full text-sm whitespace-nowrap hover:bg-white/10 transition-colors">
          ⭐ Popular
        </button>
        <button className="glass px-4 py-2 rounded-full text-sm whitespace-nowrap hover:bg-white/10 transition-colors">
          🏢 Indoor
        </button>
        <button className="glass px-4 py-2 rounded-full text-sm whitespace-nowrap hover:bg-white/10 transition-colors">
          🌳 Outdoor
        </button>
      </div>

      {/* Courts List */}
      {filteredCourts.length === 0 ? (
        <EmptyState 
          icon="🏀"
          title="No courts found"
          description="Try adjusting your search or location filters"
        />
      ) : (
        <div className="space-y-4">
          {filteredCourts.map(court => (
            <GlassCard 
              key={court.id}
              onClick={() => navigate(`/app/courts/${court.id}`)}
              className="hover:scale-[1.02] cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">{court.name}</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    📍 {court.location}
                  </p>
                </div>
                <div className={`flex items-center gap-1 text-sm ${getStatusColor(court.status)}`}>
                  <span>{getStatusEmoji(court.status)}</span>
                  <span className="capitalize">{court.status}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-2 mb-3 flex-wrap">
                <StatPill 
                  label="Distance" 
                  value={court.distance} 
                  icon="🚶"
                  variant="glass"
                  className="text-xs"
                />
                <StatPill 
                  label="Players" 
                  value={`${court.currentPlayers}/${court.maxPlayers}`} 
                  icon="👥"
                  variant="glass"
                  className="text-xs"
                />
                {court.queue.length > 0 && (
                  <StatPill 
                    label="Queue" 
                    value={court.queue.length} 
                    icon="⏱️"
                    variant="glass"
                    className="text-xs"
                  />
                )}
              </div>

              {/* Amenities */}
              <div className="flex gap-2 flex-wrap">
                {court.amenities.slice(0, 3).map((amenity, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">
                    {amenity}
                  </span>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

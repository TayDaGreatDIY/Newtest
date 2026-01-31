import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlassCard, SectionHeader, StatPill, GradientButton, Modal } from '../components';
import { mockCourts } from '../data/mockCourts';

export const CourtDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInCode, setCheckInCode] = useState('');
  const [isInQueue, setIsInQueue] = useState(false);

  const court = mockCourts.find(c => c.id === id);

  if (!court) {
    return (
      <div className="min-h-screen px-4 py-6">
        <div className="text-center py-12">
          <p className="text-gray-400">Court not found</p>
          <GradientButton 
            variant="primary" 
            onClick={() => navigate('/app/courts')}
            className="mt-4"
          >
            Back to Courts
          </GradientButton>
        </div>
      </div>
    );
  }

  const handleCheckIn = () => {
    if (checkInCode === court.checkInCode) {
      alert('✅ Successfully checked in!');
      setShowCheckInModal(false);
      setCheckInCode('');
    } else {
      alert('❌ Invalid check-in code. Try again.');
    }
  };

  const handleJoinQueue = () => {
    setIsInQueue(true);
    alert('✅ You\'ve been added to the queue!');
  };

  const handleCallNext = () => {
    alert('📢 Called next team in queue!');
  };

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

      {/* Status and Stats */}
      <GlassCard className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Court Status</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            court.status === 'available' ? 'bg-green-500/20 text-green-400' :
            court.status === 'busy' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {court.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatPill 
            label="Players" 
            value={`${court.currentPlayers}/${court.maxPlayers}`} 
            icon="👥"
            variant="glass"
          />
          <StatPill 
            label="Distance" 
            value={court.distance} 
            icon="🚶"
            variant="glass"
          />
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-400 mb-2">Amenities</p>
          <div className="flex gap-2 flex-wrap">
            {court.amenities.map((amenity, idx) => (
              <span key={idx} className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-300">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <GradientButton 
          variant="primary" 
          onClick={() => setShowCheckInModal(true)}
          fullWidth
        >
          📱 Check In
        </GradientButton>
        <GradientButton 
          variant="accent" 
          onClick={handleCallNext}
          fullWidth
          disabled={court.queue.length === 0}
        >
          📢 Call Next
        </GradientButton>
      </div>

      {/* Queue Section */}
      <GlassCard className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">Queue</h3>
            <p className="text-sm text-gray-400">{court.queue.length} teams waiting</p>
          </div>
          {!isInQueue && (
            <GradientButton 
              variant="secondary" 
              size="sm"
              onClick={handleJoinQueue}
            >
              Join Queue
            </GradientButton>
          )}
          {isInQueue && (
            <span className="text-sm text-green-400 font-semibold">✓ In Queue</span>
          )}
        </div>

        {court.queue.length === 0 ? (
          <p className="text-center text-gray-400 py-4">No teams in queue</p>
        ) : (
          <div className="space-y-3">
            {court.queue.map((entry) => (
              <div 
                key={entry.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center font-bold">
                  #{entry.position}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">{entry.teamName}</h4>
                  <p className="text-xs text-gray-400">
                    {entry.players.join(', ')} • {entry.joinedAt}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Wait Time</p>
                  <p className="text-sm font-semibold">{entry.waitTime}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Check-In Modal */}
      <Modal 
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        title="Check In to Court"
      >
        <div className="space-y-4">
          {/* QR Placeholder */}
          <div className="w-full h-48 bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-xl flex items-center justify-center border-2 border-dashed border-white/20">
            <div className="text-center">
              <div className="text-6xl mb-2">📱</div>
              <p className="text-gray-400">QR Code Scanner</p>
              <p className="text-xs text-gray-500 mt-1">Scan court QR code</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black/30 text-gray-400">Or enter code manually</span>
            </div>
          </div>

          {/* Code Entry */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Check-In Code
            </label>
            <input
              type="text"
              placeholder="Enter code (e.g., VB2024)"
              value={checkInCode}
              onChange={(e) => setCheckInCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-center text-lg font-mono"
            />
            <p className="text-xs text-gray-500 mt-2">
              Hint: Code is <code className="px-1 py-0.5 rounded bg-white/5">{court.checkInCode}</code>
            </p>
          </div>

          <GradientButton 
            variant="primary" 
            fullWidth
            onClick={handleCheckIn}
            disabled={!checkInCode}
          >
            Check In
          </GradientButton>
        </div>
      </Modal>
    </div>
  );
};

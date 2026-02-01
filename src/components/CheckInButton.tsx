import React, { useState } from 'react';
import { GradientButton } from './GradientButton';

interface CheckInButtonProps {
  courtId: string;
  courtName: string;
  hasCheckedIn: boolean;
  onCheckIn: () => Promise<void>;
  className?: string;
}

export const CheckInButton: React.FC<CheckInButtonProps> = ({
  courtId,
  courtName,
  hasCheckedIn,
  onCheckIn,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await onCheckIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  if (hasCheckedIn) {
    return (
      <div className={`glass rounded-xl p-4 border border-green-500/30 ${className}`}>
        <div className="flex items-center gap-2 justify-center text-green-500">
          <span className="text-xl">✓</span>
          <span className="font-medium">Checked in today</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {error && (
        <div className="mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}
      <GradientButton
        variant="primary"
        fullWidth
        onClick={handleCheckIn}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="animate-spin">⏳</span>
            <span className="ml-2">Checking in...</span>
          </>
        ) : (
          <>
            <span>📍</span>
            <span className="ml-2">Check In to {courtName}</span>
          </>
        )}
      </GradientButton>
    </div>
  );
};

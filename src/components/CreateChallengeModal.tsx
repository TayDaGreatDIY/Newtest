import React, { useState } from 'react';
import { Modal } from './Modal';
import { GradientButton } from './GradientButton';
import type { CreateChallengeInput } from '../types/db';

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (challenge: CreateChallengeInput) => Promise<void>;
  courtId?: string;
  courtName?: string;
}

// Helper function to format date for datetime-local input
const formatDateTimeForInput = (date: Date): string => {
  return date.toISOString().slice(0, 16);
};

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  courtId,
  courtName,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateChallengeInput>({
    court_id: courtId || '',
    title: '',
    description: '',
    challenge_type: '3-point-contest',
    rules: '',
    start_time: formatDateTimeForInput(new Date()),
    end_time: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.court_id || !formData.title || !formData.challenge_type) {
      setError('Court, title, and challenge type are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert datetime-local format to ISO
      const submitData = {
        ...formData,
        start_time: new Date(formData.start_time || new Date()).toISOString(),
        end_time: formData.end_time ? new Date(formData.end_time).toISOString() : undefined,
      };
      
      await onSubmit(submitData);
      
      // Reset form
      setFormData({
        court_id: courtId || '',
        title: '',
        description: '',
        challenge_type: '3-point-contest',
        rules: '',
        start_time: formatDateTimeForInput(new Date()),
        end_time: '',
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  const challengeTypes = [
    { value: '3-point-contest', label: '3-Point Contest', icon: '🎯' },
    { value: 'free-throw', label: 'Free Throw Challenge', icon: '🏀' },
    { value: '2-dribble-1-shot', label: '2 Dribble 1 Shot', icon: '⚡' },
    { value: 'around-the-world', label: 'Around the World', icon: '🌍' },
    { value: 'knockout', label: 'Knockout', icon: '💥' },
    { value: 'horse', label: 'H.O.R.S.E.', icon: '🐴' },
    { value: 'custom', label: 'Custom Challenge', icon: '🎮' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Challenge">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Court Name (if provided) */}
        {courtName && (
          <div className="glass rounded-xl p-3">
            <p className="text-sm text-gray-400">Creating challenge for:</p>
            <p className="font-bold">🏀 {courtName}</p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Challenge Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            placeholder="e.g., Friday Night 3-Point Showdown"
            required
          />
        </div>

        {/* Challenge Type */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Challenge Type *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {challengeTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, challenge_type: type.value })}
                className={`px-3 py-2 rounded-xl text-sm transition-all ${
                  formData.challenge_type === type.value
                    ? 'bg-purple-500 text-white'
                    : 'glass hover:bg-white/10'
                }`}
              >
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            placeholder="Describe the challenge..."
            rows={2}
          />
        </div>

        {/* Rules */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Rules
          </label>
          <textarea
            value={formData.rules}
            onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
            className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            placeholder="e.g., 5 shots from each of 5 positions, highest score wins..."
            rows={2}
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Start Time
          </label>
          <input
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium mb-2">
            End Time (Optional)
          </label>
          <input
            type="datetime-local"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
          <p className="text-xs text-gray-400 mt-1">
            Leave empty for ongoing challenges
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <GradientButton
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Creating...' : 'Create Challenge'}
          </GradientButton>
        </div>
      </form>
    </Modal>
  );
};

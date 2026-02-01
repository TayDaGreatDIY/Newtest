import React, { useState } from 'react';
import { Modal } from './Modal';
import { GradientButton } from './GradientButton';
import type { CreateCourtInput } from '../types/db';

interface CreateCourtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (court: CreateCourtInput) => Promise<void>;
}

export const CreateCourtModal: React.FC<CreateCourtModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCourtInput>({
    name: '',
    location: '',
    description: '',
    amenities: [],
    max_players: 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location) {
      setError('Name and location are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        name: '',
        location: '',
        description: '',
        amenities: [],
        max_players: 10,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create court');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAmenity = (amenity: string) => {
    if (amenity && !formData.amenities?.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: [...(formData.amenities || []), amenity],
      });
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities?.filter(a => a !== amenity) || [],
    });
  };

  const commonAmenities = [
    'Outdoor',
    'Indoor',
    'Lighting',
    'Water Fountain',
    'Restrooms',
    'Parking',
    'Covered',
    'Multiple Courts',
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Court">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Court Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            placeholder="e.g., Venice Beach Courts"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Location *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            placeholder="e.g., 1800 Ocean Front Walk, Venice, CA"
            required
          />
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
            placeholder="Tell us about this court..."
            rows={3}
          />
        </div>

        {/* Max Players */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Max Players
          </label>
          <input
            type="number"
            value={formData.max_players}
            onChange={(e) => setFormData({ ...formData, max_players: parseInt(e.target.value) || 10 })}
            className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            min="2"
            max="50"
          />
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Amenities
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {commonAmenities.map((amenity) => (
              <button
                key={amenity}
                type="button"
                onClick={() => 
                  formData.amenities?.includes(amenity) 
                    ? handleRemoveAmenity(amenity)
                    : handleAddAmenity(amenity)
                }
                className={`text-xs px-3 py-1 rounded-full transition-all ${
                  formData.amenities?.includes(amenity)
                    ? 'bg-purple-500 text-white'
                    : 'glass hover:bg-white/10'
                }`}
              >
                {amenity}
              </button>
            ))}
          </div>
          {formData.amenities && formData.amenities.length > 0 && (
            <div className="text-xs text-gray-400">
              Selected: {formData.amenities.join(', ')}
            </div>
          )}
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
            {loading ? 'Creating...' : 'Create Court'}
          </GradientButton>
        </div>
      </form>
    </Modal>
  );
};

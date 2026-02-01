import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SectionHeader, 
  EmptyState, 
  CourtCard, 
  CreateCourtModal, 
  GradientButton 
} from '../components';
import { getCourtsWithChampions, createCourt } from '../lib/courts';
import type { CourtWithChampion, CreateCourtInput } from '../types/db';

export const Courts: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [courts, setCourts] = useState<CourtWithChampion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadCourts();
  }, []);

  const loadCourts = async () => {
    setLoading(true);
    const { data, error } = await getCourtsWithChampions();
    if (error) {
      setError(error.message);
    } else {
      setCourts(data || []);
    }
    setLoading(false);
  };

  const handleCreateCourt = async (input: CreateCourtInput) => {
    const { error } = await createCourt(input);
    if (error) {
      throw new Error(error.message);
    }
    await loadCourts();
  };

  const filteredCourts = courts.filter(court => 
    court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    court.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🏀</div>
          <p className="text-gray-400">Loading courts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-6">
        <div className="glass rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadCourts}
            className="glass px-4 py-2 rounded-xl hover:bg-white/10 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <SectionHeader 
        title="Courts" 
        subtitle="Find and check in to nearby courts"
        action={
          <GradientButton 
            size="sm" 
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            + Court
          </GradientButton>
        }
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

      {/* Courts List */}
      {filteredCourts.length === 0 ? (
        <EmptyState 
          icon="🏀"
          title={searchQuery ? "No courts found" : "No courts yet"}
          description={searchQuery ? "Try adjusting your search" : "Be the first to create a court!"}
          actionLabel={!searchQuery ? "Create Court" : undefined}
          onAction={!searchQuery ? () => setIsCreateModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredCourts.map(court => (
            <CourtCard 
              key={court.id}
              court={court}
            />
          ))}
        </div>
      )}

      {/* Create Court Modal */}
      <CreateCourtModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCourt}
      />
    </div>
  );
};

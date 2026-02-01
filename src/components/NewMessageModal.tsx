import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, GradientButton } from './index';
import { searchUsers, getAllUsers, getOrCreateThread } from '../lib/messages';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewMessageModal: React.FC<NewMessageModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<Array<{ id: string; display_name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Move these above useEffect hooks
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await getAllUsers(50);
    if (error) {
      setError(error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error } = await searchUsers(searchQuery.trim(), 50);
    if (error) {
      setError(error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }, [searchQuery, loadUsers]);

  // Then keep your useEffect hooks as they are:
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadUsers();
    }
  }, [isOpen, loadUsers]);

  useEffect(() => {
    if (searchQuery.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSearch();
    } else {
      loadUsers();
    }
  }, [searchQuery, handleSearch, loadUsers]);

  const handleSelectUser = async (userId: string) => {
    setCreating(true);
    const { data: threadId, error } = await getOrCreateThread(userId);
    setCreating(false);

    if (error) {
      setError(error);
    } else if (threadId) {
      onClose();
      navigate(`/app/messages/${threadId}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-md max-h-[80vh] flex flex-col">
        <GlassCard className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">New Message</h2>
            <button
              onClick={onClose}
              disabled={creating}
              className="text-2xl hover:text-gray-400 transition-colors disabled:opacity-50"
            >
              ✕
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              disabled={creating}
              className="w-full px-4 py-3 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-400">Loading users...</div>
            </div>
          )}

          {/* User List */}
          {!loading && (
            <div className="flex-1 overflow-y-auto space-y-2">
              {users.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  {searchQuery ? 'No users found' : 'No users available'}
                </div>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    disabled={creating}
                    className="w-full glass rounded-xl p-3 hover:bg-white/10 transition-all disabled:opacity-50 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-xl">
                      🏀
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{user.display_name}</p>
                    </div>
                    <span className="text-gray-400">›</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <GradientButton
              variant="secondary"
              fullWidth
              onClick={onClose}
              disabled={creating}
            >
              Cancel
            </GradientButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

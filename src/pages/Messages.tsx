import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, SectionHeader, EmptyState } from '../components';
import { getUserThreads, subscribeToThreadUpdates } from '../lib/messages';
import type { ThreadWithDetails } from '../types/db';

export const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ThreadWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load threads on mount
  useEffect(() => {
    loadThreads();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToThreadUpdates(() => {
      loadThreads();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadThreads = async () => {
    setLoading(true);
    const { data, error } = await getUserThreads();
    if (error) {
      setError(error);
    } else if (data) {
      setThreads(data);
    }
    setLoading(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6">
        <SectionHeader 
          title="Messages" 
          subtitle="Your conversations"
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading messages...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-6">
        <SectionHeader 
          title="Messages" 
          subtitle="Your conversations"
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <SectionHeader 
        title="Messages" 
        subtitle="Your conversations"
      />

      {threads.length === 0 ? (
        <EmptyState 
          icon="💬"
          title="No messages yet"
          description="Start a conversation with other players"
        />
      ) : (
        <div className="space-y-3">
          {threads.map(thread => (
            <GlassCard 
              key={thread.thread_id}
              onClick={() => navigate(`/app/messages/${thread.thread_id}`)}
              className="hover:scale-[1.02] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-2xl">
                    🏀
                  </div>
                  {thread.unread_count > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-secondary flex items-center justify-center text-xs font-bold">
                      {thread.unread_count}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold truncate">
                      {thread.other_participant_name || 'Unknown User'}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {formatTimestamp(thread.last_message_at)}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${
                    thread.unread_count > 0 ? 'text-white font-semibold' : 'text-gray-400'
                  }`}>
                    {thread.last_message || 'No messages yet'}
                  </p>
                </div>

                {/* Arrow */}
                <span className="text-gray-400">›</span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

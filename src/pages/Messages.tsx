import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, SectionHeader, EmptyState } from '../components';
import { mockMessageThreads, type MessageThread } from '../data/mockMessages';

export const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [threads] = useState<MessageThread[]>(mockMessageThreads);

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
              key={thread.id}
              onClick={() => navigate(`/app/messages/${thread.id}`)}
              className="hover:scale-[1.02] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-2xl">
                    {thread.participantAvatar}
                  </div>
                  {thread.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-secondary flex items-center justify-center text-xs font-bold">
                      {thread.unreadCount}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold truncate">{thread.participantName}</h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {thread.lastMessageTime}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${
                    thread.unreadCount > 0 ? 'text-white font-semibold' : 'text-gray-400'
                  }`}>
                    {thread.lastMessage}
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

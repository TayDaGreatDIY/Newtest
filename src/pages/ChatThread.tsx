import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GradientButton, useToast } from '../components';
import { getThreadMessages, sendMessage, markThreadAsRead, subscribeToThreadMessages } from '../lib/messages';
import { supabase } from '../lib/supabaseClient';
import type { MessageWithSender } from '../types/db';

export const ChatThread: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherParticipantName, setOtherParticipantName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Get current user ID
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUserId();
  }, []);

  const loadMessages = useCallback(async () => {
    if (!threadId) return;

    setLoading(true);
    const { data, error } = await getThreadMessages(threadId);
    if (error) {
      setError(error);
    } else if (data) {
      setMessages(data);
      // Get other participant name from first message
      if (data.length > 0 && currentUserId) {
        const otherMessage = data.find(m => m.sender_id !== currentUserId);
        if (otherMessage) {
          setOtherParticipantName(otherMessage.sender_name);
        }
      }
    }
    setLoading(false);
  }, [threadId, currentUserId]);

  // Load messages on mount
  useEffect(() => {
    if (threadId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadMessages();
      markThreadAsRead(threadId);
    }
  }, [threadId, loadMessages]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!threadId) return;

    const unsubscribe = subscribeToThreadMessages(threadId, (payload) => {
      if (payload.eventType === 'INSERT') {
        // Add new message to the list
        loadMessages();
        // Mark as read if thread is open
        markThreadAsRead(threadId);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [threadId, loadMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !threadId) return;

    setSending(true);
    const { error } = await sendMessage(threadId, messageInput);
    setSending(false);

    if (error) {
      showToast(`Failed to send message: ${error}`, 'error');
    } else {
      setMessageInput('');
      // Messages will be updated via real-time subscription
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const hours = date.getHours();
    const mins = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  if (!threadId) {
    return (
      <div className="min-h-screen px-4 py-6">
        <div className="text-center py-12">
          <p className="text-gray-400">Invalid thread</p>
          <GradientButton 
            variant="primary" 
            onClick={() => navigate('/app/messages')}
            className="mt-4"
          >
            Back to Messages
          </GradientButton>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-6">
        <div className="text-center py-12">
          <p className="text-red-400">Error: {error}</p>
          <GradientButton 
            variant="primary" 
            onClick={() => navigate('/app/messages')}
            className="mt-4"
          >
            Back to Messages
          </GradientButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="glass-dark border-b border-white/10 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/app/messages')}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ←
          </button>
          <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-xl">
            🏀
          </div>
          <div className="flex-1">
            <h2 className="font-bold">{otherParticipantName || 'Unknown User'}</h2>
            <p className="text-xs text-gray-400">Chat</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.sender_id === currentUserId;
            return (
              <div 
                key={message.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar (only for other person) */}
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-sm flex-shrink-0">
                      🏀
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      isMe 
                        ? 'gradient-primary text-white' 
                        : 'glass'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 px-2 ${isMe ? 'text-right' : 'text-left'}`}>
                      {formatTimestamp(message.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass-dark border-t border-white/10 px-4 py-4 sticky bottom-0">
        <div className="flex gap-2 items-end">
          <input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
            disabled={sending}
            className="flex-1 px-4 py-3 rounded-2xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
          <GradientButton 
            variant="primary" 
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || sending}
            className="rounded-2xl"
          >
            {sending ? 'Sending...' : 'Send'}
          </GradientButton>
        </div>
      </div>
    </div>
  );
};

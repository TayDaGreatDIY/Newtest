import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GradientButton } from '../components';
import { mockMessageThreads } from '../data/mockMessages';

export const ChatThread: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState('');

  const thread = mockMessageThreads.find(t => t.id === threadId);

  if (!thread) {
    return (
      <div className="min-h-screen px-4 py-6">
        <div className="text-center py-12">
          <p className="text-gray-400">Thread not found</p>
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

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      alert(`Message sent: ${messageInput}`);
      setMessageInput('');
    }
  };

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
            {thread.participantAvatar}
          </div>
          <div className="flex-1">
            <h2 className="font-bold">{thread.participantName}</h2>
            <p className="text-xs text-gray-400">Active now</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
        {thread.messages.map((message) => {
          const isMe = message.senderId === 'me';
          return (
            <div 
              key={message.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar (only for other person) */}
                {!isMe && (
                  <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-sm flex-shrink-0">
                    {message.senderAvatar}
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
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="glass-dark border-t border-white/10 px-4 py-4 sticky bottom-0">
        <div className="flex gap-2 items-end">
          <input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-4 py-3 rounded-2xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
          <GradientButton 
            variant="primary" 
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="rounded-2xl"
          >
            Send
          </GradientButton>
        </div>
      </div>
    </div>
  );
};

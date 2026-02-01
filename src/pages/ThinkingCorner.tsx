import React, { useState } from 'react';
import { GlassCard, SectionHeader, GradientButton } from '../components';
import { getCoachResponse, getFallbackResponse, type ChatMessage } from '../lib/aiCoach';

const quickPrompts = [
  { emoji: '💪', label: 'Motivation', prompt: 'Give me some motivation for today\'s workout' },
  { emoji: '🏋️', label: 'Workout Plan', prompt: 'Create a basketball training workout for me' },
  { emoji: '🥗', label: 'Nutrition', prompt: 'What should I eat for optimal performance?' },
  { emoji: '🧠', label: 'Mental Reset', prompt: 'Help me get in the right mindset for competition' },
];

export const ThinkingCorner: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hey there! 👋 I\'m your AI Basketball Coach. I\'m here to help you with training tips, motivation, nutrition advice, and mental preparation. What would you like to work on today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || input;
    if (!messageToSend.trim() || loading) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageToSend,
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setError(null);

    // Get conversation history (last 5 messages for context)
    const conversationHistory = updatedMessages.slice(-5);

    // Get AI response
    const { response, error: apiError } = await getCoachResponse(
      messageToSend,
      conversationHistory
    );

    setLoading(false);

    if (apiError) {
      // Show error and use fallback
      setError(apiError);
      const fallbackResponse = getFallbackResponse(messageToSend);
      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: fallbackResponse,
      };
      setMessages([...updatedMessages, aiResponse]);
    } else {
      // Add AI response
      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: response,
      };
      setMessages([...updatedMessages, aiResponse]);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 py-6">
        <SectionHeader 
          title="Thinking Corner" 
          subtitle="Your AI Basketball Coach"
        />
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-sm text-yellow-400">
              ⚠️ {error}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Using fallback responses. Add your OpenAI API key to .env for full AI features.
            </p>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="px-4 mb-4">
        <p className="text-sm text-gray-400 mb-3">Quick prompts:</p>
        <div className="grid grid-cols-2 gap-3">
          {quickPrompts.map((prompt, idx) => (
            <GlassCard 
              key={idx}
              className="text-center cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => !loading && handleQuickPrompt(prompt.prompt)}
            >
              <div className="text-3xl mb-2">{prompt.emoji}</div>
              <p className="text-xs font-semibold">{prompt.label}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
        {messages.map((message, idx) => (
          <div 
            key={idx}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                message.role === 'user' ? 'gradient-primary' : 'gradient-accent'
              }`}>
                {message.role === 'user' ? '👤' : '🤖'}
              </div>

              {/* Message */}
              <div>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'gradient-primary' 
                    : 'glass'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[85%]">
              <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-xl flex-shrink-0">
                🤖
              </div>
              <div className="glass rounded-2xl px-4 py-3">
                <p className="text-sm text-gray-400">Thinking...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="glass-dark border-t border-white/10 px-4 py-4 sticky bottom-0">
        <div className="flex gap-2 items-end">
          <input
            type="text"
            placeholder="Ask your AI coach anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-2xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
          <GradientButton 
            variant="primary" 
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || loading}
            className="rounded-2xl"
          >
            {loading ? 'Sending...' : 'Send'}
          </GradientButton>
        </div>
      </div>
    </div>
  );
};
